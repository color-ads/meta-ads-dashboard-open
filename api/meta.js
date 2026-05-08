import crypto from 'crypto';

function isValidToken(token) {
  const expected = crypto
    .createHmac('sha256', process.env.DASH_SECRET || 'default-secret')
    .update(process.env.DASH_USER + ':' + process.env.DASH_PASS)
    .digest('hex');
  return token === expected;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!isValidToken(auth)) {
    return res.status(401).json({ error: 'Sesión inválida.' });
  }

  const metaToken = process.env.META_TOKEN;
  const accountId = process.env.META_ACCOUNT_ID;

  if (!metaToken || !accountId) {
    return res.status(500).json({ error: 'Variables de entorno no configuradas.' });
  }

  const { path, ...params } = req.query;

  // Batch request: ?ids=123,456&fields=...
  if (!path && params.ids) {
    const url = new URL('https://graph.facebook.com/v21.0/');
    url.searchParams.set('access_token', metaToken);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      return res.status(response.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (!path) return res.status(400).json({ error: 'Falta el parámetro path.' });

  const realPath = path.replace('__ACCOUNT__', accountId);
  const url = new URL(`https://graph.facebook.com/v21.0/${realPath}`);
  url.searchParams.set('access_token', metaToken);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
