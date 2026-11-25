// Outils communs aux fonctions serverless : base de données, réponses, sécurité, sessions.
import pg from 'pg';
import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt = promisify(_scrypt);

/* ---------- base de données ---------- */
import { readFileSync } from 'node:fs';
let pool, ready;
// crée les tables au premier appel si elles n’existent pas (le script est idempotent)
const ensureSchema = () => ready ||= pool.query(readFileSync(new URL('../../db/schema.sql', import.meta.url), 'utf8')).catch(e => { ready = null; throw e; });
export const q = async (text, params) => {
  if (!pool) init();
  await ensureSchema();
  return pool.query(text, params);
};
function init() {
  if (!pool) {
    const url = process.env.DATABASE_URL || '';
    pool = new pg.Pool({ connectionString: url, max: 3, ssl: /localhost|127\.0\.0\.1|sslmode=disable/.test(url) ? false : { rejectUnauthorized: true } });
    // une connexion coupée par la base ne doit jamais faire planter la fonction
    pool.on('error', err => console.error('base de données :', err.message));
  }
}

/* ---------- réponses ---------- */
export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const send = (res, status, data, extraHeaders = {}) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  for (const [k, v] of Object.entries(extraHeaders)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
};
export const handle = (methods, fn) => async (req, res) => {
  try {
    if (!methods.includes(req.method)) throw new HttpError(405, 'Méthode non autorisée.');
    checkOrigin(req);
    await fn(req, res);
  } catch (e) {
    if (e instanceof HttpError) send(res, e.status, { error: e.message });
    else { console.error(e); send(res, 500, { error: 'Erreur du serveur. Réessaie dans un moment.' }); }
  }
};
export const readBody = async req => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { throw new HttpError(400, 'Requête invalide.'); } }
  const chunks = []; let size = 0;
  for await (const c of req) { size += c.length; if (size > 20000) throw new HttpError(413, 'Requête trop grosse.'); chunks.push(c); }
  try { return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}; } catch { throw new HttpError(400, 'Requête invalide.'); }
};

/* ---------- protection contre les requêtes forgées depuis un autre site ---------- */
const origins = () => [
  ...(process.env.ALLOWED_ORIGINS || process.env.SITE_URL || 'https://www.siroxtag.fr').split(','),
  // adresses générées par Vercel pour ce déploiement (aperçus)
  ...[process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean).map(h => 'https://' + h)
].map(s => s.trim()).filter(Boolean);
function checkOrigin(req) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return;
  const o = req.headers.origin;
  if (!o || !origins().includes(o) || req.headers['x-sx'] !== '1') throw new HttpError(403, 'Requête refusée.');
}

/* ---------- limites d’essais ---------- */
export const clientIp = req => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?').split(',')[0].trim();
export async function limit(key, max, seconds) {
  const { rows } = await q(
    `insert into rate_limits (key, hits, reset_at) values ($1, 1, now() + make_interval(secs => $2))
     on conflict (key) do update set
       hits = case when rate_limits.reset_at < now() then 1 else rate_limits.hits + 1 end,
       reset_at = case when rate_limits.reset_at < now() then now() + make_interval(secs => $2) else rate_limits.reset_at end
     returning hits`, [key, seconds]);
  if (rows[0].hits > max) throw new HttpError(429, 'Trop d’essais. Attends quelques minutes.');
}

/* ---------- mots de passe (scrypt) ---------- */
const N = 16384, R = 8, P = 1, LEN = 64;
export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const h = await scrypt(pw, salt, LEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${h.toString('base64')}`;
}
export async function checkPassword(pw, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') { await hashPassword(pw); return false; } // même durée, compte ou pas
  const [, n, r, p, salt, hash] = parts;
  const h = await scrypt(pw, Buffer.from(salt, 'base64'), LEN, { N: +n, r: +r, p: +p, maxmem: 64 * 1024 * 1024 });
  const ref = Buffer.from(hash, 'base64');
  return ref.length === h.length && timingSafeEqual(ref, h);
}

/* ---------- sessions (cookie HttpOnly, jeton haché en base) ---------- */
const COOKIE = 'sx_session', DAYS = 30;
const sha = s => createHash('sha256').update(s).digest('hex');
export const cookies = req => Object.fromEntries(String(req.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]));
const secure = () => process.env.COOKIE_INSECURE === '1' ? '' : '; Secure';
export async function startSession(res, userId) {
  const token = randomBytes(32).toString('base64url');
  await q('insert into sessions (token_hash, user_id, expires_at) values ($1, $2, now() + make_interval(days => $3))', [sha(token), userId, DAYS]);
  await q('delete from sessions where user_id = $1 and expires_at < now()', [userId]);
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${DAYS * 86400}${secure()}`);
}
export async function endSession(req, res) {
  const t = cookies(req)[COOKIE];
  if (t) await q('delete from sessions where token_hash = $1', [sha(t)]);
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure()}`);
}
export async function currentUser(req) {
  const t = cookies(req)[COOKIE]; if (!t) return null;
  const { rows } = await q(
    `select u.id, u.pseudo, u.email, u.discord_id, u.pass_hash is not null as has_password, u.created_at
       from sessions s join users u on u.id = s.user_id
      where s.token_hash = $1 and s.expires_at > now()`, [sha(t)]);
  if (!rows[0]) return null;
  q('update users set last_seen = now() where id = $1', [rows[0].id]).catch(() => {});
  return rows[0];
}
export async function requireUser(req) { const u = await currentUser(req); if (!u) throw new HttpError(401, 'Connecte-toi d’abord.'); return u; }
export const publicUser = u => ({ pseudo: u.pseudo, methods: [u.has_password || u.pass_hash ? 'email' : null, u.discord_id ? 'discord' : null].filter(Boolean), since: u.created_at });

/* ---------- validation ---------- */
export const cleanPseudo = s => String(s || '').trim();
export const validPseudo = s => /^[A-Za-z0-9_.-]{3,20}$/.test(s);
export const validEmail = s => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(s) && s.length <= 254;
export async function freePseudo(base) {
  let p = (base || 'joueur').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 16) || 'joueur';
  if (p.length < 3) p = (p + 'xxx').slice(0, 3);
  for (let i = 0; i < 20; i++) {
    const c = i ? `${p.slice(0, 15)}${Math.floor(1000 + Math.random() * 9000)}` : p;
    const { rows } = await q('select 1 from users where lower(pseudo) = lower($1)', [c]);
    if (!rows.length) return c;
  }
  return `joueur${randomBytes(4).toString('hex')}`;
}
