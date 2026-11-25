"""Construit le terminal :
  - assets/js/term.js : le terminal public (aucune donnée perso, secrets brouillés) ;
  - perso/term-perso.js : les commandes de la page perso, chargées uniquement là-bas.
Usage : python3 tools/build_term.py"""
import base64, hashlib, json, os, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'public')
K = [115, 120, 116, 97, 103, 33, 55]

def enc(s):
    b = s.encode('utf-8')
    return base64.b64encode(bytes(c ^ K[i % len(K)] for i, c in enumerate(b))).decode()

def fnv(s):
    h = 0x811c9dc5
    for ch in s:
        h ^= ord(ch); h = (h * 0x01000193) & 0xffffffff
    return format(h, 'x')

def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').strip()

ACH = [
    ['terminal', '⌨️', 'Hello, terminal', 'Ouvrir le terminal caché.'],
    ['help', '📖', 'Lis le manuel', 'Taper /help.'],
    ['fun', '🎨', 'Arc-en-ciel', 'Activer le mode fun.'],
    ['serieux', '👔', 'Cravate mise', 'Passer en mode sérieux.'],
    ['inoxtag', '🔤', 'Avec un S', 'Confondre Siroxtag et Inoxtag.'],
    ['matrix', '💊', 'Pilule rouge', 'Entrer dans la Matrice.'],
    ['mdp', '🔐', 'Coffre-fort', 'Générer un mot de passe solide.'],
    ['devine', '🎯', 'Dans le mille', 'Gagner au jeu /devine.'],
    ['blagues', '😂', 'Public conquis', 'Lire 5 blagues de développeur.'],
    ['hasard', '🎲', 'Le hasard fait bien les choses', 'Ouvrir un article au hasard.'],
    ['lecteur', '📚', 'Lecteur assidu', 'Lire 10 articles de l’encyclopédie.'],
    ['biblio', '🏛️', 'Rat de bibliothèque', 'Lire 50 articles de l’encyclopédie.'],
    ['musee', '🖼️', 'Visite guidée', 'Entrer dans le musée.'],
    ['detail', '✦', 'L’œil du conservateur', 'Trouver le détail caché du musée.'],
    ['perdu', '🧭', 'Perdu de vue', 'Tomber sur la page qui n’existe pas.'],
    ['bugs10', '🐞', 'Exterminateur', 'Écraser 10 bugs en une partie.'],
    ['bugs30', '🔥', 'Zéro bug en prod', 'Écraser 30 bugs en une partie.'],
    ['lampe', '🔦', 'Lampe torche', 'Éteindre la lumière du site.'],
    ['a18', '🌑', 'Dans le noir', 'Trouver la page entièrement noire.'],
    ['lumiere', '💡', 'Une lueur', 'Trouver la lumière dans le noir.'],
    ['konami', '🎮', '+30 vies', 'Entrer le code Konami.'],
    ['a21', '🕵️', 'Un nom qui ne te dit rien', 'Prononcer le nom interdit.'],
    ['a22', '🗝️', 'Zone non référencée', 'Trouver la page que Google n’a jamais vue.'],
    ['tresor', '🏆', 'Chasseur de lumière', 'Ouvrir le coffre de la chasse au trésor.'],
    ['nuit', '🌙', 'Noctambule', 'Visiter le site entre minuit et 5 h.'],
    ['platine', '💎', 'Platine', 'Débloquer tous les autres succès.', 'Tout débloquer.'],
]
SEC = {
    'ach': ACH,
    'frag': ['NE LAISSE', 'PAS LA', 'LUMIÈRE', 'S’ÉTEINDRE'],
    'hint': ['Perds-toi. Vraiment. Une page qui n’existe pas cache un jeu.',
             'Les vieux objets gardent des secrets. Le musée t’attend : /archives',
             'Éteins tout. Une page entièrement noire t’attend quelque part. Son nom tient en un mot.',
             'Un vieux code de triche des années 1980 marche ici. Avec les flèches.'],
    'r': {'c': '/perso/', 'b': '/noir/', 'a': '/tresor/'},
    'cm': 'Accès à une zone non référencée…',
    'w': ['🕵️ Wyatt ? Ce nom ne te dit rien… officiellement.',
          'Indice n° 1 : il existe une page que Google n’a jamais vue.',
          'Indice n° 2 : son nom tient en 5 lettres. Il commence par « p » et finit par « o ».',
          'Indice n° 3 : ici, les pages s’ouvrent comme des commandes. À toi de jouer.'],
    'we': 'Quelqu’un a dit Wyatt ? 👀 Ouvre le terminal et tape /wyatt',
    'bh': 'Ne laisse pas la lumière s’éteindre… (une page entière t’attend dans le noir)',
    'allFound': 'Tous les fragments ! Remets-les dans l’ordre dans la salle du trésor (/tresor) 🏆',
    'h': {'n1': fnv('noir'), 'n2': fnv('wyatt'), 'n3': fnv('perso'), 'np': fnv('/noir/')},
}
src = open(os.path.join(ROOT, 'tools', 'term_src.js'), encoding='utf-8').read()
assert "'__SEC__'" in src
out = src.replace("'__SEC__'", "'" + enc(json.dumps(SEC, ensure_ascii=False)) + "'")
open(os.path.join(SITE, 'assets', 'js', 'term.js'), 'w', encoding='utf-8').write(out)

# la phrase du coffre, uniquement sous forme d’empreinte
PHRASE = 'ne laisse pas la lumiere s eteindre'
ph = ''.join(c for c in norm(PHRASE) if c.isalpha())
print('empreinte du coffre :', hashlib.sha256(ph.encode()).hexdigest())

PERSO = r"""/* Commandes du terminal propres à la page perso. Chargé uniquement sur /perso/. */
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
"""
open(os.path.join(SITE, 'perso', 'term-perso.js'), 'w', encoding='utf-8').write(PERSO)
print('term.js et term-perso.js générés')
