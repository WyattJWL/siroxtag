// Outils TikTok : chiffrement des jetons, appels à l’API officielle (Login Kit + Display API), synchronisation.
// Doc : https://developers.tiktok.com/doc/login-kit-web et https://developers.tiktok.com/doc/display-api-overview
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { q, HttpError } from './core.js';

export const SCOPES = 'user.info.basic,user.info.stats,video.list';
export const site = () => (process.env.SITE_URL || 'https://www.siroxtag.fr').replace(/\/$/, '');
export const redirectUri = () => site() + '/api/auth/tiktok';
export const conf = () => {
  const key = process.env.TIKTOK_CLIENT_KEY, secret = process.env.TIKTOK_CLIENT_SECRET;
  if (!key || !secret) throw new HttpError(503, 'La liaison TikTok n’est pas encore configurée.');
  return { key, secret };
};

/* jetons chiffrés en base : une fuite de la base seule ne donne pas accès aux comptes TikTok */
const K = () => createHash('sha256').update('sx-tiktok:' + (process.env.TOKEN_KEY || process.env.DATABASE_URL || '')).digest();
export const seal = s => { const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', K(), iv); const e = Buffer.concat([c.update(String(s), 'utf8'), c.final()]); return [iv, c.getAuthTag(), e].map(b => b.toString('base64url')).join('.'); };
export const open = s => { const [iv, tag, e] = String(s).split('.').map(x => Buffer.from(x, 'base64url')); const d = createDecipheriv('aes-256-gcm', K(), iv); d.setAuthTag(tag); return Buffer.concat([d.update(e), d.final()]).toString('utf8'); };

const API = 'https://open.tiktokapis.com/v2';
async function tokenCall(params) {
  const { key, secret } = conf();
  const r = await fetch(API + '/oauth/token/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' }, body: new URLSearchParams({ client_key: key, client_secret: secret, ...params }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new HttpError(502, 'TikTok a refusé la connexion. Relie ton compte à nouveau.');
  return d;
}
export const exchangeCode = code => tokenCall({ code, grant_type: 'authorization_code', redirect_uri: redirectUri() });
export async function revoke(token) {
  try { const { key, secret } = conf(); await fetch(API + '/oauth/revoke/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_key: key, client_secret: secret, token }) }); } catch { /* au mieux */ }
}
export async function saveTokens(userId, t) {
  await q(`insert into tiktok_accounts (user_id, open_id, access_enc, refresh_enc, access_exp, refresh_exp)
           values ($1, $2, $3, $4, now() + make_interval(secs => $5), now() + make_interval(secs => $6))
           on conflict (user_id) do update set open_id = excluded.open_id, access_enc = excluded.access_enc, refresh_enc = excluded.refresh_enc,
             access_exp = excluded.access_exp, refresh_exp = excluded.refresh_exp`,
    [userId, String(t.open_id || ''), seal(t.access_token), seal(t.refresh_token), Math.max(60, +t.expires_in || 86400) - 60, +t.refresh_expires_in || 31536000]);
}
async function accessToken(userId) {
  const { rows } = await q('select access_enc, refresh_enc, access_exp > now() as fresh, refresh_exp > now() as can_refresh from tiktok_accounts where user_id = $1', [userId]);
  const a = rows[0]; if (!a) throw new HttpError(404, 'Aucun compte TikTok relié.');
  if (a.fresh) return open(a.access_enc);
  if (!a.can_refresh) throw new HttpError(401, 'La liaison TikTok a expiré. Relie ton compte à nouveau.');
  const t = await tokenCall({ grant_type: 'refresh_token', refresh_token: open(a.refresh_enc) });
  await saveTokens(userId, t);
  return t.access_token;
}
async function call(token, path, init = {}) {
  const r = await fetch(API + path, { ...init, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || (d.error && d.error.code && d.error.code !== 'ok')) throw new HttpError(502, 'TikTok ne répond pas correctement : ' + String(d.error?.message || r.status).slice(0, 120));
  return d.data || {};
}
const num = v => (Number.isFinite(+v) && +v >= 0 ? Math.floor(+v) : 0);
const str = (v, n) => String(v ?? '').slice(0, n);

/* récupère le profil et jusqu’à 100 vidéos, enregistre tout, et garde une photo du jour */
export async function sync(userId) {
  const token = await accessToken(userId);
  const { user = {} } = await call(token, '/user/info/?fields=open_id,display_name,avatar_url,follower_count,likes_count,video_count');
  const fields = 'id,title,video_description,create_time,cover_image_url,share_url,duration,view_count,like_count,comment_count,share_count';
  const vids = []; let cursor, more = true;
  for (let page = 0; more && page < 5; page++) {
    const d = await call(token, '/video/list/?fields=' + fields, { method: 'POST', body: JSON.stringify(cursor ? { max_count: 20, cursor } : { max_count: 20 }) });
    vids.push(...(d.videos || [])); cursor = d.cursor; more = !!d.has_more;
  }
  await q('update tiktok_accounts set display_name = $2, avatar_url = $3, followers = $4, likes = $5, videos = $6, synced_at = now() where user_id = $1',
    [userId, str(user.display_name, 80), str(user.avatar_url, 1000), num(user.follower_count), num(user.likes_count), num(user.video_count)]);
  for (const v of vids) {
    if (!/^[\w-]{1,40}$/.test(String(v.id || ''))) continue;
    await q(`insert into tiktok_videos (user_id, video_id, title, cover_url, share_url, duration, posted_at, views, likes, comments, shares, updated_at)
             values ($1,$2,$3,$4,$5,$6,to_timestamp($7),$8,$9,$10,$11,now())
             on conflict (user_id, video_id) do update set title = excluded.title, cover_url = excluded.cover_url, share_url = excluded.share_url,
               duration = excluded.duration, views = excluded.views, likes = excluded.likes, comments = excluded.comments, shares = excluded.shares, updated_at = now()`,
      [userId, v.id, str(v.title || v.video_description, 300), str(v.cover_image_url, 1000), str(v.share_url, 300), num(v.duration), num(v.create_time), num(v.view_count), num(v.like_count), num(v.comment_count), num(v.share_count)]);
  }
  const views = vids.reduce((s, v) => s + num(v.view_count), 0);
  await q(`insert into tiktok_daily (user_id, day, followers, likes, views) values ($1, current_date, $2, $3, $4)
           on conflict (user_id, day) do update set followers = excluded.followers, likes = excluded.likes, views = excluded.views`,
    [userId, num(user.follower_count), num(user.likes_count), views]);
  return vids.length;
}
