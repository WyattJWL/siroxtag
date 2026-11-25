// Coin jeux : meilleurs scores et classements. Seul le pseudo apparaît dans les classements.
import { handle, readBody, send, q, HttpError, requireUser, currentUser, limit } from './_lib/core.js';

// jeux acceptés et score maximum plausible (au-delà, c’est de la triche)
const GAMES = { bugs: 400, snake: 2000, frappe: 300, quiz: 50 };

export default handle(['GET', 'POST'], async (req, res) => {
  if (req.method === 'GET') {
    const game = new URL(req.url, 'http://x').searchParams.get('game');
    if (!(game in GAMES)) throw new HttpError(400, 'Jeu inconnu.');
    const top = await q('select u.pseudo, s.best from scores s join users u on u.id = s.user_id where s.game = $1 order by s.best desc, s.updated_at asc limit 10', [game]);
    const u = await currentUser(req);
    let me = null;
    if (u) {
      const r = await q(`select best, (select count(*)::int + 1 from scores o where o.game = $1 and o.best > s.best) as rang from scores s where s.user_id = $2 and s.game = $1`, [game, u.id]);
      me = r.rows[0] || null;
    }
    return send(res, 200, { top: top.rows, me });
  }
  const u = await requireUser(req);
  await limit('score:' + u.id, 60, 600);
  const b = await readBody(req);
  const game = String(b.game || ''), score = Number(b.score);
  if (!(game in GAMES)) throw new HttpError(400, 'Jeu inconnu.');
  if (!Number.isInteger(score) || score < 0 || score > GAMES[game]) throw new HttpError(400, 'Score invalide.');
  const { rows } = await q(
    `insert into scores (user_id, game, best) values ($1, $2, $3)
     on conflict (user_id, game) do update set best = greatest(scores.best, excluded.best),
       updated_at = case when excluded.best > scores.best then now() else scores.updated_at end
     returning best`, [u.id, game, score]);
  send(res, 200, { best: rows[0].best, record: rows[0].best === score });
});
