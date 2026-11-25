// Inscription par e-mail + mot de passe.
import { handle, readBody, send, q, HttpError, hashPassword, startSession, limit, clientIp, cleanPseudo, validPseudo, validEmail, publicUser } from '../_lib/core.js';

export default handle(['POST'], async (req, res) => {
  await limit('register:' + clientIp(req), 8, 3600);
  const b = await readBody(req);
  const pseudo = cleanPseudo(b.pseudo), email = String(b.email || '').trim().toLowerCase(), pw = String(b.password || '');
  if (!validPseudo(pseudo)) throw new HttpError(400, 'Pseudo : 3 à 20 caractères, lettres, chiffres, point, tiret ou tiret bas.');
  if (!validEmail(email)) throw new HttpError(400, 'Adresse e-mail invalide.');
  if (pw.length < 10 || pw.length > 200) throw new HttpError(400, 'Mot de passe : au moins 10 caractères.');
  if (pw.toLowerCase().includes(pseudo.toLowerCase())) throw new HttpError(400, 'Le mot de passe ne doit pas contenir ton pseudo.');
  if (b.consent !== true) throw new HttpError(400, 'Il faut accepter la politique de confidentialité.');
  const taken = await q('select (select count(*) from users where lower(pseudo) = lower($1))::int as p, (select count(*) from users where email = $2)::int as e', [pseudo, email]);
  if (taken.rows[0].p) throw new HttpError(409, 'Ce pseudo est déjà pris.');
  if (taken.rows[0].e) throw new HttpError(409, 'Impossible de créer le compte avec cette adresse. Si c’est la tienne, connecte-toi.');
  const { rows } = await q('insert into users (pseudo, email, pass_hash) values ($1, $2, $3) returning id, pseudo, email, discord_id, true as has_password, created_at', [pseudo, email, await hashPassword(pw)]);
  await startSession(res, rows[0].id);
  send(res, 201, { user: publicUser(rows[0]) });
});
