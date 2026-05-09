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
  let accountId   = (process.env.META_ACCOUNT_ID || '').trim();

  // Ensure act_ prefix
  if (accountId && !accountId.startsWith('act_')) {
    accountId = 'act_' + accountId;
  }

  if (!metaToken || !accountId) {
    return res.status(500).json({ error: 'Variables META_TOKEN o META_ACCOUNT_ID no configuradas.' });
  }

  const { path, ...params } = req.query;

  // Determine final path
  let finalPath;
  if (!path && params.ids) {
    // Batch request: GET /?ids=123,456&fields=...
    finalPath = '';
  } else if (!path) {
    return res.status(400).json({ error: 'Falta el parámetro path.' });
  } else {
    finalPath = path.replace(/__ACCOUNT__/g, accountId);
  }

  const url = new URL(`https://graph.facebook.com/v21.0/${finalPath}`);
  url.searchParams.set('access_token', metaToken);

  for (const [k, v] of Object.entries(params)) {
    // Pass values as-is; URLSearchParams handles encoding
    url.searchParams.set(k, v);
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    // Forward Meta rate-limit headers if present
    const appUsage  = response.headers.get('x-app-usage');
    const acctUsage = response.headers.get('x-ad-account-usage');
    if (appUsage)  res.setHeader('x-app-usage', appUsage);
    if (acctUsage) res.setHeader('x-ad-account-usage', acctUsage);

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Error conectando con Meta: ' + err.message });
  }
}
