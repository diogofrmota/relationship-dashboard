import { sql } from '../lib/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRY = '7d';
const JWT_EXPIRY_REMEMBER = '30d';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Parse URL to determine endpoint
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    // POST /api/auth/register
    if (path === '/api/auth/register' && req.method === 'POST') {
      const { email, password, name } = req.body;
      if (!email || !password || !name || password.length < 6 || name.length < 4) {
        return res.status(400).json({ error: 'Invalid input', errors: {} });
      }

      const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hash = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (email, password_hash, display_name) 
        VALUES (${email}, ${hash}, ${name}) 
        RETURNING id, email, display_name
      `;
      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      return res.status(201).json({
        token,
        user: { id: user.id, email: user.email, name: user.display_name }
      });
    }

    // POST /api/auth/login
    if (path === '/api/auth/login' && req.method === 'POST') {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

      const result = await sql`SELECT * FROM users WHERE email = ${email}`;
      const user = result.rows[0];
      if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: rememberMe ? JWT_EXPIRY_REMEMBER : JWT_EXPIRY
      });
      return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.display_name }
      });
    }

    // POST /api/auth/google
    if (path === '/api/auth/google' && req.method === 'POST') {
      const { idToken, rememberMe } = req.body;
      // In production, verify idToken with Google library; simplified for now
      if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

      // Dummy verification - replace with real Google token verification
      const payload = jwt.decode(idToken);
      if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid token' });

      const email = payload.email;
      const name = payload.name || 'Google User';
      let user = (await sql`SELECT * FROM users WHERE email = ${email}`).rows[0];
      if (!user) {
        const insert = await sql`
          INSERT INTO users (email, google_id, display_name) 
          VALUES (${email}, ${payload.sub || 'google'}, ${name}) 
          RETURNING *
        `;
        user = insert.rows[0];
      } else if (!user.google_id) {
        await sql`UPDATE users SET google_id = ${payload.sub || 'google'} WHERE id = ${user.id}`;
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: rememberMe ? JWT_EXPIRY_REMEMBER : JWT_EXPIRY
      });
      return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.display_name }
      });
    }

    // POST /api/auth/apple
    if (path === '/api/auth/apple' && req.method === 'POST') {
      const { identityToken, rememberMe } = req.body;
      if (!identityToken) return res.status(400).json({ error: 'Missing identityToken' });

      // Dummy verification
      const payload = jwt.decode(identityToken);
      if (!payload || !payload.email) return res.status(400).json({ error: 'Invalid token' });

      const email = payload.email;
      const name = payload.name || 'Apple User';
      let user = (await sql`SELECT * FROM users WHERE email = ${email}`).rows[0];
      if (!user) {
        const insert = await sql`
          INSERT INTO users (email, apple_id, display_name) 
          VALUES (${email}, ${payload.sub || 'apple'}, ${name}) 
          RETURNING *
        `;
        user = insert.rows[0];
      } else if (!user.apple_id) {
        await sql`UPDATE users SET apple_id = ${payload.sub || 'apple'} WHERE id = ${user.id}`;
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: rememberMe ? JWT_EXPIRY_REMEMBER : JWT_EXPIRY
      });
      return res.json({
        token,
        user: { id: user.id, email: user.email, name: user.display_name }
      });
    }

    // GET /api/auth/me
    if (path === '/api/auth/me' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = (await sql`SELECT id, email, display_name FROM users WHERE id = ${decoded.userId}`).rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ user: { id: user.id, email: user.email, name: user.display_name } });
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // POST /api/auth/forgot-password (simulated)
    if (path === '/api/auth/forgot-password' && req.method === 'POST') {
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}