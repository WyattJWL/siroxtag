"""Génère les deux encyclopédies :
  - Wyattpédia (/perso/wiki/) : tout, non référencée ;
  - Siroxtagpédia (/wiki/) : uniquement les articles publics, sans rien de personnel, référencée.
Usage : python3 tools/build_wiki.py   (depuis la racine du dépôt)"""
import os, re, html, json, sys, copy
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wiki_content import ARTICLES as BASE
from wiki_more import MORE
from wiki_ext import EXT
from wiki_ext2 import EXT2
from wiki_filieres import FILIERES
from wiki_moi import MOI
try:
    from wiki_vague2 import VAGUE2
except ImportError:
    VAGUE2 = []

ARTICLES = BASE + MORE + FILIERES + MOI + VAGUE2
CATS = {'aime': 'Ce que j’aime', 'moi': 'Ce qui me décrit', 'projets': 'Mes projets', 'veux': 'Ce que je veux faire',
        'createurs': 'Les créateurs du code', 'artistes': 'Artistes et musique', 'jeux': 'Jeux vidéo',
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
EXTRA = {'siroxtag-fr': ['tiktok', 'sites-saas', 'terminal-cache'], 'page-perso': ['sites-saas', 'phonk', 'gta-vi', 'claude-maxxing', 'wyattpedia', 'terminal-cache'],
         'bot-impots': ['bots-discord', 'discord', 'gta-rp'], 'linear': ['gta-rp'], 'blackout': ['siroxtag-fr'], 'wyattpedia': ['claude-maxxing']}
for p, xs in EXTRA.items():
    BY[p]['uses'] = BY[p].get('uses', []) + [x for x in xs if x not in BY[p].get('uses', [])]
for a in ARTICLES:
    for s in a['see'] + a.get('uses', []):
        assert s in BY, (a['slug'], s)

def strip(s): return re.sub(r'<[^>]+>', '', s)

# ---------------------------------------------------------------------------
# Siroxtagpédia : sélection publique + nettoyage de tout ce qui est personnel
# ---------------------------------------------------------------------------
SX_EXCLUDE_CATS = {'veux', 'ecole'}
SX_MOI_OK = {'siroxtag', 'pas-inoxtag', 'createur-de-contenu', 'imitateur', 'createur-de-jeux', 'gamer', 'fan-de-gta', 'roliste',
             'chef-entreprise-fictive', 'independant', 'fait-main', 'chasseur-de-secrets', 'fan-de-terminal', 'drole', 'autoderision', 'amoureux-du-mouvement', 'noir-et-blanc'}
SX_EXCLUDE = {'page-perso', 'nuit-blanche', 'gardien-de-la-paix', 'policier-adjoint', 'cadets-republique', 'gendarmerie', 'ecole-de-police',
              'concours', 'police-scientifique', 'deontologie', 'portfolio', 'full-stack', 'bot-impots', 'hacking-ethique', 'claude-maxxing'}
FORBID = ['page perso', '/perso', 'plan a', 'plan b', 'plan c', 'plans a', 'trois plans', 'en 6e', 'la 6e', '6e,', 'maman', 'ezechielw13',
          'policier', 'cyberpolice', 'filière générale', 'lycée', 'collège', 'sommeil: null', 'yeswehack', '2 failles', 'deux failles',
          'wyatt le', 'nuit blanche', 'nuits blanches', '4 jours', 'quatre jours', 'futur', 'quand je serai grand', 'portfolio', 'bot des impôts',
          'claude maxxing', 'cette page perso', 'je t’aime']
SX_CAT = {'aime': 'univers', 'moi': 'univers', 'projets': 'univers', 'police': 'securite'}
SX_CATS = {'univers': 'L’univers Siroxtag', 'jeux': 'Jeux vidéo', 'artistes': 'Artistes et musique', 'createurs': 'Les créateurs du code',
           'tech': 'Lexique tech', 'jargon': 'Jargon de dev', 'securite': 'Sécurité en ligne'}

def sx_keep(a):
    if a['cat'] in SX_EXCLUDE_CATS or a['slug'] in SX_EXCLUDE: return False
    if a['cat'] == 'moi' and a['slug'] not in SX_MOI_OK: return False
    return not a.get('private')

def bad(txt): t = strip(txt).lower(); return any(w in t for w in FORBID)

def sx_text(t):
    t = t.replace('Wyattpédia', 'Siroxtagpédia').replace('Wyatt LE', 'Siroxtag').replace('Wyatt', 'Siroxtag')
    return t.replace('/perso/wiki/', '/wiki/')

def sx_clean_html(h, keep):
    keep = set(keep) | {'siroxtagpedia'}
    # retire les paragraphes / éléments de liste qui parlent de choses personnelles, et les liens vers des articles absents
    h = sx_text(h)
    def drop(m): return '' if bad(m.group(0)) else m.group(0)
    h = re.sub(r'<p>.*?</p>', drop, h, flags=re.S)
    h = re.sub(r'<li>.*?</li>', drop, h, flags=re.S)
    h = re.sub(r'<pre[^>]*>.*?</pre>', drop, h, flags=re.S)
    h = re.sub(r'<a [^>]*href="/wiki/([^/"]+)/"[^>]*>(.*?)</a>', lambda m: m.group(0) if m.group(1) in keep else m.group(2), h, flags=re.S)
    h = re.sub(r'<(ul|ol)>\s*</\1>', '', h)
    return h

def sx_articles():
    keep = {a['slug'] for a in ARTICLES if sx_keep(a)}
    res = []
    for a in ARTICLES:
        if a['slug'] not in keep: continue
        b = copy.deepcopy(a)
        b['cat'] = SX_CAT.get(a['cat'], a['cat'])
        b['title'] = sx_text(b['title']); b['short'] = sx_text(b['short'])
        if bad(b['short']): b['short'] = b['title'] + '.'
        b['lead'] = sx_text(b['lead'])
        if bad(b['lead']): b['lead'] = f'<b>{b["title"]}</b> : {strip(b["short"])}'
        secs = []
        for hd, body in b['sections']:
            hd = sx_text(hd); body = sx_clean_html(body, keep)
            if bad(hd) or not strip(body).strip(): continue
            secs.append((hd, body))
        b['sections'] = secs
        b['box'] = [(k, sx_text(v)) for k, v in b['box'] if not bad(v) and not bad(k)]
        b['refs'] = [sx_text(r) for r in b['refs'] if not bad(r) and 'github' not in r.lower()] or ['Siroxtagpédia, 2026.']
        b['see'] = [s for s in b['see'] if s in keep]
        b['uses'] = [s for s in b.get('uses', []) if s in keep]
        b['alias'] = [x for x in (b.get('alias') or []) if not bad(x)]
        b.pop('plan', None)
        res.append(b)
    ren = {'wyattpedia': 'siroxtagpedia'}
    for b in res:
        b['slug'] = ren.get(b['slug'], b['slug'])
        if b['slug'] == 'siroxtagpedia': b['glyph'] = 'S?'
        b['see'] = [ren.get(x, x) for x in b['see']]; b['uses'] = [ren.get(x, x) for x in b['uses']]
        b['sections'] = [(h, body.replace('/wiki/wyattpedia/', '/wiki/siroxtagpedia/')) for h, body in b['sections']]
    return res

# ---------------------------------------------------------------------------
# rendu
# ---------------------------------------------------------------------------
SKIP = ('a', 'code', 'pre', 'b', 'sup')
LINK_ALIAS = {'seconde': ['seconde générale']}

def make_terms(arts):
    terms = []
    for a in arts:
        if a['cat'] == 'moi' and a['slug'] not in ('siroxtag', 'pas-inoxtag'): continue
        if a.get('nolink'): continue
        names = LINK_ALIAS.get(a['slug']) or ([a['title']] + list(a.get('alias') or []))
        for n in set(names):
            n = n.strip()
            if len(n) < 3 or n.startswith('«'): continue
            terms.append((n, a['slug'], n.isupper() or n in ('Luau',)))
    terms.sort(key=lambda t: -len(t[0]))
    return terms

def autolink(htm, self_slug, done, terms, base):
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
        for name, slug, cs in terms:
            if slug == self_slug or slug in done: continue
            rx = re.compile(r'(?<![\w.-])' + re.escape(name) + r'(?![\w-])', 0 if cs else re.I)
            for m in rx.finditer(tok):
                if any(not (m.end() <= s or m.start() >= e) for s, e, _ in spans): continue
                if slug == 'code' and tok[m.end():m.end() + 6] in (' pénal', ' de tr', ' Konam'): continue
                spans.append((m.start(), m.end(), slug)); done.add(slug); break
        spans.sort()
        res, i = '', 0
        for s, e, slug in spans:
            res += tok[i:s] + f'<a class="wl" href="{base}{slug}/">{tok[s:e]}</a>'; i = e
        out.append(res + tok[i:])
    return ''.join(out)

FUN_DEFAULT = '<script>try{if(localStorage.getItem("sx-serious")!=="1")document.documentElement.classList.add("fun")}catch(e){document.documentElement.classList.add("fun")}</script>\n'

PERSO = dict(
    key='perso', base='/perso/wiki/', name='Wyattpédia', brand='Wyatt LE', home='/perso/', site='perso',
    robots='noindex, nofollow, noarchive, nosnippet, noimageindex', extra_head=FUN_DEFAULT + '<meta name="googlebot" content="noindex, nofollow">\n<meta name="referrer" content="no-referrer">\n',
    nav=[('Projets', '/perso/#projets', ''), ('Fun facts', '/perso/#fun', ''), ('Jeux', '/perso/#jeux', ''), ('Musique', '/perso/#musique', ''),
         ('Wyattpédia', '/perso/wiki/', 'wiki'), ('Contact', '/perso/#contact', ''), ('Siroxtag ›', '/', '')],
    tagline='l’encyclopédie qui ne parle que de Wyatt', sub='Tout ce que j’aime, ce qui me décrit, ce que je construis, ce que je veux faire, et tous les mots bizarres du code. Expliqué comme dans une encyclopédie, mais en plus drôle.',
    cats=CATS, out='perso/wiki', sitemap=False)
SX = dict(
    key='sx', base='/wiki/', name='Siroxtagpédia', brand='Siroxtag', home='/', site='siroxtag',
    robots='index, follow, max-image-preview:large', extra_head='',
    nav=[('Vidéos', '/#videos', ''), ('Projets', '/#projets', ''), ('Linear', '/Linear/', ''), ('Siroxtagpédia', '/wiki/', 'wiki'), ('Contact', '/#contact', '')],
    tagline='l’encyclopédie de l’univers Siroxtag', sub='Les jeux, la musique, les créateurs du code, tous les mots du développement et de la sécurité en ligne. Expliqués simplement, avec de l’humour.',
    cats=SX_CATS, out='wiki', sitemap=True)

GROUPS = {
    'perso': [('aime', 'Ce que j’<span class="it">aime</span>.', 'Mes passions, mes outils et mes mauvaises habitudes.', ''),
              ('moi', 'Ce qui me <span class="it">décrit</span>.', 'Une soixantaine de mots pour me résumer. Objectivité : discutable.', 'mini'),
              ('projets', 'Mes <span class="it">projets</span>.', 'Ce que j’ai construit. Chaque projet est relié aux technos qu’il utilise.', 'big'),
              ('veux', 'Ce que je veux <span class="it">faire</span>.', 'Mes plans pour plus tard. Spoiler : je compte tous les faire.', 'big'),
              ('jeux', 'Jeux <span class="it">vidéo</span>.', 'Les jeux, les studios et les notions qui comptent.', 'mini'),
              ('artistes', 'Artistes et <span class="it">musique</span>.', 'Ce qui passe dans mes oreilles.', ''),
              ('createurs', 'Les créateurs du <span class="it">code</span>.', 'Les personnes qui ont inventé ce que j’utilise tous les jours.', 'mini'),
              ('police', 'Police et <span class="it">cyber</span>.', 'Tout ce qui touche à mes plans A et B : métiers, concours, menaces, protections.', 'mini'),
              ('ecole', 'École et <span class="it">études</span>.', 'Du collège aux études d’informatique : le chemin vers mes plans.', ''),
              ('tech', 'Lexique <span class="it">tech</span>.', 'Tous les mots techniques, de A à Z. Expliqués simplement, avec des blagues.', 'mini'),
              ('jargon', 'Jargon de <span class="it">dev</span>.', 'Les expressions hors du commun que les développeurs utilisent entre eux.', 'mini')],
    'sx': [('univers', 'L’univers <span class="it">Siroxtag</span>.', 'Les vidéos, les projets, le personnage. Tout ce qui fait Siroxtag.', ''),
           ('jeux', 'Jeux <span class="it">vidéo</span>.', 'Les jeux, les studios et les notions qui comptent.', 'mini'),
           ('artistes', 'Artistes et <span class="it">musique</span>.', 'Les sons qui tournent en boucle.', ''),
           ('createurs', 'Les créateurs du <span class="it">code</span>.', 'Les personnes qui ont inventé l’informatique moderne.', 'mini'),
           ('tech', 'Lexique <span class="it">tech</span>.', 'Tous les mots techniques, de A à Z.', 'mini'),
           ('jargon', 'Jargon de <span class="it">dev</span>.', 'Les expressions hors du commun des développeurs.', 'mini'),
           ('securite', 'Sécurité <span class="it">en ligne</span>.', 'Se protéger, repérer les arnaques, savoir qui appeler.', 'mini')],
}
SORTED = {'tech', 'jargon', 'moi', 'createurs', 'artistes', 'jeux', 'police', 'securite'}

def sortkey(a):
    t = strip(a['title']).strip('« »').lower()
    return t.translate(str.maketrans('éèêàçôîïâû', 'eeeacoiiau'))

def build(cfg, arts):
    by = {a['slug']: a for a in arts}
    used = {}
    for a in arts:
        for u in a.get('uses', []): used.setdefault(u, []).append(a['slug'])
    terms = make_terms(arts)
    base, name, cats = cfg['base'], cfg['name'], cfg['cats']
    def nav():
        links = ''.join(f'<a href="{h}"{" data-active" if k == "wiki" else ""}>{t}</a>' for t, h, k in cfg['nav'])
        big = ''.join(f'<a href="{h}" style="--i:{i}"><span>{"<em>" + t + "</em>" if k == "wiki" else t}</span></a>' for i, (t, h, k) in enumerate(cfg['nav']))
        return f'''<header class="nav" data-nav>
  <a class="brand" href="{cfg["home"]}" aria-label="{cfg["brand"]}, accueil"><span class="bl">{cfg["brand"]}</span><span class="dot" aria-hidden="true">.</span></a>
  <nav class="nlinks" aria-label="Navigation">{links}<span class="ind" aria-hidden="true"></span></nav>
  <button class="burger" type="button" aria-expanded="false" aria-controls="menu" aria-label="Ouvrir le menu"><i></i><i></i></button>
  <span class="prog" aria-hidden="true"></span>
</header>
<div class="menu" id="menu" hidden><nav aria-label="Menu">{big}</nav><p>Écris-moi : <a href="mailto:contact@siroxtag.fr">contact@siroxtag.fr</a></p></div>'''
    index_json = json.dumps([{'s': a['slug'], 't': strip(a['title']), 'c': a['cat']} for a in arts], ensure_ascii=False)
    def head(title, desc, path):
        canon = (f'<link rel="canonical" href="https://www.siroxtag.fr{path}">\n<meta property="og:title" content="{html.escape(title)}">\n'
                 f'<meta property="og:description" content="{html.escape(desc)}">\n<meta property="og:type" content="article">\n<meta property="og:locale" content="fr_FR">\n') if cfg['sitemap'] else ''
        return f'''<!doctype html>
<html lang="fr" class="wiki-{cfg["key"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<meta name="robots" content="{cfg["robots"]}">
{cfg["extra_head"]}{canon}<meta name="theme-color" content="#FBFBFD">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/wiki/head.css">
<link rel="stylesheet" href="/assets/wiki/wiki.css">
</head>
<body>
'''
    foot = f'''<footer class="wf">
  <p><b>{name}.</b> {cfg["tagline"][0].upper() + cfg["tagline"][1:]}. Écrite avec beaucoup d’humour et un peu de mauvaise foi.</p>
  <p>{name} n’a aucun lien avec Wikipédia ni avec la Wikimedia Foundation. Les articles mêlent informations générales et blagues : ce n’est pas une source de référence. Les marques et les noms cités appartiennent à leurs propriétaires, sans affiliation. <a href="/mentions-legales/#marques">Mentions légales</a> · <a href="mailto:contact@siroxtag.fr">contact@siroxtag.fr</a></p>
</footer>
<script>window.WIKI = {index_json}; window.WIKI_BASE = "{base}";</script>
<script src="/assets/wiki/head.js" defer></script>
<script src="/assets/wiki/wiki.js" defer></script>
<script src="/assets/js/term.js" data-site="{cfg["site"]}" defer></script>
</body>
</html>
'''
    def card(a, i=0, kind=''):
        plan = f'<span class="plan">{a["plan"]}</span>' if a.get('plan') else ''
        q = (strip(a["title"]) + " " + " ".join(a.get("alias") or []) + " " + strip(a["short"])).lower()
        return (f'<a class="card t-{a["tone"]}{" " + kind if kind else ""}" href="{base}{a["slug"]}/" style="--i:{i % 12}" data-q="{html.escape(q)}">'
                f'<span class="g" aria-hidden="true">{a["glyph"]}</span>{plan}<b>{a["title"]}<span class="dt">.</span></b><span class="s">{a["short"]}</span><span class="more">Lire l’article ›</span></a>')
    def chips(slugs, label):
        slugs = [s for s in slugs if s in by]
        if not slugs: return ''
        items = ''.join(f'<a href="{base}{s}/"><span class="cg t-{by[s]["tone"]}" aria-hidden="true">{by[s]["glyph"]}</span>{by[s]["title"]}</a>' for s in slugs)
        return f'<div class="links-box r"><p class="lb">{label}</p><div class="lk-list">{items}</div></div>'
    def article(a, prev, nxt):
        done = set()
        lead = autolink(a['lead'], a['slug'], done, terms, base)
        sections = [(h, autolink(b, a['slug'], done, terms, base)) for h, b in a['sections']]
        u = used.get(a['slug'], [])
        projs = [s for s in u if by[s]['cat'] in ('projets', 'univers')]
        goals = [s for s in u if by[s]['cat'] == 'veux']
        others = [s for s in u if s not in projs and s not in goals]
        toc = ''.join(f'<li><a href="#s{i+1}"><span>{i+1}</span>{h}</a></li>' for i, (h, _) in enumerate(sections))
        toc += '<li><a href="#voir"><span>→</span>Voir aussi</a></li><li><a href="#refs"><span>¹</span>Références</a></li>'
        secs = ''.join(f'<section class="r" id="s{i+1}"><h2><span class="n">{i+1}</span>{h}</h2>{b}</section>' for i, (h, b) in enumerate(sections))
        box = ''.join(f'<tr><th>{k}</th><td>{v}</td></tr>' for k, v in a['box'])
        see_l = [s for s in a['see'] if s in by]
        if len(see_l) < 2:
            see_l += [x['slug'] for x in arts if x['cat'] == a['cat'] and x['slug'] != a['slug'] and x['slug'] not in see_l][:3 - len(see_l)]
        see = ''.join(card(by[s], i) for i, s in enumerate(see_l))
        refs = ''.join(f'<li>{r}</li>' for r in a['refs'])
        uses = a.get('uses', [])
        blocks = ''
        if a['cat'] in ('projets', 'univers') and uses: blocks += chips(uses, 'Fabriqué avec, et lié à')
        elif a['cat'] == 'veux': blocks += chips(uses, 'Le chemin pour y arriver')
        blocks += chips(goals, 'Une étape vers mes plans') + chips(projs, 'Utilisé dans mes projets' if cfg['key'] == 'perso' else 'Utilisé dans les projets') + chips(others, 'Lié aussi à')
        plan = (" · " + a["plan"]) if a.get("plan") else ""
        body = f'''{nav()}
<main class="wk">
  <nav class="crumbs" aria-label="Fil d’Ariane"><a href="{base}">{name}<span class="dt">.</span></a><span aria-hidden="true">›</span><a href="{base}#{a["cat"]}">{cats[a["cat"]]}</a></nav>
  <header class="ah">
    <p class="kick">Article · {cats[a["cat"]]}{plan}</p>
    <h1 data-split>{a["title"]}<span class="dt">.</span></h1>
    <p class="from">Un article de {name}, {cfg["tagline"]}.</p>
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
      <p class="mod r">Dernière modification de cette page : probablement vers 3 h du matin.</p>
    </article>
  </div>
  <nav class="pn" aria-label="Articles voisins">
    <a class="r" href="{base}{prev["slug"]}/"><small>‹ Article précédent</small><b>{prev["title"]}.</b></a>
    <a class="r" href="{base}{nxt["slug"]}/"><small>Article suivant ›</small><b>{nxt["title"]}.</b></a>
  </nav>
</main>
'''
        return head(f'{strip(a["title"])}. · {name}', strip(a['short']), f'{base}{a["slug"]}/') + body + foot
    def index():
        secs = ''
        for cat, h2, intro, kind in GROUPS[cfg['key']]:
            items = [a for a in arts if a['cat'] == cat]
            if not items: continue
            if cat in SORTED: items.sort(key=sortkey)
            secs += f'''  <section class="cat" id="{cat}">
    <h2 class="r">{h2}</h2>
    <p class="intro r">{len(items)} articles. {intro}</p>
    <div class="cards grid{" " + kind if kind else ""}">{''.join(card(a, i, kind) for i, a in enumerate(items))}</div>
  </section>
'''
        jump = ''.join(f'<a href="#{c}">{cats[c]}<small>{sum(1 for a in arts if a["cat"] == c)}</small></a>' for c, *_ in GROUPS[cfg['key']] if any(a['cat'] == c for a in arts))
        facts = json.dumps([{'t': strip(a['short']), 's': a['slug'], 'n': strip(a['title'])} for a in arts], ensure_ascii=False)
        body = f'''{nav()}
<main class="wk home">
  <header class="wh">
    <p class="kick r">L’encyclopédie libre*</p>
    <h1 data-split>{name}<span class="dt">.</span></h1>
    <p class="sub r">{cfg["sub"]}</p>
    <p class="star r">* Libre, mais c’est {"moi qui écris" if cfg["key"] == "perso" else "Siroxtag qui écrit"}.</p>
    <div class="tools r">
      <label class="search"><span class="sr">Chercher un article</span><input type="search" placeholder="Chercher : HTML, phonk, heisenbug…" autocomplete="off" data-search></label>
      <button type="button" class="rand" data-rand>Article au hasard ↻</button>
    </div>
    <p class="count r" aria-live="polite"><span data-count>{len(arts)}</span> articles. Tous vérifiés{" par moi-même" if cfg["key"] == "perso" else ""}.</p>
    <nav class="jump r" aria-label="Catégories">{jump}</nav>
  </header>
  <section class="dyk r" aria-label="Le saviez-vous">
    <span class="lbl">Le saviez-vous ?</span>
    <a class="dyk-t" href="#" data-dyk></a>
  </section>
{secs}  <p class="none" hidden data-none>Aucun article trouvé. Celui-là n’est pas encore écrit.</p>
</main>
<script>window.DYK = {facts};</script>
'''
        return head(f'{name}.', f'{name} : {cfg["tagline"]}. {len(arts)} articles sur les jeux, le code, la musique et la sécurité en ligne.', base) + body + foot
    out = os.path.join(ROOT, cfg['out'])
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(index())
    n = len(arts)
    for i, a in enumerate(arts):
        d = os.path.join(out, a['slug']); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(article(a, arts[(i - 1) % n], arts[(i + 1) % n]))
    return arts

perso_arts = build(PERSO, ARTICLES)
sx = sx_articles()
build(SX, sx)

# garde-fou : rien de personnel ne doit apparaître dans Siroxtagpédia
leaks = []
for a in sx:
    t = open(os.path.join(ROOT, 'wiki', a['slug'], 'index.html'), encoding='utf-8').read()
    low = strip(t.split('<main', 1)[1].split('</main>', 1)[0]).lower()
    for w in ['wyatt', 'perso', 'maman', 'ezechielw13', 'policier', 'yeswehack', 'lycée', 'collège', '6e']:
        if re.search(r'(?<!\w)' + re.escape(w) + r'(?!\w)', low): leaks.append((a['slug'], w))
idx = open(os.path.join(ROOT, 'wiki', 'index.html'), encoding='utf-8').read().lower()
for w in ['wyatt', '/perso', 'ezechielw13']:
    if w in idx: leaks.append(('index', w))
assert not leaks, ('fuites dans Siroxtagpédia', leaks[:30])

# plan du site : ajoute Siroxtagpédia
sm = os.path.join(ROOT, 'sitemap.xml'); s = open(sm, encoding='utf-8').read()
s = re.sub(r'\s*<url><loc>https://www\.siroxtag\.fr/wiki/[^<]*</loc>.*?</url>', '', s, flags=re.S)
urls = ''.join(f'\n  <url><loc>https://www.siroxtag.fr/wiki/{x}</loc><changefreq>monthly</changefreq><priority>{p}</priority></url>' for x, p in [('', '0.7')] + [(a['slug'] + '/', '0.5') for a in sx])
s = s.replace('</urlset>', urls + '\n</urlset>')
open(sm, 'w', encoding='utf-8').write(s)
print('Wyattpédia :', len(perso_arts), 'articles ·', ', '.join(f'{CATS[c]} {sum(1 for a in perso_arts if a["cat"] == c)}' for c in CATS if any(a['cat'] == c for a in perso_arts)))
print('Siroxtagpédia :', len(sx), 'articles ·', ', '.join(f'{SX_CATS[c]} {sum(1 for a in sx if a["cat"] == c)}' for c in SX_CATS if any(a['cat'] == c for a in sx)))
