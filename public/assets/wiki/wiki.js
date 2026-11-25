/* Encyclopédie : apparitions, sommaire actif, recherche, article au hasard, « Le saviez-vous ? ». */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // titre mot par mot (lettres pour un mot seul)
  $$('[data-split]').forEach(el => {
    const nodes = [...el.childNodes]; el.textContent = ''; let i = 0;
    nodes.forEach(n => {
      const txt = n.textContent, cls = n.nodeType === 1 ? n.className : '';
      const parts = (n.nodeType === 3 && !/\s/.test(txt.trim())) ? [...txt] : txt.split(/(\s+)/);
      parts.forEach(bit => {
        if (!bit) return;
        if (/^\s+$/.test(bit)) { el.appendChild(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'w';
        const wi = document.createElement('span'); wi.className = 'wi' + (cls ? ' ' + cls : ''); wi.style.setProperty('--i', i++); wi.textContent = bit;
        w.appendChild(wi); el.appendChild(w);
      });
    });
  });
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('ready')));

  // apparitions
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
  $$('.r, .card').forEach(el => io.observe(el));

  // cartes qui s’inclinent
  if (fine && !reduce) $$('.card').forEach(c => {
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); c.style.setProperty('--tx', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg'); c.style.setProperty('--ty', ((e.clientY - r.top) / r.height - .5) * -10 + 'deg'); });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--tx', '0deg'); c.style.setProperty('--ty', '0deg'); });
  });

  // sommaire : section active + repère qui glisse
  const toc = $('.toc');
  if (toc) {
    const links = $$('ol a', toc), mk = $('.mk', toc), ol = $('ol', toc);
    const secs = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
    const art = $('.ibox .art span');
    const tick = () => {
      let cur = links[0];
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .35) cur = links[i]; });
      links.forEach(a => a.classList.toggle('on', a === cur));
      if (cur && mk) { const r = cur.getBoundingClientRect(), o = ol.getBoundingClientRect(); mk.style.height = r.height + 'px'; const t0 = toc.getBoundingClientRect(); mk.style.left = (o.left - t0.left) + 'px'; mk.style.transform = `translate3d(0,${r.top - t0.top}px,0)`; }
      if (art && !reduce) { const y = scrollY; art.style.setProperty('--py', (y * -.08).toFixed(1) + 'px'); art.style.setProperty('--rt', (y * -.02).toFixed(2) + 'deg'); }
    };
    let t = false; addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { tick(); t = false; }); } }, { passive: true });
    addEventListener('resize', tick); setTimeout(tick, 50);
  }

  // article au hasard
  const all = window.WIKI || [];
  const here = location.pathname.split('/').filter(Boolean).pop();
  $$('[data-rand]').forEach(b => b.addEventListener('click', () => {
    const pool = all.filter(a => a.s !== here); const a = pool[Math.floor(Math.random() * pool.length)];
    b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
    setTimeout(() => { location.href = (window.WIKI_BASE || '/wiki/') + a.s + '/'; }, reduce ? 0 : 380);
  }));

  // recherche instantanée
  const q = $('[data-search]');
  const params = new URLSearchParams(location.search);
  if (params.has('hasard') && all.length) { location.replace(location.pathname + all[Math.floor(Math.random() * all.length)].s + '/'); }
  if (q) {
    const cards = $$('.cat .card'), count = $('[data-count]'), none = $('[data-none]');
    const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    q.addEventListener('input', () => {
      const v = norm(q.value.trim()); let n = 0;
      cards.forEach(c => { const ok = !v || norm(c.dataset.q).includes(v); c.classList.toggle('hide', !ok); if (ok) n++; });
      $$('.cat').forEach(s => { s.hidden = !$$('.card:not(.hide)', s).length; });
      count.textContent = n; none.hidden = n > 0;
    });
    if (params.get('q')) { q.value = params.get('q'); q.dispatchEvent(new Event('input')); setTimeout(() => q.scrollIntoView({ block: 'center' }), 300); }
  }

  // le saviez-vous ?
  const dyk = $('[data-dyk]'), facts = window.DYK || [];
  if (dyk && facts.length) {
    let i = Math.floor(Math.random() * facts.length);
    const show = () => { const f = facts[i % facts.length]; dyk.textContent = f.t + ' › ' + f.n; dyk.href = (window.WIKI_BASE || '/wiki/') + f.s + '/'; };
    show();
    if (!reduce) setInterval(() => {
      dyk.classList.add('out');
      setTimeout(() => { i++; show(); dyk.classList.remove('out'); dyk.classList.add('pre'); void dyk.offsetWidth; dyk.classList.remove('pre'); }, 420);
    }, 4200);
  }
})();
