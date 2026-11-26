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
| `TIKTOK_CLIENT_KEY` | `aw…` | Application TikTok for Developers (Login Kit + Display API) |
| `TIKTOK_CLIENT_SECRET` | *(secret)* | Application TikTok, à ne jamais publier |
| `TOKEN_KEY` | *(secret)* | Chiffre les jetons TikTok en base. Ne pas changer, sinon il faut relier TikTok à nouveau |
| `AI_API_KEY` | *(secret)* | Clé du fournisseur d’IA (Groq par défaut) |
| `AI_BASE_URL` | `https://api.groq.com/openai/v1` | Fournisseur d’IA au format chat/completions (Groq, OpenRouter, Mistral…) |
| `AI_MODEL` | *(facultatif)* | Impose un modèle précis |
| `CRON_SECRET` | *(secret)* | Protège la mise à jour quotidienne TikTok (Vercel Cron, voir `vercel.json`) |

Redirection TikTok à déclarer : `https://www.siroxtag.fr/api/auth/tiktok`. Autorisations : `user.info.basic`, `user.info.profile` (badge certifié), `user.info.stats`, `video.list`.

Compte officiel (couronne) : `update users set role = 'owner' where lower(pseudo) = 'siroxtag';` dans la console SQL de Neon.

Adresse de redirection à déclarer dans l’application Discord : `https://www.siroxtag.fr/api/auth/discord`.

## En local
```
npm install
DATABASE_URL=postgresql://… ALLOWED_ORIGINS=http://localhost:8790 SITE_URL=http://localhost:8790 COOKIE_INSECURE=1 node tools/dev-server.js 8790
```
