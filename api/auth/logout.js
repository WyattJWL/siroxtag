// Déconnexion : supprime la session côté serveur et efface le cookie.
import { handle, send, endSession } from '../_lib/core.js';

export default handle(['POST'], async (req, res) => {
  await endSession(req, res);
  send(res, 200, { ok: true });
});
