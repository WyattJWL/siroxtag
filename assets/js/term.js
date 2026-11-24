/* Terminal caché (en bas à droite) + easter eggs. Utilisé sur siroxtag.fr et /perso/.
   Le site se choisit avec <script src="term.js" data-site="siroxtag|perso">. */
(() => {
  'use strict';
  const me = document.currentScript;
  const SITE = (me && me.dataset.site) || 'siroxtag';
  const PERSO = SITE === 'perso';
  const MAIL = 'contact@siroxtag.fr';
  const PROMPT = PERSO ? 'wyatt@perso:~$' : 'siroxtag@web:~$';

  /* ---------- styles ---------- */
  const css = `
  .tm-btn{position:fixed;right:18px;bottom:18px;z-index:70;width:48px;height:48px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#141416;color:#F2F1EC;font:600 15px/1 ui-monospace,'SF Mono','Plex',Menlo,monospace;cursor:pointer;box-shadow:0 12px 30px -8px rgba(0,0,0,.45);transition:transform .35s cubic-bezier(.16,1,.3,1)}
  .tm-btn:hover{transform:translateY(-3px)}
  .tm-btn span{display:inline-block;animation:tmcaret 1.2s steps(1) infinite}
  @keyframes tmcaret{50%{opacity:.25}}
  .tm{position:fixed;right:18px;bottom:76px;z-index:71;width:min(430px,calc(100vw - 36px));height:min(330px,60vh);display:flex;flex-direction:column;background:#141416;color:#E8E8ED;border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 30px 70px -20px rgba(0,0,0,.55);font:13.5px/1.55 ui-monospace,'SF Mono','Plex',Menlo,monospace;opacity:0;visibility:hidden;transform:translateY(14px) scale(.97);transform-origin:100% 100%;transition:opacity .25s ease,transform .45s cubic-bezier(.16,1,.3,1),visibility 0s linear .45s}
  .tm.open{opacity:1;visibility:visible;transform:none;transition:opacity .25s ease,transform .45s cubic-bezier(.16,1,.3,1),visibility 0s}
  .tm-top{display:flex;align-items:center;gap:7px;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  .tm-top i{width:11px;height:11px;border-radius:50%;background:#3A3A3C}
  .tm-top b{margin-left:auto;font-weight:500;font-size:12px;color:#8E8E93}
  .tm-top button{background:none;border:0;color:#8E8E93;font:inherit;cursor:pointer;padding:0 0 0 10px}
  .tm-out{flex:1;overflow-y:auto;padding:12px 14px 4px;white-space:pre-wrap;word-break:break-word;scrollbar-width:thin}
  .tm-out a{color:#9CC4F2}
  .tm-out .p{color:#A8D8B9}.tm-out .e{color:#FF9F8A}.tm-out .m{color:#8E8E93}
  .tm-in{display:flex;gap:8px;padding:8px 14px 13px}
  .tm-in label{color:#A8D8B9;white-space:nowrap}
  .tm-in input{flex:1;min-width:0;background:none;border:0;outline:0;color:#F2F1EC;font:inherit;caret-color:#F2F1EC}
  .tm-toast{position:fixed;left:50%;top:22px;z-index:90;transform:translate(-50%,-20px);opacity:0;background:#141416;color:#F2F1EC;font:500 14px/1.3 ui-monospace,'SF Mono','Plex',Menlo,monospace;padding:12px 16px;border-radius:12px;box-shadow:0 20px 40px -12px rgba(0,0,0,.45);transition:opacity .3s ease,transform .5s cubic-bezier(.16,1,.3,1);pointer-events:none}
  .tm-toast.show{opacity:1;transform:translate(-50%,0)}
  .tm-shake{animation:tmshake .5s cubic-bezier(.36,.07,.19,.97)}
  @keyframes tmshake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-8px)}40%,60%{transform:translateX(8px)}}
  html.fun,html.fun body{transition:background-color .6s ease}
  @media (max-width:600px){.tm{right:12px;left:12px;width:auto;bottom:74px}.tm-btn{right:12px;bottom:12px}}
  @media (prefers-reduced-motion:reduce){.tm-shake{animation:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- interface ---------- */
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'tm-btn'; btn.setAttribute('aria-label', 'Ouvrir le terminal'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '›<span>_</span>';
  const box = document.createElement('div');
  box.className = 'tm'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Terminal');
  box.innerHTML = `<div class="tm-top"><i></i><i></i><i></i><b>terminal — ${PERSO ? 'wyatt' : 'siroxtag'}</b><button type="button" aria-label="Fermer">✕</button></div>
    <div class="tm-out" aria-live="polite"></div>
    <form class="tm-in"><label for="tm-input">${PROMPT}</label><input id="tm-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Commande"></form>`;
  document.body.append(btn, box);
  const out = box.querySelector('.tm-out'), input = box.querySelector('input'), form = box.querySelector('form');

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const print = (html, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const toast = (() => { const t = document.createElement('div'); t.className = 'tm-toast'; document.body.appendChild(t); let to; return msg => { t.textContent = msg; t.classList.add('show'); clearTimeout(to); to = setTimeout(() => t.classList.remove('show'), 2600); }; })();
  const go = sel => { const el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const shake = () => { document.body.classList.remove('tm-shake'); void document.body.offsetWidth; document.body.classList.add('tm-shake'); };

  /* mode fun : des couleurs partout */
  const FUNKEY = 'sx-fun';
  const setFun = on => { document.documentElement.classList.toggle('fun', on); try { on ? localStorage.setItem(FUNKEY, '1') : localStorage.removeItem(FUNKEY); } catch (e) {} };
  try { if (localStorage.getItem(FUNKEY) === '1') setFun(true); } catch (e) {}
  const toggleFun = () => { const on = !document.documentElement.classList.contains('fun'); setFun(on); return on; };

  /* ---------- commandes ---------- */
  const common = {
    help: { d: 'la liste des commandes', f: () => {
      const rows = Object.entries(cmds).filter(([, c]) => c.d).map(([k, c]) => `<span class="p">/${k.padEnd(10)}</span>${esc(c.d)}`);
      print(rows.join('\n') + '\n<span class="m">Astuce : tape un mot au clavier, n’importe où sur la page… certains font des trucs.</span>');
    } },
    whoami: { d: 'qui est là ?', f: () => print(PERSO ? 'Wyatt LE. Dieu du code autoproclamé. Classement mondial : premier (selon moi).' : 'Siroxtag. Créateur indépendant. Pas Inoxtag, hein.') },
    contact: { d: 'me contacter', f: () => print(`<a href="mailto:${MAIL}">${MAIL}</a>`) },
    fun: { d: 'des couleurs partout', f: () => { const on = toggleFun(); print(on ? 'Mode fun activé. Les couleurs sont lâchées.' : 'Retour au sérieux. Enfin, presque.'); toast(on ? 'Mode fun activé' : 'Mode fun désactivé'); } },
    ls: { d: 'les pages du site', f: () => print(PERSO ? '<a href="./">perso/</a>   <a href="/">siroxtag.fr/</a>   <a href="/Linear/">Linear/</a>' : '<a href="/">index.html</a>   <a href="/Linear/">Linear/</a>   <a href="/mentions-legales/">mentions-legales/</a>') },
    date: { d: 'la date', f: () => print(new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })) },
    clear: { d: 'nettoyer l’écran', f: () => { out.innerHTML = ''; } },
    exit: { d: 'fermer le terminal', f: () => close() },
    sudo: { f: () => print('Bien essayé. Tu n’es pas dans le fichier sudoers. Cet incident sera signalé (à personne).', 'e') },
    rm: { f: () => print('Non.', 'e') },
    hack: { f: () => print('Accès refusé. Ici, c’est hacking éthique uniquement.', 'e') },
    inoxtag: { f: () => { shake(); print('Erreur 404 : Inoxtag introuvable. Tu cherches Siroxtag. Avec un S. Et un R.', 'e'); } },
    siroxtag: { f: () => print('Oui ? C’est moi. Enfin, lui. Bref.') },
    echo: { f: a => print(esc(a || '')) },
    hello: { f: () => print('Salut ! Tape /help si t’es perdu.') }
  };
  const main = {
    tiktok: { d: 'mon compte TikTok', f: () => print('<a href="https://www.tiktok.com/@siroxletag" target="_blank" rel="noopener">@siroxletag</a> · 2 085 abonnés · 10,1 k j’aime') },
    videos: { d: 'aller aux vidéos', f: () => { go('#videos'); print('Direction les vidéos…', 'm'); } },
    blackout: { d: 'mon jeu d’horreur', f: () => print('BLACKOUT · 9 chapitres · 1 à 12 joueurs · <a href="https://blackouthorror.fr/" target="_blank" rel="noopener">blackouthorror.fr</a>\nNe laisse pas la lumière s’éteindre.') },
    linear: { d: 'le dossier RP', f: () => print('<a href="/Linear/">Ouvrir le dossier Linear.</a> (Espace pour avancer)') },
    projets: { d: 'aller aux projets', f: () => { go('#projets'); print('On y va…', 'm'); } },
    faq: { d: 'les questions', f: () => { go('#faq'); print('Les réponses sont en bas.', 'm'); } }
  };
  const perso = {
    projets: { d: 'mon portfolio', f: () => { go('#projets'); print('Tout est fait maison, même les bugs.', 'm'); } },
    outils: { d: 'mes outils', f: () => print('VS Code · GitHub · Discord\nNiveau : dieu du code.') },
    bugs: { d: 'mon pire bug', f: () => print('Le cache fantôme en production, combiné à une erreur d’hydratation silencieuse.\nJ’en fais encore des cauchemars.', 'e') },
    sommeil: { d: 'mes nuits', f: () => print('sommeil: null\nRecord de nuit blanche : 4 jours.') },
    ywh: { d: 'la sécurité', f: () => print('2 failles trouvées en 2 jours sur YesWeHack.\nAvec la permission des sites. Toujours.') },
    musique: { d: 'ce que j’écoute', f: () => { go('#musique'); print('Phonk, et en ce moment deux sons en boucle.', 'm'); } },
    plans: { d: 'plus tard', f: () => print('Plan A : policier. Plan B : cyberpolicier. Plan C : codeur.\nSpoiler : les trois.') },
    claude: { d: 'Claude Maxxing', f: () => print('Claude Maxxing : activé. Productivité : ×10. Sommeil : toujours null.') },
    github: { d: 'mon GitHub', f: () => print('<a href="https://github.com/ezechielw13" target="_blank" rel="noopener">github.com/ezechielw13</a>') },
    maman: { f: () => print('Je t’aime maman. (C’était mon tout premier code, en 6e.)') },
    phonk: { f: () => { shake(); print('🔊 BOOM BOOM BOOM'); } }
  };
  const cmds = Object.assign({}, common, PERSO ? perso : main);

  const hist = []; let hi = 0;
  function run(raw) {
    const line = raw.trim(); if (!line) return;
    hist.push(line); hi = hist.length;
    print(`<span class="p">${esc(PROMPT)}</span> ${esc(line)}`);
    const [name, ...rest] = line.replace(/^\//, '').split(/\s+/);
    const c = cmds[name.toLowerCase()];
    if (c) c.f(rest.join(' ')); else print(`Commande inconnue : ${esc(name)}. Tape /help.`, 'e');
  }
  form.addEventListener('submit', e => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi]; }
    else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
    else if (e.key === 'Escape') close();
    e.stopPropagation();
  });
  let greeted = false;
  function open() {
    box.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
    if (!greeted) { greeted = true; print(PERSO ? 'Bienvenue dans le terminal de Wyatt.\nTape /help pour voir les commandes.' : 'Bienvenue dans le terminal de Siroxtag.\nTape /help pour voir les commandes.', 'm'); }
    setTimeout(() => input.focus(), 60);
  }
  function close() { box.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
  btn.addEventListener('click', () => box.classList.contains('open') ? close() : open());
  box.querySelector('.tm-top button').addEventListener('click', close);

  /* ---------- easter eggs : des mots tapés n’importe où ---------- */
  const eggs = {
    fun: () => { const on = toggleFun(); toast(on ? 'Mode fun activé 🎨 (retape « fun » pour arrêter)' : 'Mode fun désactivé'); },
    inoxtag: () => { shake(); toast('Siroxtag. Avec un S. Merci.'); },
    sudo: () => toast('Bien essayé.'),
    help: () => open(),
    ...(PERSO ? { code: () => { shake(); toast('while (true) code();'); }, phonk: () => { shake(); toast('🔊 BOOM BOOM BOOM'); }, maman: () => toast('Je t’aime maman ❤️') } : { blackout: () => { document.documentElement.classList.toggle('lights-off'); toast('Ne laisse pas la lumière s’éteindre…'); } })
  };
  addEventListener('pointermove', e => { const r = document.documentElement.style; r.setProperty('--lx', e.clientX + 'px'); r.setProperty('--ly', e.clientY + 'px'); }, { passive: true });
  let buf = '';
  addEventListener('keydown', e => {
    const t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey || (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable))) return;
    if (e.key.length !== 1) return;
    buf = (buf + e.key.toLowerCase()).slice(-12);
    for (const k of Object.keys(eggs)) if (buf.endsWith(k)) { buf = ''; eggs[k](); break; }
  });
})();
