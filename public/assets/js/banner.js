/* Bannière d’annonce au-dessus du hero, gérée depuis l’admin du Studio.
   <script src="/assets/js/banner.js" data-target="siroxtag|m13|perso" defer></script>
   « Fermer » est retenu dans ce navigateur (clé sx-banner-x). */
(() => {
  'use strict';
  const me = document.currentScript, target = me && me.dataset.target;
  if (!target) return;
  const shut = () => { try { return JSON.parse(localStorage.getItem('sx-banner-x') || '[]'); } catch (e) { return []; } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const THEME = {
    siroxtag: 'background:#0B0B0B;color:#F2F1EC;font-family:Plex,ui-monospace,Menlo,monospace;letter-spacing:.04em',
    m13: 'background:#141A1F;color:#E7E3DA;font-family:Plex,ui-monospace,Menlo,monospace;letter-spacing:.06em;border-bottom:1px solid rgba(231,227,218,.14)',
    perso: 'background:rgba(255,255,255,.86);color:#1D1D1F;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif;-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid rgba(0,0,0,.08)'
  };
  const DOT = { info: target === 'm13' ? '#A9C7D8' : '#FF5B14', alerte: '#E6AA28', fete: '#3CB46E' };
  fetch('/api/studio?banner=' + target, { credentials: 'same-origin' }).then(r => r.ok ? r.json() : null).then(d => {
    const b = d && (d.banners || []).find(x => !shut().includes(x.id));
    if (!b) return;
    const bar = document.createElement('div');
    bar.className = 'sx-banner'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Annonce');
    bar.style.cssText = 'position:fixed;inset:0 0 auto 0;z-index:120;min-height:40px;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 46px 8px 16px;font-size:13px;line-height:1.35;text-align:center;transform:translateY(-100%);transition:transform .6s cubic-bezier(.16,1,.3,1);' + THEME[target];
    bar.innerHTML = `<span style="width:8px;height:8px;flex:none;background:${DOT[b.tone] || DOT.info};${target === 'perso' ? 'border-radius:50%' : ''}"></span><span>${esc(b.text)}</span>${b.link ? `<a href="${esc(b.link)}" style="color:inherit;font-weight:700;text-underline-offset:3px;white-space:nowrap">${esc(b.link_label || 'Voir')} →</a>` : ''}<button type="button" aria-label="Fermer l’annonce" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:28px;height:28px;border:0;background:none;color:inherit;font-size:18px;cursor:pointer;opacity:.6">×</button>`;
    document.body.prepend(bar);
    const css = document.createElement('style');
    const set = () => { const h = bar.offsetHeight; css.textContent = `html.sxb body{padding-top:${h}px}html.sxb .top,html.sxb .m-top,html.sxb header.nav,html.sxb .r-top,html.sxb .prog{top:${h}px!important}`; };
    document.head.appendChild(css); document.documentElement.classList.add('sxb'); set(); addEventListener('resize', set);
    requestAnimationFrame(() => { bar.style.transform = 'none'; });
    bar.querySelector('button').onclick = () => {
      try { localStorage.setItem('sx-banner-x', JSON.stringify([...shut(), b.id].slice(-30))); } catch (e) {}
      bar.style.transform = 'translateY(-100%)'; setTimeout(() => { bar.remove(); document.documentElement.classList.remove('sxb'); }, 500);
    };
  }).catch(() => {});
})();
