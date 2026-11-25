// Qui est connecté ?
import { handle, send, currentUser, publicUser } from '../_lib/core.js';

export default handle(['GET'], async (req, res) => {
  const u = await currentUser(req);
  send(res, 200, { user: u ? publicUser(u) : null });
});
