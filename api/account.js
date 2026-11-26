// Mon compte : GET = télécharger toutes mes données (RGPD), PATCH = changer de pseudo, DELETE = supprimer mon compte.
import { revoke, open } from './_lib/tiktok.js';
import { handle, readBody, send, q, HttpError, requireUser, endSession, cleanPseudo, validPseudo, publicUser, checkPassword, limit } from './_lib/core.js';

export default handle(['GET', 'PATCH', 'DELETE'], async (req, res) => {
  const u = await requireUser(req);
  if (req.method === 'GET') {
    const [ideas, scores, goals, tt, ttv, ttd] = await Promise.all([
      q('select title, body, hook, tag, caption, status, planned_on, video_id, created_at, updated_at from ideas where user_id = $1 order by id', [u.id]),
      q('select game, best, updated_at from scores where user_id = $1 order by game', [u.id]),
      q('select per_week, followers from studio_goals where user_id = $1', [u.id]),
      q('select display_name, followers, likes, videos, synced_at, created_at from tiktok_accounts where user_id = $1', [u.id]),
      q('select video_id, title, share_url, duration, posted_at, views, likes, comments, shares from tiktok_videos where user_id = $1 order by posted_at', [u.id]),
      q('select day, followers, likes, views from tiktok_daily where user_id = $1 order by day', [u.id])
    ]);
    res.setHeader('Content-Disposition', 'attachment; filename="mes-donnees-siroxtag.json"');
    return send(res, 200, { compte: { pseudo: u.pseudo, email: u.email, discord_id: u.discord_id, mot_de_passe: u.has_password ? 'oui (stocké chiffré, illisible)' : 'non', cree_le: u.created_at }, idees: ideas.rows, scores: scores.rows, objectifs: goals.rows[0] || null, tiktok: tt.rows[0] ? { compte: tt.rows[0], videos: ttv.rows, historique: ttd.rows, jetons: 'stockés chiffrés, non exportés' } : null });
  }
  const b = await readBody(req);
  if (req.method === 'PATCH') {
    const p = cleanPseudo(b.pseudo);
    if (!validPseudo(p)) throw new HttpError(400, 'Pseudo : 3 à 20 caractères, lettres, chiffres, point, tiret ou tiret bas.');
    const { rows } = await q('select 1 from users where lower(pseudo) = lower($1) and id <> $2', [p, u.id]);
    if (rows.length) throw new HttpError(409, 'Ce pseudo est déjà pris.');
    await q('update users set pseudo = $1 where id = $2', [p, u.id]);
    return send(res, 200, { user: publicUser({ ...u, pseudo: p }) });
  }
  // suppression définitive : on redemande le mot de passe pour les comptes e-mail
  if (b.confirm !== 'SUPPRIMER') throw new HttpError(400, 'Écris SUPPRIMER pour confirmer.');
  if (u.has_password) {
    await limit('delete:' + u.id, 5, 900);
    const { rows } = await q('select pass_hash from users where id = $1', [u.id]);
    if (!(await checkPassword(String(b.password || ''), rows[0].pass_hash))) throw new HttpError(401, 'Mot de passe incorrect.');
  }
  const tt = await q('select access_enc from tiktok_accounts where user_id = $1', [u.id]);
  if (tt.rows[0]) { try { await revoke(open(tt.rows[0].access_enc)); } catch { /* au mieux */ } }
  await q('delete from users where id = $1', [u.id]);
  await endSession(req, res);
  send(res, 200, { ok: true });
});
