/* Studio Siroxtag : application à barre latérale (une page, plusieurs vues).
   Vues : accueil, idées, accroches, tableau, calendrier, performances (TikTok), objectifs, checklist. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const e = SXA.esc, main = $('#contenu'), modal = $('[data-modal]'), mbox = $('[data-mbox]');
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const fmt = n => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1e4 ? Math.round(n / 1e3) + ' k' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.', ',') + ' k' : String(Math.round(n)));
  const pct = x => (x * 100).toFixed(1).replace('.', ',') + ' %';
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parseDay = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dLong = s => parseDay(s).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const monday = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (er) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (er) {} } };


  /* ---------- icônes (SVG maison, trait 2 px, couleur du texte) ---------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
    hook: '<circle cx="17" cy="4.5" r="1.5"/><path d="M17 6v6a5 5 0 0 1-10 0V9M7 9l-2.5 2.5M7 9l2.5 2.5"/>',
    board: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    chart: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    checksq: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12l3 3 5-6"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.2 1.2-3.6 2.4-4.6.2 1.6 1 2.6 2.1 3.1C11 9 11.2 6 12 3z"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    meh: '<circle cx="12" cy="12" r="9"/><path d="M8.5 15h7M9 9.5h.01M15 9.5h.01"/>',
    alert: '<path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    bars: '<path d="M3 21h18M6 17v-6M11 17V6M16 17v-4"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    msg: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    share: '<path d="M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M12 3v12M7 8l5-5 5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.4L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.4L20 16M20 20v-4h-4"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7 15h10"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    no: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    half: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    right: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    clip: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9z"/>'
  };
  const I = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
  $$('[data-ic]').forEach(el => { el.innerHTML = I(el.dataset.ic); });

  const S = { user: null, ideas: [], goals: { per_week: 3, followers: null }, tt: null, demo: false, loaded: false };

  /* ---------- données du générateur ---------- */
  const THEMES = {
    'Jeux vidéo': { sujets: ['la dernière mise à jour de ton jeu préféré', 'un joueur qui rage pour rien', 'le pire coéquipier en ligne', 'la musique du menu principal', 'un bug complètement absurde'], tags: '#gaming #jeuxvideo #gamer' },
    'GTA RP': { sujets: ['le premier jour d’un nouveau joueur RP', 'une course-poursuite qui tourne mal', 'un entretien d’embauche en RP', 'le patron d’entreprise trop sérieux', 'la police qui ne croit personne'], tags: '#gtarp #gta #roleplay' },
    'Horreur': { sujets: ['la créature qui déteste la lumière', 'une lampe torche presque déchargée', 'un bruit dans le couloir à 3 h du matin', 'le seul joueur resté dans le noir', 'la porte qui s’ouvre toute seule'], tags: '#horreur #roblox #frisson' },
    'Bouffe': { sujets: ['un burger maison raté', 'le goûter de 16 h', 'la recette la plus simple du monde', 'une dégustation à l’aveugle', 'le plat qu’on mange en jouant'], tags: '#food #bouffe #recette' },
    'Code': { sujets: ['un bug qui disparaît dès qu’on le regarde', 'le point-virgule oublié', 'un site codé en une soirée', 'l’IA qui propose n’importe quoi', '« ça marche sur ma machine »'], tags: '#code #developpeur #tech' },
    'Vie quotidienne': { sujets: ['le réveil du lundi matin', 'les notifications à 2 h du matin', 'le Wi-Fi qui coupe au pire moment', 'la batterie à 1 %', 'le groupe de discussion qui ne s’arrête jamais'], tags: '#humour #vraievie #pov' },
    'Musique': { sujets: ['le son qui reste dans la tête', 'monter le volume beaucoup trop fort', 'deviner une musique en 3 secondes', 'un edit sur du phonk', 'la playlist pour coder'], tags: '#musique #phonk #edit' }
  };
  const FORMATS = {
    'POV': { titre: s => `POV : ${s}`, hook: 'Commence directement dans la situation, regard caméra.', milieu: 'Fais monter la gêne ou la tension en 2 ou 3 plans.', chute: 'Une réaction exagérée, puis coupe net.' },
    'Parodie': { titre: s => `Parodie : ${s}, version film d’action`, hook: 'Une musique épique sur une situation banale.', milieu: 'Exagère chaque geste, comme une bande-annonce.', chute: 'Retour au calme brutal : silence et regard vide.' },
    'Avant / après': { titre: s => `Avant / après : ${s}`, hook: 'Montre le « avant » en moins d’une seconde.', milieu: 'Transition sur le temps fort du son.', chute: 'Le « après », avec un détail qui fait rire.' },
    'Top 3': { titre: s => `Top 3 des pires moments : ${s}`, hook: 'Annonce le n° 1 dès le début pour donner envie de rester.', milieu: 'Le n° 3 puis le n° 2, un plan chacun.', chute: 'Le n° 1, le plus absurde.' },
    'Storytime': { titre: s => `Storytime : ${s}`, hook: 'Commence par la fin : « Et c’est comme ça que… »', milieu: 'Raconte vite, avec des plans de coupe.', chute: 'Une dernière phrase qui retourne l’histoire.' },
    'Réaction': { titre: s => `Ma réaction face à ${s}`, hook: 'Ta tête en gros plan, avant même de voir le sujet.', milieu: 'Montre le sujet en incrustation.', chute: 'Une note sur 10, totalement injuste.' },
    'Fausse pub': { titre: s => `Fausse publicité : ${s}`, hook: 'Voix off de pub : « Vous en avez marre de… ? »', milieu: 'Présente le « produit » avec un sérieux total.', chute: 'Les conditions, lues beaucoup trop vite.' },
    'Edit': { titre: s => `Edit : ${s}`, hook: 'Le plan le plus fort tout de suite, calé sur le son.', milieu: 'Des coupes sur chaque temps fort.', chute: 'Un ralenti, puis un écran noir.' },
    'Défi': { titre: s => `Défi : ${s} en 10 secondes`, hook: 'Affiche le chrono à l’écran dès le départ.', milieu: 'Accélère, rate, recommence.', chute: 'Réussi ou raté : réaction honnête.' }
  };
  const SONS = ['du phonk', 'une musique épique', 'un son tendance du moment', 'un silence gênant', 'du lo-fi calme', 'un bruitage de jeu vidéo'];
  const BONUS = ['Bonus : finis par une question en description pour faire réagir.', 'Bonus : ajoute un détail caché que seuls les plus attentifs verront.', 'Bonus : fais une partie 2 si les commentaires la demandent.', 'Bonus : épingle le meilleur commentaire.', 'Bonus : tourne deux versions et garde la plus courte.'];
  const DUREES = ['7 à 15 s', '15 à 30 s', '30 à 60 s'];
  const HOOKS = {
    'Curiosité': ['Personne ne parle de {s}, et pourtant…', 'Ce que personne ne t’a jamais dit sur {s}.', 'J’ai testé {s} pendant 7 jours. Voilà le résultat.', 'Il y a un détail dans {s} que presque tout le monde rate.'],
    'Erreur': ['Arrête de faire ça avec {s}.', 'La plus grosse erreur avec {s} ? Celle-là.', 'Si tu fais ça avec {s}, tu perds ton temps.'],
    'Défi': ['Je n’ai que 10 secondes pour {s}.', '{s} sans rire ? Impossible. Essaie.', '{s} : niveau 1 contre niveau 100.'],
    'Histoire': ['Le jour où {s} a mal tourné.', 'Je n’aurais jamais dû tenter {s}.', 'Tout a commencé avec {s}…'],
    'Liste': ['3 choses à savoir sur {s}.', 'Top 3 des pires moments avec {s}.', '5 secondes pour comprendre {s}.'],
    'POV': ['POV : tu découvres {s} pour la première fois.', 'POV : {s}, mais tout part en vrille.', 'POV : ton pote ne comprend rien à {s}.']
  };
  const CHECK = {
    'Avant de tourner': ['J’ai écrit mon accroche (moins de 2 secondes).', 'Je sais comment la vidéo se termine.', 'La lumière est bonne, face à moi.', 'Le décor ne montre rien de personnel.'],
    'Avant de publier': ['Les sous-titres sont lisibles sur un petit écran.', 'Le son est bien réglé, pas trop fort.', 'La vidéo se comprend aussi sans le son.', 'Personne n’est filmé sans son accord.', 'La musique est disponible dans l’appli.', 'Pas d’info personnelle visible : adresse, école, plaque.', 'La description pose une question.', 'J’ai choisi une miniature claire.'],
    'Après la publication': ['Je réponds aux premiers commentaires.', 'J’épingle le meilleur commentaire.', 'Je note l’idée dans le tableau comme « Publié ».', 'Je regarde les chiffres après 48 h, pas avant.']
  };

  /* ---------- analyse des vidéos TikTok ---------- */
  const SLOTS = [['le matin', 6, 12], ['l’après-midi', 12, 17], ['le soir', 17, 21], ['la nuit', 21, 30]];
  const slotOf = h => SLOTS.find(([, a, b]) => (h < 6 ? h + 24 : h) >= a && (h < 6 ? h + 24 : h) < b)[0];
  const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function analyze(videos) {
    const now = Date.now();
    const vs = videos.map(v => ({ ...v, t: new Date(v.posted_at).getTime(), er: v.views ? (v.likes + v.comments + v.shares) / v.views : 0, sr: v.views ? v.shares / v.views : 0, cr: v.views ? v.comments / v.views : 0 }))
      .sort((a, b) => b.t - a.t);
    const mature = vs.filter(v => now - v.t > 48 * 3600e3);
    const medEr = median(mature.map(v => v.er)), medSr = median(mature.map(v => v.sr)), medCr = median(mature.map(v => v.cr));
    vs.forEach((v, i) => {
      const others = vs.filter(o => o !== v && now - o.t > 48 * 3600e3).slice(0, 20).map(o => o.views);
      const med = median(others); v.ratio = med ? v.views / med : null; v.tips = [];
      if (now - v.t < 48 * 3600e3) { v.cls = 'v-new'; v.ic = 'clock'; v.label = 'Trop tôt'; v.tips.push('Les chiffres bougent encore pendant les 48 premières heures. Reviens après.'); return; }
      if (others.length < 3) { v.cls = 'v-mid'; v.ic = 'bars'; v.label = 'À comparer'; v.tips.push('Il faut au moins 4 vidéos pour comparer. Continue de publier !'); return; }
      const r = v.ratio;
      [v.cls, v.ic, v.label] = r >= 2 ? ['v-top', 'flame', 'Carton'] : r >= 1.1 ? ['v-ok', 'ok', 'Bonne'] : r >= 0.7 ? ['v-mid', 'meh', 'Dans ta moyenne'] : ['v-low', 'alert', 'En dessous'];
      if (r >= 2) v.tips.push(`${r.toFixed(1).replace('.', ',')} fois tes vues habituelles. Note ce qui a marché (sujet, son, accroche) et refais-le dans la semaine.`);
      if (r < 0.9 && v.er >= medEr * 1.1) v.tips.push('Ceux qui l’ont vue ont aimé. C’est le début qui n’a pas retenu : retravaille les 2 premières secondes et la miniature.');
      if (r >= 1.1 && v.er < medEr * 0.8) v.tips.push('Beaucoup de vues mais peu de réactions : l’accroche marche, la fin moins. Termine par une question ou un rebondissement.');
      if (v.shares > 0 && medSr && v.sr >= medSr * 2) v.tips.push('Très partagée : ce format plaît, fais-en une suite.');
      if (v.comments > 0 && medCr && v.cr >= medCr * 2) v.tips.push('Elle fait parler : réponds à un commentaire en vidéo.');
      if (r < 0.7 && v.duration > 45) v.tips.push(`Elle dure ${v.duration} s. Teste une version plus courte du même sujet.`);
      if (r < 0.7 && !v.tips.length) v.tips.push('Change un seul élément la prochaine fois (accroche, son ou horaire) pour voir ce qui bloque.');
      v.tips = v.tips.slice(0, 2);
    });
    // tendances : moyenne du rapport aux vues habituelles, par jour, créneau et durée
    const rated = vs.filter(v => v.ratio !== null && now - v.t > 48 * 3600e3);
    const best = keyFn => { const g = {}; rated.forEach(v => { const k = keyFn(v); (g[k] ||= []).push(v.ratio); }); const c = Object.entries(g).filter(([, a]) => a.length >= 2).map(([k, a]) => [k, a.reduce((s, x) => s + x, 0) / a.length, a.length]).sort((a, b) => b[1] - a[1]); return c.length >= 2 ? c : null; };
    return {
      vs, medEr,
      day: best(v => DAYS[new Date(v.t).getDay()]),
      slot: best(v => slotOf(new Date(v.t).getHours())),
      dur: best(v => (v.duration < 15 ? 'moins de 15 s' : v.duration < 30 ? '15 à 30 s' : v.duration < 60 ? '30 à 60 s' : 'plus d’une minute'))
    };
  }

  /* ---------- graphiques (une seule série, survol avec info-bulle) ---------- */
  function chartBars(el, data, { ref, refLabel } = {}) {
    const W = 640, H = 200, P = 6, max = Math.max(1, ...data.map(d => d.v), ref || 0) * 1.08, bw = (W - P * 2) / data.length;
    const y = v => H - (v / max) * (H - 10);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H + 2}" role="img" aria-label="${e(el.dataset.title || 'Graphique')}">
      <line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="var(--line)"/>
      ${data.map((d, i) => { const h = Math.max(2, H - y(d.v)); return `<path data-i="${i}" fill="var(--o)" opacity="${d.dim ? .45 : 1}" d="M${P + i * bw + 1},${H} v${-(h - 4)} q0,-4 4,-4 h${Math.max(1, bw - 10)} q4,0 4,4 v${h - 4} z"/>`; }).join('')}
      ${ref ? `<line x1="0" x2="${W}" y1="${y(ref)}" y2="${y(ref)}" stroke="var(--fg)" stroke-dasharray="4 4" opacity=".6"/><text x="${W}" y="${y(ref) - 6}" text-anchor="end" font-size="12" fill="var(--mut)">${e(refLabel || '')}</text>` : ''}
      ${data.map((d, i) => `<rect data-i="${i}" x="${P + i * bw}" y="0" width="${bw}" height="${H}" fill="transparent"/>`).join('')}
    </svg><div class="tip"></div>`;
    hover(el, data, i => ({ x: P + i * bw + bw / 2, y: y(data[i].v) }), W, H);
  }
  function chartLine(el, data) {
    const W = 640, H = 180, lo = Math.min(...data.map(d => d.v)), hi = Math.max(...data.map(d => d.v)), span = Math.max(1, hi - lo);
    const x = i => (data.length < 2 ? W / 2 : (i / (data.length - 1)) * W), y = v => H - 8 - ((v - lo) / span) * (H - 24);
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(el.dataset.title || 'Graphique')}">
      <line x1="0" x2="${W}" y1="${H - 8}" y2="${H - 8}" stroke="var(--line)"/>
      <polyline fill="none" stroke="var(--o)" stroke-width="2" stroke-linejoin="round" points="${data.map((d, i) => `${x(i)},${y(d.v)}`).join(' ')}"/>
      <line data-cross x1="0" x2="0" y1="0" y2="${H - 8}" stroke="var(--mut)" opacity="0"/>
      <circle data-dot r="5" fill="var(--o)" stroke="var(--bg)" stroke-width="2" opacity="0"/>
      ${data.map((d, i) => `<rect data-i="${i}" x="${x(i) - W / data.length / 2}" y="0" width="${W / data.length}" height="${H}" fill="transparent"/>`).join('')}
    </svg><div class="tip"></div>`;
    hover(el, data, i => ({ x: x(i), y: y(data[i].v) }), W, H, true);
  }
  function hover(el, data, pos, W, H, line) {
    const tip = $('.tip', el), svg = $('svg', el);
    const show = i => {
      const p = pos(i), r = svg.getBoundingClientRect(), k = r.width / W;
      tip.innerHTML = `<b>${e(fmt(data[i].v))}</b> · ${e(data[i].label)}`; tip.style.left = Math.min(r.width - 60, Math.max(60, p.x * k)) + 'px'; tip.style.top = p.y * k + 'px'; tip.classList.add('on');
      if (line) { $('[data-cross]', el).setAttribute('x1', p.x); $('[data-cross]', el).setAttribute('x2', p.x); $('[data-cross]', el).setAttribute('opacity', '.5'); const d = $('[data-dot]', el); d.setAttribute('cx', p.x); d.setAttribute('cy', p.y); d.setAttribute('opacity', '1'); }
    };
    const hide = () => { tip.classList.remove('on'); if (line) { $('[data-cross]', el).setAttribute('opacity', '0'); $('[data-dot]', el).setAttribute('opacity', '0'); } };
    $$('rect[data-i]', el).forEach(r => { r.addEventListener('pointerenter', () => show(+r.dataset.i)); r.addEventListener('pointerdown', () => show(+r.dataset.i)); });
    svg.addEventListener('pointerleave', hide);
  }
  const tableOf = (rows, head) => `<details style="margin-top:10px"><summary class="m" style="cursor:pointer;font-size:14px">Voir en tableau</summary><table class="tbl"><thead><tr>${head.map(h => `<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${e(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></details>`;

  /* ---------- exemple de données (démo, clairement signalé) ---------- */
  function demoData() {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const titles = ['POV : le Wi-Fi coupe en pleine partie', 'Top 3 des pires coéquipiers', 'Edit phonk : la course-poursuite', 'Storytime : mon premier jour en RP', 'Fausse pub : la lampe torche infinie', 'Défi : deviner le jeu en 3 s', 'Avant / après : ma chambre de gamer', 'Réaction à mon tout premier TikTok', 'POV : la batterie à 1 %', 'Parodie : le lundi matin, version film', 'Le bug le plus absurde du jeu', 'Top 3 des musiques de menu', 'POV : 3 h du matin, un bruit dans le couloir', 'Défi : un burger en 60 s', 'Storytime : la créature dans le noir', 'Edit : la meilleure action de la semaine', 'Le son qui reste dans la tête', 'Fausse pub : le point-virgule magique'];
    const now = Date.now(), videos = titles.map((t, i) => {
      const age = (i * 3.4 + rnd() * 2) * 86400e3 + (i ? 0 : 20 * 3600e3), boost = [1, 0.6, 3.1, 0.9, 1.2, 0.5, 1, 1.4, 0.7, 2.2, 0.8, 0.4, 1.6, 1, 0.9, 1.3, 0.6, 1.1][i];
      const views = Math.round((1800 + rnd() * 2500) * boost * (i ? 1 : 0.35)), er = 0.05 + rnd() * 0.07;
      const d = new Date(now - age); d.setHours([18, 12, 19, 20, 9, 17, 21, 13, 19, 18, 22, 11, 20, 18, 21, 19, 16, 10][i]);
      return { id: 'demo' + i, title: t, cover: '', url: '', duration: [12, 28, 15, 52, 22, 9, 18, 35, 11, 24, 47, 14, 26, 61, 33, 13, 19, 21][i], posted_at: d.toISOString(), views, likes: Math.round(views * er * 0.85), comments: Math.round(views * er * 0.1), shares: Math.round(views * er * 0.05 * (boost > 2 ? 4 : 1)) };
    });
    const daily = []; let f = 820;
    for (let k = 59; k >= 0; k--) { f += Math.round(4 + rnd() * 14 + (k === 40 || k === 19 ? 120 : 0)); daily.push({ day: iso(new Date(now - k * 86400e3)), followers: f }); }
    return { configured: true, demo: true, account: { display_name: 'Compte d’exemple', avatar_url: '', followers: f, likes: 48200, videos: 18, synced_at: new Date().toISOString(), alive: true }, videos, daily };
  }

  /* ---------- chargement ---------- */
  async function load() {
    S.user = await SXA.me();
    if (S.user) {
      $('[data-acc]').textContent = S.user.pseudo;
      $('[data-user]').innerHTML = `<b>${e(S.user.pseudo)}</b><a href="/compte/" style="padding:0;display:inline;color:var(--mut);font-size:13px;font-weight:500">Mon compte ${I('right')}</a>`;
      const [i, g, t] = await Promise.all([SXA.api('ideas').catch(() => ({ ideas: [] })), SXA.api('studio').catch(() => ({})), SXA.api('tiktok').catch(() => null)]);
      S.ideas = i.ideas || []; if (g.goals) S.goals = g.goals; S.tt = t;
    }
    S.loaded = true;
  }
  const needLogin = (title, text) => {
    main.innerHTML = `<div class="st-view"><p class="lab">Membres</p><h1 class="st-h">${title}</h1><p class="st-lead">${text}</p><div class="box" style="margin-top:28px;max-width:460px" data-login></div></div>`;
    SXA.form($('[data-login]'), { next: '/studio/' + location.hash, onDone: async () => { await load(); route(); } });
  };
  const ttData = () => (S.demo ? demoData() : S.tt);
  const published = () => {
    const t = ttData();
    if (t && t.account && t.videos && t.videos.length) return t.videos.map(v => new Date(v.posted_at));
    return S.ideas.filter(i => i.status === 'publie').map(i => new Date(i.updated_at));
  };
  function weeks(n) {
    const pub = published(), m0 = monday(new Date()), out = [];
    for (let k = n - 1; k >= 0; k--) { const a = new Date(m0); a.setDate(a.getDate() - 7 * k); const b = new Date(a); b.setDate(b.getDate() + 7); out.push({ a, n: pub.filter(d => d >= a && d < b).length }); }
    return out;
  }
  function streak() {
    const g = S.goals.per_week; if (!g) return 0;
    const w = weeks(52); let s = 0, i = w.length - 1;
    if (w[i].n < g) i--; // la semaine en cours n’est pas finie
    for (; i >= 0 && w[i].n >= g; i--) s++;
    return s;
  }

  /* ---------- vues ---------- */
  const V = {};
  V.accueil = () => {
    const h = new Date().getHours(), hello = h < 6 ? 'Encore debout' : h < 18 ? 'Salut' : 'Bonsoir';
    if (!S.user) {
      main.innerHTML = `<div class="st-view"><p class="lab">Outil gratuit pour créateurs</p><h1 class="st-h">Le Studio.</h1>
        <p class="st-lead">Tout pour créer tes vidéos courtes au même endroit : des idées, des accroches qui retiennent, un tableau de tournage, un calendrier, et le suivi de tes vidéos TikTok qui te dit ce qui marche.</p>
        <div class="grid g3 st-sec">
          <a class="tile" href="#/idees" style="color:inherit;text-decoration:none"><small>${I('bulb')} Idées</small><b>∞</b><span>Une idée complète en un clic : format, plan, son et hashtags.</span></a>
          <a class="tile" href="#/accroches" style="color:inherit;text-decoration:none"><small>${I('hook')} Accroches</small><b>/100</b><span>Écris ton accroche, le Studio la note et te dit quoi améliorer.</span></a>
          <a class="tile" href="#/performances" style="color:inherit;text-decoration:none"><small>${I('chart')} Performances</small><b>TikTok</b><span>Chaque vidéo reçoit un verdict et des conseils. Démo disponible.</span></a>
        </div>
        <div class="st-sec"><h2>Crée ton compte gratuit pour tout garder</h2><div class="box" style="max-width:460px" data-login></div></div></div>`;
      SXA.form($('[data-login]'), { next: '/studio/', onDone: async () => { await load(); route(); } });
      return;
    }
    const w = weeks(1)[0], g = S.goals.per_week, st = streak(), stock = S.ideas.filter(i => i.status === 'idee' || i.status === 'a-tourner').length;
    const today = iso(new Date()), next = S.ideas.filter(i => i.planned_on && i.planned_on >= today && i.status !== 'publie').sort((a, b) => a.planned_on.localeCompare(b.planned_on))[0];
    const t = S.tt && S.tt.account ? S.tt : null, last = t && t.videos.length ? analyze(t.videos).vs[0] : null;
    main.innerHTML = `<div class="st-view"><p class="lab">Tableau de bord</p><h1 class="st-h">${hello}, ${e(S.user.pseudo)}.</h1>
      <p class="st-lead">${g ? (w.n >= g ? 'Objectif de la semaine atteint. Bien joué !' : `Encore ${g - w.n} vidéo${g - w.n > 1 ? 's' : ''} pour tenir ton objectif de la semaine.`) : 'Fixe-toi un objectif dans l’onglet Objectifs.'}</p>
      <div class="grid g4 st-sec">
        <div class="tile"><small>Cette semaine</small><b>${w.n}${g ? ` / ${g}` : ''}</b><span>vidéo${w.n > 1 ? 's' : ''} publiée${w.n > 1 ? 's' : ''}</span>${g ? `<div class="bar"><i style="width:${Math.min(100, (w.n / g) * 100)}%"></i></div>` : ''}</div>
        <div class="tile"><small>Série</small><b>${st} ${st ? I('flame') : ''}</b><span>semaine${st > 1 ? 's' : ''} d’affilée avec l’objectif tenu</span></div>
        <div class="tile"><small>En stock</small><b>${stock}</b><span>idée${stock > 1 ? 's' : ''} prête${stock > 1 ? 's' : ''} à tourner</span></div>
        <div class="tile"><small>Prochaine vidéo</small><b style="font-size:20px;line-height:1.2">${next ? e(next.title) : '—'}</b><span>${next ? e(dLong(next.planned_on)) : '<a href="#/calendrier" style="color:inherit">Planifie-la dans le calendrier</a>'}</span></div>
      </div>
      ${t ? `<div class="grid g2 st-sec"><div class="tile"><small>Abonnés TikTok</small><b>${fmt(t.account.followers || 0)}</b><span>${S.goals.followers ? `Objectif : ${fmt(S.goals.followers)}` : 'Fixe un objectif d’abonnés dans Objectifs.'}</span>${S.goals.followers ? `<div class="bar"><i style="width:${Math.min(100, ((t.account.followers || 0) / S.goals.followers) * 100)}%"></i></div>` : ''}</div>
        ${last ? `<a class="tile" href="#/performances" style="color:inherit;text-decoration:none"><small>Dernière vidéo</small><b style="font-size:20px;line-height:1.2">${e(last.title || 'Sans titre')}</b><span><span class="pill ${last.cls}">${I(last.ic)}${e(last.label)}</span> ${fmt(last.views)} vues</span></a>` : ''}</div>`
        : `<div class="demo">${I('chart')} Relie ton TikTok dans <a href="#/performances" style="color:inherit;font-weight:700">Performances</a> pour savoir si tes vidéos marchent.</div>`}
      <div class="st-sec"><h2>On fait quoi maintenant ?</h2><div class="row"><a class="sbtn pri" href="#/idees">${I('bulb')}Trouver une idée</a><a class="sbtn" href="#/accroches">${I('hook')}Tester une accroche</a><a class="sbtn" href="#/tableau">${I('board')}Mon tableau</a><a class="sbtn" href="#/publier">${I('send')}Préparer une publication</a><a class="sbtn" href="#/checklist">${I('checksq')}Checklist avant publication</a></div></div></div>`;
  };

  V.idees = () => {
    main.innerHTML = `<div class="st-view"><p class="lab">Générateur</p><h1 class="st-h">Une idée, <span class="it">tout de suite</span>.</h1>
      <p class="st-lead">Le Studio te propose une vidéo courte complète : le format, l’accroche, le plan en trois temps, le son et les hashtags.</p>
      <section class="box gen st-sec" aria-live="polite" data-gen>
        <div class="row" style="margin-bottom:20px">
          <select data-f="theme" aria-label="Thème"><option value="">Tous les thèmes</option>${Object.keys(THEMES).map(t => `<option>${e(t)}</option>`).join('')}</select>
          <select data-f="format" aria-label="Format"><option value="">Tous les formats</option>${Object.keys(FORMATS).map(t => `<option>${e(t)}</option>`).join('')}</select>
          <select data-f="duree" aria-label="Durée"><option value="">Toutes les durées</option>${DUREES.map(t => `<option>${e(t)}</option>`).join('')}</select>
        </div>
        <p class="lab" data-o="format"></p><h2 data-o="titre"></h2>
        <div class="tags"><span data-o="theme"></span><span data-o="duree"></span><span data-o="son"></span></div>
        <div class="plan3"><div><b>0 – 2 s · L’accroche</b><p data-o="hook"></p></div><div><b>Le milieu</b><p data-o="milieu"></p></div><div><b>La chute</b><p data-o="chute"></p></div></div>
        <p class="m" style="margin-top:16px;line-height:1.6"><span data-o="bonus"></span><br><span data-o="tags"></span></p>
        <div class="row" style="margin-top:20px"><button class="sbtn pri" type="button" data-next>${I('refresh')}Une autre idée</button><button class="sbtn" type="button" data-keep>${I('plus')}Garder dans mon tableau</button><button class="sbtn" type="button" data-copy>${I('copy')}Copier</button></div>
        <p class="msg" data-gmsg></p>
      </section></div>`;
    const gen = $('[data-gen]'), gmsg = $('[data-gmsg]'), f = k => $(`[data-f=${k}]`);
    let cur;
    const roll = () => {
      const theme = f('theme').value || pick(Object.keys(THEMES)), format = f('format').value || pick(Object.keys(FORMATS)), duree = f('duree').value || pick(DUREES);
      const s = pick(THEMES[theme].sujets), F = FORMATS[format], son = pick(SONS);
      cur = { theme, format, duree, son, titre: F.titre(s), hook: F.hook, milieu: F.milieu, chute: F.chute, bonus: pick(BONUS), tags: THEMES[theme].tags + ' #pourtoi' };
      Object.entries({ format: 'Format · ' + format, titre: cur.titre, theme, duree, son: 'Son : ' + son, hook: cur.hook, milieu: cur.milieu, chute: cur.chute, bonus: cur.bonus, tags: cur.tags }).forEach(([k, v]) => { $(`[data-o="${k}"]`, gen).textContent = v; });
      gen.classList.remove('flash'); void gen.offsetWidth; gen.classList.add('flash'); gmsg.textContent = '';
    };
    const asText = c => `${c.titre}\nFormat : ${c.format} · ${c.duree} · son : ${c.son}\nAccroche : ${c.hook}\nMilieu : ${c.milieu}\nChute : ${c.chute}\n${c.bonus}\n${c.tags}`;
    ['theme', 'format', 'duree'].forEach(k => f(k).addEventListener('change', roll));
    $('[data-next]').addEventListener('click', roll);
    $('[data-copy]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(asText(cur)); gmsg.innerHTML = I('check') + ' Copié'; } catch (er) { gmsg.textContent = 'Copie impossible sur ce navigateur.'; } });
    $('[data-keep]').addEventListener('click', async () => {
      if (!S.user) { gmsg.innerHTML = 'Crée ton compte gratuit pour garder tes idées : <a href="#/" style="color:inherit">c’est ici</a>.'; return; }
      try { const r = await SXA.api('ideas', { method: 'POST', body: { title: cur.titre, hook: cur.hook, tag: cur.theme, body: `Format : ${cur.format} · ${cur.duree} · son : ${cur.son}\nMilieu : ${cur.milieu}\nChute : ${cur.chute}\n${cur.bonus}\n${cur.tags}` } }); S.ideas.unshift(r.idea); gmsg.innerHTML = I('check') + ' Ajoutée à ton tableau. <a href="#/tableau" style="color:inherit">Voir</a>'; } catch (er) { gmsg.textContent = er.message; }
    });
    roll();
  };

  V.accroches = () => {
    main.innerHTML = `<div class="st-view"><p class="lab">Les 2 premières secondes</p><h1 class="st-h">Des accroches <span class="it">qui retiennent</span>.</h1>
      <p class="st-lead">Sur TikTok, tout se joue au début. Donne ton sujet pour obtenir des accroches, ou écris la tienne pour la faire noter.</p>
      <div class="grid g2 st-sec" style="align-items:start">
        <section class="box"><h2 style="margin:0;font-size:20px">Générer</h2>
          <label class="fld">Ton sujet<input class="in" data-s maxlength="80" value="ce jeu"></label>
          <label class="fld">Style<select data-c><option value="">Tous les styles</option>${Object.keys(HOOKS).map(k => `<option>${e(k)}</option>`).join('')}</select></label>
          <button class="sbtn pri" type="button" data-gen style="margin-top:14px">${I('refresh')}Générer des accroches</button>
          <div class="hooks" data-hooks></div></section>
        <section class="box"><h2 style="margin:0;font-size:20px">Tester mon accroche</h2>
          <label class="fld">Ce que tu dis (ou écris) dans les 2 premières secondes<textarea data-t maxlength="300" placeholder="Ex. : Personne ne parle de ce bug, et pourtant…"></textarea></label>
          <div data-res class="st-sec" style="margin-top:18px"></div></section>
      </div></div>`;
    const gen = () => {
      const s = $('[data-s]').value.trim() || 'ce sujet', c = $('[data-c]').value, pool = c ? HOOKS[c] : Object.values(HOOKS).flat();
      const list = [...pool].sort(() => Math.random() - 0.5).slice(0, 6).map(t => t.replace('{s}', s)).map(t => t[0].toUpperCase() + t.slice(1));
      $('[data-hooks]').innerHTML = list.map(t => `<div class="hk"><span>${e(t)}</span><button class="sbtn" type="button" data-use="${e(t)}">Tester</button></div>`).join('');
    };
    $('[data-gen]').addEventListener('click', gen); $('[data-c]').addEventListener('change', gen);
    $('[data-hooks]').addEventListener('click', ev => { const b = ev.target.closest('[data-use]'); if (b) { $('[data-t]').value = b.dataset.use; grade(); $('[data-t]').focus(); } });
    const grade = () => {
      const t = $('[data-t]').value.trim(), out = $('[data-res]');
      if (!t) { out.innerHTML = '<p class="m">La note s’affiche dès que tu écris.</p>'; return; }
      const low = t.toLowerCase(), words = t.split(/\s+/).filter(Boolean).length;
      const C = [
        [words <= 12 ? 25 : words <= 20 ? 10 : 0, 25, words <= 12 ? `Court : ${words} mots.` : `${words} mots : vise 12 maximum, ça doit tenir en 2 secondes.`],
        [/^(salut|bonjour|hello|hey|coucou|yo|alors|bon|euh)\b/.test(low) ? 0 : 20, 20, /^(salut|bonjour|hello|hey|coucou|yo|alors|bon|euh)\b/.test(low) ? 'Évite de commencer par une salutation : entre direct dans le sujet.' : 'Tu entres direct dans le sujet.'],
        [/\b(tu|toi|ton|ta|tes|te|t’|t'|vous|votre)\b|t’|t'/.test(low) ? 15 : 0, 15, /\b(tu|toi|ton|ta|tes|te|vous|votre)\b|t’|t'/.test(low) ? 'Tu parles directement au spectateur.' : 'Parle au spectateur : « tu », « ton », « toi »…'],
        [/(personne|jamais|secret|pourquoi|comment|erreur|pire|vrai|attends|regarde|avant de|impossible|personne ne|j’ai testé|j'ai testé|résultat|incroyable|arrête)/.test(low) ? 20 : 0, 20, /(personne|jamais|secret|pourquoi|comment|erreur|pire|vrai|attends|regarde|avant de|impossible|j’ai testé|j'ai testé|résultat|incroyable|arrête)/.test(low) ? 'Tu crées de la curiosité.' : 'Ajoute de la curiosité : « personne ne… », « l’erreur que… », « j’ai testé… ».'],
        [/\d/.test(t) ? 10 : 0, 10, /\d/.test(t) ? 'Un chiffre précis, ça accroche.' : 'Un chiffre aide souvent : « 3 choses », « 10 secondes ».'],
        [/[?…:!]|\.\.\./.test(t) ? 10 : 0, 10, /[?…:!]|\.\.\./.test(t) ? 'La ponctuation donne du rythme.' : 'Une question ou des points de suspension donnent envie de connaître la suite.']
      ];
      const sc = C.reduce((s, c) => s + c[0], 0), mood = sc >= 80 ? ['v-top', I('flame') + 'Excellente'] : sc >= 60 ? ['v-ok', I('ok') + 'Bonne'] : sc >= 40 ? ['v-mid', I('meh') + 'Peut mieux faire'] : ['v-low', I('alert') + 'À retravailler'];
      out.innerHTML = `<div class="row"><span class="score">${sc}</span><span class="m">/ 100</span><span class="pill ${mood[0]}">${mood[1]}</span></div>
        <ul class="crit">${C.map(c => `<li class="${c[0] === c[1] ? 'c-ok' : c[0] ? 'c-half' : 'c-no'}">${c[0] === c[1] ? I('ok') : c[0] ? I('half') : I('no')} ${e(c[2])}</li>`).join('')}</ul>
        <p class="m" style="font-size:13px;margin-top:12px">Note indicative, basée sur des règles simples. Rien ne remplace le test : publie, puis regarde tes chiffres.</p>`;
    };
    $('[data-t]').addEventListener('input', grade);
    gen(); grade();
  };

  /* tableau de tournage */
  const COLS = [['idee', 'Idées'], ['a-tourner', 'À tourner'], ['tourne', 'Tourné'], ['publie', 'Publié']];
  V.tableau = () => {
    if (!S.user) return needLogin('Mon tableau <span class="it">de tournage</span>.', 'Connecte-toi pour garder tes idées et les suivre, de l’idée à la publication. C’est gratuit.');
    const card = (i, ci) => `<div class="card-i" data-edit="${e(i.id)}" tabindex="0"><b>${e(i.title)}</b>${i.hook ? `<p>${I('hook')} ${e(i.hook)}</p>` : ''}
      <div class="meta">${i.tag ? `<span class="pill">${e(i.tag)}</span>` : ''}${i.planned_on ? `<span class="pill">${I('calendar')}${e(parseDay(i.planned_on).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))}</span>` : ''}${i.video_id ? `<span class="pill">${I('film')}liée</span>` : ''}</div>
      <div class="mv">${ci ? `<button type="button" data-mv="${e(i.id)}" data-to="${COLS[ci - 1][0]}" aria-label="Reculer">${I('left')}</button>` : ''}${ci < 3 ? `<button type="button" data-mv="${e(i.id)}" data-to="${COLS[ci + 1][0]}" aria-label="Avancer">${I('right')}</button>` : ''}</div></div>`;
    main.innerHTML = `<div class="st-view"><p class="lab">De l’idée à la publication</p><h1 class="st-h">Mon <span class="it">tableau</span>.</h1>
      <p class="st-lead">Clique sur une carte pour écrire le script, choisir une date ou la relier à ta vidéo TikTok.</p>
      <form class="row st-sec" data-add><input class="in" name="t" maxlength="160" placeholder="Nouvelle idée…" aria-label="Nouvelle idée" style="flex:1;min-width:200px"><button class="sbtn pri" type="submit">${I('plus')}Ajouter</button></form>
      <div class="board" style="margin-top:16px">${COLS.map(([k, n], ci) => `<div class="col"><h3><span>${n}</span><span>${S.ideas.filter(i => i.status === k).length}</span></h3>${S.ideas.filter(i => i.status === k).map(i => card(i, ci)).join('')}</div>`).join('')}</div></div>`;
    $('[data-add]').addEventListener('submit', async ev => { ev.preventDefault(); const t = ev.target.t.value.trim(); if (!t) return; try { const r = await SXA.api('ideas', { method: 'POST', body: { title: t } }); S.ideas.unshift(r.idea); V.tableau(); } catch (er) { alert(er.message); } });
    main.addEventListener('click', boardClick);
  };
  async function boardClick(ev) {
    const mv = ev.target.closest('[data-mv]');
    if (mv) { ev.stopPropagation(); try { const r = await SXA.api('ideas', { method: 'PATCH', body: { id: +mv.dataset.mv, status: mv.dataset.to } }); swap(r.idea); route(); } catch (er) { alert(er.message); } return; }
    const c = ev.target.closest('[data-edit]'); if (c) editIdea(c.dataset.edit);
  }
  const swap = idea => { S.ideas = S.ideas.map(i => (String(i.id) === String(idea.id) ? idea : i)); };
  function editIdea(id, preset = {}) {
    const i = id ? S.ideas.find(x => String(x.id) === String(id)) : { title: '', hook: '', body: '', tag: '', status: 'idee', planned_on: preset.planned_on || '', video_id: '' };
    if (!i) return;
    const vids = (S.tt && S.tt.videos) || [];
    mbox.innerHTML = `<form data-ef><p class="lab">${id ? 'Modifier l’idée' : 'Nouvelle idée'}</p>
      <label class="fld">Titre<input class="in" name="title" maxlength="160" required value="${e(i.title)}"></label>
      <label class="fld">Accroche (les 2 premières secondes)<input class="in" name="hook" maxlength="300" value="${e(i.hook || '')}"></label>
      <label class="fld">Script et notes<textarea name="body" maxlength="2000">${e(i.body || '')}</textarea></label>
      <div class="grid g2"><label class="fld">Étiquette<input class="in" name="tag" maxlength="40" value="${e(i.tag || '')}" placeholder="GTA RP, horreur…"></label>
      <label class="fld">Date prévue<input class="in" type="date" name="planned_on" value="${e(i.planned_on || '')}"></label></div>
      <div class="grid g2"><label class="fld">Étape<select name="status">${COLS.map(([k, n]) => `<option value="${k}"${i.status === k ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="fld">Vidéo TikTok liée<select name="video_id"><option value="">Aucune</option>${vids.map(v => `<option value="${e(v.id)}"${i.video_id === v.id ? ' selected' : ''}>${e((v.title || 'Sans titre').slice(0, 50))} · ${e(new Date(v.posted_at).toLocaleDateString('fr-FR'))}</option>`).join('')}</select></label></div>
      <div class="row" style="margin-top:20px"><button class="sbtn pri" type="submit">Enregistrer</button><button class="sbtn" type="button" data-close>Annuler</button>${id ? `<a class="sbtn" href="#/publier?id=${e(id)}" data-close>${I('send')}Préparer la publication</a><span style="flex:1"></span><button class="sbtn" type="button" data-del>Supprimer</button>` : ''}</div>
      <p class="msg" data-em></p></form>`;
    modal.hidden = false; $('input[name=title]', mbox).focus();
    const close = () => { modal.hidden = true; mbox.innerHTML = ''; };
    $$('[data-close]', mbox).forEach(b => b.addEventListener('click', close));
    $('[data-del]', mbox)?.addEventListener('click', async () => { if (!confirm('Supprimer cette idée ?')) return; try { await SXA.api('ideas', { method: 'DELETE', body: { id: +id } }); S.ideas = S.ideas.filter(x => String(x.id) !== String(id)); close(); route(); } catch (er) { $('[data-em]', mbox).textContent = er.message; } });
    $('[data-ef]', mbox).addEventListener('submit', async ev => {
      ev.preventDefault(); const d = Object.fromEntries(new FormData(ev.target));
      try {
        if (id) { const r = await SXA.api('ideas', { method: 'PATCH', body: { id: +id, ...d } }); swap(r.idea); }
        else { const r = await SXA.api('ideas', { method: 'POST', body: { title: d.title, hook: d.hook, body: d.body, tag: d.tag, planned_on: d.planned_on || null } }); let idea = r.idea; if (d.status !== 'idee' || d.video_id) idea = (await SXA.api('ideas', { method: 'PATCH', body: { id: +idea.id, status: d.status, video_id: d.video_id } })).idea; S.ideas.unshift(idea); }
        close(); route();
      } catch (er) { $('[data-em]', mbox).textContent = er.message; }
    });
  }
  modal.addEventListener('click', ev => { if (ev.target === modal) { modal.hidden = true; mbox.innerHTML = ''; } });
  addEventListener('keydown', ev => { if (ev.key === 'Escape' && !modal.hidden) { modal.hidden = true; mbox.innerHTML = ''; } if (ev.key === 'Enter' && ev.target.matches?.('[data-edit]')) editIdea(ev.target.dataset.edit); });

  /* calendrier */
  let calRef = new Date();
  V.calendrier = () => {
    if (!S.user) return needLogin('Mon <span class="it">calendrier</span>.', 'Connecte-toi pour planifier tes vidéos jour par jour.');
    const y = calRef.getFullYear(), m = calRef.getMonth(), first = monday(new Date(y, m, 1)), today = iso(new Date());
    const vids = ((S.tt && S.tt.account && S.tt.videos) || []).map(v => ({ day: iso(new Date(v.posted_at)), title: v.title || 'Vidéo TikTok' }));
    const cells = []; for (let k = 0; k < 42; k++) { const d = new Date(first); d.setDate(d.getDate() + k); cells.push(d); }
    const rows = cells[35].getMonth() !== m ? cells.slice(0, 35) : cells;
    main.innerHTML = `<div class="st-view"><p class="lab">Planning</p><h1 class="st-h">Mon <span class="it">calendrier</span>.</h1>
      <p class="st-lead">Clique sur un jour pour y prévoir une vidéo. ${vids.length ? 'Les vidéos déjà publiées sur TikTok apparaissent en orange.' : ''}</p>
      <div class="row st-sec"><button class="sbtn" type="button" data-m="-1" aria-label="Mois précédent">${I('left')}</button><h2 style="margin:0;font-size:22px;min-width:180px;text-align:center;text-transform:capitalize">${e(calRef.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }))}</h2><button class="sbtn" type="button" data-m="1" aria-label="Mois suivant">${I('right')}</button><button class="sbtn" type="button" data-m="0">Aujourd’hui</button></div>
      <div class="cal">${['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map(d => `<div class="dn">${d}</div>`).join('')}
      ${rows.map(d => { const k = iso(d), ev = S.ideas.filter(i => i.planned_on === k), pv = vids.filter(v => v.day === k); return `<button type="button" class="d${d.getMonth() !== m ? ' out' : ''}${k === today ? ' today' : ''}" data-day="${k}" aria-label="${e(dLong(k))}, ${ev.length + pv.length} élément(s)"><span>${d.getDate()}</span>${ev.map(i => `<div class="ev" data-edit="${e(i.id)}">${i.status === 'publie' ? I('check') : ''}${e(i.title)}</div>`).join('')}${pv.map(v => `<div class="ev pub">${I('film')}${e(v.title)}</div>`).join('')}</button>`; }).join('')}</div>
      ${(() => { const un = S.ideas.filter(i => !i.planned_on && i.status !== 'publie'); return un.length ? `<div class="st-sec"><h2>Pas encore planifiées (${un.length})</h2><div class="row">${un.slice(0, 12).map(i => `<button class="sbtn" type="button" data-edit="${e(i.id)}">${e(i.title.slice(0, 40))}</button>`).join('')}</div></div>` : ''; })()}</div>`;
    $$('[data-m]').forEach(b => b.addEventListener('click', () => { const k = +b.dataset.m; calRef = k ? new Date(y, m + k, 1) : new Date(); V.calendrier(); }));
    main.onclick = ev => { const ed = ev.target.closest('[data-edit]'); if (ed) { ev.stopPropagation(); return editIdea(ed.dataset.edit); } const d = ev.target.closest('[data-day]'); if (d) editIdea(null, { planned_on: d.dataset.day }); };
  };

  /* performances TikTok */
  V.performances = async () => {
    const q = new URLSearchParams(location.hash.split('?')[1] || '');
    const flash = { ok: 'Ton compte TikTok est relié. Tes vidéos arrivent.', refus: 'Tu as annulé la liaison avec TikTok.', erreur: 'La liaison avec TikTok n’a pas abouti. Réessaie.' }[q.get('tiktok')] || '';
    const t = ttData();
    if (!t || !t.account) {
      const configured = t ? t.configured : false;
      main.innerHTML = `<div class="st-view"><p class="lab">Suivi TikTok</p><h1 class="st-h">Est-ce que <span class="it">ça marche</span> ?</h1>
        <p class="st-lead">Relie ton compte TikTok. Le Studio récupère les chiffres de tes vidéos (vues, j’aime, commentaires, partages) chaque jour. Il compare chaque vidéo à tes habitudes et te dit quoi améliorer.</p>
        ${flash ? `<div class="demo">${e(flash)}</div>` : ''}
        <div class="grid g3 st-sec">
          <div class="tile"><small>1 · Relier</small><b>${I('link')}</b><span>Tu te connectes chez TikTok. On ne voit jamais ton mot de passe.</span></div>
          <div class="tile"><small>2 · Lire</small><b>${I('eye')}</b><span>Accès en lecture seule : le Studio ne publie rien et ne modifie rien.</span></div>
          <div class="tile"><small>3 · Comprendre</small><b>${I('bulb')}</b><span>Un verdict par vidéo, tes meilleurs jours, horaires et durées.</span></div>
        </div>
        <div class="row st-sec">${!S.user ? '<a class="sbtn pri" href="#/">Créer mon compte pour relier TikTok</a>' : configured ? `<a class="sbtn tt" href="/api/auth/tiktok">${I('music')}Relier mon compte TikTok</a>` : '<span class="pill v-new">Liaison TikTok bientôt disponible</span>'}<button class="sbtn" type="button" data-demo>Voir la démo</button></div>
        <p class="m" style="font-size:13px;margin-top:16px;max-width:44em">Le Studio utilise l’API officielle de TikTok. Tu peux délier ton compte à tout moment : tes données TikTok sont alors effacées. Détails dans la <a href="/confidentialite/" style="color:inherit">politique de confidentialité</a>.</p></div>`;
      $('[data-demo]').addEventListener('click', () => { S.demo = true; V.performances(); });
      return;
    }
    const A = analyze(t.videos), a = t.account, vs = A.vs, mature = vs.filter(v => v.ratio !== null && v.cls !== 'v-new');
    const chrono = [...vs].slice(0, 20).reverse(), medViews = median(chrono.map(v => v.views));
    const tot = vs.reduce((s, v) => s + v.views, 0), counts = ['v-top', 'v-ok', 'v-mid', 'v-low'].map(c => vs.filter(v => v.cls === c).length);
    const ins = (title, arr, unit) => arr ? `<div class="tile"><small>${title}</small><b style="font-size:24px">${e(arr[0][0][0].toUpperCase() + arr[0][0].slice(1))}</b><span>${(arr[0][1]).toFixed(1).replace('.', ',')} × tes vues habituelles${unit ? '' : ''} (${arr[0][2]} vidéos). Le moins bon : ${e(arr[arr.length - 1][0])}.</span></div>` : `<div class="tile"><small>${title}</small><b style="font-size:24px">—</b><span>Pas encore assez de vidéos pour comparer.</span></div>`;
    main.innerHTML = `<div class="st-view"><p class="lab">Suivi TikTok</p><h1 class="st-h">Mes <span class="it">performances</span>.</h1>
      ${S.demo ? `<div class="demo">${I('flask')}<span><b>Démo</b> : ces chiffres sont des exemples inventés, pas un vrai compte.</span><span style="flex:1"></span><button class="sbtn" type="button" data-nodemo>Quitter la démo</button></div>` : ''}
      ${flash && !S.demo ? `<div class="demo">${e(flash)}</div>` : ''}
      <div class="tt-head st-sec">${a.avatar_url ? `<img src="${e(a.avatar_url)}" alt="" referrerpolicy="no-referrer">` : '<img alt="">'}<div><b style="font-size:20px">${e(a.display_name || 'Mon compte')}</b><div class="m" style="font-size:14px">Mis à jour ${a.synced_at ? e(new Date(a.synced_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })) : 'jamais'}</div></div><span style="flex:1"></span>
        ${S.demo ? '' : '<button class="sbtn" type="button" data-sync>' + I('refresh') + 'Mettre à jour</button><button class="sbtn" type="button" data-unlink>Délier</button>'}</div>
      <p class="msg" data-pm></p>
      <div class="grid g4" style="margin-top:8px">
        <div class="tile"><small>Abonnés</small><b>${fmt(a.followers || 0)}</b>${t.daily.length > 1 ? `<span>${(d => (d >= 0 ? '+' : '') + fmt(d))((t.daily.at(-1).followers || 0) - (t.daily[Math.max(0, t.daily.length - 8)].followers || 0))} en 7 jours</span>` : '<span>La courbe arrive dans quelques jours.</span>'}</div>
        <div class="tile"><small>Vues (${vs.length} vidéos)</small><b>${fmt(tot)}</b><span>${fmt(medViews)} vues pour une vidéo habituelle</span></div>
        <div class="tile"><small>Engagement moyen</small><b>${pct(A.medEr)}</b><span>(j’aime + commentaires + partages) ÷ vues</span></div>
        <div class="tile"><small>Verdicts</small><b class="vrow">${I('flame')}${counts[0]} ${I('ok')}${counts[1]} ${I('meh')}${counts[2]} ${I('alert')}${counts[3]}</b><span>sur tes vidéos de plus de 48 h</span></div>
      </div>
      ${chrono.length > 1 ? `<section class="box st-sec"><h2 style="margin:0;font-size:18px">Vues de tes ${chrono.length} dernières vidéos</h2><p class="m" style="font-size:14px;margin:6px 0 0">La ligne pointillée montre ta vidéo habituelle (médiane). Survole une barre pour le détail.</p><div class="chart" data-title="Vues par vidéo" data-c1></div>${tableOf(chrono.map(v => [new Date(v.posted_at).toLocaleDateString('fr-FR'), v.title || 'Sans titre', fmt(v.views)]), ['Date', 'Vidéo', 'Vues'])}</section>` : ''}
      ${t.daily.length > 1 ? `<section class="box st-sec"><h2 style="margin:0;font-size:18px">Abonnés, jour après jour</h2><div class="chart" data-title="Abonnés par jour" data-c2></div>${tableOf(t.daily.map(d => [parseDay(d.day).toLocaleDateString('fr-FR'), fmt(d.followers || 0)]), ['Jour', 'Abonnés'])}</section>` : ''}
      <div class="st-sec"><h2>Ce qui marche le mieux pour toi</h2><div class="grid g3">${ins('Meilleur jour', A.day)}${ins('Meilleur moment', A.slot)}${ins('Meilleure durée', A.dur)}</div>
        <p class="m" style="font-size:13px;margin-top:10px">Calculé sur tes propres vidéos. Plus tu publies, plus c’est fiable. TikTok ne donne pas la durée de visionnage à ce type d’application, donc le Studio ne peut pas l’afficher.</p></div>
      <div class="st-sec"><h2>Vidéo par vidéo</h2><div class="vids">${vs.map(v => `<article class="vid">${v.cover ? `<img src="${e(v.cover)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : '<div class="ph"></div>'}
        <div><b>${v.url ? `<a href="${e(v.url)}" target="_blank" rel="noopener" style="color:inherit">${e(v.title || 'Sans titre')}</a>` : e(v.title || 'Sans titre')}</b>
        <div class="nums"><span>${e(new Date(v.posted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }))}</span><span>${I('eye')}${fmt(v.views)}</span><span>${I('heart')}${fmt(v.likes)}</span><span>${I('msg')}${fmt(v.comments)}</span><span>${I('share')}${fmt(v.shares)}</span><span>${v.duration} s</span><span>engagement ${pct(v.er)}</span></div>
        ${v.tips.map(x => `<p class="tip-l">${I('bulb')}<span>${e(x)}</span></p>`).join('')}</div><span class="pill ${v.cls}">${I(v.ic)}${e(v.label)}</span></article>`).join('')}</div></div></div>`;
    if (chrono.length > 1) chartBars($('[data-c1]'), chrono.map(v => ({ v: v.views, label: (v.title || 'Sans titre').slice(0, 40), dim: v.cls === 'v-new' })), { ref: medViews, refLabel: 'ta vidéo habituelle' });
    if (t.daily.length > 1) chartLine($('[data-c2]'), t.daily.map(d => ({ v: d.followers || 0, label: parseDay(d.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) })));
    $('[data-nodemo]')?.addEventListener('click', () => { S.demo = false; V.performances(); });
    $('[data-sync]')?.addEventListener('click', async ev => { ev.target.disabled = true; $('[data-pm]').textContent = 'Mise à jour…'; try { await SXA.api('tiktok', { method: 'POST' }); S.tt = await SXA.api('tiktok'); V.performances(); } catch (er) { $('[data-pm]').textContent = er.message; ev.target.disabled = false; } });
    $('[data-unlink]')?.addEventListener('click', async () => { if (!confirm('Délier ton compte TikTok ? Tes chiffres TikTok seront effacés du Studio.')) return; try { await SXA.api('tiktok', { method: 'DELETE' }); S.tt = await SXA.api('tiktok'); V.performances(); } catch (er) { $('[data-pm]').textContent = er.message; } });
  };


  /* atelier de publication : description, hashtags, meilleur moment */
  const FTAG = { 'POV': '#pov', 'Parodie': '#parodie', 'Avant / après': '#avantapres', 'Top 3': '#top3', 'Storytime': '#storytime', 'Réaction': '#reaction', 'Fausse pub': '#faussepub', 'Edit': '#edit', 'Défi': '#defi' };
  const BROAD = ['#pourtoi', '#humour', '#tiktokfrance', '#viral'];
  const QUESTIONS = ['Et toi, tu aurais fait quoi ?', 'Ça t’est déjà arrivé ?', 'Tu veux une partie 2 ?', 'Ta note sur 10 en commentaire.', 'Dis-moi en commentaire si tu es d’accord.', 'Identifie quelqu’un qui fait exactement ça.'];
  const cleanTag = t => '#' + String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_]/g, '');
  V.publier = () => {
    if (!S.user) return needLogin('L’atelier <span class="it">de publication</span>.', 'Connecte-toi pour préparer la description et les hashtags de tes vidéos.');
    const qs = new URLSearchParams(location.hash.split('?')[1] || '');
    const cands = S.ideas.filter(i => i.status !== 'publie');
    let idea = S.ideas.find(i => String(i.id) === qs.get('id')) || null;
    const st = { tags: [], extra: [], variant: 0, q: pick(QUESTIONS) };
    const themeOf = i => (i && (Object.keys(THEMES).find(t => t.toLowerCase() === String(i.tag || '').toLowerCase()) || Object.keys(THEMES).find(t => (i.body || '').includes(t)))) || '';
    const formatOf = i => (i && Object.keys(FORMATS).find(f => (i.body || '').includes('Format : ' + f) || (i.title || '').startsWith(f))) || '';
    const pool = () => {
      const th = themeOf(idea), fo = formatOf(idea);
      const niche = th ? THEMES[th].tags.split(' ') : idea && idea.tag ? [cleanTag(idea.tag)] : [];
      return [...new Set([...niche, ...(fo ? [FTAG[fo]] : []), ...BROAD, ...st.extra])].filter(t => t.length > 1);
    };
    const t = ttData(), A = t && t.account && t.videos && t.videos.length ? analyze(t.videos) : null;
    const when = A && (A.day || A.slot) ? `D’après tes vidéos : publie plutôt <b>${A.day ? e(A.day[0][0]) : ''}${A.day && A.slot ? ', ' : ''}${A.slot ? e(A.slot[0][0]) : ''}</b>.` : 'Pas encore assez de vidéos analysées pour te conseiller un horaire. Relie ton TikTok dans Performances : le conseil apparaîtra ici.';
    main.innerHTML = `<div class="st-view"><p class="lab">Avant de poster</p><h1 class="st-h">L’atelier <span class="it">de publication</span>.</h1>
      <p class="st-lead">Choisis une idée de ton tableau. Le Studio te prépare la description et les hashtags. Tu copies, tu ouvres TikTok, tu publies.</p>
      <div class="grid g2 st-sec" style="align-items:start">
        <section class="box"><h2 style="margin:0;font-size:20px">1 · La vidéo</h2>
          <label class="fld">Idée du tableau<select data-pi><option value="">Écrire sans idée</option>${cands.map(i => `<option value="${e(i.id)}"${idea && String(idea.id) === String(i.id) ? ' selected' : ''}>${e(i.title.slice(0, 70))}</option>`).join('')}</select></label>
          <label class="fld">Sujet ou titre<input class="in" data-pt maxlength="160" value="${e(idea ? idea.title : '')}" placeholder="Ex. : POV : la batterie à 1 %"></label>
          <label class="fld">Accroche (première ligne de la description)<input class="in" data-ph maxlength="300" value="${e(idea ? idea.hook || '' : '')}" placeholder="Ex. : Personne ne parle de ça…"></label>
          <h2 style="margin:26px 0 0;font-size:20px">2 · Les hashtags</h2>
          <p class="m" style="font-size:14px;margin:6px 0 0">Touche un hashtag pour l’ajouter ou le retirer. Conseil courant : 3 à 5 hashtags précis valent mieux que 15 au hasard.</p>
          <div class="row" data-chips style="margin-top:12px"></div>
          <form class="row" data-addtag style="margin-top:10px"><input class="in" name="t" maxlength="40" placeholder="Ajouter un hashtag" style="flex:1;min-width:160px"><button class="sbtn" type="submit">${I('plus')}Ajouter</button></form>
          <h2 style="margin:26px 0 0;font-size:20px">3 · Le bon moment</h2>
          <p class="m" style="margin:8px 0 0;line-height:1.5">${I('clock')} ${when}</p>
        </section>
        <section class="box"><h2 style="margin:0;font-size:20px">4 · La description</h2>
          <div class="row" style="margin-top:12px" role="tablist" data-vars>${['Question', 'Curiosité', 'Courte'].map((n, k) => `<button type="button" class="sbtn${k ? '' : ' pri'}" data-v="${k}">${n}</button>`).join('')}<button type="button" class="sbtn" data-reroll title="Autre question">${I('refresh')}</button></div>
          <label class="fld">Tu peux la modifier librement<textarea data-cap maxlength="2200" style="min-height:190px"></textarea></label>
          <p class="m" style="font-size:13px;margin:6px 0 0" data-count></p>
          <div class="row" style="margin-top:16px"><button class="sbtn pri" type="button" data-cp>${I('copy')}Copier la description</button><a class="sbtn tt" href="https://www.tiktok.com/upload" target="_blank" rel="noopener">${I('music')}Ouvrir TikTok</a></div>
          <div class="row" style="margin-top:10px">${'<button class="sbtn" type="button" data-save>' + I('check') + 'Enregistrer dans l’idée</button><button class="sbtn" type="button" data-done>' + I('send') + 'Marquer comme publiée</button>'}</div>
          <p class="msg" data-pmsg></p>
          <ul class="crit" style="margin-top:18px">${['Les sous-titres sont lisibles sur un petit écran.', 'Aucune info personnelle visible.', 'La musique est disponible dans l’appli.'].map(x => `<li class="c-half">${I('checksq')} ${e(x)}</li>`).join('')}</ul>
          <a href="#/checklist" class="m" style="font-size:14px;color:inherit">Voir la checklist complète ${I('right')}</a>
        </section></div></div>`;
    const cap = $('[data-cap]'), msg = $('[data-pmsg]');
    const build = () => {
      const tt = $('[data-pt]').value.trim(), h = $('[data-ph]').value.trim(), tags = st.tags.join(' ');
      const first = h || tt || 'Ma nouvelle vidéo';
      const v = [
        `${first}\n\n${st.q}\n\n${tags}`,
        `${first}${/[.!?…]$/.test(first) ? '' : '…'} attends la fin.\n\n${tt && h ? tt + '\n\n' : ''}${tags}`,
        `${(tt || first).slice(0, 90)} ${tags}`
      ][st.variant];
      cap.value = v.trim(); count();
    };
    const count = () => { const n = [...cap.value].length, h = (cap.value.match(/#[\p{L}\p{N}_]+/gu) || []).length; $('[data-count]').textContent = `${n} caractères · ${h} hashtag${h > 1 ? 's' : ''}${h > 6 ? ' : c’est beaucoup, garde les plus précis.' : ''}`; };
    const chips = () => { $('[data-chips]').innerHTML = pool().map(x => `<button type="button" class="pill${st.tags.includes(x) ? ' v-top' : ''}" data-tag="${e(x)}" style="cursor:pointer;background:${st.tags.includes(x) ? '' : 'none'};color:inherit">${I('hash')}${e(x.slice(1))}</button>`).join(''); };
    const init = () => {
      const p = pool(); st.tags = p.slice(0, Math.min(4, p.length)); if (!st.tags.includes('#pourtoi') && p.includes('#pourtoi')) st.tags.push('#pourtoi');
      chips();
      if (idea && idea.caption) { cap.value = idea.caption; count(); } else build();
    };
    $('[data-pi]').addEventListener('change', ev => { idea = S.ideas.find(i => String(i.id) === ev.target.value) || null; history.replaceState(null, '', '#/publier' + (idea ? '?id=' + idea.id : '')); $('[data-pt]').value = idea ? idea.title : ''; $('[data-ph]').value = idea ? idea.hook || '' : ''; st.extra = []; init(); });
    [$('[data-pt]'), $('[data-ph]')].forEach(x => x.addEventListener('input', build));
    $('[data-chips]').addEventListener('click', ev => { const b = ev.target.closest('[data-tag]'); if (!b) return; const x = b.dataset.tag; st.tags = st.tags.includes(x) ? st.tags.filter(y => y !== x) : [...st.tags, x]; chips(); build(); });
    $('[data-addtag]').addEventListener('submit', ev => { ev.preventDefault(); const x = cleanTag(ev.target.t.value); if (x.length < 2) return; if (!st.extra.includes(x)) st.extra.push(x); if (!st.tags.includes(x)) st.tags.push(x); ev.target.reset(); chips(); build(); });
    $('[data-vars]').addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (b) { st.variant = +b.dataset.v; $$('[data-v]').forEach(x => x.classList.toggle('pri', x === b)); build(); } if (ev.target.closest('[data-reroll]')) { st.q = pick(QUESTIONS.filter(q => q !== st.q)); build(); } });
    cap.addEventListener('input', count);
    $('[data-cp]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(cap.value); msg.innerHTML = I('check') + ' Copiée. Colle-la dans TikTok au moment de publier.'; } catch (er) { cap.select(); msg.textContent = 'Copie automatique impossible : sélectionne le texte et copie-le.'; } });
    const patch = async body => { if (!idea) { msg.textContent = 'Choisis d’abord une idée du tableau (étape 1).'; return null; } const r = await SXA.api('ideas', { method: 'PATCH', body: { id: +idea.id, ...body } }); swap(r.idea); idea = r.idea; return r.idea; };
    $('[data-save]').addEventListener('click', async () => { try { if (await patch({ caption: cap.value, title: $('[data-pt]').value.trim() || undefined, hook: $('[data-ph]').value.trim() })) msg.innerHTML = I('check') + ' Enregistrée dans ton idée.'; } catch (er) { msg.textContent = er.message; } });
    $('[data-done]').addEventListener('click', async () => { try { if (await patch({ caption: cap.value, status: 'publie', planned_on: idea.planned_on || iso(new Date()) })) msg.innerHTML = I('check') + ' Bravo ! L’idée passe dans « Publié ». Pense à revenir voir ses chiffres dans 48 h.'; } catch (er) { msg.textContent = er.message; } });
    init();
  };

  /* objectifs */
  V.objectifs = () => {
    if (!S.user) return needLogin('Mes <span class="it">objectifs</span>.', 'Connecte-toi pour te fixer un rythme de publication et suivre ta série.');
    const w = weeks(8), g = S.goals.per_week, st = streak(), t = ttData(), fol = t && t.account ? t.account.followers || 0 : null;
    main.innerHTML = `<div class="st-view"><p class="lab">Régularité</p><h1 class="st-h">Mes <span class="it">objectifs</span>.</h1>
      <p class="st-lead">La régularité compte plus que la perfection. Fixe un rythme tenable, et garde ta série.</p>
      <div class="grid g2 st-sec" style="align-items:start">
        <form class="box" data-gf><h2 style="margin:0;font-size:20px">Mon rythme</h2>
          <label class="fld">Vidéos par semaine<input class="in" type="number" name="per_week" min="0" max="50" value="${e(g)}"></label>
          <label class="fld">Abonnés visés sur TikTok (facultatif)<input class="in" type="number" name="followers" min="0" value="${e(S.goals.followers ?? '')}" placeholder="Ex. : 1000"></label>
          <button class="sbtn pri" type="submit" style="margin-top:16px">Enregistrer</button><p class="msg" data-gm></p></form>
        <div class="grid">
          <div class="tile"><small>Cette semaine</small><b>${w.at(-1).n}${g ? ` / ${g}` : ''}</b>${g ? `<div class="bar"><i style="width:${Math.min(100, (w.at(-1).n / g) * 100)}%"></i></div>` : ''}</div>
          <div class="tile"><small>Série</small><b>${st} semaine${st > 1 ? 's' : ''} ${st ? I('flame') : ''}</b><span>${st ? 'Ne casse pas la chaîne !' : 'Tiens ton objectif une semaine pour lancer ta série.'}</span></div>
          ${fol !== null && S.goals.followers ? `<div class="tile"><small>Abonnés</small><b>${fmt(fol)} / ${fmt(S.goals.followers)}</b><div class="bar"><i style="width:${Math.min(100, (fol / S.goals.followers) * 100)}%"></i></div></div>` : ''}
        </div></div>
      <section class="box st-sec"><h2 style="margin:0;font-size:18px">Vidéos publiées, semaine par semaine</h2><p class="m" style="font-size:14px;margin:6px 0 0">${t && t.account ? 'D’après ton compte TikTok.' : 'D’après les idées passées en « Publié » dans ton tableau.'} La ligne pointillée montre ton objectif.</p><div class="chart" data-title="Vidéos publiées par semaine" data-c3></div>
        ${tableOf(w.map(x => ['Semaine du ' + x.a.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), String(x.n)]), ['Semaine', 'Vidéos'])}</section></div>`;
    chartBars($('[data-c3]'), w.map(x => ({ v: x.n, label: 'semaine du ' + x.a.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) })), { ref: g, refLabel: 'objectif' });
    $('[data-gf]').addEventListener('submit', async ev => {
      ev.preventDefault(); const d = Object.fromEntries(new FormData(ev.target));
      try { S.goals = (await SXA.api('studio', { method: 'PUT', body: { per_week: Number(d.per_week || 0), followers: d.followers === '' ? null : Number(d.followers) } })).goals; V.objectifs(); $('[data-gm]').innerHTML = I('check') + ' Enregistré'; } catch (er) { $('[data-gm]').textContent = er.message; }
    });
  };

  /* checklist (cochée dans ce navigateur uniquement) */
  V.checklist = () => {
    const done = store.get('sx-studio-check', {});
    main.innerHTML = `<div class="st-view"><p class="lab">Avant de publier</p><h1 class="st-h">La <span class="it">checklist</span>.</h1>
      <p class="st-lead">Coche au fur et à mesure. Tes cases restent cochées sur cet appareil.</p>
      ${Object.entries(CHECK).map(([g, items]) => `<section class="st-sec"><h2>${e(g)}</h2><ul class="ck">${items.map((t, i) => { const k = g + i; return `<li><label><input type="checkbox" data-k="${e(k)}"${done[k] ? ' checked' : ''}><span>${e(t)}</span></label></li>`; }).join('')}</ul></section>`).join('')}
      <button class="sbtn st-sec" type="button" data-reset>Tout décocher pour la prochaine vidéo</button></div>`;
    main.onchange = ev => { const k = ev.target.dataset.k; if (!k) return; const d = store.get('sx-studio-check', {}); if (ev.target.checked) d[k] = 1; else delete d[k]; store.set('sx-studio-check', d); if (Object.keys(d).length === Object.values(CHECK).flat().length && window.SX) window.SX.confettis?.(); };
    $('[data-reset]').addEventListener('click', () => { store.set('sx-studio-check', {}); V.checklist(); });
  };

  /* ---------- routeur ---------- */
  function route() {
    const r = (location.hash.replace(/^#\/?/, '').split('?')[0] || 'accueil');
    const name = V[r] ? r : 'accueil';
    main.onclick = null; main.onchange = null; main.removeEventListener('click', boardClick);
    $$('[data-r]').forEach(a => (a.dataset.r === name ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    $(`[data-r="${name}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
    V[name]();
    document.title = ({ accueil: 'Tableau de bord', idees: 'Idées', accroches: 'Accroches', tableau: 'Tableau', calendrier: 'Calendrier', publier: 'Publier', performances: 'Performances', objectifs: 'Objectifs', checklist: 'Checklist' }[name]) + ' — Studio Siroxtag';
    if (S.navigated) { main.focus({ preventScroll: true }); scrollTo({ top: 0 }); }
    S.navigated = true;
  }
  addEventListener('hashchange', route);
  load().then(route);
})();
