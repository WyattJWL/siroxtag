/* En-tête animé des pages perso : lettres qui montent, point qui rebondit,
   soulignement qui glisse, barre de lecture, menu plein écran sur mobile. */
(() => {
  const nav = document.querySelector('[data-nav]'); if (!nav) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const brand = nav.querySelector('.brand'), label = brand.querySelector('.bl');
  // découpe « Wyatt LE » en lettres
  const mask = document.createElement('span'); mask.className = 'brand-mask'; mask.setAttribute('aria-hidden', 'true');
  [...label.textContent].forEach((c, i) => {
    const s = document.createElement('span');
    if (c === ' ') { s.className = 'sp'; } else { s.className = 'ch'; s.textContent = c; }
    s.style.setProperty('--i', i); mask.appendChild(s);
  });
  label.replaceWith(mask);
  const dot = brand.querySelector('.dot');
  const links = [...nav.querySelectorAll('.nlinks a')];
  links.forEach((a, i) => a.style.setProperty('--i', i));
  requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add('go')));
  // le point rebondit de temps en temps (et quand on le survole)
  const boing = () => { dot.classList.remove('boing'); void dot.offsetWidth; dot.classList.add('boing'); };
  if (!reduce) { setInterval(boing, 5200); brand.addEventListener('mouseenter', () => setTimeout(boing, 250)); }

  // soulignement qui suit la souris, sinon le lien actif
  const ind = nav.querySelector('.ind'), box = nav.querySelector('.nlinks');
  let active = links.find(a => a.dataset.active !== undefined) || null;
  const place = a => {
    if (!a || getComputedStyle(box).display === 'none') { ind.classList.remove('show'); return; }
    const r = a.getBoundingClientRect(), b = box.getBoundingClientRect();
    ind.style.width = (r.width - 22) + 'px'; ind.style.transform = `translate3d(${r.left - b.left + 11}px,0,0)`; ind.classList.add('show');
  };
  links.forEach(a => { a.addEventListener('mouseenter', () => place(a)); });
  box.addEventListener('mouseleave', () => place(active));
  // liens « aimantés »
  if (!reduce && matchMedia('(pointer: fine)').matches) links.forEach(a => {
    a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect(); a.style.transform = `translate3d(${((e.clientX - r.left) / r.width - .5) * 6}px,${((e.clientY - r.top) / r.height - .5) * 4}px,0)`; a.style.transitionDelay = '0s'; });
    a.addEventListener('pointerleave', () => { a.style.transform = ''; });
  });
  // section active sur la page d’accueil perso
  const here = location.pathname.replace(/index\.html$/, '');
  const spy = links.map(a => { const u = new URL(a.href, location.href); return (u.pathname.replace(/index\.html$/, '') === here && u.hash) ? [a, document.querySelector(u.hash)] : null; }).filter(x => x && x[1]);
  setTimeout(() => place(active), 900);

  // barre de lecture, en-tête qui se cache en descendant
  const prog = nav.querySelector('.prog'); let lastY = scrollY, ticking = false;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    nav.classList.toggle('scrolled', y > 10);
    if (!document.documentElement.classList.contains('menu-open')) nav.classList.toggle('away', y > 160 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('away');
    lastY = y;
    if (spy.length) {
      let cur = null; spy.forEach(([a, el]) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight * .45 && r.bottom > innerHeight * .2) cur = a; });
      if (cur !== active) { if (active) active.classList.remove('on'); active = cur; if (active) active.classList.add('on'); if (!box.matches(':hover')) place(active); }
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', () => place(active)); onScroll();

  // menu plein écran (mobile)
  const burger = nav.querySelector('.burger'), menu = document.getElementById(burger.getAttribute('aria-controls'));
  const setMenu = open => {
    burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.documentElement.classList.toggle('menu-open', open);
    if (open) { menu.hidden = false; nav.classList.remove('away'); requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('open'))); }
    else { menu.classList.remove('open'); setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 700); }
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); } });
})();
