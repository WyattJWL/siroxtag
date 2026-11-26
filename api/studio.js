// Objectifs du Studio : vidéos par semaine et abonnés visés.
import { handle, readBody, send, q, requireUser, HttpError } from './_lib/core.js';

export default handle(['GET', 'PUT'], async (req, res) => {
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
