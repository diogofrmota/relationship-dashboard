import { initializeDatabase, sql } from '../lib/db.js';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

function getUserIdFromToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await initializeDatabase();

    // GET /api/shelf - list user's shelves
    if (path === '/api/shelf' && req.method === 'GET') {
      const shelves = await sql`
        SELECT s.id, s.name, s.created_by, sm.role, s.created_at
        FROM shelves s
        JOIN shelf_members sm ON s.id = sm.shelf_id
        WHERE sm.user_id = ${userId}
        ORDER BY s.created_at DESC
      `;
      return res.json({ shelves: shelves.rows });
    }

    // POST /api/shelf - create a new shelf
    if (path === '/api/shelf' && req.method === 'POST') {
      const { name } = req.body;
      if (!name || !name.trim()) return res.status(400).json({ error: 'Name required' });
      const shelfId = randomUUID();

      const result = await sql`
        INSERT INTO shelves (id, name, created_by)
        VALUES (${shelfId}, ${name.trim()}, ${userId})
        RETURNING id, name, created_by, created_at
      `;
      const shelf = result.rows[0];
      // Add creator as owner
      await sql`
        INSERT INTO shelf_members (shelf_id, user_id, role)
        VALUES (${shelf.id}, ${userId}, 'owner')
        ON CONFLICT (shelf_id, user_id) DO NOTHING
      `;
      // Create initial data entry
      await sql`
        INSERT INTO shelf_data (shelf_id, data)
        VALUES (${shelf.id}, '{}'::jsonb)
        ON CONFLICT (shelf_id) DO NOTHING
      `;
      return res.status(201).json({ shelf });
    }

    // POST /api/shelf/join - join a shelf with a one-time code
    if (path === '/api/shelf/join' && req.method === 'POST') {
      const { shelfId, joinCode } = req.body;
      if (!shelfId || !joinCode) return res.status(400).json({ error: 'Missing fields' });

      // Check code validity (we store raw codes for simplicity, but should hash; here we compare directly)
      const codeResult = await sql`
        SELECT * FROM shelf_join_codes 
        WHERE shelf_id = ${shelfId} AND code = ${joinCode} AND is_used = false AND expires_at > NOW()
      `;
      if (codeResult.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired code' });

      // Add member
      const existing = await sql`SELECT * FROM shelf_members WHERE shelf_id = ${shelfId} AND user_id = ${userId}`;
      if (existing.rows.length > 0) return res.status(400).json({ error: 'Already a member' });

      await sql`INSERT INTO shelf_members (shelf_id, user_id, role) VALUES (${shelfId}, ${userId}, 'member')`;
      // Mark code used
      await sql`UPDATE shelf_join_codes SET is_used = true WHERE id = ${codeResult.rows[0].id}`;

      return res.json({ success: true });
    }

    // GET /api/shelf/:id/data - get shelf data
    if (path.match(/^\/api\/shelf\/[^\/]+\/data$/) && req.method === 'GET') {
      const shelfId = path.split('/')[3];
      // Verify membership
      const member = await sql`SELECT 1 FROM shelf_members WHERE shelf_id = ${shelfId} AND user_id = ${userId}`;
      if (member.rows.length === 0) return res.status(403).json({ error: 'Not a member' });

      const data = await sql`SELECT data FROM shelf_data WHERE shelf_id = ${shelfId}`;
      return res.json(data.rows[0]?.data || {});
    }

    // POST /api/shelf/:id/data - save shelf data
    if (path.match(/^\/api\/shelf\/[^\/]+\/data$/) && req.method === 'POST') {
      const shelfId = path.split('/')[3];
      const { data } = req.body;
      if (!data) return res.status(400).json({ error: 'Data required' });

      const member = await sql`SELECT 1 FROM shelf_members WHERE shelf_id = ${shelfId} AND user_id = ${userId}`;
      if (member.rows.length === 0) return res.status(403).json({ error: 'Not a member' });

      await sql`
        INSERT INTO shelf_data (shelf_id, data, updated_at) 
        VALUES (${shelfId}, ${JSON.stringify(data)}, NOW()) 
        ON CONFLICT (shelf_id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
      return res.json({ success: true });
    }

    // POST /api/shelf/:id/new-join-code - regenerate join code (owner only)
    if (path.match(/^\/api\/shelf\/[^\/]+\/new-join-code$/) && req.method === 'POST') {
      const shelfId = path.split('/')[3];
      const member = await sql`SELECT role FROM shelf_members WHERE shelf_id = ${shelfId} AND user_id = ${userId}`;
      if (member.rows.length === 0 || member.rows[0].role !== 'owner') {
        return res.status(403).json({ error: 'Only owners can regenerate code' });
      }

      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await sql`
        INSERT INTO shelf_join_codes (shelf_id, code, is_used, expires_at) 
        VALUES (${shelfId}, ${code}, false, NOW() + INTERVAL '7 days')
      `;
      return res.json({ code });
    }

    // DELETE /api/shelf/:id/membership - remove current user from shelf
    if (path.match(/^\/api\/shelf\/[^\/]+\/membership$/) && req.method === 'DELETE') {
      const shelfId = path.split('/')[3];
      const member = await sql`SELECT 1 FROM shelf_members WHERE shelf_id = ${shelfId} AND user_id = ${userId}`;
      if (member.rows.length === 0) return res.status(404).json({ error: 'Shelf not found' });

      await sql`DELETE FROM shelf_members WHERE shelf_id = ${shelfId} AND user_id = ${userId}`;

      const remainingMembers = await sql`
        SELECT COUNT(*)::int AS count
        FROM shelf_members
        WHERE shelf_id = ${shelfId}
      `;

      if ((remainingMembers.rows[0]?.count || 0) === 0) {
        await sql`DELETE FROM shelves WHERE id = ${shelfId}`;
      }

      return res.json({ success: true });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Data API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
