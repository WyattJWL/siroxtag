"""Génère Wyattpédia (/perso/wiki/) à partir de tools/wiki_content.py et tools/wiki_more.py.
Usage : python3 tools/build_wiki.py   (depuis la racine du dépôt)
        python3 tools/build_wiki.py --nav   (affiche aussi le HTML de l’en-tête)"""
import os, re, html, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wiki_content import ARTICLES as BASE
from wiki_more import MORE
from wiki_ext import EXT
from wiki_ext2 import EXT2
from wiki_filieres import FILIERES
from wiki_moi import MOI

ARTICLES = BASE + MORE + FILIERES + MOI
CATS = {'aime': 'Ce que j’aime', 'moi': 'Ce qui me décrit', 'projets': 'Mes projets', 'veux': 'Ce que je veux faire',
        'police': 'Police et cyber', 'ecole': 'École et études', 'tech': 'Lexique tech', 'jargon': 'Jargon de dev'}
BY = {a['slug']: a for a in ARTICLES}
assert len(BY) == len(ARTICLES), 'slug en double'
for k, secs in list(EXT.items()) + list(EXT2.items()):
    assert k in BY, ('ext', k)
    BY[k]['sections'] = list(BY[k]['sections']) + secs
missing = [a['slug'] for a in BASE + MORE if a['slug'] not in EXT and a['slug'] not in EXT2]
assert not missing, ('pas rallongés', missing)
PATHS = {'policier': ['gardien-de-la-paix', 'policier-adjoint', 'cadets-republique', 'concours', 'ecole-de-police', 'gendarmerie', 'deontologie', 'numeros-urgence'],
         'cyberpolicier': ['cybercriminalite', 'pharos', 'forensique', 'osint', 'ctf', 'pentest', 'anssi', 'cnil', 'code-penal-323'],
         'developpeur': ['but-informatique', 'bts-sio', 'licence-informatique', 'ecole-ingenieur', 'alternance', 'portfolio', 'full-stack'],
         'filiere-generale': ['college', 'brevet', 'stage-3e', 'orientation', 'seconde', 'snt', 'specialite-nsi', 'maths', 'bac-general', 'grand-oral', 'parcoursup']}
for k, v in PATHS.items(): BY[k]['uses'] = v

ALIAS_EXTRA = {'bots-discord': ['bot Discord', 'bots Discord'], 'hacking-ethique': ['bug bounty', 'hacking éthique'], 'sites-saas': ['SaaS'],
  'claude-maxxing': ['Claude'], 'vs-code': ['Visual Studio Code'], 'gta-vi': ['Grand Theft Auto VI'], 'page-perso': ['page perso'],
  'bot-impots': ['bot des impôts'], 'terminal-cache': ['terminal caché'], 'developpeur': ['développeur', 'développeurs'],
  'filiere-generale': ['filière générale'], 'bug': ['pire bug', 'cache fantôme'], 'nuit-blanche': ['nuit blanche', 'nuits blanches'],
  'cyberpolicier': ['cyberpolicier'], 'policier': ['policier'], 'github': ['GitHub'], 'linear': ['Linear'], 'blackout': ['BLACKOUT']}
for k, v in ALIAS_EXTRA.items():
    BY[k]['alias'] = list(BY[k].get('alias') or []) + v

# liens projets ↔ sujets, en plus des technos déclarées dans « uses »
EXTRA = {'siroxtag-fr': ['tiktok', 'sites-saas', 'terminal-cache'], 'page-perso': ['sites-saas', 'phonk', 'gta-vi', 'claude-maxxing', 'wyattpedia', 'terminal-cache'],
         'bot-impots': ['bots-discord', 'discord', 'gta-rp'], 'linear': ['gta-rp'], 'blackout': ['siroxtag-fr'], 'wyattpedia': ['claude-maxxing']}
for p, xs in EXTRA.items():
    BY[p]['uses'] = BY[p].get('uses', []) + [x for x in xs if x not in BY[p].get('uses', [])]
USED_IN = {}
for a in ARTICLES:
    for u in a.get('uses', []):
        assert u in BY, (a['slug'], 'uses', u)
        USED_IN.setdefault(u, []).append(a['slug'])
for a in ARTICLES:
    for s in a['see']:
        assert s in BY, (a['slug'], 'see', s)

def strip(s): return re.sub(r'<[^>]+>', '', s)

# ---------- liens automatiques entre articles ----------
TERMS = []
LINK_ALIAS = {'seconde': ['seconde générale']}
for a in ARTICLES:
    if a['cat'] == 'moi' and a['slug'] not in ('siroxtag', 'pas-inoxtag'): continue
    names = LINK_ALIAS.get(a['slug']) or ([a['title']] + list(a.get('alias') or []))
    for n in set(names):
        n = n.strip()
        if len(n) < 3 or n.startswith('«'): continue
        cs = n.isupper() or n in ('Luau',)
        TERMS.append((n, a['slug'], cs))
TERMS.sort(key=lambda t: -len(t[0]))
SKIP = ('a', 'code', 'pre', 'b', 'sup')

def autolink(htm, self_slug, done):
    out, stack = [], []
    for tok in re.split(r'(<[^>]+>)', htm):
        if tok.startswith('<'):
            m = re.match(r'</?\s*([a-zA-Z0-9]+)', tok)
            if m:
                tag = m.group(1).lower()
                if tag in SKIP:
                    if tok.startswith('</'):
                        if tag in stack: stack.remove(tag)
                    elif not tok.endswith('/>'): stack.append(tag)
            out.append(tok); continue
        if stack or not tok.strip():
            out.append(tok); continue
        spans = []
        for name, slug, cs in TERMS:
            if slug == self_slug or slug in done: continue
            rx = re.compile(r'(?<![\w.-])' + re.escape(name) + r'(?![\w-])', 0 if cs else re.I)
            for m in rx.finditer(tok):
                if any(not (m.end() <= s or m.start() >= e) for s, e, _ in spans): continue
                if slug == 'code' and tok[m.end():m.end() + 6] in (' pénal', ' de tr'): continue
                spans.append((m.start(), m.end(), slug)); done.add(slug); break
        spans.sort()
        res, i = '', 0
        for s, e, slug in spans:
            res += tok[i:s] + f'<a class="wl" href="/perso/wiki/{slug}/">{tok[s:e]}</a>'; i = e
        out.append(res + tok[i:])
    return ''.join(out)

def nav(active):
    items = [('Projets', '/perso/#projets', ''), ('Fun facts', '/perso/#fun', ''), ('Jeux', '/perso/#jeux', ''), ('Musique', '/perso/#musique', ''),
             ('Wyattpédia', '/perso/wiki/', 'wiki'), ('Contact', '/perso/#contact', ''), ('Siroxtag ›', '/', '')]
    links = ''.join(f'<a href="{h}"{" data-active" if k and k == active else ""}>{t}</a>' for t, h, k in items)
    big = ''.join(f'<a href="{h}" style="--i:{i}"><span>{"<em>Wyattpédia</em>" if k == "wiki" else t}</span></a>' for i, (t, h, k) in enumerate(items))
    return f'''<header class="nav" data-nav>
  <a class="brand" href="/perso/" aria-label="Wyatt LE, accueil perso"><span class="bl">Wyatt LE</span><span class="dot" aria-hidden="true">.</span></a>
  <nav class="nlinks" aria-label="Navigation">{links}<span class="ind" aria-hidden="true"></span></nav>
  <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu"><i></i><i></i></button>
  <span class="prog" aria-hidden="true"></span>
</header>
<div class="menu" id="menu" hidden><nav aria-label="Menu">{big}</nav><p>Écris-moi : <a href="mailto:contact@siroxtag.fr">contact@siroxtag.fr</a></p></div>'''

HEAD = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
<meta name="googlebot" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#FBFBFD">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/perso/head.css">
<link rel="stylesheet" href="/perso/wiki/wiki.css">
</head>
<body>
'''
FOOT = '''<footer class="wf">
  <p><b>Wyattpédia.</b> L’encyclopédie qui ne parle que de Wyatt. Écrite par Wyatt, avec beaucoup d’humour et un peu de mauvaise foi.</p>
  <p>Wyattpédia n’a aucun lien avec Wikipédia ni avec la Wikimedia Foundation. Les articles mêlent informations générales et blagues : ce n’est pas une source de référence. Les marques citées appartiennent à leurs propriétaires, sans affiliation. <a href="/mentions-legales/#marques">Mentions légales</a> · <a href="mailto:contact@siroxtag.fr">contact@siroxtag.fr</a></p>
</footer>
<script>window.WIKI = {index};</script>
<script src="/perso/head.js" defer></script>
<script src="/perso/wiki/wiki.js" defer></script>
<script src="/assets/js/term.js" data-site="perso" defer></script>
</body>
</html>
'''
INDEX_JSON = json.dumps([{'s': a['slug'], 't': strip(a['title']), 'c': a['cat']} for a in ARTICLES], ensure_ascii=False)

def card(a, i=0, kind=''):
    plan = f'<span class="plan">{a["plan"]}</span>' if a.get('plan') else ''
    q = (strip(a["title"]) + " " + " ".join(a.get("alias") or []) + " " + strip(a["short"])).lower()
    return (f'<a class="card t-{a["tone"]}{" " + kind if kind else ""}" href="/perso/wiki/{a["slug"]}/" style="--i:{i % 12}" data-q="{html.escape(q)}">'
            f'<span class="g" aria-hidden="true">{a["glyph"]}</span>{plan}<b>{a["title"]}<span class="dt">.</span></b><span class="s">{a["short"]}</span><span class="more">Lire l’article ›</span></a>')

def chips(slugs, label):
    if not slugs: return ''
    items = ''.join(f'<a href="/perso/wiki/{s}/"><span class="cg t-{BY[s]["tone"]}" aria-hidden="true">{BY[s]["glyph"]}</span>{BY[s]["title"]}</a>' for s in slugs)
    return f'<div class="links-box r"><p class="lb">{label}</p><div class="lk-list">{items}</div></div>'

def article(a, prev, nxt):
    done = set()
    lead = autolink(a['lead'], a['slug'], done)
    sections = [(h, autolink(b, a['slug'], done)) for h, b in a['sections']]
    projs = [s for s in USED_IN.get(a['slug'], []) if BY[s]['cat'] == 'projets']
    goals = [s for s in USED_IN.get(a['slug'], []) if BY[s]['cat'] == 'veux']
    others = [s for s in USED_IN.get(a['slug'], []) if BY[s]['cat'] not in ('projets', 'veux')]
    uses = a.get('uses', [])
    toc = ''.join(f'<li><a href="#s{i+1}"><span>{i+1}</span>{h}</a></li>' for i, (h, _) in enumerate(sections))
    toc += '<li><a href="#voir"><span>→</span>Voir aussi</a></li><li><a href="#refs"><span>¹</span>Références</a></li>'
    secs = ''.join(f'<section class="r" id="s{i+1}"><h2><span class="n">{i+1}</span>{h}</h2>{b}</section>' for i, (h, b) in enumerate(sections))
    box = ''.join(f'<tr><th>{k}</th><td>{v}</td></tr>' for k, v in a['box'])
    see = ''.join(card(BY[s], i) for i, s in enumerate(a['see']))
    refs = ''.join(f'<li>{r}</li>' for r in a['refs'])
    blocks = chips(uses, 'Fabriqué avec, et lié à') if a['cat'] == 'projets' else chips(uses, 'Le chemin pour y arriver') if a['cat'] == 'veux' else ''
    blocks += chips(goals, 'Une étape vers mes plans') + chips(projs, 'Utilisé dans mes projets') + chips(others, 'Lié aussi à')
    plan = (" · " + a["plan"]) if a.get("plan") else ""
    body = f'''{nav('wiki')}
<main class="wk">
  <nav class="crumbs" aria-label="Fil d’Ariane"><a href="/perso/wiki/">Wyattpédia<span class="dt">.</span></a><span aria-hidden="true">›</span><a href="/perso/wiki/#{a["cat"]}">{CATS[a["cat"]]}</a></nav>
  <header class="ah">
    <p class="kick">Article · {CATS[a["cat"]]}{plan}</p>
    <h1 data-split>{a["title"]}<span class="dt">.</span></h1>
    <p class="from">Un article de Wyattpédia, l’encyclopédie qui ne parle que de Wyatt.</p>
  </header>
  <div class="layout">
    <aside class="toc" aria-label="Sommaire"><b>Sommaire</b><ol>{toc}</ol><span class="mk" aria-hidden="true"></span><button type="button" class="rand" data-rand>Article au hasard ↻</button></aside>
    <article class="body">
      <aside class="ibox t-{a["tone"]}"><div class="art" aria-hidden="true"><span>{a["glyph"]}</span></div><p class="it">{a["title"]}</p><table>{box}</table></aside>
      <p class="lead r">{lead}</p>
      {blocks}
      {secs}
      <section class="r" id="voir"><h2><span class="n">→</span>Voir aussi</h2><div class="cards">{see}</div></section>
      <section class="r" id="refs"><h2><span class="n">¹</span>Références</h2><ol class="refs">{refs}</ol></section>
      <p class="mod r">Dernière modification de cette page : par Wyatt, probablement vers 3 h du matin.</p>
    </article>
  </div>
  <nav class="pn" aria-label="Articles voisins">
    <a class="r" href="/perso/wiki/{prev["slug"]}/"><small>‹ Article précédent</small><b>{prev["title"]}.</b></a>
    <a class="r" href="/perso/wiki/{nxt["slug"]}/"><small>Article suivant ›</small><b>{nxt["title"]}.</b></a>
  </nav>
</main>
'''
    return HEAD.format(title=html.escape(f'{strip(a["title"])}. · Wyattpédia'), desc=html.escape(strip(a['short']))) + body + FOOT.format(index=INDEX_JSON)

def sortkey(a):
    t = strip(a['title']).strip('« »').lower()
    return t.translate(str.maketrans('éèêàçôîï', 'eeeacoii'))

GROUPS = [
    ('aime', 'Ce que j’<span class="it">aime</span>.', 'Mes passions, mes outils et mes mauvaises habitudes.', ''),
    ('moi', 'Ce qui me <span class="it">décrit</span>.', 'Une soixantaine de mots pour me résumer. Objectivité : discutable.', 'mini'),
    ('projets', 'Mes <span class="it">projets</span>.', 'Ce que j’ai construit. Chaque projet est relié aux technos qu’il utilise.', 'big'),
    ('veux', 'Ce que je veux <span class="it">faire</span>.', 'Mes plans pour plus tard. Spoiler : je compte tous les faire.', 'big'),
    ('police', 'Police et <span class="it">cyber</span>.', 'Tout ce qui touche à mes plans A et B : métiers, concours, menaces, protections.', ''),
    ('ecole', 'École et <span class="it">études</span>.', 'Du collège aux études d’informatique : le chemin vers mes plans.', ''),
    ('tech', 'Lexique <span class="it">tech</span>.', 'Tous les mots techniques, de A à Z. Expliqués simplement, avec des blagues.', 'mini'),
    ('jargon', 'Jargon de <span class="it">dev</span>.', 'Les expressions hors du commun que les développeurs utilisent entre eux.', ''),
]

def index():
    secs = ''
    for cat, h2, intro, kind in GROUPS:
        items = [a for a in ARTICLES if a['cat'] == cat]
        if cat in ('tech', 'jargon', 'moi'): items.sort(key=sortkey)
        secs += f'''  <section class="cat" id="{cat}">
    <h2 class="r">{h2}</h2>
    <p class="intro r">{len(items)} articles. {intro}</p>
    <div class="cards grid{" " + kind if kind else ""}">{''.join(card(a, i, kind) for i, a in enumerate(items))}</div>
  </section>
'''
    jump = ''.join(f'<a href="#{c}">{CATS[c]}<small>{sum(1 for a in ARTICLES if a["cat"] == c)}</small></a>' for c, *_ in GROUPS)
    facts = json.dumps([{'t': strip(a['short']), 's': a['slug'], 'n': strip(a['title'])} for a in ARTICLES], ensure_ascii=False)
    body = f'''{nav('wiki')}
<main class="wk home">
  <header class="wh">
    <p class="kick r">L’encyclopédie libre*</p>
    <h1 data-split>Wyattpédia<span class="dt">.</span></h1>
    <p class="sub r">Tout ce que j’aime, ce qui me décrit, ce que je construis, ce que je veux faire, et tous les mots bizarres du code. Expliqué comme dans une encyclopédie, mais en plus drôle.</p>
    <p class="star r">* Libre, mais c’est moi qui écris.</p>
    <div class="tools r">
      <label class="search"><span class="sr">Chercher un article</span><input type="search" placeholder="Chercher : HTML, phonk, heisenbug…" autocomplete="off" data-search></label>
      <button type="button" class="rand" data-rand>Article au hasard ↻</button>
    </div>
    <p class="count r" aria-live="polite"><span data-count>{len(ARTICLES)}</span> articles. Tous vérifiés par moi-même.</p>
    <nav class="jump r" aria-label="Catégories">{jump}</nav>
  </header>
  <section class="dyk r" aria-label="Le saviez-vous">
    <span class="lbl">Le saviez-vous ?</span>
    <a class="dyk-t" href="#" data-dyk></a>
  </section>
{secs}  <p class="none" hidden data-none>Aucun article trouvé. Celui-là, je ne l’ai pas encore écrit.</p>
</main>
<script>window.DYK = {facts};</script>
'''
    return HEAD.format(title='Wyattpédia.', desc='L’encyclopédie qui ne parle que de Wyatt.') + body + FOOT.format(index=INDEX_JSON)

out = os.path.join(ROOT, 'perso', 'wiki')
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(index())
n = len(ARTICLES)
for i, a in enumerate(ARTICLES):
    d = os.path.join(out, a['slug']); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(article(a, ARTICLES[(i - 1) % n], ARTICLES[(i + 1) % n]))
if '--nav' in sys.argv: print(nav(''))
print('wiki :', n, 'articles ·', ', '.join(f'{CATS[c]} {sum(1 for a in ARTICLES if a["cat"] == c)}' for c in CATS))
