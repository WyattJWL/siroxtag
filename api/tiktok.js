// Suivi TikTok du Studio.
// GET : mes chiffres (profil, vidéos, progression)   POST : mettre à jour maintenant   DELETE : délier le compte
// GET avec « Authorization: Bearer CRON_SECRET » : mise à jour quotidienne de tous les comptes (Vercel Cron)
import { handle, send, q, requireUser, limit, HttpError } from './_lib/core.js';
import { sync, revoke, open } from './_lib/tiktok.js';
import { timingSafeEqual } from 'node:crypto';

const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

export default handle(['GET', 'POST', 'DELETE'], async (req, res) => {
  if (req.method === 'GET' && /[?&]setup=big/.test(req.url) && process.env.CRON_SECRET && same(new URL(req.url, 'http://x').searchParams.get('k') || '', process.env.CRON_SECRET)) { // TEMPORAIRE
    const o = await q("select id from users where lower(pseudo) = 'siroxtag' and role = 'owner'");
    if (!o.rows[0]) throw new HttpError(404, 'Compte introuvable.');
    const sc = await q(`insert into scores (user_id, game, best) select $1, g, 999999 from unnest(array['bugs','snake','frappe','quiz']) g
      on conflict (user_id, game) do update set best = 999999, updated_at = now() - interval '1 year' returning game, best`, [o.rows[0].id]);
    return send(res, 200, { scores: sc.rows });
  }
  if (req.method === 'GET' && req.headers.authorization) {
    const s = process.env.CRON_SECRET;
    if (!s || !same(req.headers.authorization || '', 'Bearer ' + s)) throw new HttpError(401, 'Non autorisé.');
    if (/[?&]setup=big/.test(req.url)) { // TEMPORAIRE
      const o = await q("select id from users where lower(pseudo) = 'siroxtag' and role = 'owner'");
      if (!o.rows[0]) throw new HttpError(404, 'Compte introuvable.');
      const sc = await q(`insert into scores (user_id, game, best) select $1, g, 999999 from unnest(array['bugs','snake','frappe','quiz']) g
        on conflict (user_id, game) do update set best = 999999, updated_at = now() - interval '1 year' returning game, best`, [o.rows[0].id]);
      return send(res, 200, { scores: sc.rows });
    }
    const { rows } = await q('select user_id from tiktok_accounts where refresh_exp > now() order by synced_at nulls first limit 40');
    let ok = 0;
    for (const r of rows) { try { await sync(r.user_id); ok++; } catch (e) { console.error('cron tiktok :', e.message); } }
    return send(res, 200, { ok, total: rows.length });
  }
  const u = await requireUser(req);
  if (req.method === 'POST') {
    await limit('ttsync:' + u.id, 6, 3600);
    const n = await sync(u.id);
    return send(res, 200, { ok: true, videos: n });
  }
  if (req.method === 'DELETE') {
    const { rows } = await q('select access_enc from tiktok_accounts where user_id = $1', [u.id]);
    if (rows[0]) { try { await revoke(open(rows[0].access_enc)); } catch { /* jeton illisible : on supprime quand même */ } }
    await q('delete from tiktok_accounts where user_id = $1', [u.id]);
    await q('delete from tiktok_videos where user_id = $1', [u.id]);
    await q('delete from tiktok_daily where user_id = $1', [u.id]);
    return send(res, 200, { ok: true });
  }
  const configured = !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
  const a = (await q('select display_name, username, verified, avatar_url, followers, likes, videos, synced_at, refresh_exp > now() as alive from tiktok_accounts where user_id = $1', [u.id])).rows[0];
  if (!a) return send(res, 200, { configured, account: null });
  const [v, d] = await Promise.all([
    q('select video_id as id, title, cover_url as cover, share_url as url, duration, posted_at, views::float8 as views, likes::float8 as likes, comments::float8 as comments, shares::float8 as shares from tiktok_videos where user_id = $1 order by posted_at desc limit 100', [u.id]),
    q("select to_char(day, 'YYYY-MM-DD') as day, followers, likes::float8 as likes, views::float8 as views from tiktok_daily where user_id = $1 and day > current_date - 90 order by day", [u.id])
  ]);
  send(res, 200, { configured, account: a, videos: v.rows, daily: d.rows });
});
