"""Génère Wyattpédia (/perso/wiki/) à partir de tools/wiki_content.py.
Usage : python3 tools/build_wiki.py   (depuis la racine du dépôt)"""
import os, re, html, json, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wiki_content import ARTICLES

CATS = {'aime': 'Ce que j’aime', 'veux': 'Ce que je veux faire'}
BY = {a['slug']: a for a in ARTICLES}

def strip(s): return re.sub(r'<[^>]+>', '', s)

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
  <p>Wyattpédia n’a aucun lien avec Wikipédia ni avec la Wikimedia Foundation. Les marques citées appartiennent à leurs propriétaires, sans affiliation. <a href="/mentions-legales/#marques">Mentions légales</a> · <a href="mailto:contact@siroxtag.fr">contact@siroxtag.fr</a></p>
</footer>
<script>window.WIKI = {index};</script>
<script src="/perso/head.js" defer></script>
<script src="/perso/wiki/wiki.js" defer></script>
<script src="/assets/js/term.js" data-site="perso" defer></script>
</body>
</html>
'''
INDEX_JSON = json.dumps([{'s': a['slug'], 't': a['title'], 'c': a['cat']} for a in ARTICLES], ensure_ascii=False)

def card(a, i=0, big=False):
    plan = f'<span class="plan">{a["plan"]}</span>' if a.get('plan') else ''
    return (f'<a class="card t-{a["tone"]}{" big" if big else ""}" href="/perso/wiki/{a["slug"]}/" style="--i:{i}" data-q="{html.escape((a["title"] + " " + strip(a["short"])).lower())}">'
            f'<span class="g" aria-hidden="true">{a["glyph"]}</span>{plan}<b>{a["title"]}<span class="dt">.</span></b><span class="s">{a["short"]}</span><span class="more">Lire l’article ›</span></a>')

def article(a, prev, nxt):
    toc = ''.join(f'<li><a href="#s{i+1}"><span>{i+1}</span>{h}</a></li>' for i, (h, _) in enumerate(a['sections']))
    toc += '<li><a href="#voir"><span>→</span>Voir aussi</a></li><li><a href="#refs"><span>¹</span>Références</a></li>'
    secs = ''.join(f'<section class="r" id="s{i+1}"><h2><span class="n">{i+1}</span>{h}</h2>{b}</section>' for i, (h, b) in enumerate(a['sections']))
    box = ''.join(f'<tr><th>{k}</th><td>{v}</td></tr>' for k, v in a['box'])
    see = ''.join(card(BY[s], i) for i, s in enumerate(a['see']))
    refs = ''.join(f'<li>{r}</li>' for r in a['refs'])
    title = f'{a["title"]}. · Wyattpédia'
    body = f'''{nav('wiki')}
<main class="wk">
  <nav class="crumbs" aria-label="Fil d’Ariane"><a href="/perso/wiki/">Wyattpédia<span class="dt">.</span></a><span aria-hidden="true">›</span><a href="/perso/wiki/#{a["cat"]}">{CATS[a["cat"]]}</a></nav>
  <header class="ah">
    <p class="kick">Article · {CATS[a["cat"]]}{(" · " + a["plan"]) if a.get("plan") else ""}</p>
    <h1 data-split>{a["title"]}<span class="dt">.</span></h1>
    <p class="from">Un article de Wyattpédia, l’encyclopédie qui ne parle que de Wyatt.</p>
  </header>
  <div class="layout">
    <aside class="toc" aria-label="Sommaire"><b>Sommaire</b><ol>{toc}</ol><span class="mk" aria-hidden="true"></span><button type="button" class="rand" data-rand>Article au hasard ↻</button></aside>
    <article class="body">
      <aside class="ibox t-{a["tone"]}"><div class="art" aria-hidden="true"><span>{a["glyph"]}</span></div><p class="it">{a["title"]}</p><table>{box}</table></aside>
      <p class="lead r">{a["lead"]}</p>
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
    return HEAD.format(title=html.escape(title), desc=html.escape(strip(a['short']))) + body + FOOT.format(index=INDEX_JSON)

def index():
    aime = [a for a in ARTICLES if a['cat'] == 'aime']; veux = [a for a in ARTICLES if a['cat'] == 'veux']
    facts = json.dumps([{'t': strip(a['short']), 's': a['slug'], 'n': a['title']} for a in ARTICLES], ensure_ascii=False)
    body = f'''{nav('wiki')}
<main class="wk home">
  <header class="wh">
    <p class="kick r">L’encyclopédie libre*</p>
    <h1 data-split>Wyattpédia<span class="dt">.</span></h1>
    <p class="sub r">Tout ce que j’aime, et tout ce que je veux faire. Expliqué comme dans une encyclopédie, mais en plus drôle.</p>
    <p class="star r">* Libre, mais c’est moi qui écris.</p>
    <div class="tools r">
      <label class="search"><span class="sr">Chercher un article</span><input type="search" placeholder="Chercher un article…" autocomplete="off" data-search></label>
      <button type="button" class="rand" data-rand>Article au hasard ↻</button>
    </div>
    <p class="count r" aria-live="polite"><span data-count>{len(ARTICLES)}</span> articles. Tous vérifiés par moi-même.</p>
  </header>
  <section class="dyk r" aria-label="Le saviez-vous">
    <span class="lbl">Le saviez-vous ?</span>
    <a class="dyk-t" href="#" data-dyk></a>
  </section>
  <section class="cat" id="aime">
    <h2 class="r">Ce que j’<span class="it">aime</span>.</h2>
    <p class="intro r">{len(aime)} articles sur mes passions, mes outils et mes mauvaises habitudes.</p>
    <div class="cards grid">{''.join(card(a, i) for i, a in enumerate(aime))}</div>
  </section>
  <section class="cat" id="veux">
    <h2 class="r">Ce que je veux <span class="it">faire</span>.</h2>
    <p class="intro r">Mes plans pour plus tard. Spoiler : je compte tous les faire.</p>
    <div class="cards grid big">{''.join(card(a, i, True) for i, a in enumerate(veux))}</div>
  </section>
  <p class="none" hidden data-none>Aucun article trouvé. Celui-là, je ne l’ai pas encore écrit.</p>
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
print('wiki :', n, 'articles')
