/* Commandes du terminal propres à la page perso. Chargé uniquement sur /perso/. */
window.SX_X = {
  prompt: 'wyatt@perso:~$', name: 'wyatt', home: '/perso/', wiki: '/perso/wiki/', wikiName: 'Wyattpédia',
  hello: 'Bienvenue dans le terminal de Wyatt.',
  whoami: 'Wyatt LE. Dieu du code autoproclamé. Classement mondial : premier (selon moi).',
  ls: '<a href="/perso/">perso/</a>   <a href="/perso/wiki/">wiki/</a>   <a href="/">siroxtag.fr/</a>   <a href="/Linear/">Linear/</a>',
  python: 'import turtle\n# … un cœur …\nt.write("Je t’aime maman")\n\nMon tout premier code, en 6e.',
  gta: 'GTA VI : le préféré. GTA V : me manque quand même.',
  dormir: 'Erreur : sommeil introuvable. Record actuel : 4 jours.',
  self: 'C’est moi. Et tu es déjà chez moi. Bienvenue 👋',
  chapName: 'Ma page', chapDesc: 'mes projets et mes passions',
  chapter: h => ({
    projets: { d: 'mon portfolio', f: () => { h.go('#projets'); h.say('Tout est fait maison, même les bugs.', 'm'); } },
    outils: { d: 'mes outils', f: () => h.say('VS Code · GitHub · Discord\nNiveau : dieu du code.') },
    funfacts: { d: 'mes fun facts', f: () => h.go('#fun') },
    jeux: { d: 'mes jeux', f: () => { h.go('#jeux'); h.say('GTA VI en tête. GTA V dans le cœur.', 'm'); } },
    musique: { d: 'ce que j’écoute', f: () => { h.go('#musique'); h.say('Phonk, et en ce moment deux sons en boucle.', 'm'); } },
    plans: { d: 'plus tard', f: () => h.say('Plan A : policier. Plan B : cyberpolicier. Plan C : codeur.\nSpoiler : les trois.') },
    bugs: { d: 'mon pire bug', f: () => h.say('Le cache fantôme en production, combiné à une erreur d’hydratation silencieuse.\nJ’en fais encore des cauchemars.', 'e') },
    sommeil: { d: 'mes nuits', f: () => h.say('sommeil: null\nRecord de nuit blanche : 4 jours.') },
    ywh: { d: 'la sécurité', f: () => h.say('2 failles trouvées en 2 jours sur YesWeHack.\nAvec la permission des sites. Toujours.') },
    claude: { d: 'Claude Maxxing', f: () => h.say('Claude Maxxing : activé. Productivité : ×10. Sommeil : toujours null.') },
    github: { d: 'mon GitHub', f: () => h.print('<a href="https://github.com/ezechielw13" target="_blank" rel="noopener">github.com/ezechielw13</a>') },
    arcade: { d: 'le coin jeux', f: () => h.nav('/perso/jeux/', 'Insère une pièce…') },
    siroxtag: { d: 'aller sur siroxtag.fr', f: () => h.nav('/', 'Direction siroxtag.fr…') }
  }),
  hidden: h => ({
    maman: () => h.say('Je t’aime maman. (C’était mon tout premier code, en 6e.)'),
    phonk: () => { h.shake(); h.say('🔊 BOOM BOOM BOOM'); }
  }),
  eggs: h => ({
    code: () => { h.shake(); h.toast('while (true) code();'); },
    phonk: () => { h.shake(); h.toast('🔊 BOOM BOOM BOOM'); },
    maman: () => h.toast('Je t’aime maman ❤️')
  })
};
