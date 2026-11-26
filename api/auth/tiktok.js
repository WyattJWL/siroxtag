// Relier un compte TikTok au Studio (il faut déjà être connecté au site).
// Étape 1 : /api/auth/tiktok   Étape 2 (retour de TikTok) : /api/auth/tiktok?code=…&state=…
import { randomBytes } from 'node:crypto';
import { handle, cookies, currentUser, limit } from '../_lib/core.js';
import { conf, SCOPES, redirectUri, exchangeCode, saveTokens, sync } from '../_lib/tiktok.js';

const secure = () => (process.env.COOKIE_INSECURE === '1' ? '' : '; Secure');
const BACK = '/studio/#/performances';
const go = (res, url, cookie) => { res.statusCode = 302; if (cookie) res.setHeader('Set-Cookie', cookie); res.setHeader('Location', url); res.setHeader('Cache-Control', 'no-store'); res.end(); };

export default handle(['GET'], async (req, res) => {
  const url = new URL(req.url, 'https://www.siroxtag.fr');
  const u = await currentUser(req);
  if (!u) return go(res, BACK);
  const code = url.searchParams.get('code');
  if (!code) {
    if (url.searchParams.get('error')) return go(res, BACK + '?tiktok=refus');
    const { key } = conf();
    await limit('tiktok:' + u.id, 20, 900);
    const state = randomBytes(24).toString('base64url');
    const auth = new URL('https://www.tiktok.com/v2/auth/authorize/');
    auth.search = new URLSearchParams({ client_key: key, scope: SCOPES, response_type: 'code', redirect_uri: redirectUri(), state });
    return go(res, auth.toString(), `sx_tt=${state}; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=600${secure()}`);
  }
  const clear = `sx_tt=; Path=/api/auth; HttpOnly; SameSite=Lax; Max-Age=0${secure()}`;
  if (!cookies(req).sx_tt || cookies(req).sx_tt !== url.searchParams.get('state')) return go(res, BACK + '?tiktok=erreur', clear);
  try {
    await saveTokens(u.id, await exchangeCode(code));
    await sync(u.id).catch(e => console.error('tiktok sync :', e.message));
  } catch (e) { console.error('tiktok :', e.message); return go(res, BACK + '?tiktok=erreur', clear); }
  go(res, BACK + '?tiktok=ok', clear);
});
