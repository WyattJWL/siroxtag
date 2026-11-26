/* PROJECT-M13 : motion design de la page d’accueil de la saga */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const e = SXA.esc;

  /* pluie de novembre : fine, de biais, sans conviction. Pendant les fêtes, elle tourne en neige. */
  const SNOW = (() => { const d = new Date(); let p = false; try { p = /[?&]noel=1/.test(location.search) || sessionStorage.getItem('sx-noel-preview') === '1'; } catch (er) {} return p || (d.getMonth() === 11 && d.getDate() >= 15 && d.getDate() <= 26); })();
  const cv = $('[data-rain]'), cx = cv.getContext('2d');
  let W, H, drops = [];
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); W = cv.width = cv.offsetWidth * d; H = cv.height = cv.offsetHeight * d; drops = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: Math.random() * W, y: Math.random() * H, l: 8 + Math.random() * 22, v: 3 + Math.random() * 5, a: .05 + Math.random() * .16 })); };
  size(); addEventListener('resize', size);
  let heroOn = true;
  new IntersectionObserver(([en]) => { heroOn = en.isIntersecting; }).observe(cv);
  const rain = () => {
    if (heroOn) {
      cx.clearRect(0, 0, W, H); cx.lineWidth = 1;
      for (const d of drops) {
        if (SNOW) { cx.fillStyle = `rgba(231,240,246,${d.a * 2.2})`; cx.beginPath(); cx.arc(d.x, d.y, d.l / 9, 0, 7); cx.fill(); if (!calm) { d.y += d.v * .22; d.x += Math.sin((d.y + d.l * 40) / 60) * .4; if (d.y > H) { d.y = -4; d.x = Math.random() * W; } } continue; }
        cx.strokeStyle = `rgba(216,233,242,${d.a})`; cx.beginPath(); cx.moveTo(d.x, d.y); cx.lineTo(d.x - d.l * .35, d.y + d.l); cx.stroke(); if (!calm) { d.y += d.v; d.x -= d.v * .35; if (d.y > H) { d.y = -d.l; d.x = Math.random() * (W + 200); } } }
    }
    if (!calm) requestAnimationFrame(rain);
  };
  rain();

  /* le titre se reconstruit à partir de fragments */
  const h1 = $('[data-title]'), txt = h1.textContent; h1.innerHTML = '';
  [...txt].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch; s.setAttribute('aria-hidden', 'true'); if (ch === '-') s.className = 'dash'; s.style.cssText = `--x:${(Math.random() - .5) * 60}vw;--y:${(Math.random() - .5) * 50}vh;--r:${(Math.random() - .5) * 180}deg;--d:${.1 + i * .07}s`; h1.appendChild(s); });
  requestAnimationFrame(() => setTimeout(() => $('[data-hero]').classList.add('on'), 60));

  /* la phrase se tape comme sur une vieille machine */
  const tag = $('[data-type]'), sentence = tag.dataset.type;
  if (calm) tag.textContent = sentence;
  else { let k = 0; tag.innerHTML = '<span></span><i aria-hidden="true"></i>'; const sp = tag.firstChild; setTimeout(function step() { sp.textContent = sentence.slice(0, ++k); if (k < sentence.length) setTimeout(step, sentence[k - 1] === ',' ? 260 : 28 + Math.random() * 40); }, 1500); }

  /* apparitions au défilement */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .18 });
  $$('.rv').forEach(el => io.observe(el));

  /* la citation s’allume mot par mot, au rythme du défilement */
  const q = $('[data-words]'); q.innerHTML = q.textContent.split(' ').map(w => `<span class="w">${e(w)}</span>`).join(' ');
  const ws = $$('.w', q);
  /* le tome 4 s’efface lettre par lettre */
  const er = $$('[data-erase] .er').flatMap(el => { el.innerHTML = [...el.textContent].map(c => `<span>${e(c)}</span>`).join(''); return $$('span', el); });
  const order = er.map((s, i) => [s, Math.random()]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const onScroll = () => {
    const r = q.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .4)));
    ws.forEach((w, i) => w.classList.toggle('lit', i / ws.length < p));
    const s = $('[data-erase]').getBoundingClientRect(), pe = Math.min(.92, Math.max(0, (innerHeight * .55 - s.top) / (innerHeight * .9)));
    order.forEach((sp, i) => sp.classList.toggle('gone', i / order.length < pe));
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* le distributeur : sa lampe clignote trois secondes allumée, une seconde éteinte */
  const mac = $('[data-machine]');
  if (!calm) (function blink() { mac.classList.remove('off'); setTimeout(() => { mac.classList.add('off'); setTimeout(blink, 1000); }, 3000); })();
  const OBJ = {
    gourmette: ['Une gourmette', 'Avec un prénom que Darius ne reconnaît pas.'],
    ticket: ['Un ticket de cinéma', 'Jauni, pour un film sorti avant sa naissance.'],
    lunettes: ['Une paire de lunettes d’enfant', 'Quelqu’un, quelque part, a dû mal y voir pendant longtemps.'],
    dent: ['Une dent de lait', 'Dans un petit sachet. Gardée par qui ?'],
    collier: ['Un collier pour chien, taille S', 'Cuir marron, légèrement rongé sur la boucle. Six euros quatre-vingts. Darius le connaît.']
  };
  const lab = $('[data-label]');
  const show = k => { lab.innerHTML = `<b>${e(OBJ[k][0])}</b><p>${e(OBJ[k][1])}</p>`; if (k === 'collier' && window.SX) window.SX.toast('Miel…'); };
  $$('.hot', mac).forEach(g => { g.addEventListener('click', () => show(g.dataset.k)); g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); show(g.dataset.k); } }); g.addEventListener('mouseenter', () => show(g.dataset.k)); });

  /* les chapitres, leur date de sortie et ma progression */
  const TOMES = ['La Page 404', 'Les Pages retirées', 'Les Pages ajoutées', 'Les Pages effacées'];
  const fmtDate = d => new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  let nextAt = null, lastLoad = 0;
  async function loadToc() {
    let d;
    try { d = await SXA.api('m13'); } catch (er) { $('[data-toc]').innerHTML = `<p class="mono" style="padding:20px 0">${e(er.message)}</p>`; return; }
    const prog = Object.fromEntries((d.progress || []).map(p => [p.t + '-' + p.c, p]));
    $('[data-toc]').innerHTML = [1, 2, 3, 4].map(t => {
      const chs = d.chapters.filter(c => c.t === t), open = chs.filter(c => c.open).length;
      return `<div class="tome-h" id="tome-${t}"><h3>Tome ${t} · ${e(TOMES[t - 1])}</h3><span class="mono">${open ? `${open} / ${chs.length} sortis` : `à partir du ${e(fmtDate(chs[0].date))}`}</span></div>` +
        chs.map(c => {
          const p = prog[t + '-' + c.c], pct = p ? (p.done ? 100 : p.pct) : 0;
          if (!c.open) return `<div class="ch lock" data-at="${e(c.date)}"><span class="no">${String(c.c).padStart(2, '0')}</span><span class="tt" aria-label="Chapitre pas encore sorti"></span><span class="st">${e(fmtDate(c.date))}</span></div>`;
          return `<a class="ch${p && p.done ? ' done' : ''}" style="--p:${pct}" href="/m13/lire/?t=${t}&c=${c.c}"><span class="no">${String(c.c).padStart(2, '0')}</span><span class="tt">${e(c.title)}</span><span class="st">${p && p.done ? 'lu' : pct ? `${pct} %` : `${Math.max(1, Math.round(c.words / 230))} min`}</span></a>`;
        }).join('');
    }).join('');
    if (d.next) { nextAt = Date.parse(d.next); $('[data-next]').hidden = false; $('[data-nd]').textContent = fmtDate(d.next) + ', 7 h'; tick(); }
  }
  const left = s => `${String(Math.floor(s / 3600)).padStart(2, '0')} h ${String(Math.floor(s % 3600 / 60)).padStart(2, '0')} min ${String(s % 60).padStart(2, '0')} s`;
  const tick = () => {
    // dans les 24 h avant sa sortie, un chapitre affiche le temps restant, à la seconde
    let reload = false;
    $$('[data-at]').forEach(r => { const s = Math.floor((Date.parse(r.dataset.at) - Date.now()) / 1000), st = r.querySelector('.st');
      if (s <= 0) { reload = true; return; }
      if (s < 86400) { r.classList.add('soon'); st.innerHTML = `<b>Sortie dans</b> ${left(s)}`; } });
    if (reload && Date.now() - lastLoad > 10000) { lastLoad = Date.now(); loadToc(); return; }
    if (!nextAt) return; const s = Math.max(0, Math.floor((nextAt - Date.now()) / 1000));
    if (!s) { loadToc(); return; }
    const j = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    $('[data-cd]').textContent = `${j ? j + ' j ' : ''}${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')} min ${String(sec).padStart(2, '0')} s`;
  };
  setInterval(tick, 1000);

  /* le compte : le même que sur Siroxtag */
  async function acc() {
    const box = $('[data-acc]'), u = await SXA.me();
    if (u) {
      let last = null; try { const d = await SXA.api('m13'); last = (d.progress || []).filter(p => !p.done).sort((a, b) => b.t - a.t || b.c - a.c)[0] || null; } catch (er) {}
      box.innerHTML = `<p class="mono">Connecté</p><p style="font-size:26px;font-weight:800;margin:8px 0 0">${e(u.pseudo)}${SXA.badges(u)}</p><p style="color:var(--mut)">Ta progression est enregistrée sur ton compte.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px">${last ? `<a class="m-btn fill" href="/m13/lire/?t=${last.t}&c=${last.c}">Reprendre · tome ${last.t}, chapitre ${last.c}</a>` : '<a class="m-btn fill" href="/m13/lire/?t=1&c=1">Lire le chapitre 1</a>'}<a class="m-btn" href="/compte/">Mon compte</a></div>`;
    } else SXA.form(box, { next: '/m13/', onDone: () => { acc(); loadToc(); } });
  }
  loadToc(); acc();

  /* succès : entrer dans PROJECT-M13 */
  addEventListener('load', () => setTimeout(() => window.SX && window.SX.ach('m13'), 2500));
})();
