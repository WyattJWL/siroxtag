// Studio d’idées : le tableau des idées de vidéos de chaque membre.
import { handle, readBody, send, q, HttpError, requireUser } from './_lib/core.js';

const COLS = "id, title, body, hook, tag, caption, status, to_char(planned_on, 'YYYY-MM-DD') as planned_on, video_id, created_at, updated_at";
const STATUS = ['idee', 'a-tourner', 'tourne', 'publie'];
const day = v => (v === null || v === '' ? null : /^\d{4}-\d{2}-\d{2}$/.test(String(v)) && !isNaN(Date.parse(v)) ? String(v) : undefined);
const vid = v => (v === null || v === '' ? null : /^[\w-]{1,40}$/.test(String(v)) ? String(v) : undefined);
const txt = (s, max) => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

export default handle(['GET', 'POST', 'PATCH', 'DELETE'], async (req, res) => {
  const u = await requireUser(req);
  if (req.method === 'GET') {
    const { rows } = await q(`select ${COLS} from ideas where user_id = $1 order by updated_at desc limit 500`, [u.id]);
    return send(res, 200, { ideas: rows });
  }
  const b = await readBody(req);
  if (req.method === 'POST') {
    const title = txt(b.title, 160), body = txt(b.body, 2000), hook = txt(b.hook, 300), tag = txt(b.tag, 40), planned = b.planned_on === undefined ? null : day(b.planned_on);
    if (planned === undefined) throw new HttpError(400, 'Date invalide.');
    if (!title) throw new HttpError(400, 'Donne un titre à ton idée.');
    const n = await q('select count(*)::int as n from ideas where user_id = $1', [u.id]);
    if (n.rows[0].n >= 500) throw new HttpError(400, 'Tableau plein (500 idées). Fais un peu de ménage !');
    const { rows } = await q(`insert into ideas (user_id, title, body, hook, tag, planned_on) values ($1, $2, $3, $4, $5, $6) returning ${COLS}`, [u.id, title, body, hook, tag, planned]);
    return send(res, 201, { idea: rows[0] });
  }
  const id = Number(b.id);
  if (!Number.isSafeInteger(id)) throw new HttpError(400, 'Idée inconnue.');
  if (req.method === 'PATCH') {
    const status = b.status === undefined ? null : String(b.status);
    if (status !== null && !STATUS.includes(status)) throw new HttpError(400, 'Statut inconnu.');
    const planned = b.planned_on === undefined ? undefined : day(b.planned_on), video = b.video_id === undefined ? undefined : vid(b.video_id);
    if (b.planned_on !== undefined && planned === undefined) throw new HttpError(400, 'Date invalide.');
    if (b.video_id !== undefined && video === undefined) throw new HttpError(400, 'Vidéo invalide.');
    const { rows } = await q(
      `update ideas set status = coalesce($3, status), title = coalesce(nullif($4, ''), title), body = coalesce($5, body),
              hook = coalesce($6, hook), tag = coalesce($7, tag), caption = coalesce($12, caption),
              planned_on = case when $8 then $9::date else planned_on end, video_id = case when $10 then $11 else video_id end, updated_at = now()
        where id = $1 and user_id = $2 returning ${COLS}`,
      [id, u.id, status, b.title === undefined ? null : txt(b.title, 160), b.body === undefined ? null : txt(b.body, 2000),
       b.hook === undefined ? null : txt(b.hook, 300), b.tag === undefined ? null : txt(b.tag, 40),
       b.planned_on !== undefined, planned ?? null, b.video_id !== undefined, video ?? null, b.caption === undefined ? null : txt(b.caption, 2200)]);
    if (!rows[0]) throw new HttpError(404, 'Idée introuvable.');
    return send(res, 200, { idea: rows[0] });
  }
  await q('delete from ideas where id = $1 and user_id = $2', [id, u.id]);
  send(res, 200, { ok: true });
});
