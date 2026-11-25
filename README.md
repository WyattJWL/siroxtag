# siroxtag.fr

Site statique (dossier `public/`) + fonctions serverless (dossier `api/`) pour les espaces membres, hébergés sur Vercel, avec une base PostgreSQL.

## Dossiers
- `public/` : tout ce qui est publié (pages, styles, scripts, encyclopédies générées).
- `api/` : fonctions serverless (comptes, Discord, idées, scores). `api/_lib/` = outils communs.
- `db/schema.sql` : structure de la base, à exécuter une fois.
- `tools/` : générateurs (jamais publiés). `python3 tools/build_wiki.py` et `python3 tools/build_term.py`.

## Variables d’environnement (réglages Vercel)
| Nom | Exemple | Rôle |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql://…` | Base PostgreSQL (Neon via le Marketplace Vercel) |
| `SITE_URL` | `https://www.siroxtag.fr` | Adresse du site (redirection Discord, cookies) |
| `ALLOWED_ORIGINS` | `https://www.siroxtag.fr` | Origines autorisées à appeler l’API (séparées par des virgules) |
| `DISCORD_CLIENT_ID` | `123…` | Application Discord |
| `DISCORD_CLIENT_SECRET` | *(secret)* | Application Discord, à ne jamais publier |

Adresse de redirection à déclarer dans l’application Discord : `https://www.siroxtag.fr/api/auth/discord`.

## En local
```
npm install
DATABASE_URL=postgresql://… ALLOWED_ORIGINS=http://localhost:8790 SITE_URL=http://localhost:8790 COOKIE_INSECURE=1 node tools/dev-server.js 8790
```
