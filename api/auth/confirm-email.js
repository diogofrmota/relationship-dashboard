import { sql, bcrypt, cors, errResponse, verifyJwt } from '../../lib/auth-shared.js';
import { initializeDatabase } from '../../lib/db.js';

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await initializeDatabase();

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Confirmation token is required' });

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch {
      return res.status(400).json({ error: 'Confirmation link has expired or is invalid.' });
    }

    if (decoded.purpose !== 'email-verification') {
      return res.status(400).json({ error: 'Invalid confirmation token.' });
    }

    const row = (await sql`
      SELECT token_hash, expires_at
      FROM email_verification_tokens
      WHERE user_id = ${decoded.userId}
    `).rows[0];

    if (!row) return res.status(400).json({ error: 'Confirmation link already used or expired.' });
    if (new Date(row.expires_at).getTime() < Date.now()) {
      await sql`DELETE FROM email_verification_tokens WHERE user_id = ${decoded.userId}`;
      return res.status(400).json({ error: 'Confirmation link has expired.' });
    }

    const valid = await bcrypt.compare(token, row.token_hash);
    if (!valid) return res.status(400).json({ error: 'Confirmation link is invalid.' });

    await sql`UPDATE users SET email_verified = true WHERE id = ${decoded.userId}`;
    await sql`DELETE FROM email_verification_tokens WHERE user_id = ${decoded.userId}`;

    return res.json({ message: 'Account confirmed. You can now sign in.' });
  } catch (error) {
    return errResponse(res, error);
  }
}
