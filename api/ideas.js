// Studio d’idées : le tableau des idées de vidéos de chaque membre.
import { handle, readBody, send, q, HttpError, requireUser } from './_lib/core.js';

const STATUS = ['idee', 'a-tourner', 'tourne', 'publie'];
const txt = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

export default handle(['GET', 'POST', 'PATCH', 'DELETE'], async (req, res) => {
  const u = await requireUser(req);
  if (req.method === 'GET') {
    const { rows } = await q('select id, title, body, status, created_at, updated_at from ideas where user_id = $1 order by updated_at desc limit 500', [u.id]);
    return send(res, 200, { ideas: rows });
  }
  const b = await readBody(req);
  if (req.method === 'POST') {
    const title = txt(b.title, 160), body = txt(b.body, 2000);
    if (!title) throw new HttpError(400, 'Donne un titre à ton idée.');
    const n = await q('select count(*)::int as n from ideas where user_id = $1', [u.id]);
    if (n.rows[0].n >= 500) throw new HttpError(400, 'Tableau plein (500 idées). Fais un peu de ménage !');
    const { rows } = await q('insert into ideas (user_id, title, body) values ($1, $2, $3) returning id, title, body, status, created_at, updated_at', [u.id, title, body]);
    return send(res, 201, { idea: rows[0] });
  }
  const id = Number(b.id);
  if (!Number.isSafeInteger(id)) throw new HttpError(400, 'Idée inconnue.');
  if (req.method === 'PATCH') {
    const status = b.status === undefined ? null : String(b.status);
    if (status !== null && !STATUS.includes(status)) throw new HttpError(400, 'Statut inconnu.');
    const { rows } = await q(
      `update ideas set status = coalesce($3, status), title = coalesce(nullif($4, ''), title), body = coalesce($5, body), updated_at = now()
        where id = $1 and user_id = $2 returning id, title, body, status, created_at, updated_at`,
      [id, u.id, status, b.title === undefined ? null : txt(b.title, 160), b.body === undefined ? null : txt(b.body, 2000)]);
    if (!rows[0]) throw new HttpError(404, 'Idée introuvable.');
    return send(res, 200, { idea: rows[0] });
  }
  await q('delete from ideas where id = $1 and user_id = $2', [id, u.id]);
  send(res, 200, { ok: true });
});
