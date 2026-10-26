// Currículo (/Curriculo/ em PT, /Curriculo/en.html em EN), gerado dos mesmos dados do site.
// Na tela é uma folha branca sobre o fundo escuro; na impressão o texto flui em páginas A4 (tools/pdf.mjs).
// Cargos e datas vêm de dados.experiencias, que seguem o ORCID. Nada de cargo ou número fora do registro.
import { esc, c, rotas, monograma, pessoaLD, publicados, DOMINIO } from './comum.mjs';

export const PDF_CV = { pt: '/Curriculo/Davi-Castro-Curriculo.pdf', en: '/Curriculo/Davi-Castro-Resume.pdf' };
const PROJETOS_CV = ['nexusatlas', 'audicomhub', 'speedtest', 'facesafety', 'popmanager', 'ecolyra'];

const X = {
  pt: {
    lang: 'pt-BR', titulo: 'Currículo — Davi Castro Jorge da Costa',
    descricao: 'Currículo de Davi Castro: desenvolvedor full stack em Uberlândia, Programador Júnior na Audicom Telecom e estudante de Sistemas de Informação na Uniube.',
    voltar: 'davicjc.com', baixar: 'Baixar PDF', outra: 'English', cargo: 'Desenvolvedor full stack',
    sub: 'Programador Júnior na Audicom Telecom · Sistemas de Informação na Uniube, conclusão em dez 2026',
    local: 'Uberlândia, MG · Brasil',
    resumo_t: 'Resumo',
    resumo: 'Desenvolvedor full stack. Construo sistemas web de ponta a ponta, da interface ao banco de dados e ao deploy, e cuido deles em produção. Na Audicom Telecom, onde entrei pelo suporte e hoje sou Programador Júnior, desenvolvo os sistemas internos do provedor: o NexusAtlas (ordens de serviço em campo), o Audicom Hub (chamados, rondas, frota e estoque) e o teste de velocidade próprio. Também integro biometria e reconhecimento facial ao controle de acesso e cuido da infraestrutura em que tudo isso roda. Antes, na Algar Telecom, atendi em inglês clientes internacionais do atacado.',
    competencias: 'Competências', experiencia: 'Experiência', projetos: 'Projetos selecionados', formacao: 'Formação',
    idiomas: 'Idiomas', certificacoes: 'Certificações',
    idiomas_lista: [['Português', 'nativo'], ['Inglês', 'avançado · certificado Wizard by Pearson (2019); atendimento B2B internacional na Algar'], ['Espanhol', 'básico']],
    certs: [
      ['Microsoft Learn', '13 conquistas: migração de cargas e de SQL Server para o Azure, administração de bancos no Azure, Linux e Java no Azure, soluções e engenharia de IA, GitHub Copilot e Azure Copilot; Migrate & Modernize Challenge.'],
      ['Alura', 'Formação Python para desenvolvimento e automação (100 h) · Linha de comando no Windows (5 h) · Inglês para tecnologia (10 h).'],
      ['Algar Telecom', 'Lei Geral de Proteção de Dados, LGPD (121 h, 6 cursos) · Código de Conduta.'],
      ['Hacker Rangers', 'Segurança da Informação (2 cursos).']
    ],
    rodape: 'Portfólio com os sistemas no ar e os estudos de caso em', atualizado: 'Atualizado em',
    meses: ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],
    sit: { no_ar: 'no ar', desenvolvimento: 'em desenvolvimento', prototipo: 'protótipo', aguardando: 'aguardando o cliente', abandonado: 'descontinuado', historico: 'histórico' }
  },
  en: {
    lang: 'en', titulo: 'Résumé — Davi Castro Jorge da Costa',
    descricao: 'Résumé of Davi Castro: full-stack developer in Uberlândia, Brazil, Junior Programmer at Audicom Telecom and Information Systems student at Uniube.',
    voltar: 'davicjc.com', baixar: 'Download PDF', outra: 'Português', cargo: 'Full-stack developer',
    sub: 'Junior Programmer at Audicom Telecom · B.S. in Information Systems at Uniube, graduating Dec 2026',
    local: 'Uberlândia, MG · Brazil',
    resumo_t: 'Summary',
    resumo: 'Full-stack developer. I build web systems end to end, from the interface to the database and the deploy, and keep them running in production. At Audicom Telecom, where I started in support and am now a Junior Programmer, I build the internet provider\'s internal systems: NexusAtlas (field-service orders), Audicom Hub (tickets, patrols, fleet and stock) and the in-house speed test. I also wire biometrics and facial recognition into access control and look after the infrastructure all of it runs on. Before that, at Algar Telecom, I served international wholesale customers in English.',
    competencias: 'Skills', experiencia: 'Experience', projetos: 'Selected projects', formacao: 'Education',
    idiomas: 'Languages', certificacoes: 'Certifications',
    idiomas_lista: [['Portuguese', 'native'], ['English', 'advanced · Wizard by Pearson certificate (2019); international B2B support at Algar'], ['Spanish', 'basic']],
    certs: [
      ['Microsoft Learn', '13 achievements: migrating workloads and SQL Server to Azure, Azure database administration, Linux and Java on Azure, AI solutions and engineering, GitHub Copilot and Azure Copilot; Migrate & Modernize Challenge.'],
      ['Alura', 'Python for development and automation track (100 h) · Windows command line (5 h) · English for tech (10 h).'],
      ['Algar Telecom', 'Brazilian data protection law, LGPD (121 h, 6 courses) · Code of Conduct.'],
      ['Hacker Rangers', 'Information security (2 courses).']
    ],
    rodape: 'Portfolio with the live systems and case studies at', atualizado: 'Updated',
    meses: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    sit: { no_ar: 'live', desenvolvimento: 'in development', prototipo: 'prototype', aguardando: 'awaiting client', abandonado: 'discontinued', historico: 'archived' }
  }
};

const host = u => (u || '').replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

function cabeca(dados, lang, x) {
  const ct = id => (dados.contatos || []).find(k => k.id === id) || {};
  const email = ct('ct-email');
  const tel = ct('ct-whatsapp');
  const links = [
    ['https://davicjc.com' + (lang === 'en' ? '/en/' : '/'), 'davicjc.com'],
    ['https://github.com/Davicjc', 'github.com/Davicjc'],
    ['https://www.linkedin.com/in/davicjc', 'linkedin.com/in/davicjc'],
    dados.site.orcid ? ['https://orcid.org/' + dados.site.orcid, 'orcid.org/' + dados.site.orcid] : null
  ].filter(Boolean);
  return `<header class="cv__cabeca">
    <div class="cv__marca">${monograma('cv__d')}<span>davi castro</span></div>
    <h1 class="cv__nome">Davi Castro Jorge da Costa</h1>
    <p class="cv__cargo">${esc(x.cargo)}</p>
    <p class="cv__sub">${esc(x.sub)}</p>
    <ul class="cv__contatos">
      <li>${esc(x.local)}</li>
      ${email.valor ? `<li><a href="${esc(email.url)}">${esc(email.valor)}</a></li>` : ''}
      ${tel.valor ? `<li><a href="${esc(tel.url)}">${esc(tel.valor)}</a></li>` : ''}
      ${links.map(([u, t]) => `<li><a href="${u}">${esc(t)}</a></li>`).join('')}
    </ul>
  </header>`;
}

const secao = (titulo, corpo, classe = '') => `<section class="cv__secao${classe ? ' ' + classe : ''}"><h2 class="cv__titulo">${esc(titulo)}</h2>${corpo}</section>`;

// Grupos pensados para quem contrata full stack; cada tecnologia aparece na pilha de algum projeto publicado.
const COMPETENCIAS = [
  [{ pt: 'Front-end', en: 'Front end' }, ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Tailwind CSS', 'PWA', 'Chart.js', 'Leaflet']],
  [{ pt: 'Back-end e dados', en: 'Back end and data' }, ['Node.js', 'Python', 'FastAPI', 'Flask', 'C#', 'Firebase (Auth, Firestore, Rules)', 'PostgreSQL', 'SQLite', 'REST', 'WebSocket', 'WebRTC']],
  [{ pt: 'Integrações e automação', en: 'Integrations and automation' }, ['OpenCV', 'reconhecimento facial e biometria', 'Raspberry Pi', 'Cloudflare', 'Git']],
  [{ pt: 'Infraestrutura e operação', en: 'Infrastructure and operations' }, ['Linux', 'Nginx', 'systemd', 'VMware ESXi', 'WireGuard', 'MikroTik', 'Cisco', 'Ubiquiti', 'BGP, RPKI e OSPF', 'Zabbix', 'Grafana']]
];
const EN_TERMOS = { 'reconhecimento facial e biometria': 'facial recognition and biometrics', 'BGP, RPKI e OSPF': 'BGP, RPKI and OSPF' };

function competencias(lang) {
  return `<dl class="cv__competencias">${COMPETENCIAS.map(([t, lista]) => `<div><dt>${esc(t[lang])}</dt><dd>${lista.map(x => esc(lang === 'en' ? EN_TERMOS[x] || x : x)).join(' · ')}</dd></div>`).join('')}</dl>`;
}

function experiencias(dados, lang) {
  const lista = (dados.experiencias || []).filter(e => e.tipo !== 'formacao' && e.publicado !== false).sort((a, b) => (a.ordem ?? 9) - (b.ordem ?? 9));
  return lista.map(e => `<article class="cv__item">
      <header class="cv__item-cabeca">
        <h3>${esc(c(e, 'cargo', lang))}</h3>
        <p class="cv__periodo">${esc(c(e, 'periodo', lang))}</p>
      </header>
      <p class="cv__onde">${esc(c(e, 'empresa', lang))}${c(e, 'area', lang) ? ` · ${esc(c(e, 'area', lang))}` : ''}</p>
      <p>${esc(c(e, 'descricao', lang))}</p>
    </article>`).join('');
}

function projetos(dados, lang, x) {
  const pub = publicados(dados.projetos);
  return `<ul class="cv__projetos">${PROJETOS_CV.map(id => pub.find(p => p.id === id)).filter(Boolean).map(p => {
    const url = p.demo || p.repo || DOMINIO + rotas.projeto(lang, p.id);
    return `<li>
      <p class="cv__projeto-cabeca"><strong>${esc(c(p, 'titulo', lang))}</strong><span class="cv__sit">${esc(x.sit[p.situacao || 'no_ar'])}${p.ano ? ` · ${esc(p.ano)}` : ''}</span></p>
      <p>${esc(c(p, 'tagline', lang))}.</p>
      <p class="cv__stack">${(p.stack || []).slice(0, 5).map(esc).join(' · ')} — <a href="${esc(url)}">${esc(host(url))}</a></p>
    </li>`;
  }).join('')}</ul>`;
}

function formacao(dados, lang) {
  return (dados.experiencias || []).filter(e => e.tipo === 'formacao').map(e => `<article class="cv__item">
      <header class="cv__item-cabeca"><h3>${esc(c(e, 'cargo', lang))}</h3><p class="cv__periodo">${esc(c(e, 'periodo', lang))}</p></header>
      <p class="cv__onde">${esc(c(e, 'empresa', lang))}</p>
      <p>${esc(c(e, 'descricao', lang))}</p>
    </article>`).join('');
}

export function paginaCurriculo(ctx) {
  const { dados, lang } = ctx;
  const x = X[lang];
  const outra = lang === 'en' ? 'pt' : 'en';
  const caminho = rotas.cv(lang);
  const data = new Date(dados._build.ts);
  const quando = `${x.atualizado} ${lang === 'en' ? `${x.meses[data.getMonth()]} ${data.getFullYear()}` : `${x.meses[data.getMonth()]} de ${data.getFullYear()}`}`;
  const v = dados._build.versoes;
  const jsonld = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'ProfilePage', url: DOMINIO + caminho, name: x.titulo, inLanguage: x.lang, mainEntity: { '@id': DOMINIO + '/#davi' } },
    pessoaLD(dados, lang)
  ] };
  return `<!doctype html>
<html lang="${x.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(x.titulo)}</title>
<meta name="description" content="${esc(x.descricao)}">
<link rel="canonical" href="${DOMINIO + caminho}">
<link rel="alternate" hreflang="pt-BR" href="${DOMINIO + rotas.cv('pt')}">
<link rel="alternate" hreflang="en" href="${DOMINIO + rotas.cv('en')}">
<link rel="alternate" hreflang="x-default" href="${DOMINIO + rotas.cv('pt')}">
<meta name="author" content="Davi Castro">
<meta name="theme-color" content="#090C10">
<meta name="robots" content="index, follow">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(x.titulo)}">
<meta property="og:description" content="${esc(x.descricao)}">
<meta property="og:url" content="${DOMINIO + caminho}">
<meta property="og:image" content="${DOMINIO}/assets/og/${lang === 'en' ? 'inicio-en' : 'inicio'}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/archivo-500_700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/ibm-plex-sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/curriculo.css?v=${v.cv || '1'}">
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<nav class="cv-barra" aria-label="${lang === 'en' ? 'Résumé' : 'Currículo'}">
  <a href="${rotas.inicio(lang)}">← ${esc(x.voltar)}</a>
  <span class="cv-barra__acoes"><a href="${rotas.cv(outra)}" hreflang="${outra === 'en' ? 'en' : 'pt-BR'}">${esc(x.outra)}</a><a class="cv-barra__pdf" href="${PDF_CV[lang]}" download>${esc(x.baixar)}</a></span>
</nav>
<main class="cv">
  <article class="cv__folha">
    ${cabeca(dados, lang, x)}
    ${secao(x.resumo_t, `<p class="cv__resumo">${esc(x.resumo)}</p>`)}
    ${secao(x.competencias, competencias(lang))}
    ${secao(x.experiencia, experiencias(dados, lang))}
    ${secao(x.projetos, projetos(dados, lang, x))}
    ${secao(x.formacao, formacao(dados, lang))}
    <div class="cv__duas">
      ${secao(x.idiomas, `<ul class="cv__lista">${x.idiomas_lista.map(([l, n]) => `<li><strong>${esc(l)}</strong> · ${esc(n)}</li>`).join('')}</ul>`)}
      ${secao(x.certificacoes, `<ul class="cv__lista">${x.certs.map(([q, t]) => `<li><strong>${esc(q)}</strong> · ${esc(t)}</li>`).join('')}</ul>`, 'cv__secao--certs')}
    </div>
    <footer class="cv__rodape"><span>${esc(x.rodape)} <a href="https://davicjc.com${lang === 'en' ? '/en/' : '/'}">davicjc.com</a></span><span>${esc(quando)}</span></footer>
  </article>
</main>
</body>
</html>
`;
}
