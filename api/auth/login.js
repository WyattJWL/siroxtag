// Connexion par e-mail (ou pseudo) + mot de passe.
import { handle, readBody, send, q, HttpError, checkPassword, startSession, limit, clientIp, publicUser } from '../_lib/core.js';

export default handle(['POST'], async (req, res) => {
  const b = await readBody(req);
  const id = String(b.login || '').trim().toLowerCase(), pw = String(b.password || '');
  await limit('login:' + clientIp(req), 20, 900);
  if (id) await limit('login-id:' + id, 10, 900);
  const { rows } = await q('select id, pseudo, email, discord_id, pass_hash, created_at from users where email = $1 or lower(pseudo) = $1 limit 1', [id]);
  const ok = await checkPassword(pw, rows[0]?.pass_hash);
  if (!rows[0] || !ok) throw new HttpError(401, 'Identifiants incorrects.');
  await startSession(res, rows[0].id);
  send(res, 200, { user: publicUser(rows[0]) });
});
