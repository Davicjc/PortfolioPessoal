#!/usr/bin/env node
// Gera as imagens de compartilhamento (1200×630) em assets/og/ usando o Chrome instalado (headless).
//   node tools/og.mjs            → home PT/EN + todos os projetos publicados
//   node tools/og.mjs nexusatlas → só um projeto
// Rode depois do build (lê data/conteudo.json). Sem dependências: só Node e o Chrome.
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(RAIZ, 'assets/og');
const CHROMES = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean);
const CHROME = CHROMES.find(c => existsSync(c));
if (!CHROME) { console.error('Chrome não encontrado. Defina CHROME=/caminho/do/chrome'); process.exit(1); }

const dados = JSON.parse(readFileSync(join(RAIZ, 'data/conteudo.json'), 'utf8'));
const SIT = { no_ar: ['No ar', 'Live'], desenvolvimento: ['Em desenvolvimento', 'In development'], prototipo: ['Protótipo', 'Prototype'], aguardando: ['Aguardando o cliente', 'Awaiting client'], abandonado: ['Descontinuado', 'Discontinued'], historico: ['Histórico', 'Archived'] };
const c = (o, campo, lang) => (o && (o[`${campo}_${lang}`] || o[`${campo}_pt`] || o[campo])) || '';
const tira = s => (s || '').replace(/^\//, '');
const projetos = (dados.projetos || []).filter(p => p.publicado !== false);
const parede = (dados.site.parede || []).map(t => ({ nome: t.nome, src: tira(t.src) }));

function telasDe(p) {
  const proprias = [...(p.galeria || []).map(g => (typeof g === 'string' ? g : g.src)), p.imagem].filter(Boolean).map(tira);
  const unicas = [...new Set(proprias)];
  const outras = parede.filter(t => !unicas.includes(t.src));
  // Posições mais visíveis primeiro (4 é a tela grande do centro). Com uma tela só, ela também vai para a 1.
  const grade = new Array(9).fill(null);
  const lugares = [4, 1, 3, 7, 0, 6];
  const lista = unicas.length === 1 ? [unicas[0], unicas[0]] : unicas;
  lugares.forEach((pos, i) => { if (lista[i]) grade[pos] = { nome: c(p, 'titulo', 'pt'), src: lista[i] }; });
  let k = 0;
  return grade.map(t => t || outras[k++ % Math.max(1, outras.length)]).filter(Boolean);
}

function render(nome, payload) {
  const url = pathToFileURL(join(RAIZ, 'tools/og.html')).href + '#' + encodeURIComponent(JSON.stringify(payload));
  const destino = join(SAIDA, nome + '.jpg');
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1200,630', '--virtual-time-budget=4000', '--allow-file-access-from-files', `--screenshot=${destino}`, url], { stdio: 'ignore', timeout: 60000 });
  console.log('og ·', nome);
}

mkdirSync(SAIDA, { recursive: true });
const so = process.argv[2];
if (!so) {
  for (const lang of ['pt', 'en']) {
    render(lang === 'en' ? 'inicio-en' : 'inicio', {
      kicker: lang === 'en' ? 'Full-stack developer · Brazil' : 'Desenvolvedor full stack · Uberlândia',
      titulo: c(dados.site, 'titulo', lang), sub: lang === 'en' ? 'Products built end to end — and kept running in production.' : 'Produtos construídos de ponta a ponta — e mantidos no ar, em produção.',
      situacao: 'no_ar', telas: parede.slice(0, 9)
    });
  }
}
for (const p of projetos) {
  if (so && p.id !== so) continue;
  for (const [i, lang] of ['pt', 'en'].entries()) {
    render((lang === 'en' ? 'en-' : '') + p.id, {
      kicker: `${(SIT[p.situacao] || SIT.no_ar)[i]}${p.ano ? ' · ' + p.ano : ''}${p.caso ? (lang === 'en' ? ' · case study' : ' · estudo de caso') : ''}`,
      titulo: c(p, 'titulo', lang), sub: c(p, 'tagline', lang), situacao: p.situacao, telas: telasDe(p),
      rodape: 'davicjc.com' + (lang === 'en' ? '/en/projects/' : '/projetos/') + p.id
    });
  }
}
