#!/usr/bin/env node
// Gera os PDFs a partir das próprias páginas: o manual da marca (/brand/, A4 deitado) e os currículos
// (/Curriculo/ e /Curriculo/en.html, A4 em pé). Cada folha da página vira uma página do PDF.
//   node tools/build.mjs && node tools/pdf.mjs
// Sobe um servidor local só enquanto o Chrome imprime (as páginas usam caminhos absolutos: /assets/...).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { PDF_MANUAL } from './tpl/marca.mjs';
import { PDF_CV } from './tpl/curriculo.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean).find(c => existsSync(c));
if (!CHROME) { console.error('Chrome não encontrado. Defina CHROME=/caminho/do/chrome'); process.exit(1); }

const DOCUMENTOS = [
  ['/brand/', PDF_MANUAL],
  ['/Curriculo/', PDF_CV.pt],
  ['/Curriculo/en.html', PDF_CV.en]
];

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
const base = `http://127.0.0.1:${servidor.address().port}`;

const so = process.argv[2];
for (const [pagina, pdf] of DOCUMENTOS) {
  if (so && !pagina.includes(so) && !pdf.includes(so)) continue;
  const destino = join(RAIZ, pdf);
  await new Promise((ok, erro) => execFile(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-pdf-header-footer', '--print-to-pdf-no-header',
    '--virtual-time-budget=10000', '--run-all-compositor-stages-before-draw', `--print-to-pdf=${destino}`, base + pagina
  ], { timeout: 120000 }, e => (e ? erro(e) : ok())));
  const { size } = await stat(destino);
  console.log(`pdf · ${pdf} · ${Math.round(size / 1024)} KB`);
}
servidor.close();
