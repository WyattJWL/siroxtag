/* Terminal caché (en bas à droite) + succès + easter eggs.
   /help affiche les chapitres ; /help 3 ou /help code affiche les commandes d’un chapitre. */
(() => {
  'use strict';
  const PD = window.SX_X || null;
  const XT = !!PD;
  const MAIL = 'contact@siroxtag.fr';
  const PROMPT = PD ? PD.prompt : 'siroxtag@web:~$';
  const WIKI = PD ? PD.wiki : '/wiki/';
  const HOME = PD ? PD.home : '/';
  // petits secrets brouillés, pour ne pas tout dévoiler dans le code source
  const K = [115, 120, 116, 97, 103, 33, 55];
  const D = s => { try { return new TextDecoder().decode(Uint8Array.from(atob(s), (c, i) => c.charCodeAt(0) ^ K[i % K.length])); } catch (e) { return ''; } };
  const J = s => JSON.parse(D(s));
  const H = s => { let h = 0x811c9dc5; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16); };
  const SEC = J('__SEC__');

  /* ---------- styles ---------- */
  const css = `
  .tm-btn{position:fixed;right:18px;bottom:18px;z-index:70;width:48px;height:48px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:#141416;color:#F2F1EC;font:600 15px/1 ui-monospace,'SF Mono','Plex',Menlo,monospace;cursor:pointer;box-shadow:0 12px 30px -8px rgba(0,0,0,.45);transition:transform .35s cubic-bezier(.16,1,.3,1)}
  .tm-btn:hover{transform:translateY(-3px)}
  .tm-btn span{display:inline-block;animation:tmcaret 1.2s steps(1) infinite}
  @keyframes tmcaret{50%{opacity:.25}}
  .tm{position:fixed;right:18px;bottom:76px;z-index:71;width:min(470px,calc(100vw - 36px));height:min(380px,64vh);display:flex;flex-direction:column;background:#141416;color:#E8E8ED;border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 30px 70px -20px rgba(0,0,0,.55);font:13.5px/1.55 ui-monospace,'SF Mono','Plex',Menlo,monospace;opacity:0;visibility:hidden;transform:translateY(14px) scale(.97);transform-origin:100% 100%;transition:opacity .25s ease,transform .45s cubic-bezier(.16,1,.3,1),visibility 0s linear .45s}
  .tm.open{opacity:1;visibility:visible;transform:none;transition:opacity .25s ease,transform .45s cubic-bezier(.16,1,.3,1),visibility 0s}
  .tm-top{display:flex;align-items:center;gap:7px;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
  .tm-top i{width:11px;height:11px;border-radius:50%;background:#3A3A3C}
  .tm-top b{margin-left:auto;font-weight:500;font-size:12px;color:#8E8E93}
  .tm-top button{background:none;border:0;color:#8E8E93;font:inherit;cursor:pointer;padding:0 0 0 10px}
  .tm-out{flex:1;overflow-y:auto;padding:12px 14px 4px;white-space:pre-wrap;word-break:break-word;scrollbar-width:thin}
  .tm-out div{font:inherit;margin:0;padding:0}.tm-out span{font:inherit}
  .tm-out a{color:#9CC4F2}
  .tm-out .tm-p{color:#A8D8B9}.tm-out .tm-e{color:#FF9F8A}.tm-out .tm-m{color:#8E8E93}.tm-out .tm-y{color:#F2D49B}
  .tm-out .sw{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:6px}
  .tm-in{display:flex;gap:8px;padding:8px 14px 13px}
  .tm-in label{color:#A8D8B9;white-space:nowrap}
  .tm-in input{flex:1;min-width:0;background:none;border:0;outline:0;color:#F2F1EC;font:inherit;caret-color:#F2F1EC}
  .tm-toast{position:fixed;left:50%;top:22px;z-index:90;transform:translate(-50%,-20px);opacity:0;background:#141416;color:#F2F1EC;font:500 14px/1.3 ui-monospace,'SF Mono','Plex',Menlo,monospace;padding:12px 16px;border-radius:12px;box-shadow:0 20px 40px -12px rgba(0,0,0,.45);transition:opacity .3s ease,transform .5s cubic-bezier(.16,1,.3,1);pointer-events:none;max-width:calc(100vw - 32px)}
  .tm-toast.show{opacity:1;transform:translate(-50%,0)}
  .tm-shake{animation:tmshake .5s cubic-bezier(.36,.07,.19,.97)}
  @keyframes tmshake{10%,90%{transform:translateX(-2px)}20%,80%{transform:translateX(4px)}30%,50%,70%{transform:translateX(-8px)}40%,60%{transform:translateX(8px)}}
  .tm-matrix{position:fixed;inset:0;z-index:88;pointer-events:none;background:rgba(0,0,0,.82);transition:opacity .8s ease}
  .tm-conf{position:fixed;top:-12px;z-index:89;width:9px;height:14px;border-radius:2px;pointer-events:none;animation:tmfall linear forwards}
  @keyframes tmfall{to{transform:translate3d(var(--dx),110vh,0) rotate(var(--r))}}
  .tm-ach-box{position:fixed;top:14px;right:14px;z-index:95;display:flex;flex-direction:column;gap:8px;pointer-events:none}
  .tm-ach{display:flex;align-items:center;gap:12px;width:min(320px,calc(100vw - 28px));padding:10px 14px 10px 10px;background:#212121;border:2px solid #555;outline:2px solid #000;box-shadow:inset 2px 2px 0 #3a3a3a,inset -2px -2px 0 #161616,0 12px 30px -10px rgba(0,0,0,.6);color:#fff;font:700 14px/1.25 ui-monospace,'SF Mono','Plex',Menlo,monospace;transform:translateX(calc(100% + 40px));transition:transform .55s cubic-bezier(.2,.9,.3,1.1)}
  .tm-ach.in{transform:none}
  .tm-ach.out{transform:translateX(calc(100% + 40px));transition:transform .45s ease-in}
  .tm-ach .ic{flex:none;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:24px;background:#8b8b8b;border:2px solid #373737;box-shadow:inset 2px 2px 0 #c6c6c6,inset -2px -2px 0 #555}
  .tm-ach small{display:block;color:#FFFF55;font-size:12.5px;margin-bottom:3px;letter-spacing:.01em}
  .tm-ach.gold small{color:#FFAA00}
  html.fun,html.fun body{transition:background-color .6s ease}
  @media (max-width:600px){.tm{right:12px;left:12px;width:auto;bottom:74px}.tm-btn{right:12px;bottom:12px}.tm-ach-box{top:10px;right:10px}}
  @media (prefers-reduced-motion:reduce){.tm-shake{animation:none}.tm-conf{display:none}.tm-ach{transition:none}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- interface ---------- */
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'tm-btn'; btn.setAttribute('aria-label', 'Ouvrir le terminal'); btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '›<span>_</span>';
  const box = document.createElement('div');
  box.className = 'tm'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Terminal');
  box.innerHTML = `<div class="tm-top"><i></i><i></i><i></i><b>terminal — ${PD ? PD.name : 'siroxtag'}</b><button type="button" aria-label="Fermer">✕</button></div>
    <div class="tm-out" aria-live="polite"></div>
    <form class="tm-in"><label for="tm-input">${PROMPT}</label><input id="tm-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Commande"></form>`;
  document.body.append(btn, box);
  const out = box.querySelector('.tm-out'), input = box.querySelector('input'), form = box.querySelector('form');
  const hist = []; let hi = 0;

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const SK = 'sx-term';
  let saveT = 0;
  const saveNow = () => { try { while (out.innerHTML.length > 30000 && out.firstChild) out.firstChild.remove(); sessionStorage.setItem(SK, JSON.stringify({ open: box.classList.contains('open'), html: out.innerHTML, hist: hist.slice(-50), url: location.pathname })); } catch (e) {} };
  const save = () => { clearTimeout(saveT); saveT = setTimeout(saveNow, 120); };
  const print = (html, cls) => { const d = document.createElement('div'); if (cls) d.className = 'tm-' + cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; save(); };
  const say = (txt, cls) => print(esc(txt), cls);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rnd = n => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; };
  const toast = (() => { const t = document.createElement('div'); t.className = 'tm-toast'; document.body.appendChild(t); let to; return msg => { t.textContent = msg; t.classList.add('show'); clearTimeout(to); to = setTimeout(() => t.classList.remove('show'), 2600); }; })();
  const go = sel => { const el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else location.href = HOME + sel; };
  const nav = (url, msg) => { if (msg) say(msg, 'm'); setTimeout(() => { location.href = url; }, 350); };
  const shake = () => { document.body.classList.remove('tm-shake'); void document.body.offsetWidth; document.body.classList.add('tm-shake'); };

  /* ---------- succès, façon jeu vidéo ---------- */
  const ACH = SEC.ach; // [id, icône, titre, description]
  const achBox = document.createElement('div'); achBox.className = 'tm-ach-box'; achBox.setAttribute('aria-live', 'polite'); document.body.appendChild(achBox);
  const achGet = () => { try { const v = JSON.parse(localStorage.getItem('sx-ach') || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
  const achToast = (a, gold) => {
    const t = document.createElement('div'); t.className = 'tm-ach' + (gold ? ' gold' : '');
    t.innerHTML = `<span class="ic" aria-hidden="true">${a[1]}</span><span><small>${gold ? 'Défi relevé !' : 'Succès débloqué !'}</small>${esc(a[2])}</span>`;
    achBox.appendChild(t); requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('in')));
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 500); }, 4200);
  };
  const ach = id => {
    const a = ACH.find(x => x[0] === id); if (!a) return false;
    const got = achGet(); if (got[id]) return false;
    got[id] = Date.now(); try { localStorage.setItem('sx-ach', JSON.stringify(got)); } catch (e) {}
    achToast(a, id === 'platine');
    if (id !== 'platine' && ACH.filter(x => x[0] !== 'platine').every(x => got[x[0]])) setTimeout(() => ach('platine'), 1200);
    return true;
  };

  /* ---------- mode fun ----------
     Certaines pages : activé par défaut, /serieux l’éteint (clé sx-serious).
     siroxtag.fr : s’active à la demande (clé sx-fun). */
  const isFun = () => document.documentElement.classList.contains('fun');
  const setFun = on => {
    document.documentElement.classList.toggle('fun', on);
    try {
      if (XT) on ? localStorage.removeItem('sx-serious') : localStorage.setItem('sx-serious', '1');
      else on ? localStorage.setItem('sx-fun', '1') : localStorage.removeItem('sx-fun');
    } catch (e) {}
  };
  try { setFun(XT ? localStorage.getItem('sx-serious') !== '1' : localStorage.getItem('sx-fun') === '1'); } catch (e) { if (XT) document.documentElement.classList.add('fun'); }
  const funOn = () => { setFun(true); ach('fun'); };
  const funOff = () => { setFun(false); ach('serieux'); };

  /* ---------- effets ---------- */
  function matrix() {
    ach('matrix');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { toast('Wake up, Neo…'); return; }
    const c = document.createElement('canvas'); c.className = 'tm-matrix'; document.body.appendChild(c);
    const x = c.getContext('2d'), w = c.width = innerWidth, h = c.height = innerHeight, fs = 16, cols = Math.ceil(w / fs), y = Array(cols).fill(0).map(() => Math.random() * -40);
    const ch = '01アイウエオカキクケコ{}<>;=/*+SIROXTAG';
    const t0 = performance.now();
    const step = t => {
      x.fillStyle = 'rgba(0,0,0,.08)'; x.fillRect(0, 0, w, h); x.fillStyle = '#7CFFA0'; x.font = fs + 'px monospace';
      y.forEach((v, i) => { x.fillText(ch[Math.floor(Math.random() * ch.length)], i * fs, v * fs); y[i] = v * fs > h && Math.random() > .975 ? 0 : v + 1; });
      if (t - t0 < 4200) requestAnimationFrame(step); else { c.style.opacity = 0; setTimeout(() => c.remove(), 800); }
    };
    requestAnimationFrame(step);
  }
  function confettis() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cols = ['#CADDF4', '#F6CBD0', '#D3EAC8', '#E2D7F6', '#FBEEDC', '#C8643B', '#1F4470'];
    for (let i = 0; i < 90; i++) {
      const d = document.createElement('i'); d.className = 'tm-conf';
      d.style.left = Math.random() * 100 + 'vw'; d.style.background = pick(cols);
      d.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px'); d.style.setProperty('--r', (Math.random() * 1080 - 540) + 'deg');
      d.style.animationDuration = (1.8 + Math.random() * 1.8) + 's'; d.style.animationDelay = Math.random() * .4 + 's';
      document.body.appendChild(d); setTimeout(() => d.remove(), 4500);
    }
  }
  const lights = () => { const on = document.documentElement.classList.toggle('lights-off'); if (on) ach('lampe'); return on; };

  /* ---------- chasse au trésor : 4 fragments ---------- */
  const FRAG = SEC.frag, HINT = SEC.hint, R = SEC.r;
  const hunt = {
    get: () => { try { const v = JSON.parse(localStorage.getItem('sx-hunt') || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } },
    frag: n => FRAG[n - 1],
    found(n) {
      const f = hunt.get(); if (f.includes(n)) return false;
      f.push(n); f.sort(); try { localStorage.setItem('sx-hunt', JSON.stringify(f)); } catch (e) {}
      confettis(); toast(`Fragment ${n}/4 trouvé : « ${FRAG[n - 1]} »`);
      if (f.length === 4) setTimeout(() => toast(SEC.allFound), 2800);
      return true;
    }
  };

  /* ---------- contenus ---------- */
  const BLAGUES = [
    'Pourquoi les développeurs confondent Halloween et Noël ? Parce que OCT 31 = DEC 25.',
    'Il y a 10 types de personnes : celles qui comprennent le binaire, et les autres.',
    'Un développeur va au supermarché. On lui dit : « Prends un pain, et s’il y a des œufs, prends-en six. » Il revient avec six pains.',
    '« Ça marche sur ma machine. » « Très bien, on livrera ta machine au client. »',
    'Le code, c’est comme l’humour : si tu dois l’expliquer, c’est qu’il est mauvais.',
    'Combien de développeurs faut-il pour changer une ampoule ? Aucun, c’est un problème matériel.',
    'Mon code ne marche pas, je ne sais pas pourquoi. Mon code marche, je ne sais pas pourquoi non plus.',
    'J’ai mis un point-virgule. Puis deux. Puis j’ai compris que j’étais en Python.',
    'Un SQL entre dans un bar, va voir deux tables et demande : « Je peux me joindre à vous ? »',
    'Le meilleur commentaire de code : « Ne touche pas à ça. Je ne sais pas pourquoi, mais ça marche. »',
    'Debugger, c’est être le détective d’un crime dont on est aussi le coupable.',
    'Pourquoi le développeur est-il resté coincé dans la douche ? La bouteille disait : « Shampouiner, rincer, répéter. »'
  ];
  const CITATIONS = [
    ['Parler ne coûte rien. Montre-moi le code.', 'Linus Torvalds'],
    ['L’optimisation prématurée est la racine de tous les maux.', 'Donald Knuth'],
    ['N’importe quel idiot peut écrire du code qu’un ordinateur comprend. Les bons programmeurs écrivent du code que les humains comprennent.', 'Martin Fowler'],
    ['La simplicité est une condition préalable à la fiabilité.', 'Edsger Dijkstra'],
    ['Les programmes doivent être écrits pour être lus par des humains, et seulement accessoirement pour être exécutés par des machines.', 'Harold Abelson et Gerald Sussman']
  ];
  const EXCUSES = ['C’est le cache.', 'Ça marchait hier.', 'C’est une fonctionnalité, pas un bug.', 'C’est sûrement le navigateur.', 'Le DNS n’a pas encore propagé.', 'Quelqu’un a touché à mon code.', 'C’est la faute du point-virgule.', 'Je n’ai rien changé. Enfin, presque.'];
  const MOTIV = ['Chaque bug corrigé fait de toi un meilleur développeur.', 'Le code parfait n’existe pas. Le code fini, si.', 'Un pas à la fois. Une ligne à la fois.', 'Tu ne rates pas : tu fais des tests.', 'Aujourd’hui, ton code va compiler du premier coup. Peut-être.'];
  const COMPL = ['Ton code est propre. Presque autant que ton humour.', 'Tu as un excellent goût en matière de terminal.', 'Les bugs ont peur de toi.', 'Tu viens de taper une commande parfaite. Bravo.'];
  const BOULE = ['Oui.', 'Non.', 'Sans aucun doute.', 'Demande plus tard.', 'Les astres disent oui.', 'Mieux vaut ne pas te le dire maintenant.', 'Probablement.', 'C’est le cache qui décidera.'];
  let secret = null, essais = 0, blagues = 0;

  /* ---------- chapitres de commandes ---------- */
  const CH = [];
  const chap = (k, n, d, c) => CH.push({ k, n, d, c });
  const helpers = { say, print, go, nav, shake, toast, esc, ach, confettis, setFun };

  chap('bases', 'Les bases', 'les commandes indispensables', {
    help: { d: 'les chapitres (/help 2, /help code…)', f: a => { ach('help'); help(a); } },
    clear: { d: 'nettoyer l’écran', f: () => { out.innerHTML = ''; save(); } },
    exit: { d: 'fermer le terminal', f: () => close() },
    ls: { d: 'les pages du site', f: () => print(PD ? PD.ls : '<a href="/">index.html</a>   <a href="/wiki/">wiki/</a>   <a href="/Linear/">Linear/</a>   <a href="/archives/">archives/</a>   <a href="/mentions-legales/">mentions-legales/</a>') },
    whoami: { d: 'qui est là ?', f: () => say(PD ? PD.whoami : 'Siroxtag. Créateur indépendant. Pas Inoxtag, hein.') },
    contact: { d: 'me contacter', f: () => print(`<a href="mailto:${MAIL}">${MAIL}</a>`) },
    date: { d: 'la date et l’heure', f: () => say(new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })) },
    historique: { d: 'les commandes déjà tapées', f: () => say(hist.length ? hist.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`).join('\n') : 'Rien pour l’instant.') },
    echo: { d: 'répète ce que tu écris', f: a => say(a || '') },
    ia: { d: 'poser une question à l’IA (/ia une idée de vidéo ?)', f: async a => {
      if (!a) { say('Exemple : /ia donne-moi une idée de vidéo sur GTA RP', 'm'); return; }
      print('<span class="tm-m">L’IA réfléchit…</span>'); const wait = out.lastChild;
      let txt, bad = false;
      try {
        const r = await fetch('/api/ia', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-SX': '1' }, body: JSON.stringify({ task: 'chat', text: String(a).slice(0, 600) }) });
        const d = await r.json().catch(() => ({})); bad = !r.ok; txt = r.ok ? d.text : (d.error || 'L’IA ne répond pas.');
      } catch (e) { bad = true; txt = 'L’IA ne répond pas. Vérifie ta connexion.'; }
      if (wait && wait.parentNode) wait.remove();
      say(txt || '…', bad ? 'e' : ''); if (!bad) say('Réponse d’une IA : elle peut se tromper.', 'm');
    } }
  });
  chap('modes', 'Les modes', 'changer l’ambiance du site', {
    fun: { d: 'des couleurs partout', f: () => { if (isFun()) { say('Déjà en mode fun. Tape /serieux pour calmer le jeu.', 'm'); return; } funOn(); say('Mode fun activé. Les couleurs sont lâchées.'); toast('Mode fun activé 🎨'); } },
    serieux: { d: 'le mode sobre, sans couleurs', f: () => { if (!isFun()) { say('Déjà sérieux. Très sérieux. Trop, peut-être.', 'm'); return; } funOff(); say('Mode sérieux activé. Cravate mise.'); toast('Mode sérieux activé'); } },
    ...(XT ? {} : { lumiere: { d: 'éteindre ou rallumer la lumière', f: () => say(lights() ? 'Lumières éteintes. Ta souris est ta lampe torche.' : 'Lumières rallumées. La créature recule.') } }),
    matrix: { d: 'entrer dans la Matrice', f: () => { say('Wake up…', 'y'); matrix(); } },
    confettis: { d: 'faire la fête', f: () => { confettis(); say('🎉'); } },
    secouer: { d: 'secouer la page', f: () => { shake(); say('Ça va, ça va…'); } }
  });
  if (PD) chap('site', PD.chapName, PD.chapDesc, PD.chapter(helpers));
  else chap('site', 'Le site', 'les vidéos, les projets, l’univers Siroxtag', {
    tiktok: { d: 'le compte TikTok', f: () => print('<a href="https://www.tiktok.com/@siroxletag" target="_blank" rel="noopener">@siroxletag</a> · parodies, edits, humour') },
    videos: { d: 'aller aux vidéos', f: () => { go('#videos'); say('Direction les vidéos…', 'm'); } },
    apropos: { d: 'qui est Siroxtag', f: () => go('#a-propos') },
    projets: { d: 'aller aux projets', f: () => { go('#projets'); say('On y va…', 'm'); } },
    blackout: { d: 'le jeu d’horreur', f: () => print('BLACKOUT · 9 chapitres · 1 à 12 joueurs · <a href="https://blackouthorror.fr/" target="_blank" rel="noopener">blackouthorror.fr</a>\nNe laisse pas la lumière s’éteindre.') },
    linear: { d: 'le dossier RP', f: () => print('<a href="/Linear/">Ouvrir le dossier Linear.</a> (Espace pour avancer)') },
    studio: { d: 'le Studio d’idées de vidéos', f: () => nav('/studio/', 'Ouverture du Studio…') },
    m13: { d: 'la saga PROJECT-M13', f: () => nav('/m13/', 'Il pleut sur Luynes…') },
    compte: { d: 'mon compte', f: () => nav('/compte/', 'Direction ton compte…') },
    faq: { d: 'les questions', f: () => { go('#faq'); say('Les réponses sont en bas.', 'm'); } },
    inoxtag: { d: 'la question qui revient', f: () => { ach('inoxtag'); shake(); say('Erreur 404 : Inoxtag introuvable. Tu cherches Siroxtag. Avec un S. Et un R.', 'e'); } }
  });
  chap('wiki', PD ? PD.wikiName : 'Siroxtagpédia', 'l’encyclopédie du site', {
    wiki: { d: 'ouvrir l’encyclopédie', f: () => nav(WIKI, 'Ouverture de l’encyclopédie…') },
    hasard: { d: 'un article au hasard', f: () => { ach('hasard'); const l = window.WIKI || []; if (!l.length) { nav(WIKI + '?hasard'); return; } const a = pick(l); nav(WIKI + a.s + '/', 'Article au hasard : ' + a.t + '.'); } },
    cherche: { d: 'chercher un article (/cherche python)', f: a => { if (!a) { say('Exemple : /cherche heisenbug', 'm'); return; } nav(WIKI + '?q=' + encodeURIComponent(a), 'Recherche de « ' + a + ' »…'); } }
  });
  chap('code', 'Le code', 'des petits outils de développeur', {
    hello: { d: 'Hello, World! en trois langages', f: () => say('print("Hello, World!")        # Python\nconsole.log("Hello, World!");  // JavaScript\necho "Hello, World!";          // PHP') },
    python: { d: 'un peu de Python', f: () => say(PD ? PD.python : 'for i in range(3):\n    print("Siroxtag")\n\nPython : lisible, simple, puissant.') },
    js: { d: 'une bizarrerie JavaScript', f: () => say(pick(['typeof NaN      // "number"', 'NaN === NaN     // false', '"2" + 2         // "22"', '"2" - 2         // 0', '[] + []         // ""', 'typeof null     // "object"'])) },
    git: { d: 'un faux historique Git', f: () => say('a1b2c3d  vraiment fix cette fois\n9f8e7d6  fix 2\n5c4b3a2  fix\n1a2b3c4  ajoute une fonctionnalité incroyable\n0000001  premier commit') },
    npm: { d: 'une fausse installation', f: () => { say('npm install bonne-humeur…', 'm'); setTimeout(() => say('added 1 337 packages in 3s\n42 vulnerabilities (0 graves, 42 drôles)'), 700); } },
    ping: { d: 'tester la connexion', f: () => say(`pong 🏓 (temps : ${3 + rnd(40)} ms)`) },
    pointvirgule: { d: 'la ponctuation préférée', f: a => say(';'.repeat(Math.min(200, Math.max(1, parseInt(a, 10) || 12)))) },
    canard: { d: 'parler au canard en caoutchouc', f: () => say('    __\n___( o)>\n\\ <_. )\n `---\'\nCoin. Explique-moi ton bug, ligne par ligne.') },
    binaire: { d: 'convertir en binaire (/binaire 42)', f: a => { if (!a) { say('Exemple : /binaire 42 ou /binaire salut', 'm'); return; } const n = Number(a); say(Number.isInteger(n) ? n.toString(2) : [...new TextEncoder().encode(a)].map(b => b.toString(2).padStart(8, '0')).join(' ')); } },
    hex: { d: 'convertir en hexadécimal', f: a => { const n = parseInt(a, 10); say(Number.isNaN(n) ? 'Exemple : /hex 255' : '0x' + n.toString(16).toUpperCase()); } },
    base64: { d: 'encoder du texte en Base64', f: a => { if (!a) { say('Exemple : /base64 salut', 'm'); return; } say(btoa(String.fromCharCode(...new TextEncoder().encode(a)))); } },
    inverse: { d: 'écrire à l’envers', f: a => say([...(a || 'Siroxtag')].reverse().join('')) },
    majuscules: { d: 'TOUT EN MAJUSCULES', f: a => say((a || 'tape un texte').toUpperCase()) },
    compte: { d: 'compter les caractères', f: a => say(a ? `${[...a].length} caractères, ${a.trim().split(/\s+/).length} mots.` : 'Exemple : /compte bonjour tout le monde') },
    couleur: { d: 'une couleur pastel au hasard', f: () => { const h = rnd(360), c = `hsl(${h} 70% 85%)`; print(`<span class="sw" style="background:${c}"></span>${c}`); } },
    uuid: { d: 'un identifiant unique', f: () => say(crypto.randomUUID ? crypto.randomUUID() : 'Ton navigateur ne sait pas faire ça.') }
  });
  chap('securite', 'Sécurité', 'se protéger en ligne', {
    mdp: { d: 'générer un mot de passe solide (/mdp 20)', f: a => { ach('mdp'); const n = Math.min(64, Math.max(12, parseInt(a, 10) || 20)), al = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%&*+-=?@'; let s = ''; for (let i = 0; i < n; i++) s += al[rnd(al.length)]; say(s, 'y'); say('Généré dans ton navigateur. Rien n’est envoyé nulle part.', 'm'); } },
    '2fa': { d: 'pourquoi activer la double authentification', f: () => say('Même si on vole ton mot de passe, il manque la deuxième clé.\nÀ activer d’abord sur ta boîte e-mail, puis sur Discord, GitHub et tes jeux.') },
    phishing: { d: 'repérer un faux message', f: () => say('1. Le message est urgent.\n2. L’expéditeur est bizarre.\n3. Le lien ne mène pas au vrai site.\n4. On te demande un code reçu par SMS.\n→ Ne clique pas. Va toi-même sur le site officiel.') },
    urgence: { d: 'les numéros d’urgence', f: () => say('17  Police secours\n15  SAMU\n18  Pompiers\n112 Urgence européen\n114 Urgence par SMS\n3018 Cyberharcèlement') },
    signaler: { d: 'signaler un contenu ou une arnaque', f: () => print('Contenu illicite : <a href="https://www.internet-signalement.gouv.fr/" target="_blank" rel="noopener">PHAROS</a>\nVictime d’une arnaque en ligne : <a href="https://www.cybermalveillance.gouv.fr/" target="_blank" rel="noopener">cybermalveillance.gouv.fr</a>') },
    cesar: { d: 'chiffre de César (/cesar 3 bonjour)', f: a => { const m = /^(-?\d+)\s+(.+)$/.exec(a || ''); if (!m) { say('Exemple : /cesar 3 bonjour', 'm'); return; } const k = ((+m[1] % 26) + 26) % 26; say(m[2].replace(/[a-z]/gi, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + k) % 26 + b); })); } }
  });
  chap('jeux', 'Jeux', 'des petits jeux dans le terminal', {
    de: { d: 'lancer un dé (/de 20)', f: a => { const f = Math.min(1000, Math.max(2, parseInt(a, 10) || 6)); say(`🎲 ${1 + rnd(f)} (dé à ${f} faces)`); } },
    pile: { d: 'pile ou face', f: () => say(rnd(2) ? '🪙 Pile.' : '🪙 Face.') },
    pfc: { d: 'pierre, feuille, ciseaux (/pfc pierre)', f: a => { const o = ['pierre', 'feuille', 'ciseaux'], j = norm(a || ''); if (!o.includes(j)) { say('Exemple : /pfc pierre', 'm'); return; } const m = o[rnd(3)], r = j === m ? 'Égalité.' : ((j === 'pierre' && m === 'ciseaux') || (j === 'feuille' && m === 'pierre') || (j === 'ciseaux' && m === 'feuille')) ? 'Tu gagnes !' : 'J’ai gagné.'; say(`Toi : ${j}. Moi : ${m}. ${r}`); } },
    devine: { d: 'deviner un nombre (/devine, puis /devine 50)', f: a => { if (secret === null || !a) { secret = 1 + rnd(100); essais = 0; say('J’ai choisi un nombre entre 1 et 100. Tape /devine suivi de ta proposition.'); if (!a) return; } const n = parseInt(a, 10); if (Number.isNaN(n)) { say('Un nombre, s’il te plaît.', 'e'); return; } essais++; if (n === secret) { say(`Bravo ! C’était ${secret}, trouvé en ${essais} essai${essais > 1 ? 's' : ''}.`); confettis(); ach('devine'); secret = null; } else say(n < secret ? 'Plus grand.' : 'Plus petit.'); } },
    boule: { d: 'la boule magique (/boule question ?)', f: a => say(a ? '🔮 ' + pick(BOULE) : 'Pose une question : /boule vais-je dormir ce soir ?') },
    konami: { d: 'un indice', f: () => say('↑ ↑ ↓ ↓ ← → ← → B A\nAvec le clavier, en dehors du terminal.') },
    gta: { d: 'le jeu préféré', f: () => say(PD ? PD.gta : 'GTA VI, GTA RP et la ville de Linear. Tout est fictif, rien n’est sérieux.') }
  });
  chap('chasse', 'Chasse et succès', 'la chasse au trésor et tes succès', {
    chasse: { d: 'la chasse au trésor : progression et indices', f: () => {
      const f = hunt.get();
      print(`<span class="tm-y">Chasse au trésor : ${f.length}/4 fragments</span>`);
      [1, 2, 3, 4].forEach(n => print(f.includes(n) ? `<span class="tm-p">✓ Fragment ${n} : « ${esc(FRAG[n - 1])} »</span>` : `<span class="tm-m">☐ Fragment ${n} : ${esc(HINT[n - 1])}</span>`));
      if (f.length === 4) say(SEC.allFound, 'y');
    } },
    succes: { d: 'tes succès débloqués', f: () => {
      const got = achGet(), n = ACH.filter(a => got[a[0]]).length;
      print(`<span class="tm-y">Succès : ${n}/${ACH.length}</span>`);
      ACH.forEach(a => print(got[a[0]] ? `<span class="tm-p">${a[1]} ${esc(a[2])}</span> <span class="tm-m">— ${esc(a[3])}</span>` : `<span class="tm-m">🔒 ??? — ${a[4] ? esc(a[4]) : 'encore secret'}</span>`));
    } },
    tresor: { d: 'la salle du trésor', f: () => nav(R.a, 'Direction la salle du trésor…') },
    archives: { d: 'le musée Siroxtag', f: () => nav('/archives/', 'Ouverture du musée…') },
    perdu: { d: 'se perdre (exprès)', f: () => nav('/404.html', 'Tu veux te perdre ? D’accord.') }
  });
  chap('rire', 'Pour rire', 'des blagues, des citations et du n’importe quoi', {
    blague: { d: 'une blague de développeur', f: () => { say(pick(BLAGUES)); if (++blagues >= 5) ach('blagues'); } },
    citation: { d: 'une citation célèbre (traduite)', f: () => { const c = pick(CITATIONS); say(`« ${c[0]} »\n— ${c[1]}`); } },
    excuse: { d: 'une excuse quand ça plante', f: () => say(pick(EXCUSES)) },
    motivation: { d: 'un petit boost', f: () => say(pick(MOTIV)) },
    compliment: { d: 'parce que tu le vaux bien', f: () => say(pick(COMPL)) },
    meteo: { d: 'la météo du jour', f: () => say(`Ciel : 100 % code. Température : ${18 + rnd(10)} °C dans le processeur. Risque de bugs : modéré.`) },
    cafe: { d: 'un café', f: () => say('☕ Café ajouté. Énergie +10.') },
    dormir: { d: 'aller dormir', f: () => say(PD ? PD.dormir : 'Bonne nuit. Enfin, encore une vidéo et j’y vais.') },
    mdr: { d: 'mort de rire', f: () => say('😂 Mdr. Officiellement validé.') }
  });
  chap('nav', 'Navigation', 'se déplacer sur le site', {
    haut: { d: 'remonter tout en haut', f: () => scrollTo({ top: 0, behavior: 'smooth' }) },
    bas: { d: 'descendre tout en bas', f: () => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' }) },
    accueil: { d: 'revenir à l’accueil', f: () => nav(HOME) },
    mentions: { d: 'les mentions légales', f: () => nav('/mentions-legales/') },
    retour: { d: 'page précédente', f: () => history.back() }
  });

  /* commandes cachées : absentes de /help */
  const hidden = {
    sudo: () => say('Bien essayé. Tu n’es pas dans le fichier sudoers. Cet incident sera signalé (à personne).', 'e'),
    rm: () => say('Non.', 'e'),
    hack: () => say('Accès refusé. Ici, c’est hacking éthique uniquement.', 'e'),
    vim: () => say('Pour quitter vim… personne ne sait vraiment. Tape /exit.'),
    '42': () => say('La réponse à la grande question sur la vie, l’univers et le reste.'),
    merci: () => say('Avec plaisir 🙌'),
    coucou: () => say('Coucou ! Tape /help.'),
    hello: () => say('Salut ! Tape /help si t’es perdu.'),
    siroxtag: () => say('Oui ? C’est moi. Enfin, lui. Bref.'),
    inoxtag: () => { ach('inoxtag'); shake(); say('Siroxtag. Avec un S. Et un R.', 'e'); },
    ...(PD ? PD.hidden(helpers) : {})
  };
  // commandes secrètes : leurs noms ne figurent pas en clair dans le code
  const secretCmds = {
    [SEC.h.n1]: () => nav(R.b, 'Extinction des lumières…'),
    [SEC.h.n2]: () => {
      if (PD) { say(PD.self); return; }
      ach('a21'); shake(); say(SEC.w[0], 'y');
      setTimeout(() => say(SEC.w[1]), 700); setTimeout(() => say(SEC.w[2]), 1600); setTimeout(() => say(SEC.w[3], 'm'), 2600);
    },
    ...(PD ? {} : { [SEC.h.n3]: () => nav(R.c, SEC.cm) })
  };

  const all = {}; CH.forEach(c => Object.entries(c.c).forEach(([k, v]) => { all[k] = v; }));
  const ALIAS = { 'sérieux': 'serieux', 'serious': 'serieux', 'aide': 'help', 'h': 'help', '?': 'help', 'cls': 'clear', 'quit': 'exit', 'quitter': 'exit', 'dé': 'de', 'météo': 'meteo', 'café': 'cafe', 'césar': 'cesar', 'lumière': 'lumiere', 'javascript': 'js', 'motdepasse': 'mdp', 'hacker': 'hack', 'recherche': 'cherche', 'random': 'hasard', 'wikipedia': 'wiki', 'succès': 'succes', 'achievements': 'succes', 'trésor': 'tresor' };

  function help(arg) {
    const a = norm(arg || '');
    if (!a) {
      const rows = CH.map((c, i) => `<span class="tm-p">${String(i + 1).padStart(2)}  ${esc(c.n.padEnd(17))}</span>${esc(c.d)} <span class="tm-m">(${Object.keys(c.c).length})</span>`);
      print(rows.join('\n') + '\n<span class="tm-m">Tape /help suivi d’un numéro ou d’un nom. Exemple : /help 5 ou /help code.\n/help tout affiche toutes les commandes.\nAstuce : certains mots tapés n’importe où sur la page font des trucs.</span>');
      return;
    }
    const list = a === 'tout' || a === 'all' ? CH : CH.filter((c, i) => String(i + 1) === a || norm(c.k) === a || norm(c.n) === a || norm(c.n).includes(a));
    if (!list.length) { say(`Chapitre inconnu : ${arg}. Tape /help pour la liste.`, 'e'); return; }
    list.forEach(c => {
      print(`<span class="tm-y">${esc(c.n)}</span>`);
      print(Object.entries(c.c).map(([k, v]) => `<span class="tm-p">/${esc(k.padEnd(13))}</span>${esc(v.d)}`).join('\n'));
    });
  }

  function run(raw) {
    const line = raw.trim(); if (!line) return;
    hist.push(line); hi = hist.length; save();
    print(`<span class="tm-p">${esc(PROMPT)}</span> ${esc(line)}`);
    const [first, ...rest] = line.replace(/^\//, '').split(/\s+/);
    let name = first.toLowerCase(); name = ALIAS[name] || ALIAS[norm(name)] || name;
    const arg = rest.join(' ');
    if (all[name]) all[name].f(arg);
    else if (hidden[name]) hidden[name](arg);
    else if (secretCmds[H(norm(name))]) secretCmds[H(norm(name))](arg);
    else say(`Commande inconnue : ${first}. Tape /help.`, 'e');
  }
  form.addEventListener('submit', e => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && hist.length) { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi]; }
    else if (e.key === 'ArrowDown' && hist.length) { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
    else if (e.key === 'Tab') { e.preventDefault(); const v = input.value.replace(/^\//, '').toLowerCase(); const m = Object.keys(all).filter(k => k.startsWith(v)); if (m.length === 1) input.value = '/' + m[0] + ' '; else if (m.length) say(m.map(k => '/' + k).join('  '), 'm'); }
    else if (e.key === 'Escape') close();
    e.stopPropagation();
  });
  let greeted = false;
  function open(noFocus) {
    box.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); save(); ach('terminal');
    if (!greeted) { greeted = true; say((PD ? PD.hello : 'Bienvenue dans le terminal de Siroxtag.') + `\n${Object.keys(all).length} commandes, rangées en ${CH.length} chapitres. Tape /help.`, 'm'); }
    if (noFocus !== true) setTimeout(() => input.focus({ preventScroll: true }), 60);
  }
  function close() { box.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); save(); }
  // le terminal suit la navigation : on retrouve l’écran, l’historique, et il reste ouvert s’il l’était
  try {
    const st = JSON.parse(sessionStorage.getItem(SK) || 'null');
    if (st) {
      if (st.html) { out.innerHTML = st.html; greeted = true; }
      if (Array.isArray(st.hist)) { hist.push(...st.hist); hi = hist.length; }
      if (st.url && st.url !== location.pathname && st.html) print(`<span class="tm-m">→ cd ${esc(location.pathname)}</span>`);
      if (st.open) open(true);
      out.scrollTop = out.scrollHeight;
    }
  } catch (e) {}
  addEventListener('pagehide', saveNow);
  btn.addEventListener('click', () => box.classList.contains('open') ? close() : open());
  box.querySelector('.tm-top button').addEventListener('click', close);

  /* ---------- code Konami : ↑ ↑ ↓ ↓ ← → ← → B A ---------- */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']; let kpos = 0;
  addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase();
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? (kpos >= 2 && KONAMI[kpos - 1] === 'arrowup' ? kpos : 1) : 0);
    if (kpos === KONAMI.length) { kpos = 0; setFun(true); shake(); confettis(); ach('konami'); if (!hunt.found(4)) toast('Code Konami activé : +30 vies. Mode fun débloqué.'); }
  });

  /* ---------- easter eggs : des mots tapés n’importe où ---------- */
  const eggs = {
    fun: () => { if (isFun()) { toast('Déjà en mode fun 🎨 (tape « serieux » pour le calme)'); return; } funOn(); toast('Mode fun activé 🎨'); },
    serieux: () => { funOff(); toast('Mode sérieux activé'); },
    inoxtag: () => { ach('inoxtag'); shake(); toast('Siroxtag. Avec un S. Merci.'); },
    sudo: () => toast('Bien essayé.'),
    help: () => open(),
    matrix: () => matrix(),
    ...(PD ? PD.eggs(helpers) : { blackout: () => { lights(); toast(SEC.bh); } })
  };
  const secretEggs = { [SEC.h.n2]: () => { if (PD) { toast('Oui, c’est moi 👋'); return; } toast(SEC.we); } };
  addEventListener('pointermove', e => { const r = document.documentElement.style; r.setProperty('--lx', e.clientX + 'px'); r.setProperty('--ly', e.clientY + 'px'); }, { passive: true });
  let buf = '';
  addEventListener('keydown', e => {
    const t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey || (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable))) return;
    if (e.key.length !== 1) return;
    buf = (buf + norm(e.key)).slice(-12);
    for (const k of Object.keys(eggs)) if (buf.endsWith(k)) { buf = ''; eggs[k](); return; }
    for (let n = 3; n <= 8; n++) { const f = secretEggs[H(buf.slice(-n))]; if (f) { buf = ''; f(); return; } }
  });

  /* ---------- succès liés aux pages ---------- */
  const path = location.pathname;
  const hr = new Date().getHours(); if (hr >= 0 && hr < 5) ach('nuit');
  if (path.startsWith(WIKI) && /^[^/]+\/$/.test(path.slice(WIKI.length))) {
    try { const r = new Set(JSON.parse(localStorage.getItem('sx-lu') || '[]')); r.add(path); localStorage.setItem('sx-lu', JSON.stringify([...r].slice(-800))); if (r.size >= 10) ach('lecteur'); if (r.size >= 50) ach('biblio'); } catch (e) {}
  }
  if (path.startsWith('/archives')) ach('musee');
  if (H(path) === SEC.h.np) ach('a18');
  if (PD) ach('a22');
  if (document.querySelector('[data-arena]')) ach('perdu');

  window.SX = { hunt, toast, confettis, shake, ach, H };
})();
