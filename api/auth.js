export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Get credentials from Vercel environment variables
  const validUsername = process.env.AUTH_USERNAME;
  const validPassword = process.env.AUTH_PASSWORD;

  // Check if credentials are configured
  if (!validUsername || !validPassword) {
    console.error('Auth credentials not configured in environment variables');
    return res.status(500).json({ 
      error: 'Authentication not configured',
      authenticated: false 
    });
  }

  // Validate credentials
  const isValid = username === validUsername && password === validPassword;

  if (isValid) {
    return res.status(200).json({ 
      authenticated: true,
      message: 'Authentication successful'
    });
  } else {
    return res.status(401).json({ 
      authenticated: false,
      error: 'Invalid credentials'
    });
  }
}