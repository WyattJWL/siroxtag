// Qui est connecté ? (GET) — Se déconnecter (DELETE) : supprime la session côté serveur et efface le cookie.
// Les deux sont réunis dans une seule fonction : le plan gratuit de Vercel limite le site à 12 fonctions.
import { handle, send, currentUser, publicUser, endSession } from '../_lib/core.js';

export default handle(['GET', 'DELETE'], async (req, res) => {
  if (req.method === 'DELETE') { await endSession(req, res); return send(res, 200, { ok: true }); }
  const u = await currentUser(req);
  send(res, 200, { user: u ? publicUser(u) : null });
});
