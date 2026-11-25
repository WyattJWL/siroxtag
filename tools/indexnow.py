"""Prévient les moteurs compatibles IndexNow (Bing, Yandex, Seznam, Naver…) des pages publiques du site.
Usage : python3 tools/indexnow.py            -> envoie toutes les URL du sitemap
        python3 tools/indexnow.py URL1 URL2  -> envoie seulement ces URL
La clé est le fichier <clé>.txt à la racine du site. Les pages /perso/ ne sont jamais envoyées."""
import glob, json, os, re, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'public')
HOST = 'www.siroxtag.fr'
keys = [os.path.basename(p)[:-4] for p in glob.glob(os.path.join(SITE, '*.txt')) if re.fullmatch(r'[0-9a-f]{32}\.txt', os.path.basename(p))]
assert len(keys) == 1, 'il faut exactement un fichier de clé IndexNow à la racine'
key = keys[0]
urls = sys.argv[1:] or re.findall(r'<loc>(https://www\.siroxtag\.fr/[^<]*)</loc>', open(os.path.join(SITE, 'sitemap.xml'), encoding='utf-8').read())
urls = [u for u in dict.fromkeys(urls) if u.startswith('https://' + HOST + '/') and '/perso' not in u]
body = json.dumps({'host': HOST, 'key': key, 'keyLocation': f'https://{HOST}/{key}.txt', 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/IndexNow', data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
try:
    with urllib.request.urlopen(req, timeout=30) as r: print('IndexNow :', r.status, '-', len(urls), 'URL envoyées')
except urllib.error.HTTPError as e:
    print('IndexNow : erreur', e.code, e.read()[:300]); sys.exit(1)
