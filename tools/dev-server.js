// Serveur local qui imite Vercel : fichiers de public/ + fonctions de api/. Usage : node tools/dev-server.js [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PUB = path.join(ROOT, 'public');
const PORT = +process.argv[2] || 8790;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.jpg': 'image/jpeg' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const file = path.join(ROOT, url.pathname.replace(/\/$/, '') + '.js');
    if (!file.startsWith(path.join(ROOT, 'api')) || !fs.existsSync(file) || path.basename(file).startsWith('_')) { res.statusCode = 404; return res.end('{}'); }
    const mod = await import(pathToFileURL(file).href);
    return mod.default(req, res);
  }
  let p = path.join(PUB, decodeURIComponent(url.pathname));
  if (!p.startsWith(PUB)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.statusCode = 404; p = path.join(PUB, '404.html'); }
  res.setHeader('Content-Type', TYPES[path.extname(p)] || 'application/octet-stream');
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log('http://localhost:' + PORT));
