#!/usr/bin/env node
// Gera o PDF do manual da marca a partir da própria página /brand/ (cada .folha vira uma página A4 deitada).
//   node tools/build.mjs && node tools/manual.mjs
// Sobe um servidor local só enquanto o Chrome imprime (a página usa caminhos absolutos: /assets/...).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { PDF_MANUAL } from './tpl/marca.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean).find(c => existsSync(c));
if (!CHROME) { console.error('Chrome não encontrado. Defina CHROME=/caminho/do/chrome'); process.exit(1); }

const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const servidor = createServer(async (req, res) => {
  let arquivo = join(RAIZ, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try {
    if ((await stat(arquivo)).isDirectory()) arquivo = join(arquivo, 'index.html');
    res.writeHead(200, { 'content-type': TIPOS[extname(arquivo).toLowerCase()] || 'application/octet-stream' });
    res.end(await readFile(arquivo));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise(ok => servidor.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${servidor.address().port}/brand/`;
const destino = join(RAIZ, PDF_MANUAL);

await new Promise((ok, erro) => execFile(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-pdf-header-footer', '--print-to-pdf-no-header',
  '--virtual-time-budget=10000', '--run-all-compositor-stages-before-draw', `--print-to-pdf=${destino}`, url
], { timeout: 120000 }, e => (e ? erro(e) : ok())));
servidor.close();
const { size } = await stat(destino);
console.log(`manual · ${PDF_MANUAL} · ${Math.round(size / 1024)} KB`);
