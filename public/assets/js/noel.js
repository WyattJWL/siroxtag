/* Noël sur Siroxtag : du 15 au 26 décembre (aperçu avec ?noel=1).
   Neige, bonnet sur le logo, calendrier de l’Avent (15 → 24), compte à rebours, feu d’artifice le 24 au soir et le 25.
   Chargé automatiquement par le terminal (term.js). Réglages gardés dans le navigateur : sx-noel-off, sx-avent. */
(() => {
  'use strict';
  if (window.__sxNoel) return; window.__sxNoel = true;
  const preview = /[?&]noel=1/.test(location.search) || (() => { try { return sessionStorage.getItem('sx-noel-preview') === '1'; } catch (e) { return false; } })();
  // en aperçu, on fait comme si on était le 15 décembre au matin
  const now = () => (preview ? new Date(new Date().getFullYear(), 11, 15, 10) : new Date());
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const m13 = location.pathname.startsWith('/m13'), perso = location.pathname.startsWith('/perso');
  const RED = m13 ? '#A9C7D8' : '#E0322B', INK = m13 ? '#E7E3DA' : '#F2F1EC';
  const css = document.createElement('style');
  css.textContent = `
.sxn-snow{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:44}
.sxn-chip{position:fixed;left:50%;bottom:16px;z-index:70;display:flex;align-items:center;gap:10px;height:46px;padding:0 16px 0 12px;border:1px solid rgba(255,255,255,.18);background:rgba(11,11,11,.86);color:#F2F1EC;font:600 13px/1 ${m13 ? 'Plex,ui-monospace,monospace' : 'system-ui,-apple-system,sans-serif'};cursor:pointer;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);${m13 ? '' : 'border-radius:14px;'}transform:translate(-50%,160%);transition:transform .7s cubic-bezier(.16,1,.3,1);white-space:nowrap}
.sxn-chip.on{transform:translate(-50%,0)}.sxn-chip svg{width:22px;height:22px}.sxn-chip:hover{border-color:${RED}}
.sxn-chip b{font-variant-numeric:tabular-nums}
body:has(.cc.show) .sxn-chip,body:has(.cc.show) .sxn-pane{opacity:0;pointer-events:none}
.sxn-pane{position:fixed;left:50%;margin-left:calc(min(420px,100vw - 32px) / -2);bottom:72px;z-index:71;width:min(420px,calc(100vw - 32px));max-height:min(78vh,640px);overflow:auto;padding:20px;background:#0E0F11;color:#F2F1EC;border:1px solid rgba(255,255,255,.16);${m13 ? '' : 'border-radius:20px;'}box-shadow:0 30px 80px -20px rgba(0,0,0,.7);font:400 15px/1.5 system-ui,-apple-system,sans-serif;opacity:0;transform:translateY(14px) scale(.98);transform-origin:bottom center;pointer-events:none;transition:opacity .3s,transform .45s cubic-bezier(.16,1,.3,1)}
.sxn-pane.on{opacity:1;transform:none;pointer-events:auto}
.sxn-pane h3{margin:0;font:800 24px/1.05 Archivo,system-ui,sans-serif;letter-spacing:-.02em}
.sxn-pane .sub{margin:6px 0 14px;color:rgba(242,241,236,.6);font-size:14px}
.sxn-doors{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;perspective:600px}
.sxn-door{position:relative;aspect-ratio:1;border:1px solid rgba(255,255,255,.16);background:#17191C;color:#F2F1EC;font:800 20px/1 Archivo,system-ui,sans-serif;cursor:pointer;${m13 ? '' : 'border-radius:10px;'}transform-style:preserve-3d;transition:transform .7s cubic-bezier(.16,1,.3,1),background .3s}
.sxn-door[disabled]{cursor:not-allowed;opacity:.4}
.sxn-door.today{border-color:${RED};box-shadow:0 0 0 1px ${RED} inset;animation:sxnPulse 2s ease-in-out infinite}
.sxn-door.open{background:${RED};color:#0B0B0B;transform:rotateY(-18deg)}
@keyframes sxnPulse{50%{box-shadow:0 0 0 3px ${RED} inset}}
.sxn-msg{margin-top:14px;padding:14px;border:1px solid rgba(255,255,255,.12);${m13 ? '' : 'border-radius:12px;'}min-height:64px}
.sxn-msg a{color:inherit;font-weight:700}
.sxn-tools{display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:13px;color:rgba(242,241,236,.6)}
.sxn-tools button{background:none;border:1px solid rgba(255,255,255,.16);color:inherit;padding:6px 10px;cursor:pointer;font:inherit;${m13 ? '' : 'border-radius:8px;'}}
.sxn-hat{position:absolute;left:-.32em;top:-.62em;width:.95em;height:.95em;transform:rotate(-22deg);pointer-events:none;animation:sxnHat 3.5s ease-in-out infinite}
@keyframes sxnHat{50%{transform:rotate(-14deg) translateY(-1px)}}
.sxn-fw{position:fixed;inset:0;pointer-events:none;z-index:200}
@media (prefers-reduced-motion:reduce){.sxn-door,.sxn-hat,.sxn-chip{animation:none!important;transition:none!important}}`;
  document.head.appendChild(css);

  /* la neige (fine et lente ; le bouton « couper la neige » la retire) */
  let snowOff = get('sx-noel-off', false), cv, raf;
  function snow() {
    if (snowOff || calm || cv) return;
    cv = document.createElement('canvas'); cv.className = 'sxn-snow'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    const cx = cv.getContext('2d'); let W, H, F = [];
    const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = cv.width = innerWidth * d; H = cv.height = innerHeight * d; F = Array.from({ length: Math.min(160, Math.round(innerWidth * innerHeight / 9000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: (.6 + Math.random() * 2.2) * d, v: (.25 + Math.random() * .8) * d, s: Math.random() * 6, a: .35 + Math.random() * .55 })); };
    size(); addEventListener('resize', size);
    let t = 0;
    (function frame() {
      t += .01; cx.clearRect(0, 0, W, H);
      for (const f of F) {
        f.y += f.v; f.x += Math.sin(t + f.s) * .35;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, 7); cx.fillStyle = m13 ? `rgba(216,233,242,${f.a})` : perso ? `rgba(160,190,230,${f.a})` : `rgba(255,255,255,${f.a})`; cx.fill();
      }
      raf = requestAnimationFrame(frame);
    })();
  }
  const unsnow = () => { if (cv) { cancelAnimationFrame(raf); cv.remove(); cv = null; } };

  /* un bonnet de Noël sur le logo */
  function hat() {
    if (snowOff) return;
    document.querySelectorAll('.brand,.m-logo').forEach(b => {
      if (b.querySelector('.sxn-hat')) return;
      if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
      b.insertAdjacentHTML('afterbegin', `<svg class="sxn-hat" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18c2-7 6-12 13-12 2 0 3 2 2 5l-1 4" fill="${RED}"/><path d="M2 17.5h16.5v3.5H2z" fill="${INK}"/><circle cx="17.5" cy="15" r="2.6" fill="${INK}"/></svg>`);
    });
  }
  const unhat = () => document.querySelectorAll('.sxn-hat').forEach(h => h.remove());

  /* le calendrier de l’Avent : une case par jour, du 15 au 24 décembre */
  const DAYS = {
    15: ['Astuce de créateur', 'Les deux premières secondes font tout. Teste ton accroche dans le Studio : il la note sur 100.', '/studio/#/accroches', 'Tester mon accroche'],
    16: ['Blague de Noël', 'Pourquoi le Père Noël code en JavaScript ? Parce qu’il adore les objets… et qu’il n’a jamais fini de les livrer en asynchrone.', null],
    17: ['Il pleut sur Luynes', 'Même en décembre. Le chapitre suivant de PROJECT-M13 sort un jeudi, à 7 h.', '/m13/', 'Ouvrir la saga'],
    18: ['Un secret', 'Ouvre le terminal en bas à droite et tape /noel. Le terminal a une surprise de saison.', null],
    19: ['Linear. fête Noël', 'Même les entreprises de jeu de rôle ferment pour les fêtes. Enfin, presque.', '/Linear/', 'Voir Linear.'],
    20: ['Le défi du jour', 'Écrase 25 bugs en une partie. Le jeu se cache sur une page qui n’existe pas.', '/404.html', 'Jouer'],
    21: ['La nuit la plus longue', 'C’est le solstice d’hiver. Parfait pour une page entièrement noire… si tu la trouves.', null],
    22: ['Planifie tes vacances', 'Le calendrier du Studio peut te préparer deux semaines de vidéos avec l’IA. Les fêtes, c’est du contenu.', '/studio/#/calendrier', 'Mon planning'],
    23: ['Une lecture au coin du feu', 'Un article au hasard de l’encyclopédie Siroxtagpédia.', '/wiki/?hasard', 'Au hasard'],
    24: ['Joyeux réveillon', 'Merci d’être passé tout le mois. Ce soir, regarde le ciel du site à partir de 18 h.', null]
  };
  const opened = () => get('sx-avent', []);
  const today = () => { const d = now(); return d.getMonth() === 11 ? d.getDate() : 0; };
  const countdown = () => {
    const d = now(), xmas = new Date(d.getFullYear(), 11, 25), s = Math.floor((xmas - d) / 1000);
    if (s <= 0) return d.getDate() <= 26 ? 'Joyeux Noël !' : '';
    const j = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    return j >= 1 ? `Noël dans <b>${j} j ${String(h).padStart(2, '0')} h</b>` : `Noël dans <b>${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')} min</b>`;
  };
  const tree = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l3 5h-2l4 6h-3l4 6H6l4-6H7l4-6H9z" fill="${m13 ? '#A9C7D8' : '#3CB46E'}"/><path d="M11 19h2v3h-2z" fill="#8A4B2E"/><circle cx="12" cy="2.5" r="1.6" fill="#FFC93C"/></svg>`;
  const chip = document.createElement('button'), pane = document.createElement('div');
  chip.type = 'button'; chip.className = 'sxn-chip'; chip.setAttribute('aria-expanded', 'false'); chip.setAttribute('aria-label', 'Le calendrier de l’Avent de Siroxtag');
  pane.className = 'sxn-pane'; pane.setAttribute('role', 'dialog'); pane.setAttribute('aria-label', 'Calendrier de l’Avent');
  const drawChip = () => { chip.innerHTML = tree + `<span>${countdown() || 'Bonnes fêtes'}</span>`; };
  function drawPane(msg) {
    const t = today(), o = opened();
    pane.innerHTML = `<h3>Le calendrier de l’Avent${preview ? ' <small style="font:500 12px system-ui;color:#E6AA28">aperçu</small>' : ''}</h3><p class="sub">Une case par jour, du 15 au 24 décembre. ${countdown().replace(/<\/?b>/g, '')}</p>
      <div class="sxn-doors">${Object.keys(DAYS).map(Number).map(d => `<button type="button" class="sxn-door${o.includes(d) ? ' open' : ''}${d === t && !o.includes(d) ? ' today' : ''}" data-d="${d}" ${d > t ? 'disabled' : ''} aria-label="Case du ${d} décembre${d > t ? ', pas encore' : ''}">${d}</button>`).join('')}</div>
      <div class="sxn-msg" aria-live="polite">${msg || (t > 24 ? '<b>Joyeux Noël !</b> Merci d’être là. On se retrouve en janvier pour la suite.' : 'Ouvre la case du jour.')}</div>
      <div class="sxn-tools"><span>${o.length}/10 ouvertes</span><button type="button" data-snow>${snowOff ? 'Remettre la neige' : 'Couper la neige'}</button></div>`;
  }
  const openPane = on => { pane.classList.toggle('on', on); chip.setAttribute('aria-expanded', String(on)); if (on) drawPane(); };
  chip.onclick = () => openPane(!pane.classList.contains('on'));
  pane.addEventListener('click', ev => {
    const s = ev.target.closest('[data-snow]');
    if (s) { snowOff = !snowOff; set('sx-noel-off', snowOff); if (snowOff) { unsnow(); unhat(); } else { snow(); hat(); } drawPane(); return; }
    const b = ev.target.closest('[data-d]'); if (!b || b.disabled) return;
    const d = +b.dataset.d, o = opened(); if (!o.includes(d)) { o.push(d); set('sx-avent', o); }
    const [title, text, link, label] = DAYS[d];
    drawPane(`<b>${d} décembre · ${esc(title)}</b><br>${esc(text)}${link ? `<br><a href="${esc(link)}">${esc(label)} →</a>` : ''}`);
    if (window.SX) { window.SX.ach('noel'); if (opened().length >= 10) window.SX.ach('avent'); if (d === 24) window.SX.confettis(); }
  });
  addEventListener('keydown', ev => { if (ev.key === 'Escape') openPane(false); });
  document.addEventListener('click', ev => { if (pane.classList.contains('on') && !pane.contains(ev.target) && !chip.contains(ev.target)) openPane(false); });

  /* feu d’artifice : le 24 à partir de 18 h, et le 25 */
  function fireworks() {
    if (calm) return;
    const c = document.createElement('canvas'); c.className = 'sxn-fw'; document.body.appendChild(c);
    const x = c.getContext('2d'), d = Math.min(2, devicePixelRatio || 1); c.width = innerWidth * d; c.height = innerHeight * d;
    const P = [], COLORS = ['#FFC93C', '#E0322B', '#3CB46E', '#F2F1EC', '#A9C7D8'];
    let n = 0, end = Date.now() + 6500;
    const burst = () => { const cx = (.15 + Math.random() * .7) * c.width, cy = (.12 + Math.random() * .35) * c.height, col = COLORS[n++ % COLORS.length]; for (let i = 0; i < 70; i++) { const a = Math.random() * 7, v = (1 + Math.random() * 4) * d; P.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, col }); } };
    const iv = setInterval(burst, 450); burst();
    (function f() {
      x.clearRect(0, 0, c.width, c.height);
      for (const p of P) { p.x += p.vx; p.y += p.vy; p.vy += .05 * d; p.vx *= .985; p.l -= .012; if (p.l > 0) { x.globalAlpha = p.l; x.fillStyle = p.col; x.fillRect(p.x, p.y, 2.4 * d, 2.4 * d); } }
      x.globalAlpha = 1;
      if (Date.now() > end) clearInterval(iv);
      if (Date.now() < end + 2500) requestAnimationFrame(f); else c.remove();
    })();
  }

  const start = () => {
    document.body.append(chip, pane); drawChip(); setInterval(drawChip, 30000);
    requestAnimationFrame(() => setTimeout(() => chip.classList.add('on'), 800));
    snow(); hat();
    const d = now();
    if (d.getMonth() === 11 && ((d.getDate() === 24 && d.getHours() >= 18) || d.getDate() === 25)) {
      const k = 'sx-fw-' + d.getFullYear() + '-' + d.getDate();
      try { if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, '1'); setTimeout(fireworks, 1200); } } catch (e) { setTimeout(fireworks, 1200); }
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.SX_NOEL = { fireworks, preview };
})();
