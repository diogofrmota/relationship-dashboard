export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query' });

  const userAgent = process.env.NOMINATIM_USER_AGENT || 'DiogoMonicaTracker/1.0';
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;

  const response = await fetch(url, {
    headers: { 'User-Agent': userAgent }
  });
  const data = await response.json();
  res.status(200).json(data);
}