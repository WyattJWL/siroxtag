// PROJECT-M13 : la saga, publiée chapitre par chapitre (un chapitre chaque jeudi).
// GET            : la liste des chapitres (titre visible seulement une fois sorti) et ma progression
// GET ?t=1&c=1   : le texte d’un chapitre sorti (compte Siroxtag obligatoire)
// POST {t,c,pct,done} : enregistrer où j’en suis
// Les textes sont chiffrés dans content/m13/book.json (clé M13_KEY) : rien n’est lisible avant sa date, même dans le code.
import { readFileSync } from 'node:fs';
import { createDecipheriv } from 'node:crypto';
import { handle, readBody, send, q, HttpError, currentUser, requireUser, limit } from './_lib/core.js';

let BOOK;
const book = () => (BOOK ||= JSON.parse(readFileSync(new URL('../content/m13/book.json', import.meta.url), 'utf8')));
// premier chapitre : jeudi 26 novembre 2026, 7 h (heure de Paris), puis un chapitre par semaine
const WEEK = 7 * 86400e3;
// dates de sortie : date de départ (réglée dans l’admin, sinon M13_START) + une semaine par chapitre, sauf date précise choisie dans l’admin
async function schedule() {
  const [st, ov] = await Promise.all([q("select value from site_settings where key = 'm13_start'"), q('select tome, chap, release_at from m13_schedule')]);
  const start = Date.parse(st.rows[0]?.value || process.env.M13_START || '2026-11-26T06:00:00Z');
  const o = Object.fromEntries(ov.rows.map(r => [r.tome + '-' + r.chap, new Date(r.release_at).getTime()]));
  return i => { const m = book().meta[i]; return new Date(o[m.t + '-' + m.c] ?? start + i * WEEK); };
}
const isOwner = u => !!u && u.role === 'owner';

function decrypt(blob) {
  const key = Buffer.from(process.env.M13_KEY || '', 'base64url');
  if (key.length !== 32) throw new HttpError(503, 'La saga n’est pas encore configurée.');
  const [iv, tag, e] = String(blob).split('.').map(x => Buffer.from(x, 'base64url'));
  const d = createDecipheriv('aes-256-gcm', key, iv); d.setAuthTag(tag);
  return JSON.parse(Buffer.concat([d.update(e), d.final()]).toString('utf8'));
}

export default handle(['GET', 'POST'], async (req, res) => {
  const B = book(), now = Date.now(), releaseOf = await schedule();
  if (req.method === 'POST') {
    const u = await requireUser(req);
    await limit('m13:' + u.id, 240, 3600);
    const b = await readBody(req);
    const t = Number(b.t), c = Number(b.c), pct = Math.max(0, Math.min(100, Math.round(Number(b.pct) || 0)));
    if (!B.meta.some(m => m.t === t && m.c === c)) throw new HttpError(400, 'Chapitre inconnu.');
    await q(`insert into m13_progress (user_id, tome, chap, pct, done) values ($1, $2, $3, $4, $5)
             on conflict (user_id, tome, chap) do update set pct = greatest(m13_progress.pct, excluded.pct), done = m13_progress.done or excluded.done, updated_at = now()`,
      [u.id, t, c, pct, b.done === true]);
    return send(res, 200, { ok: true });
  }
  const u = await currentUser(req), url = new URL(req.url, 'http://x');
  const t = Number(url.searchParams.get('t')), c = Number(url.searchParams.get('c'));
  const list = B.meta.map((m, i) => { const open = isOwner(u) || releaseOf(i) <= now; return { t: m.t, c: m.c, open, date: releaseOf(i).toISOString(), title: open ? m.title : null, words: open ? m.words : null }; });
  if (!t || !c) {
    const prog = u ? (await q('select tome as t, chap as c, pct, done from m13_progress where user_id = $1', [u.id])).rows : [];
    return send(res, 200, { chapters: list, progress: prog, user: !!u, next: list.filter(x => !x.open).map(x => x.date).sort()[0] || null });
  }
  const i = B.meta.findIndex(m => m.t === t && m.c === c);
  if (i < 0) throw new HttpError(404, 'Chapitre inconnu.');
  if (!u) throw new HttpError(401, 'Connecte-toi avec ton compte Siroxtag pour lire PROJECT-M13. C’est gratuit.');
  if (!list[i].open) throw new HttpError(403, 'Ce chapitre n’est pas encore sorti.');
  const p = (await q('select pct, done from m13_progress where user_id = $1 and tome = $2 and chap = $3', [u.id, t, c])).rows[0] || null;
  send(res, 200, { t, c, title: B.meta[i].title, paras: decrypt(B.data[t + '-' + c]), progress: p,
    prev: i > 0 ? { t: B.meta[i - 1].t, c: B.meta[i - 1].c } : null,
    next: i + 1 < B.meta.length ? { t: B.meta[i + 1].t, c: B.meta[i + 1].c, open: list[i + 1].open, date: list[i + 1].date } : null });
});
