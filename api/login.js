import crypto from 'crypto';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { user, pass } = req.body || {};

  if (
    user === process.env.DASH_USER &&
    pass === process.env.DASH_PASS
  ) {
    const token = crypto
      .createHmac('sha256', process.env.DASH_SECRET || 'default-secret')
      .update(user + ':' + pass)
      .digest('hex');
    return res.json({ ok: true, token });
  }

  return res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
}
