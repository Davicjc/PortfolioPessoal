// Peças compartilhadas por todas as páginas: utilitários, ícones, cabeçalho, rodapé e o <head> com SEO.
import { T, SITUACAO } from './textos.mjs';

export const DOMINIO = 'https://davicjc.com';

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Campo traduzido: tenta o idioma pedido e cai para o português.
export const c = (obj, campo, lang) => (obj && (obj[`${campo}_${lang}`] || obj[`${campo}_pt`] || obj[campo])) || '';

// Valor com variante em inglês (ex.: "63 mil" / "63k").
export const v = (obj, lang) => (lang === 'en' && obj.valor_en) || obj.valor || '';

export const rotas = {
  inicio: lang => (lang === 'en' ? '/en/' : '/'),
  projetos: lang => (lang === 'en' ? '/en/projects/' : '/projetos/'),
  projeto: (lang, id) => (lang === 'en' ? `/en/projects/${id}/` : `/projetos/${id}/`),
  cv: lang => (lang === 'en' ? '/Curriculo/en.html' : '/Curriculo/'),
  cvPdf: lang => (lang === 'en' ? '/Curriculo/Davi-Castro-Resume.pdf' : '/Curriculo/Davi-Castro-Curriculo.pdf')
};

// Link do currículo: o PDF quando ele já existe no site; senão, a página do currículo.
export const linkCv = (dados, lang) => (dados._build?.cvPdf?.[lang] ? rotas.cvPdf(lang) : rotas.cv(lang));
export const baixaCv = (dados, lang) => (dados._build?.cvPdf?.[lang] ? ' download' : '');

export const absoluto = caminho => DOMINIO + caminho;
export const caminhoImg = p => (!p ? '' : /^(https?:|data:|\/)/.test(p) ? p : '/' + p);

export const ICONES = {
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  diagonal: '<path d="M7 17 17 7M9 7h8v8"/>',
  baixo: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
  copiar: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  cadeado: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  whatsapp: '<path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 10c.4 1.9 2.1 3.6 4 4l1.2-1.1 2 .9c-.2 1.3-1.3 2-2.6 1.9C10.3 15.4 8.6 13.7 8.3 10.4 8.2 9.1 9 8 10.2 7.8l.9 2z"/>',
  orcid: '<circle cx="12" cy="12" r="9"/><path d="M9 10.5V16M9 8v.01M12 10.5h2a2.75 2.75 0 0 1 0 5.5h-2z"/>'
};
export const icone = (nome, classe = 'ic') =>
  `<svg class="${classe}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONES[nome] || ''}</svg>`;

// Monograma D: a haste aberta no nó, ocupado pelo pacote verde. Mesmo desenho de brand/d-monograma.svg (brand/gerar-marca.py).
export const monograma = (classe = 'marca__d') =>
  `<svg class="${classe}" viewBox="0 0 100 100" width="28" height="28" aria-hidden="true" focusable="false"><path d="M30 39V22H48A28 28 0 0 1 48 78H30V61" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/><circle cx="30" cy="50" r="7" fill="var(--link)"/></svg>`;

export const led = situacao => `<span class="led" data-situacao="${esc(situacao || 'no_ar')}" aria-hidden="true"></span>`;

export function situacao(p, lang, { ativo = true } = {}) {
  const s = SITUACAO[p.situacao] || SITUACAO.no_ar;
  const extra = ativo && p.ativo ? `<span class="situacao__ativo"> · ${T[lang].ativo}</span>` : '';
  return `<span class="situacao" data-situacao="${esc(p.situacao || 'no_ar')}">${led(p.situacao)}<span>${s[lang]}</span>${extra}</span>`;
}

// <img> com largura/altura reais e variante menor (sufixo -800 / -390) quando existir.
export function img(dados, src, alt, { classe = '', sizes = '100vw', carregar = 'lazy', prioridade = false } = {}) {
  if (!src) return '';
  const caminho = caminhoImg(src);
  const meta = dados._imgs?.[caminho] || {};
  const srcset = meta.variantes?.length
    ? ` srcset="${meta.variantes.map(x => `${x.caminho} ${x.w}w`).join(', ')}, ${caminho} ${meta.w}w" sizes="${sizes}"`
    : '';
  const dims = meta.w ? ` width="${meta.w}" height="${meta.h}"` : '';
  const extra = prioridade ? ' fetchpriority="high"' : '';
  return `<img class="${classe}" src="${caminho}"${srcset}${dims} alt="${esc(alt)}" loading="${carregar}" decoding="async"${extra}>`;
}

export const ordenar = l => (l || []).slice().sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
export const publicados = l => ordenar((l || []).filter(x => x.publicado !== false));

export function cabecalho(ctx) {
  const { lang, t, alternativa } = ctx;
  const inicio = rotas.inicio(lang);
  const ativo = ctx.pagina === 'inicio' ? '' : inicio;
  const outro = lang === 'en' ? 'pt' : 'en';
  return `<header class="topo" data-topo>
  <div class="envelope topo__barra">
    <a class="marca" href="${inicio}" aria-label="Davi Castro — ${lang === 'en' ? 'home' : 'início'}">${monograma()}<span class="marca__nome">davi castro</span></a>
    <nav class="nav" id="nav" aria-label="${lang === 'en' ? 'Main' : 'Principal'}">
      <a href="${ativo}#trabalho">${t.nav_trabalho}</a>
      <a href="${ativo}#trajetoria">${t.nav_trajetoria}</a>
      <a href="${ativo}#contato">${t.nav_contato}</a>
      <a class="nav__cv" href="${rotas.cv(lang)}">${t.nav_cv}</a>
    </nav>
    <div class="idioma" role="group" aria-label="${lang === 'en' ? 'Language' : 'Idioma'}">
      <a href="${lang === 'pt' ? '#' : alternativa}" hreflang="pt-BR" lang="pt-BR"${lang === 'pt' ? ' aria-current="true"' : ''} data-idioma="pt">PT</a>
      <a href="${lang === 'en' ? '#' : alternativa}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="true"' : ''} data-idioma="en">EN</a>
    </div>
    <button class="topo__menu" type="button" aria-expanded="false" aria-controls="nav" data-menu>${icone('menu')}<span class="sr">${t.menu}</span></button>
  </div>
</header>`;
}

export function rodape(ctx) {
  const { dados, lang, t } = ctx;
  const data = new Date(dados._build.ts);
  const quando = `${data.getDate()} ${t.meses[data.getMonth()]} ${data.getFullYear()}`;
  return `<footer class="rodape">
  <div class="envelope rodape__grade">
    <div class="rodape__marca">
      <a class="marca" href="${rotas.inicio(lang)}">${monograma()}<span class="marca__nome">davi castro</span></a>
      <p>${esc(t.rodape_feito)}</p>
      <p class="rodape__nota">${esc(t.rodape_ping)}</p>
    </div>
    <nav class="rodape__links" aria-label="${lang === 'en' ? 'Footer' : 'Rodapé'}">
      <a href="${rotas.projetos(lang)}">${t.todos_projetos}</a>
      <a href="${rotas.cv(lang)}">${t.nav_cv}</a>
      <a href="/brand/">${t.rodape_marca}</a>
      <a href="/coffee/">${t.rodape_cafe}</a>
    </nav>
    <div class="rodape__fim rotulo">
      <span>© ${data.getFullYear()} Davi Castro · davicjc</span>
      <span>${t.atualizado} <time datetime="${dados._build.ts}">${quando}</time></span>
    </div>
  </div>
</footer>`;
}

// Documento completo: <head> com SEO, JSON-LD, hreflang e o corpo.
export function documento(ctx, { titulo, descricao, caminho, caminhoAlt, ogImagem, ogTipo = 'website', jsonld = [], corpo, classe = '' }) {
  const { lang, t, dados } = ctx;
  const url = absoluto(caminho);
  const urlAlt = absoluto(caminhoAlt);
  const pt = lang === 'pt' ? url : urlAlt;
  const en = lang === 'en' ? url : urlAlt;
  // Card de compartilhamento: o gerado em assets/og/ quando existe; senão, a imagem da marca.
  const temOg = ogImagem && (!ogImagem.startsWith('/assets/og/') || dados._og?.includes(ogImagem.split('/').pop()));
  const og = temOg ? absoluto(caminhoImg(ogImagem)) : absoluto('/brand/og.png');
  const v = dados._build.versoes;
  return `<!doctype html>
<html lang="${t.lang}" class="sem-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="pt-BR" href="${pt}">
<link rel="alternate" hreflang="en" href="${en}">
<link rel="alternate" hreflang="x-default" href="${pt}">
<meta name="author" content="Davi Castro">
<meta name="theme-color" content="#090C10">
<meta name="color-scheme" content="dark">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="${ogTipo}">
<meta property="og:site_name" content="Davi Castro">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(titulo)}">
<meta property="og:locale" content="${t.og_locale}">
<meta property="og:locale:alternate" content="${lang === 'en' ? 'pt_BR' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="me" href="https://github.com/Davicjc">
<link rel="me" href="https://www.linkedin.com/in/davicjc">
<link rel="me" href="https://orcid.org/0009-0005-8485-455X">
<link rel="preload" href="/assets/fonts/archivo-500_700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/ibm-plex-sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/estilo.css?v=${v.css}">
<script>document.documentElement.classList.replace('sem-js','js')</script>
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="${classe}" data-lang="${lang}" data-build="${dados._build.ts}" data-vox="${v.vox || '1'}">
<a class="pular" href="#conteudo">${t.pular}</a>
${cabecalho(ctx)}
<main id="conteudo">
${corpo}
</main>
${rodape(ctx)}
<script type="module" src="/assets/js/site.js?v=${v.js}"></script>
</body>
</html>
`;
}

// Pessoa (JSON-LD) usada em todas as páginas: o mesmo @id liga o autor de cada projeto ao perfil.
export function pessoaLD(dados, lang) {
  const s = dados.site;
  const contatos = dados.contatos || [];
  const sameAs = ['https://github.com/Davicjc', 'https://www.linkedin.com/in/davicjc'];
  if (s.orcid) sameAs.push('https://orcid.org/' + s.orcid);
  const email = contatos.find(x => /mailto:/.test(x.url || ''))?.valor || 'contato@davicjc.com';
  return {
    '@type': 'Person',
    '@id': DOMINIO + '/#davi',
    name: 'Davi Castro',
    alternateName: ['Davi Castro Jorge da Costa', 'davicjc'],
    givenName: 'Davi', familyName: 'Castro Jorge da Costa',
    jobTitle: c(s, 'cargo', lang),
    description: c(s, 'lead', lang),
    url: DOMINIO + rotas.inicio(lang),
    image: DOMINIO + '/fotos/me/me.jpg',
    email: 'mailto:' + email,
    address: { '@type': 'PostalAddress', addressLocality: 'Uberlândia', addressRegion: 'MG', addressCountry: 'BR' },
    worksFor: { '@type': 'Organization', name: 'Audicom Telecom', url: 'https://audicomtelecom.com.br/' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidade de Uberaba (Uniube)' },
    award: lang === 'en' ? '1st place among 60 academic projects — Face Safety, Uniube (2023)' : '1º lugar entre 60 projetos acadêmicos — Face Safety, Uniube (2023)',
    knowsLanguage: ['pt-BR', 'en'],
    knowsAbout: ['Full-stack development', 'JavaScript', 'TypeScript', 'Python', 'Node.js', 'Firebase', 'WebRTC', 'Network automation', 'NetDevOps', 'Network monitoring', 'MikroTik RouterOS', 'BGP', 'RPKI', 'OSPF', 'BFD', 'Zabbix', 'Grafana', 'Computer vision', 'Facial recognition', 'Access control'],
    identifier: s.orcid ? { '@type': 'PropertyValue', propertyID: 'ORCID', value: s.orcid } : undefined,
    sameAs
  };
}
