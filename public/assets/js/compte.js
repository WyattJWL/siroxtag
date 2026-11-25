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
          <label class="ax-ck"><input type="checkbox" name="consent" required> <span>J’ai lu la <a href="/confidentialite/" target="_blank">politique de confidentialité</a>. J’ai 15 ans ou plus, ou l’accord d’un parent.</span></label>
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
  return { api, me, logout, form, esc };
})();
