// Studio : objectifs du membre, bannières publiques du site, et espace admin (compte officiel uniquement).
//   GET ?banner=siroxtag|m13|perso   bannières actives (public)
//   GET / PUT                        objectifs du membre connecté
//   GET ?admin=1                     tableau de bord admin
//   POST { admin: '…', … }           actions admin (bannières, sorties M13, comptes)
// Tout est dans une seule fonction : le plan gratuit de Vercel limite le site à 12 fonctions.
import { handle, readBody, send, q, requireUser, HttpError } from './_lib/core.js';
import { readFileSync } from 'node:fs';

const TARGETS = ['siroxtag', 'm13', 'perso'], TONES = ['info', 'alerte', 'fete'];
const clip = (s, n) => String(s ?? '').replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, n);
const when = v => { if (v === null || v === undefined || v === '') return null; const t = Date.parse(v); if (Number.isNaN(t)) throw new HttpError(400, 'Date invalide.'); return new Date(t).toISOString(); };
const safeLink = v => { const s = clip(v, 300); if (!s) return ''; if (/^\/(?!\/)/.test(s) || /^https:\/\/[^\s]+$/i.test(s)) return s; throw new HttpError(400, 'Le lien doit commencer par / ou https://'); };
const maskEmail = m => { if (!m) return null; const [a, d] = String(m).split('@'); return a.slice(0, 1) + '•••@' + (d || ''); };
let META;
const m13Meta = () => (META ||= JSON.parse(readFileSync(new URL('../content/m13/book.json', import.meta.url), 'utf8')).meta);

async function owner(req) {
  const u = await requireUser(req);
  if (u.role !== 'owner') throw new HttpError(403, 'Réservé au compte officiel.');
  return u;
}

export default handle(['GET', 'PUT', 'POST'], async (req, res) => {
  const url = new URL(req.url, 'http://x');
  // bannières visibles par tout le monde
  if (req.method === 'GET' && url.searchParams.has('banner')) {
    const t = url.searchParams.get('banner');
    if (!TARGETS.includes(t)) throw new HttpError(400, 'Site inconnu.');
    const { rows } = await q(`select id, text, link, link_label, tone from site_banners
      where target = $1 and active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())
      order by created_at desc limit 2`, [t]);
    return send(res, 200, { banners: rows });
  }
  if (req.method === 'GET' && url.searchParams.has('admin')) {
    await owner(req);
    const [stats, users, banners, sched, start] = await Promise.all([
      q(`select (select count(*)::int from users) as users,
                (select count(*)::int from users where created_at > now() - interval '7 days') as users_7j,
                (select count(*)::int from users where last_seen > now() - interval '7 days') as actifs_7j,
                (select count(*)::int from ideas) as idees,
                (select count(distinct user_id)::int from m13_progress) as lecteurs_m13,
                (select count(*)::int from m13_progress where done) as chapitres_lus,
                (select count(*)::int from tiktok_accounts) as tiktok`),
      q(`select u.pseudo, u.email, u.discord_id is not null as discord, u.pass_hash is not null as mail, u.role, u.created_at, u.last_seen,
                (select count(*)::int from ideas i where i.user_id = u.id) as idees,
                (select count(*)::int from m13_progress m where m.user_id = u.id and m.done) as m13,
                t.user_id is not null as tiktok, coalesce(t.verified, false) as verified
           from users u left join tiktok_accounts t on t.user_id = u.id order by u.created_at desc limit 300`),
      q('select id, target, text, link, link_label, tone, starts_at, ends_at, active, created_at from site_banners order by created_at desc limit 50'),
      q('select tome as t, chap as c, release_at from m13_schedule'),
      q("select value from site_settings where key = 'm13_start'")
    ]);
    return send(res, 200, {
      stats: stats.rows[0], banners: banners.rows,
      users: users.rows.map(r => ({ ...r, email: maskEmail(r.email) })),
      m13: { start: start.rows[0]?.value || process.env.M13_START || '2026-11-26T06:00:00Z', overrides: sched.rows, chapters: m13Meta().map(m => ({ t: m.t, c: m.c, title: m.title })) }
    });
  }
  if (req.method === 'POST') {
    await owner(req);
    const b = await readBody(req), a = String(b.admin || '');
    if (a === 'banner-save') {
      const target = String(b.target), tone = TONES.includes(b.tone) ? b.tone : 'info', text = clip(b.text, 220);
      if (!TARGETS.includes(target)) throw new HttpError(400, 'Choisis un site.');
      if (!text) throw new HttpError(400, 'Écris le texte de la bannière.');
      const vals = [target, text, safeLink(b.link), clip(b.link_label, 40), tone, when(b.starts_at), when(b.ends_at), b.active !== false];
      if (b.id) await q('update site_banners set target=$2, text=$3, link=$4, link_label=$5, tone=$6, starts_at=$7, ends_at=$8, active=$9 where id = $1', [Number(b.id), ...vals]);
      else await q('insert into site_banners (target, text, link, link_label, tone, starts_at, ends_at, active) values ($1,$2,$3,$4,$5,$6,$7,$8)', vals);
      return send(res, 200, { ok: true });
    }
    if (a === 'banner-del') { await q('delete from site_banners where id = $1', [Number(b.id)]); return send(res, 200, { ok: true }); }
    if (a === 'm13-start') {
      const v = when(b.at); if (!v) throw new HttpError(400, 'Choisis une date.');
      await q("insert into site_settings (key, value) values ('m13_start', $1) on conflict (key) do update set value = excluded.value", [v]);
      return send(res, 200, { ok: true });
    }
    if (a === 'm13-date') {
      const t = Number(b.t), c = Number(b.c);
      if (!m13Meta().some(m => m.t === t && m.c === c)) throw new HttpError(400, 'Chapitre inconnu.');
      const v = b.at === 'now' ? new Date().toISOString() : when(b.at);
      if (v) await q('insert into m13_schedule (tome, chap, release_at) values ($1,$2,$3) on conflict (tome, chap) do update set release_at = excluded.release_at', [t, c, v]);
      else await q('delete from m13_schedule where tome = $1 and chap = $2', [t, c]);
      return send(res, 200, { ok: true });
    }
    if (a === 'user-del') {
      const p = clip(b.pseudo, 40);
      const { rows } = await q("delete from users where lower(pseudo) = lower($1) and role <> 'owner' returning pseudo", [p]);
      if (!rows[0]) throw new HttpError(404, 'Compte introuvable (le compte officiel ne peut pas être supprimé).');
      return send(res, 200, { ok: true });
    }
    throw new HttpError(400, 'Action inconnue.');
  }
  const u = await requireUser(req);
  if (req.method === 'PUT') {
    const b = await readBody(req);
    const w = Number(b.per_week), f = b.followers === null || b.followers === '' || b.followers === undefined ? null : Number(b.followers);
    if (!Number.isInteger(w) || w < 0 || w > 50) throw new HttpError(400, 'Objectif : entre 0 et 50 vidéos par semaine.');
    if (f !== null && (!Number.isInteger(f) || f < 0 || f > 1e9)) throw new HttpError(400, 'Nombre d’abonnés invalide.');
    await q(`insert into studio_goals (user_id, per_week, followers) values ($1, $2, $3)
             on conflict (user_id) do update set per_week = excluded.per_week, followers = excluded.followers, updated_at = now()`, [u.id, w, f]);
  }
  const { rows } = await q('select per_week, followers from studio_goals where user_id = $1', [u.id]);
  send(res, 200, { goals: rows[0] || { per_week: 3, followers: null } });
});
