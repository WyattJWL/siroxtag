/* Espace membre : connexion, inscription, appels à l’API. Utilisé par /compte/, /studio/ et le coin jeux. */
window.SXA = (() => {
  'use strict';
  const api = async (path, opts = {}) => {
    const r = await fetch('/api/' + path, { method: opts.method || 'GET', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-SX': '1' }, body: opts.body ? JSON.stringify(opts.body) : undefined });
    let d = {}; try { d = await r.json(); } catch (e) {}
    if (!r.ok) throw Object.assign(new Error(d.error || 'Le serveur ne répond pas. Réessaie dans un moment.'), { status: r.status });
    return d;
  };
  let meP = null;
  const me = (fresh) => { if (!meP || fresh) meP = api('auth/me').then(d => d.user).catch(() => null); return meP; };
  const logout = async () => { await api('auth/logout', { method: 'POST' }).catch(() => {}); meP = null; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // bloc connexion / inscription
  function form(el, { next = location.pathname, onDone } = {}) {
    const n = encodeURIComponent(next);
    el.innerHTML = `
      <div class="ax">
        <a class="ax-discord" href="/api/auth/discord?next=${n}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.6 1.3a18.3 18.3 0 0 0-5.6 0L8.6 3a19.7 19.7 0 0 0-4.9 1.5A20.4 20.4 0 0 0 .2 18.1a19.9 19.9 0 0 0 6 3l1.3-2a12.9 12.9 0 0 1-2-1l.5-.4a14.2 14.2 0 0 0 12 0l.5.4c-.6.4-1.3.7-2 1l1.3 2a19.8 19.8 0 0 0 6-3 20.3 20.3 0 0 0-3.5-13.7ZM8.3 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Zm7.4 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4Z"/></svg>Continuer avec Discord</a>
        <p class="ax-or"><span>ou avec un e-mail</span></p>
        <div class="ax-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-t="login">Connexion</button><button type="button" role="tab" aria-selected="false" data-t="register">Inscription</button></div>
        <form class="ax-f" data-f="login">
          <label>E-mail ou pseudo<input name="login" autocomplete="username" required></label>
          <label>Mot de passe<input name="password" type="password" autocomplete="current-password" required></label>
          <button class="ax-btn" type="submit">Se connecter →</button>
        </form>
        <form class="ax-f" data-f="register" hidden>
          <label>Pseudo <small>3 à 20 caractères, visible dans les classements</small><input name="pseudo" autocomplete="nickname" minlength="3" maxlength="20" pattern="[A-Za-z0-9_.\\-]{3,20}" required></label>
          <label>E-mail <small>pour te connecter, jamais affiché</small><input name="email" type="email" autocomplete="email" required></label>
          <label>Mot de passe <small>10 caractères minimum</small><input name="password" type="password" autocomplete="new-password" minlength="10" required></label>
          <label class="ax-ck"><input type="checkbox" name="consent" required> <span>J’accepte les <a href="/conditions/" target="_blank">conditions d’utilisation</a> et j’ai lu la <a href="/confidentialite/" target="_blank">politique de confidentialité</a>. J’ai 15 ans ou plus, ou l’accord d’un parent.</span></label>
          <button class="ax-btn" type="submit">Créer mon compte →</button>
        </form>
        <p class="ax-msg" aria-live="polite"></p>
      </div>`;
    const msg = el.querySelector('.ax-msg');
    if (/erreur=discord/.test(location.search)) msg.textContent = 'La connexion avec Discord n’a pas abouti. Réessaie.';
    el.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => {
      el.querySelectorAll('[data-t]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
      el.querySelectorAll('[data-f]').forEach(f => { f.hidden = f.dataset.f !== b.dataset.t; });
      msg.textContent = '';
    }));
    el.querySelectorAll('form').forEach(f => f.addEventListener('submit', async e => {
      e.preventDefault(); const btn = f.querySelector('button'); btn.disabled = true; msg.textContent = '…';
      const d = Object.fromEntries(new FormData(f)); if (f.dataset.f === 'register') d.consent = !!f.consent.checked;
      try {
        await api(f.dataset.f === 'login' ? 'auth/login' : 'auth/register', { method: 'POST', body: d });
        msg.textContent = ''; const u = await me(true); onDone && onDone(u);
      } catch (err) { msg.textContent = err.message; }
      btn.disabled = false;
    }));
  }
  // badges : check bleu = compte TikTok certifié, couronne = compte officiel Siroxtag
  const badges = u => (u && u.verified ? '<span class="sx-badge sx-ver" tabindex="0" role="img" aria-label="Compte TikTok certifié" data-tip="Compte TikTok certifié"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#20D5EC" stroke="#20D5EC" stroke-width="1.2" stroke-linejoin="round" d="M23.00,12.00 L21.27,14.48 L21.53,17.50 L18.79,18.79 L17.50,21.53 L14.48,21.27 L12.00,23.00 L9.52,21.27 L6.50,21.53 L5.21,18.79 L2.47,17.50 L2.73,14.48 L1.00,12.00 L2.73,9.52 L2.47,6.50 L5.21,5.21 L6.50,2.47 L9.52,2.73 L12.00,1.00 L14.48,2.73 L17.50,2.47 L18.79,5.21 L21.53,6.50 L21.27,9.52Z"/><path d="M7.6 12.3l3 3 5.8-6.4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : '')
    + (u && u.owner ? '<span class="sx-badge sx-crown" tabindex="0" role="img" aria-label="OUI C’EST BIEN MOI" data-tip="OUI C’EST BIEN MOI"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" fill="#FFC93C" stroke="#E0A400" stroke-width="1.2" stroke-linejoin="round"/><circle cx="12" cy="15" r="1.6" fill="#FF5B14"/></svg></span>' : '');
  return { api, me, logout, form, esc, badges };
})();
