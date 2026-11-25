// Mon compte : GET = télécharger toutes mes données (RGPD), PATCH = changer de pseudo, DELETE = supprimer mon compte.
import { handle, readBody, send, q, HttpError, requireUser, endSession, cleanPseudo, validPseudo, publicUser, checkPassword, limit } from './_lib/core.js';

export default handle(['GET', 'PATCH', 'DELETE'], async (req, res) => {
  const u = await requireUser(req);
  if (req.method === 'GET') {
    const [ideas, scores] = await Promise.all([
      q('select title, body, status, created_at, updated_at from ideas where user_id = $1 order by id', [u.id]),
      q('select game, best, updated_at from scores where user_id = $1 order by game', [u.id])
    ]);
    res.setHeader('Content-Disposition', 'attachment; filename="mes-donnees-siroxtag.json"');
    return send(res, 200, { compte: { pseudo: u.pseudo, email: u.email, discord_id: u.discord_id, mot_de_passe: u.has_password ? 'oui (stocké chiffré, illisible)' : 'non', cree_le: u.created_at }, idees: ideas.rows, scores: scores.rows });
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
  await q('delete from users where id = $1', [u.id]);
  await endSession(req, res);
  send(res, 200, { ok: true });
});
