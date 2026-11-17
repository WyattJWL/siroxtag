/* Siroxtag — animations et cookies. Pas de bibliothèque, pas de traceur. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- 1. titres découpés en mots ---------- */
  function splitWords(el) {
    const parts = [];
    (function walk(n, cls) {
      for (const c of Array.from(n.childNodes)) {
        if (c.nodeType === 3) parts.push({ t: c.textContent, cls });
        else if (c.nodeType === 1) walk(c, (cls ? cls + ' ' : '') + c.className);
      }
    })(el, '');
    el.textContent = '';
    let host = null, i = 0;
    for (const p of parts) {
      for (const bit of p.t.split(/([ \t\n\r]+)/)) {
        if (!bit) continue;
        if (/^[ \t\n\r]+$/.test(bit)) { el.appendChild(document.createTextNode(' ')); host = null; continue; }
        if (!host) {
          const w = document.createElement('span'); w.className = 'w';
          host = document.createElement('span'); host.className = 'wi'; host.style.setProperty('--i', i++);
          w.appendChild(host); el.appendChild(w);
        }
        if (p.cls) { const s = document.createElement('span'); s.className = p.cls; s.textContent = bit; host.appendChild(s); }
        else host.appendChild(document.createTextNode(bit));
      }
    }
  }
  $$('[data-split]').forEach(splitWords);

  /* titre du héros : lettre par lettre */
  const ht = $('.hero-title .rig');
  if (ht) {
    let i = 0;
    $$('[data-chars]', ht).forEach(part => {
      const txt = part.textContent; part.textContent = '';
      for (const ch of txt) {
        const m = document.createElement('span'); m.className = 'chm';
        const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; c.style.setProperty('--i', i++);
        m.appendChild(c); part.appendChild(m);
      }
    });
  }

  /* ---------- 2. compteurs ---------- */
  const fmt = (v, dec) => {
    const s = dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  function count(el) {
    const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suf || '';
    if (reduce) { el.textContent = fmt(to, dec) + suf; return; }
    const t0 = performance.now(), dur = 1800;
    const step = now => {
      const p = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(to * e, dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- 3. apparitions au scroll ---------- */
  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      el.classList.add('in');
      if (el.dataset.count) count(el);
      io.unobserve(el);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  $$('[data-rv],[data-split],[data-count]').forEach(el => io.observe(el));

  /* ---------- 4. intro ---------- */
  const go = () => requestAnimationFrame(() => document.documentElement.classList.add('ready'));
  if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(go); else go();

  /* ---------- 5. menu mobile ---------- */
  const mb = $('.menu-btn'), dr = $('.drawer');
  if (mb && dr) {
    const set = open => {
      dr.classList.toggle('open', open); document.body.classList.toggle('menu-open', open);
      mb.setAttribute('aria-expanded', String(open)); mb.textContent = open ? 'Fermer' : 'Menu';
      dr.setAttribute('aria-hidden', String(!open));
    };
    mb.addEventListener('click', () => set(!dr.classList.contains('open')));
    $$('a', dr).forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  /* ---------- 6. L en 3D (Linear) ---------- */
  function cuboid(w, h, d, x, y, z, cls, skip) {
    const b = document.createElement('div'); b.className = 'cub ' + (cls || '');
    b.style.transform = `translate3d(${x}px,${y}px,${z}px)`;
    const faces = [
      ['f', w, h, `translateZ(${d / 2}px)`], ['k', w, h, `rotateY(180deg) translateZ(${d / 2}px)`],
      ['r', d, h, `rotateY(90deg) translateZ(${w / 2}px)`], ['l', d, h, `rotateY(-90deg) translateZ(${w / 2}px)`],
      ['t', w, d, `rotateX(90deg) translateZ(${h / 2}px)`], ['b', w, d, `rotateX(-90deg) translateZ(${h / 2}px)`]
    ];
    for (const [k, fw, fh, tf] of faces) {
      if (skip && skip.includes(k)) continue;
      const f = document.createElement('i'); f.className = 'face ' + k;
      f.style.cssText = `width:${fw}px;height:${fh}px;left:${-fw / 2}px;top:${-fh / 2}px;transform:${tf}`;
      b.appendChild(f);
    }
    return b;
  }
  const lrig = $('.l3d-rig');
  if (lrig) {
    lrig.appendChild(cuboid(140, 470, 140, -130, -45, 0, '', ['b']));
    lrig.appendChild(cuboid(400, 140, 140, 0, 260, 0));
    lrig.appendChild(cuboid(730, 10, 10, -55, 262, 0, 'rod'));
    const ball = document.createElement('div'); ball.className = 'ball';
    ball.style.transform = 'translate3d(332px,262px,0)';
    for (const a of [0, 60, 120]) { const i = document.createElement('i'); i.style.transform = `rotateY(${a}deg)`; ball.appendChild(i); }
    lrig.appendChild(ball);
  }

  const lScale = () => { const m = lrig.parentNode.parentNode; return clamp(Math.min(m.offsetWidth, m.offsetHeight) / 1000, .22, .62).toFixed(3); };

  /* ---------- 7. BLACKOUT : la lampe torche ---------- */
  const bo = $('.bo');
  let boPointer = false;
  if (bo) {
    const lit = $('.pic.lit', bo);
    const move = (x, y) => { lit.style.setProperty('--x', x + 'px'); lit.style.setProperty('--y', y + 'px'); };
    bo.addEventListener('pointermove', e => { const r = bo.getBoundingClientRect(); boPointer = true; move(e.clientX - r.left, e.clientY - r.top); });
    bo.addEventListener('pointerleave', () => { boPointer = false; });
    bo._move = move;
  }

  /* ---------- 8. projets en défilement horizontal ---------- */
  const pj = $('.projets'), track = $('.pj-track');
  let pjOn = false;
  function layoutProjects() {
    if (!pj || !track) return;
    pjOn = !reduce && innerWidth >= 1000;
    pj.classList.toggle('h', pjOn);
    if (pjOn) {
      const extra = track.scrollWidth - innerWidth;
      pj.style.height = (innerHeight + extra) + 'px';
    } else { pj.style.height = ''; track.style.transform = ''; }
  }
  addEventListener('resize', layoutProjects);
  addEventListener('load', layoutProjects);
  layoutProjects();

  /* ---------- 9. boucle : scroll, héros, bandeau ---------- */
  const prog = $('.prog'), mq = $('.mq-track'), heroRig = ht, top = $('.top');
  let hidden = false;
  let lastY = scrollY, vel = 0, mqX = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  if (fine) addEventListener('pointermove', e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
  function frame(now) {
    const y = scrollY, H = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${H > 0 ? y / H : 0})`;
    const dy = y - lastY;
    if (top && !document.body.classList.contains('menu-open')) {
      if (dy > 4 && y > 240 && !hidden) { top.classList.add('hide'); hidden = true; }
      else if ((dy < -4 || y < 120) && hidden) { top.classList.remove('hide'); hidden = false; }
    }
    vel += (dy - vel) * .12; lastY = y;
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    if (!reduce) {
      if (mq) {
        mqX -= 0.6 + Math.abs(vel) * 0.35;
        const w = mq.scrollWidth / 2;
        if (w > 0 && -mqX > w) mqX += w;
        mq.style.transform = `translate3d(${mqX.toFixed(1)}px,0,0) skewX(${clamp(-vel * .25, -12, 12).toFixed(2)}deg)`;
      }
      if (heroRig && y < innerHeight * 1.2) {
        const k = y / innerHeight;
        heroRig.style.transform = `translate3d(0,${(k * 120).toFixed(1)}px,0) rotateX(${(my * -9 + k * 18).toFixed(2)}deg) rotateY(${(mx * 12).toFixed(2)}deg) scale(${(1 - k * .12).toFixed(3)})`;
      }
      if (pjOn) {
        const r = pj.getBoundingClientRect();
        const max = pj.offsetHeight - innerHeight;
        const p = clamp(-r.top / (max || 1), 0, 1);
        track.style.transform = `translate3d(${(-p * (track.scrollWidth - innerWidth)).toFixed(1)}px,0,0)`;
        if (lrig) { const s = lScale(); lrig.style.transform = `rotateX(${(-14 - my * 8).toFixed(2)}deg) rotateY(${(-40 + p * 260 + mx * 20).toFixed(2)}deg) scale3d(${s},${s},${s})`; }
      } else if (lrig) {
        const r = lrig.closest('.pj').getBoundingClientRect();
        const p = clamp(1 - (r.top + r.height / 2) / innerHeight, 0, 1);
        const s = lScale();
        lrig.style.transform = `rotateX(-14deg) rotateY(${(-60 + p * 200).toFixed(2)}deg) scale3d(${s},${s},${s})`;
      }
      if (bo && !boPointer && bo._move) {
        const r = bo.getBoundingClientRect(), t = now / 1000;
        bo._move(r.width * (.5 + Math.sin(t * .7) * .28), r.height * (.45 + Math.sin(t * 1.1) * .18));
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 10. transition vers une autre page (le L qui grandit) ---------- */
  $$('a[data-veil]').forEach(a => a.addEventListener('click', e => {
    if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    const v = document.createElement('div'); v.className = 'veil';
    const i = document.createElement('i'); v.appendChild(i); document.body.appendChild(v);
    const S = 200, D = Math.hypot(innerWidth, innerHeight) / 2, k = D / (S * .2) * 1.15;
    i.style.left = (innerWidth / 2 - S * .2) + 'px'; i.style.top = (innerHeight / 2 - S * .8) + 'px';
    i.style.background = a.dataset.veil || '#0B0B0B';
    i.animate([{ transform: 'scale(.02) rotate(-24deg)' }, { transform: `scale(${k}) rotate(0deg)` }], { duration: 820, easing: 'cubic-bezier(.7,0,.84,0)', fill: 'forwards' })
      .finished.then(() => { location.href = a.href; });
  }));
  addEventListener('pageshow', e => { if (e.persisted) $$('.veil').forEach(v => v.remove()); });

  /* ---------- 11. cookies : seules les vidéos TikTok en déposent ---------- */
  const KEY = 'sx-consent', MAX = 182 * 24 * 3600 * 1000; // choix gardé 6 mois
  const read = () => { try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && Date.now() - c.t < MAX ? c : null; } catch (e) { return null; } };
  const save = tiktok => { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, tiktok, t: Date.now() })); } catch (e) {} };
  const cc = $('.cc');
  function loadVideos() {
    $$('.vframe[data-tt]').forEach(f => {
      if (f.classList.contains('live')) return;
      const id = f.dataset.tt;
      const ifr = document.createElement('iframe');
      ifr.src = `https://www.tiktok.com/player/v1/${id}?music_info=1&description=1&rel=0`;
      ifr.title = f.dataset.title || 'Vidéo TikTok';
      ifr.allow = 'fullscreen';
      ifr.loading = 'lazy';
      f.appendChild(ifr); f.classList.add('live');
    });
  }
  function unloadVideos() {
    $$('.vframe.live').forEach(f => { $$('iframe', f).forEach(i => i.remove()); f.classList.remove('live'); });
  }
  function apply(c) { if (c && c.tiktok) loadVideos(); else unloadVideos(); }
  function openCC() { if (cc) { cc.classList.add('show'); cc.setAttribute('aria-hidden', 'false'); } }
  function closeCC() { if (cc) { cc.classList.remove('show'); cc.setAttribute('aria-hidden', 'true'); } }
  const current = read();
  apply(current);
  if (!current) setTimeout(openCC, 1400);
  if (cc) $$('[data-cc]', cc).forEach(b => b.addEventListener('click', () => {
    const ok = b.dataset.cc === 'accept'; save(ok); apply({ tiktok: ok }); closeCC();
  }));
  $$('[data-cookies]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); openCC(); }));
  $$('.vframe [data-load]').forEach(b => b.addEventListener('click', () => { save(true); apply({ tiktok: true }); closeCC(); }));
})();
