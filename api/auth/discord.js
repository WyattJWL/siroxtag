// Connexion avec Discord (OAuth2). Étape 1 : /api/auth/discord?next=/compte/  Étape 2 : /api/auth/discord?code=…&state=…
// On ne demande que l’identifiant et le pseudo Discord (scope « identify ») : ni e-mail, ni serveurs.
import { randomBytes } from 'node:crypto';
import { handle, q, HttpError, cookies, startSession, limit, clientIp, freePseudo } from '../_lib/core.js';

const site = () => (process.env.SITE_URL || 'https://www.siroxtag.fr').replace(/\/$/, '');
const redirectUri = () => site() + '/api/auth/discord';
const safeNext = n => (typeof n === 'string' && /^\/(?!\/)[\w\-./?=&#%]*$/.test(n) ? n : '/compte/');
const secure = () => (process.env.COOKIE_INSECURE === '1' ? '' : '; Secure');
const go = (res, url, cookie) => { res.statusCode = 302; if (cookie) res.setHeader('Set-Cookie', cookie); res.setHeader('Location', url); res.setHeader('Cache-Control', 'no-store'); res.end(); };

export default handle(['GET'], async (req, res) => {
  const url = new URL(req.url, site());
  const { CLIENT_ID = process.env.DISCORD_CLIENT_ID, SECRET = process.env.DISCORD_CLIENT_SECRET } = {};
  if (!CLIENT_ID || !SECRET) throw new HttpError(503, 'La connexion Discord n’est pas encore configurée.');
  const code = url.searchParams.get('code');
  if (!code) {
    if (url.searchParams.get('error')) return go(res, '/compte/?erreur=discord');
    await limit('discord:' + clientIp(req), 30, 900);
    const state = randomBytes(24).toString('base64url');
    const next = safeNext(url.searchParams.get('next'));
    const auth = new URL('https://discord.com/oauth2/authorize');
    auth.search = new URLSearchParams({ client_id: CLIENT_ID, response_type: 'code', redirect_uri: redirectUri(), scope: 'identify', state, prompt: 'none' });
    return go(res, auth.toString(), `sx_oauth=${state}.${encodeURIComponent(next)}; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=600${secure()}`);
  }
  // retour de Discord : on vérifie que la demande vient bien de nous
  const [state, nextEnc = ''] = String(cookies(req).sx_oauth || '').split('.');
  if (!state || state !== url.searchParams.get('state')) return go(res, '/compte/?erreur=discord');
  const clear = `sx_oauth=; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=0${secure()}`;
  const tok = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: SECRET, grant_type: 'authorization_code', code, redirect_uri: redirectUri() })
  });
  if (!tok.ok) return go(res, '/compte/?erreur=discord', clear);
  const { access_token } = await tok.json();
  const me = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `Bearer ${access_token}` } });
  if (!me.ok) return go(res, '/compte/?erreur=discord', clear);
  const d = await me.json();
  if (!/^\d{5,25}$/.test(String(d.id || ''))) return go(res, '/compte/?erreur=discord', clear);
  let { rows } = await q('select id from users where discord_id = $1', [d.id]);
  if (!rows[0]) ({ rows } = await q('insert into users (pseudo, discord_id) values ($1, $2) returning id', [await freePseudo(d.global_name || d.username), d.id]));
  res.setHeader('Set-Cookie', clear);
  await startSession(res, rows[0].id);
  const setCookies = [res.getHeader('Set-Cookie')].flat();
  res.setHeader('Set-Cookie', [clear, ...setCookies.filter(c => !String(c).startsWith('sx_oauth'))]);
  res.statusCode = 302; res.setHeader('Location', safeNext(decodeURIComponent(nextEnc))); res.setHeader('Cache-Control', 'no-store'); res.end();
});
