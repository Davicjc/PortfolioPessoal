#!/usr/bin/env node
// Gera o site estático a partir do conteúdo do Firestore (data/firestore.json) + data/overlay.json.
//   node tools/sync.mjs   → puxa o Firestore
//   node tools/build.mjs  → gera as páginas, o sitemap, o robots, o llms.txt e o CSS final
// Nenhuma dependência: só Node 20+.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { T } from './tpl/textos.mjs';
import { c, rotas, publicados, DOMINIO, caminhoImg } from './tpl/comum.mjs';
import { paginaInicio } from './tpl/inicio.mjs';
import { paginaProjeto } from './tpl/projeto.mjs';
import { paginaProjetos, paginaErro } from './tpl/projetos.mjs';
import { paginaMarca } from './tpl/marca.mjs';
import { paginaCurriculo } from './tpl/curriculo.mjs';
import { paginaCafe } from './tpl/cafe.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = p => readFileSync(join(RAIZ, p), 'utf8');
const lerJSON = p => JSON.parse(ler(p));
const gravar = (p, conteudo) => { const alvo = join(RAIZ, p); mkdirSync(dirname(alvo), { recursive: true }); writeFileSync(alvo, conteudo); };
const hash = s => createHash('sha1').update(s).digest('hex').slice(0, 10);
const LINGUAS = ['pt', 'en'];

/* ─────────── 1. Conteúdo: Firestore + overlay ─────────── */
function mesclar(base, overlay) {
  const dados = structuredClone(base);
  dados.site = { ...(base.site || {}), ...(overlay.site || {}) };
  for (const [colecao, docs] of Object.entries(overlay)) {
    if (colecao === 'site' || colecao.startsWith('$') || typeof docs !== 'object') continue;
    const lista = (dados[colecao] ||= []);
    for (const [id, campos] of Object.entries(docs)) {
      const atual = lista.find(d => d.id === id);
      if (atual) Object.assign(atual, campos);
      else lista.push({ id, ...campos });
    }
  }
  return dados;
}

/* ─────────── 2. Dimensões das imagens (PNG, JPEG, WebP) sem bibliotecas ─────────── */
function dimensoes(arquivo) {
  const b = readFileSync(arquivo);
  if (b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const tipo = b.toString('ascii', 12, 16);
    if (tipo === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (tipo === 'VP8L') { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
    if (tipo === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

function catalogarImagens(dados) {
  const caminhos = new Set();
  for (const p of dados.projetos || []) {
    [p.imagem, p.celular, ...(p.galeria || []).map(g => (typeof g === 'string' ? g : g?.src))].forEach(x => x && caminhos.add(caminhoImg(x)));
  }
  for (const tela of dados.site?.parede || []) {
    [tela.src, ...(tela.alt || [])].forEach(x => {
      if (!x) return;
      caminhos.add(caminhoImg(x));
      if (/-1200\.\w+$/.test(x)) caminhos.add(caminhoImg(x.replace('-1200', '-800')));
    });
  }
  const imgs = {};
  for (const caminho of caminhos) {
    if (!caminho.startsWith('/')) continue;
    const arquivo = join(RAIZ, decodeURIComponent(caminho));
    if (!existsSync(arquivo)) { console.warn('imagem não encontrada:', caminho); continue; }
    const d = dimensoes(arquivo);
    if (!d) continue;
    const variantes = [];
    for (const suf of ['-390', '-800', '-1200']) {
      const alt = caminho.replace(/(\.\w+)$/, suf + '$1');
      const arqAlt = join(RAIZ, decodeURIComponent(alt));
      if (existsSync(arqAlt)) { const da = dimensoes(arqAlt); if (da && da.w < d.w) variantes.push({ caminho: alt, w: da.w }); }
    }
    imgs[caminho] = { ...d, variantes };
  }
  return imgs;
}

// Fotos enviadas pelo painel chegam em base64 (data:...). No site estático elas viram arquivos,
// para o HTML não carregar dezenas de KB de texto e o navegador poder guardar em cache.
function extrairBase64(dados) {
  for (const d of dados.depoimentos || []) {
    const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(d.foto || '');
    if (!m) continue;
    const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
    const caminho = `fotos/depoimentos/${d.id}.${ext}`;
    const alvo = join(RAIZ, caminho);
    mkdirSync(dirname(alvo), { recursive: true });
    writeFileSync(alvo, Buffer.from(m[2], 'base64'));
    d.foto = caminho;
  }
}

/* ─────────── 3. Números vivos do GitHub (contribuições e repositórios) ─────────── */
function tokenGitHub() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try { return execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; }
}
async function numerosGitHub() {
  // No CI o token do Actions não enxerga repositórios privados nem contribuições privadas: os números
  // cairiam. Só atualiza quando o build roda na máquina do Davi (com o gh logado).
  if (process.env.CI) return null;
  const token = tokenGitHub();
  if (!token) return null;
  const query = `query{ user(login:"Davicjc"){ contributionsCollection{ contributionCalendar{ totalContributions } } repositories(ownerAffiliations:OWNER, isFork:false, first:1){ totalCount } } }`;
  try {
    const r = await fetch('https://api.github.com/graphql', { method: 'POST', headers: { Authorization: 'bearer ' + token, 'Content-Type': 'application/json', 'User-Agent': 'davicjc-build' }, body: JSON.stringify({ query }) });
    const j = await r.json();
    const u = j.data?.user;
    return u ? { contribuicoes: u.contributionsCollection.contributionCalendar.totalContributions, repositorios: u.repositories.totalCount } : null;
  } catch { return null; }
}
const formatar = (n, lang) => n.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR');
// Os números buscados na máquina do Davi ficam em data/github.json; o CI só lê esse arquivo.
async function numerosGuardados() {
  const arquivo = join(RAIZ, 'data/github.json');
  const vivos = await numerosGitHub();
  if (vivos) {
    const texto = JSON.stringify(vivos, null, 1) + '\n';
    if (!existsSync(arquivo) || readFileSync(arquivo, 'utf8') !== texto) writeFileSync(arquivo, texto);
    return vivos;
  }
  return existsSync(arquivo) ? JSON.parse(readFileSync(arquivo, 'utf8')) : null;
}

// Data do conteúdo, não do build: a última alteração no banco (updateTime de cada documento) ou no overlay.
// Assim dois builds do mesmo conteúdo saem idênticos, aqui ou no CI.
function dataDoConteudo(base, overlay) {
  const datas = [overlay.$atualizado, base.site?._atualizado];
  for (const lista of Object.values(base)) if (Array.isArray(lista)) for (const d of lista) datas.push(d?._atualizado);
  const ms = datas.filter(Boolean).map(Date.parse).filter(n => !Number.isNaN(n));
  return new Date(ms.length ? Math.max(...ms) : Date.now()).toISOString();
}

/* ─────────── 4. Arquivos de apoio ─────────── */
function sitemap(dados, ts) {
  const dia = ts.slice(0, 10);
  const entrada = (pt, en, prioridade, imagens = []) => `  <url>
    <loc>${DOMINIO}${pt}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${DOMINIO}${pt}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${DOMINIO}${en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMINIO}${pt}"/>
    <lastmod>${dia}</lastmod>
    <priority>${prioridade}</priority>${imagens.map(i => `
    <image:image><image:loc>${DOMINIO}${i}</image:loc></image:image>`).join('')}
  </url>`;
  const urls = [];
  const lista = publicados(dados.projetos);
  for (const [pt, en] of [['/', '/en/'], ['/projetos/', '/en/projects/']]) urls.push(entrada(pt, en, pt === '/' ? '1.0' : '0.8'));
  for (const [pt, en] of [['/', '/en/'], ['/projetos/', '/en/projects/']]) urls.push(entrada(en, pt, pt === '/' ? '0.9' : '0.7'));
  for (const p of lista) {
    const imgs = [p.imagem, ...(p.galeria || []).map(g => (typeof g === 'string' ? g : g.src))].filter(Boolean).map(caminhoImg);
    urls.push(entrada(rotas.projeto('pt', p.id), rotas.projeto('en', p.id), p.caso ? '0.9' : '0.6', [...new Set(imgs)]));
    urls.push(entrada(rotas.projeto('en', p.id), rotas.projeto('pt', p.id), p.caso ? '0.8' : '0.5'));
  }
  urls.push(`  <url><loc>${DOMINIO}/Curriculo/</loc><lastmod>${dia}</lastmod><priority>0.7</priority></url>`);
  urls.push(`  <url><loc>${DOMINIO}/Curriculo/en.html</loc><lastmod>${dia}</lastmod><priority>0.6</priority></url>`);
  urls.push(`  <url><loc>${DOMINIO}/brand/</loc><lastmod>${dia}</lastmod><priority>0.3</priority></url>`);
  urls.push(entrada('/coffee/', '/en/coffee/', '0.3'), entrada('/en/coffee/', '/coffee/', '0.2'));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

function llms(dados) {
  const s = dados.site;
  const lista = publicados(dados.projetos);
  const exps = publicados(dados.experiencias);
  const linha = p => `- [${c(p, 'titulo', 'pt')}](${DOMINIO}${rotas.projeto('pt', p.id)}) — ${c(p, 'tagline', 'pt')}. Situação: ${p.situacao || 'no_ar'}. Tecnologias: ${(p.stack || []).join(', ')}.`;
  return `# Davi Castro (davicjc) — ${c(s, 'cargo', 'pt')}

> ${c(s, 'lead', 'pt')}

> ${c(s, 'lead', 'en')}

- Site: ${DOMINIO}/ (English: ${DOMINIO}/en/)
- E-mail: contato@davicjc.com
- GitHub: https://github.com/Davicjc
- LinkedIn: https://www.linkedin.com/in/davicjc
- ORCID: https://orcid.org/${s.orcid || ''}
- Currículo: ${DOMINIO}/Curriculo/ · Résumé: ${DOMINIO}/Curriculo/en.html
- Formação: ${c(s, 'formatura', 'pt')}

## Estudos de caso

${lista.filter(p => p.caso).map(linha).join('\n')}

## Outros projetos

${lista.filter(p => !p.caso).map(linha).join('\n')}

## Trajetória

${exps.map(e => `- ${c(e, 'cargo', 'pt')} — ${e.empresa} (${c(e, 'periodo', 'pt')}). ${c(e, 'descricao', 'pt')}`).join('\n')}
`;
}

/* ─────────── 5. Geração ─────────── */
async function principal() {
  const base = existsSync(join(RAIZ, 'data/firestore.json')) ? lerJSON('data/firestore.json') : {};
  const overlay = existsSync(join(RAIZ, 'data/overlay.json')) ? lerJSON('data/overlay.json') : {};
  const dados = mesclar(base, overlay);
  extrairBase64(dados);
  const ts = dataDoConteudo(base, overlay);

  const gh = await numerosGuardados();
  for (const p of dados.site.provas || []) {
    if (gh && p.chave && gh[p.chave] != null) { p.valor = formatar(gh[p.chave], 'pt'); p.valor_en = formatar(gh[p.chave], 'en'); }
  }

  // CSS final = tokens + fontes + estilos (um só arquivo, um só pedido).
  const css = [ler('assets/css/tokens.css'), ler('assets/css/fontes.css'), ler('assets/css/site.css')].join('\n');
  gravar('assets/css/estilo.css', css);
  // Currículo: só tokens, fontes e a folha A4 (não carrega o CSS do site).
  const cssCv = [ler('assets/css/tokens.css'), ler('assets/css/fontes.css'), ler('assets/css/cv.css')].join('\n');
  gravar('assets/css/curriculo.css', cssCv);
  // Café: o qr.js (também usado aqui no build) e o cafe.js viram um arquivo só para o navegador.
  const jsCafe = ler('assets/js/qr.js').replace(/^export /gm, '') + '\n' + ler('assets/js/cafe.js').replace(/^import .*$/m, '');
  gravar('assets/js/cafe-app.js', jsCafe);
  const js = ler('assets/js/site.js');
  const vox = ler('assets/js/vox.js');
  dados._imgs = catalogarImagens(dados);
  dados._og = existsSync(join(RAIZ, 'assets/og')) ? readdirSync(join(RAIZ, 'assets/og')) : [];
  dados._build = { ts, versoes: { css: hash(css), js: hash(js), vox: hash(vox), marca: hash(ler('assets/css/marca.css')), cv: hash(cssCv), cafe: hash(ler('assets/css/cafe.css')), cafeJs: hash(jsCafe) } };

  // Páginas
  const gerados = [];
  const pagina = (arquivo, html) => { gravar(arquivo, html); gerados.push(arquivo); };
  for (const lang of LINGUAS) {
    const ctx = { dados, lang, t: T[lang] };
    const pre = lang === 'en' ? 'en/' : '';
    pagina(pre + 'index.html', paginaInicio(ctx));
    pagina(lang === 'en' ? 'en/projects/index.html' : 'projetos/index.html', paginaProjetos(ctx));
    for (const p of publicados(dados.projetos)) pagina(rotas.projeto(lang, p.id).slice(1) + 'index.html', paginaProjeto(ctx, p));
  }
  pagina('404.html', paginaErro({ dados, lang: 'pt', t: T.pt }));
  pagina('brand/index.html', paginaMarca({ dados, lang: 'pt', t: T.pt }, lerJSON('brand/tokens.json')));
  pagina('Curriculo/index.html', paginaCurriculo({ dados, lang: 'pt', t: T.pt }));
  pagina('Curriculo/en.html', paginaCurriculo({ dados, lang: 'en', t: T.en }));
  const cafe = lerJSON('data/cafe.json');
  for (const lang of LINGUAS) pagina(rotas.cafe(lang).slice(1) + 'index.html', paginaCafe({ dados, lang, t: T[lang] }, cafe));

  // Remove páginas de projetos que saíram do ar desde o último build.
  const manifesto = join(RAIZ, 'data/gerados.json');
  const anteriores = existsSync(manifesto) ? JSON.parse(readFileSync(manifesto, 'utf8')) : [];
  for (const velho of anteriores.filter(a => !gerados.includes(a))) {
    const arq = join(RAIZ, velho);
    if (existsSync(arq) && /^(en\/)?(projetos|projects)\//.test(velho)) {
      rmSync(arq);
      const pasta = dirname(arq);
      if (existsSync(pasta) && !readdirSync(pasta).length) rmSync(pasta, { recursive: true });
    }
  }
  writeFileSync(manifesto, JSON.stringify(gerados, null, 1));

  gravar('sitemap.xml', sitemap(dados, ts));
  gravar('llms.txt', llms(dados));

  // Retrato do conteúdo mesclado (sem imagens em base64), para conferência e para importar no painel.
  const retrato = JSON.parse(JSON.stringify(dados, (k, val) => (typeof val === 'string' && val.startsWith('data:') ? '[base64]' : val)));
  delete retrato._imgs;
  delete retrato._sincronizado;
  gravar('data/conteudo.json', JSON.stringify(retrato, null, 1));

  const n = publicados(dados.projetos).length;
  console.log(`build ok · ${gerados.length} páginas · ${n} projetos publicados · css ${dados._build.versoes.css} · js ${dados._build.versoes.js}${gh ? ` · GitHub: ${gh.contribuicoes} contribuições, ${gh.repositorios} repositórios` : ''}`);
}

principal().catch(e => { console.error(e); process.exit(1); });
