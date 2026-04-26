export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'TMDB_API_KEY is not configured' });
  }

  const url = new URL('https://api.themoviedb.org/3/search/multi');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', q);
  url.searchParams.set('include_adult', 'false');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      return res.status(response.status).json({ error: 'TMDB request failed' });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('TMDB proxy error:', error);
    return res.status(502).json({ error: 'Upstream error' });
  }
}