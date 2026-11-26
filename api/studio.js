// Objectifs du Studio : vidéos par semaine et abonnés visés.
import { handle, readBody, send, q, requireUser, HttpError } from './_lib/core.js';
import { timingSafeEqual } from 'node:crypto';
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

export default handle(['GET', 'PUT'], async (req, res) => {
  // TEMPORAIRE : réglage du compte officiel (couronne + scores), protégé par CRON_SECRET
  if (req.headers.authorization) {
    const s = process.env.CRON_SECRET;
    if (!s || !same(req.headers.authorization || '', 'Bearer ' + s)) throw new HttpError(401, 'Non autorisé.');
    const o = await q("update users set role = 'owner' where lower(pseudo) = 'siroxtag' returning id, pseudo");
    if (!o.rows[0]) throw new HttpError(404, 'Compte Siroxtag introuvable.');
    const sc = await q(`insert into scores (user_id, game, best)
      select $1, g.game, g.best from (values ('bugs', 400), ('snake', 2000), ('frappe', 300), ('quiz', 50)) as g(game, best)
      on conflict (user_id, game) do update set best = excluded.best, updated_at = now() - interval '1 year' returning game, best`, [o.rows[0].id]);
    return send(res, 200, { owner: o.rows[0].pseudo, scores: sc.rows });
  }
  const u = await requireUser(req);
  if (req.method === 'PUT') {
    const b = await readBody(req);
    const w = Number(b.per_week), f = b.followers === null || b.followers === '' || b.followers === undefined ? null : Number(b.followers);
    if (!Number.isInteger(w) || w < 0 || w > 50) throw new HttpError(400, 'Objectif : entre 0 et 50 vidéos par semaine.');
    if (f !== null && (!Number.isInteger(f) || f < 0 || f > 1e9)) throw new HttpError(400, 'Nombre d’abonnés invalide.');
    await q(`insert into studio_goals (user_id, per_week, followers) values ($1, $2, $3)
             on conflict (user_id) do update set per_week = excluded.per_week, followers = excluded.followers, updated_at = now()`, [u.id, w, f]);
  }
  const { rows } = await q('select per_week, followers from studio_goals where user_id = $1', [u.id]);
  send(res, 200, { goals: rows[0] || { per_week: 3, followers: null } });
});
