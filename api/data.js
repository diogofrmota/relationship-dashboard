import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // CORS headers for PWA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const { rows } = await sql`
          SELECT data FROM user_data WHERE user_id = ${userId}
        `;
        return res.status(200).json(rows[0]?.data || { movies: [], anime: [], books: [] });

      case 'POST':
      case 'PUT':
        const { data } = req.body;
        await sql`
          INSERT INTO user_data (user_id, data, updated_at)
          VALUES (${userId}, ${data}, NOW())
          ON CONFLICT (user_id)
          DO UPDATE SET data = ${data}, updated_at = NOW()
        `;
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database error' });
  }
}