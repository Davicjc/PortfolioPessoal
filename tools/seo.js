#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════
   SEO estático do davicjc.com — sem dependências, só Node.

   O site é uma SPA: o conteúdo nasce no navegador. O Google executa
   JavaScript, mas Bing, LinkedIn, WhatsApp, Slack e os robôs de IA
   leem só o HTML. Este script lê a semente embutida no index.html
   (/* SEMENTE:INICIO *\/ … /* SEMENTE:FIM *\/) e grava:

   1. <!-- SEO:JSONLD --> dados estruturados (Person, ProfilePage,
      WebSite, lista de projetos, credenciais)
   2. <!-- SEO:ESTATICO --> o conteúdo completo em HTML semântico
      dentro de <main id="app">, que o JS substitui ao carregar
   3. sitemap.xml (com imagens) e llms.txt

   Uso, sempre que mudar o conteúdo pelo /adm:
     1. no /adm, "Exportar semente" e cole no index.html
     2. node tools/seo.js
   ══════════════════════════════════════════════════════════════════ */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://davicjc.com';
const HOJE = new Date().toISOString().slice(0, 10);

const idxPath = path.join(ROOT, 'index.html');
let html = fs.readFileSync(idxPath, 'utf8');
const eol = html.includes('\r\n') ? '\r\n' : '\n';
const m = html.match(/\/\* SEMENTE:INICIO \*\/ ([\s\S]*?) \/\* SEMENTE:FIM/);
if (!m) throw new Error('semente não encontrada no index.html');
const D = JSON.parse(m[1]);

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ord = l => (l || []).slice().sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
const pub = l => ord(l).filter(x => x.publicado !== false);
const pt = (o, k) => (o && (o[k + '_pt'] || o[k])) || '';
const en = (o, k) => (o && (o[k + '_en'] || o[k + '_pt'] || o[k])) || '';
const abs = u => !u ? '' : /^https?:/i.test(u) ? u : /^(mailto:|tel:|data:)/i.test(u) ? '' : SITE + '/' + String(u).replace(/^\.?\//, '').split('/').map(encodeURIComponent).join('/').replace(/%25([0-9A-F]{2})/gi, '%$1');
const web = u => /^https?:/i.test(u || '') ? u : '';
const uniq = a => [...new Set(a.filter(Boolean))];

const s = D.site || {};
const projetos = pub(D.projetos), exps = ord(D.experiencias), caps = pub(D.capacidades);
const certs = pub(D.certificados), deps = pub(D.depoimentos), clis = pub(D.clientes), cts = ord(D.contatos);
const contato = re => cts.find(c => re.test(c.url || '') || re.test(c.id || ''));
const email = (contato(/^mailto:/i) || {}).valor || '';
const gh = web((contato(/github/i) || {}).url), li = web((contato(/linkedin/i) || {}).url);
const wa = contato(/wa\.me|whatsapp/i);
const atual = exps.find(e => e.atual) || exps[0] || {};
const nome = s.nome || 'Davi Castro', completo = s.nome_completo || nome;
const habilidades = uniq([].concat(...ord(s.camadas).map(c => c.itens || []), ...caps.map(c => c.tecnologias || [])));

/* ── 1. JSON-LD ─────────────────────────────────────────────────── */
const PID = SITE + '/#davi';
const pessoa = {
  '@type': 'Person', '@id': PID,
  name: completo, alternateName: uniq([nome, 'davicjc', 'Davi CJC']),
  givenName: completo.split(' ')[0], familyName: completo.split(' ').slice(1).join(' '),
  url: SITE + '/', image: { '@type': 'ImageObject', url: SITE + '/fotos/me/me.jpg', caption: completo },
  description: pt(s, 'resumo'), disambiguatingDescription: pt(s, 'cargo'),
  jobTitle: pt(atual, 'cargo') || pt(s, 'cargo'),
  email: email ? 'mailto:' + email : undefined,
  telephone: wa && wa.valor ? wa.valor.replace(/[^\d+]/g, '') : undefined,
  address: { '@type': 'PostalAddress', addressLocality: 'Uberlândia', addressRegion: 'MG', addressCountry: 'BR' },
  homeLocation: { '@type': 'Place', name: pt(s, 'local') || 'Uberlândia, MG, Brasil' },
  nationality: { '@type': 'Country', name: 'Brasil' },
  worksFor: atual.empresa ? { '@type': 'Organization', name: atual.empresa.split('&')[0].trim(), url: 'https://audicomtelecom.com.br/' } : undefined,
  alumniOf: exps.filter(e => /universidade|faculdade|uniube/i.test(e.empresa || '')).map(e => ({ '@type': 'CollegeOrUniversity', name: e.empresa })),
  hasOccupation: exps.slice(0, 3).map(e => ({ '@type': 'Occupation', name: pt(e, 'cargo'), description: pt(e, 'periodo') + ' · ' + e.empresa, occupationLocation: { '@type': 'City', name: 'Uberlândia' } })),
  knowsAbout: habilidades,
  knowsLanguage: [{ '@type': 'Language', name: 'Português', alternateName: 'pt-BR' }, { '@type': 'Language', name: 'English', alternateName: 'en' }],
  hasCredential: certs.map(c => {
    const v = (c.links || []).find(l => /validar|verify/i.test(l.label || '') && web(l.url)) || (c.links || []).find(l => l.url);
    return { '@type': 'EducationalOccupationalCredential', name: pt(c, 'titulo'), credentialCategory: 'certificate', recognizedBy: { '@type': 'Organization', name: c.emissor }, url: v ? abs(v.url) : undefined };
  }),
  sameAs: uniq([gh, li, 'https://www.instagram.com/davicjc/'])
};
const site = { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE + '/', name: nome + ' — Portfólio', alternateName: 'davicjc', inLanguage: ['pt-BR', 'en', 'es'], publisher: { '@id': PID }, author: { '@id': PID } };
const pagina = {
  '@type': 'ProfilePage', '@id': SITE + '/#pagina', url: SITE + '/', name: nome + ' — ' + pt(s, 'cargo'),
  description: pt(s, 'resumo'), inLanguage: 'pt-BR', isPartOf: { '@id': SITE + '/#site' },
  mainEntity: { '@id': PID }, about: { '@id': PID }, dateModified: HOJE,
  primaryImageOfPage: { '@type': 'ImageObject', url: SITE + '/brand/og.png', width: 1200, height: 630 },
  breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: SITE + '/' }] }
};
const lista = {
  '@type': 'ItemList', '@id': SITE + '/#projetos', name: 'Projetos de ' + nome, numberOfItems: projetos.length,
  itemListElement: projetos.map((p, i) => {
    const repo = web(p.repo), demo = web(p.demo);
    const item = {
      '@type': repo ? 'SoftwareSourceCode' : 'CreativeWork', name: pt(p, 'titulo'), headline: pt(p, 'tagline'),
      description: pt(p, 'descricao') || pt(p, 'tagline'), author: { '@id': PID }, creator: { '@id': PID },
      keywords: (p.stack || []).join(', '), genre: p.categoria, inLanguage: 'pt-BR',
      url: demo || repo || SITE + '/#/projetos', image: p.imagem && !/^data:/.test(p.imagem) ? abs(p.imagem) : undefined
    };
    if (repo){ item.codeRepository = repo; item.programmingLanguage = (p.stack || []).slice(0, 4); }
    return { '@type': 'ListItem', position: i + 1, item };
  })
};
const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': [pessoa, site, pagina, lista] }, (k, v) => (v === undefined || (Array.isArray(v) && !v.length)) ? undefined : v, 1)
  .replace(/</g, '\\u003c');

/* ── 2. HTML estático (pt) ──────────────────────────────────────── */
const L = [];
L.push(`<div class="seo-static">`);
L.push(`<header><h1>${esc(nome)} — ${esc(pt(s, 'cargo'))}</h1><p>${esc(pt(s, 'local'))}${s.disponivel ? ' · ' + esc(pt(s, 'disponibilidade')) : ''}</p><p>${esc(pt(s, 'resumo'))}</p>`);
L.push(`<p>${ord(s.numeros).map(n => esc(n.valor + ' ' + pt(n, 'rotulo'))).join(' · ')}</p>`);
L.push(`<nav aria-label="Seções"><a href="#/projetos">Projetos</a> · <a href="#/sobre">Trajetória</a> · <a href="#/contato">Contato</a> · <a href="Curriculo/">Currículo</a> · <a href="Curriculo/en.html">Résumé (English)</a></nav></header>`);
if (caps.length){
  L.push(`<section><h2>${esc(pt(s, 'capacidades_titulo') || 'Da tela ao roteador')}</h2><p>${esc(pt(s, 'capacidades_sub'))}</p>`);
  caps.forEach(c => L.push(`<article><h3>${esc(pt(c, 'titulo'))}</h3><p>${esc(pt(c, 'texto'))}</p><p>${esc((c.tecnologias || []).join(', '))}</p></article>`));
  L.push(`<p>Camadas: ${ord(s.camadas).map(c => esc(pt(c, 'nome') + ' (' + (c.itens || []).join(', ') + ')')).join('; ')}.</p></section>`);
}
if (projetos.length){
  L.push(`<section><h2>${esc(pt(s, 'projetos_titulo') || 'Projetos')}</h2><p>${esc(pt(s, 'projetos_sub'))}</p>`);
  projetos.forEach(p => {
    L.push(`<article><h3>${esc(pt(p, 'titulo'))}</h3><p>${esc(pt(p, 'tagline'))}</p>`);
    if (pt(p, 'descricao')) L.push(`<p>${esc(pt(p, 'descricao'))}</p>`);
    if (pt(p, 'papel')) L.push(`<p>Papel: ${esc(pt(p, 'papel'))}</p>`);
    if (pt(p, 'impacto')) L.push(`<p>Impacto: ${esc(pt(p, 'impacto'))}</p>`);
    if ((p.stack || []).length) L.push(`<p>Stack: ${esc(p.stack.join(', '))}</p>`);
    const ls = [web(p.demo) && `<a href="${esc(p.demo)}">ver ao vivo</a>`, web(p.repo) && `<a href="${esc(p.repo)}">código-fonte</a>`].filter(Boolean);
    if (ls.length) L.push(`<p>${ls.join(' · ')}</p>`);
    L.push(`</article>`);
  });
  L.push(`</section>`);
}
if (exps.length){
  L.push(`<section><h2>${esc(pt(s, 'trajetoria_titulo') || 'Trajetória')}</h2><p>${esc(pt(s, 'trajetoria_sub'))}</p>`);
  exps.forEach(e => L.push(`<article><h3>${esc(pt(e, 'cargo'))} — ${esc(e.empresa)}</h3><p>${esc(pt(e, 'periodo'))}</p><p>${esc(pt(e, 'descricao'))}</p>${pt(e, 'progressao') ? `<p>${esc(pt(e, 'progressao'))}</p>` : ''}</article>`));
  L.push(`</section>`);
}
if (certs.length){
  L.push(`<section><h2>${esc(pt(s, 'certificados_titulo') || 'Certificados')}</h2><ul>`);
  certs.forEach(c => L.push(`<li>${esc(pt(c, 'titulo'))} — ${esc(c.emissor)}</li>`));
  L.push(`</ul></section>`);
}
if (clis.length) L.push(`<section><h2>${esc(pt(s, 'clientes_titulo') || 'Clientes')}</h2><p>${clis.map(c => web(c.site) ? `<a href="${esc(c.site)}">${esc(c.nome)}</a>` : esc(c.nome)).join(' · ')}</p></section>`);
if (deps.length){
  L.push(`<section><h2>${esc(pt(s, 'depoimentos_titulo') || 'Depoimentos')}</h2>`);
  deps.forEach(d => L.push(`<figure><blockquote>${esc(pt(d, 'texto'))}</blockquote><figcaption>${esc(d.nome)} — ${esc(pt(d, 'cargo'))}</figcaption></figure>`));
  L.push(`</section>`);
}
L.push(`<section><h2>${esc(pt(s, 'contato_titulo') || 'Contato')}</h2><p>${esc(pt(s, 'contato_sub'))}</p><ul>`);
cts.forEach(c => L.push(`<li>${esc(pt(c, 'rotulo'))}: <a href="${esc(c.url)}">${esc(c.valor)}</a></li>`));
L.push(`</ul></section></div>`);
const estatico = L.join(eol);

function trocar(src, marca, novo){
  const re = new RegExp(`(<!-- ${marca}:INICIO -->)[\\s\\S]*?(<!-- ${marca}:FIM -->)`);
  if (!re.test(src)) throw new Error('marcador ' + marca + ' não encontrado no index.html');
  return src.replace(re, (_, a, b) => a + eol + novo + eol + b);
}
html = trocar(html, 'SEO:JSONLD', `<script type="application/ld+json">${eol}${ld}${eol}</script>`);
html = trocar(html, 'SEO:ESTATICO', estatico);
fs.writeFileSync(idxPath, html);

/* ── 3. sitemap.xml (com imagens) ───────────────────────────────── */
const imgs = [
  { loc: SITE + '/brand/og.png', title: nome + ' — ' + pt(s, 'cargo') },
  { loc: SITE + '/fotos/me/me.jpg', title: completo },
  ...projetos.filter(p => p.imagem && !/^data:/.test(p.imagem)).map(p => ({ loc: abs(p.imagem), title: pt(p, 'titulo') + ' — ' + pt(p, 'tagline') }))
];
const sm = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Portfólio: página única (SPA). Gerado por tools/seo.js em ${HOJE}. -->
  <url>
    <loc>${SITE}/</loc>
    <lastmod>${HOJE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${imgs.map(i => `    <image:image><image:loc>${esc(i.loc)}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`).join('\n')}
  </url>

  <url>
    <loc>${SITE}/Curriculo/</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${SITE}/Curriculo/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/Curriculo/en.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/Curriculo/"/>
    <lastmod>${HOJE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE}/Curriculo/en.html</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${SITE}/Curriculo/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/Curriculo/en.html"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/Curriculo/"/>
    <lastmod>${HOJE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sm);

/* ── 4. llms.txt — resumo para assistentes de IA (llmstxt.org) ──── */
const llms = `# ${completo} (${nome} · davicjc)

> ${pt(s, 'cargo')} em ${pt(s, 'local')}. ${pt(s, 'resumo')}

- Site: ${SITE}/
- E-mail: ${email}
${li ? `- LinkedIn: ${li}\n` : ''}${gh ? `- GitHub: ${gh}\n` : ''}- Currículo (PT): ${SITE}/Curriculo/
- Résumé (EN): ${SITE}/Curriculo/en.html

## Trajetória

${exps.map(e => `- ${pt(e, 'cargo')} — ${e.empresa} (${pt(e, 'periodo')}). ${pt(e, 'descricao')}`).join('\n')}

## O que faz

${caps.map(c => `- ${pt(c, 'titulo')}: ${pt(c, 'texto')} (${(c.tecnologias || []).join(', ')})`).join('\n')}

## Projetos

${projetos.map(p => `- [${pt(p, 'titulo')}](${web(p.demo) || web(p.repo) || SITE + '/#/projetos'}): ${pt(p, 'tagline')}${(p.stack || []).length ? ' — ' + p.stack.join(', ') : ''}`).join('\n')}

## Certificados

${certs.map(c => `- ${pt(c, 'titulo')} — ${c.emissor}`).join('\n')}

## Optional

- English: ${nome} is a ${en(s, 'cargo')} based in ${en(s, 'local')}. ${en(s, 'resumo')}
`;
fs.writeFileSync(path.join(ROOT, 'llms.txt'), llms);

console.log(`ok · ${projetos.length} projetos · ${certs.length} certificados · ${habilidades.length} habilidades · ${Math.round(estatico.length / 1024)}KB de HTML estático`);
