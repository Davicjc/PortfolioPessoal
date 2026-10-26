// Página de cada projeto (PT em /projetos/<id>/, EN em /en/projects/<id>/).
// Projetos marcados como "caso" ganham o estudo completo: problema, decisões, arquitetura e resultado.
import { T } from './textos.mjs';
import { esc, c, v, rotas, icone, img, situacao, publicados, documento, pessoaLD, caminhoImg, DOMINIO } from './comum.mjs';
import { janela } from './inicio.mjs';

function acoes(p, lang, t) {
  const botoes = [];
  if (p.demo) botoes.push(`<a class="botao botao--sinal" href="${esc(p.demo)}" rel="noopener">${p.tipo_botao === 'pagina' ? t.abrir_pagina : t.abrir_sistema}${icone('diagonal')}</a>`);
  if (p.repo) botoes.push(`<a class="botao botao--linha" href="${esc(p.repo)}" rel="noopener">${icone('github')}${t.ver_codigo}</a>`);
  else if (p.privado) botoes.push(`<span class="selo">${icone('cadeado', 'ic ic--mini')}${t.repo_privado}</span>`);
  return botoes.length ? `<div class="projeto__acoes">${botoes.join('')}</div>` : '';
}

function bloco(rotulo, conteudo, id = '') {
  if (!conteudo) return '';
  return `<section class="bloco"${id ? ` id="${id}"` : ''}>
    <h2 class="bloco__rotulo rotulo">${esc(rotulo)}</h2>
    <div class="bloco__conteudo">${conteudo}</div>
  </section>`;
}

// Arquitetura: as camadas atravessadas pelo barramento, com um pacote descendo como uma requisição.
function arquitetura(p, lang) {
  if (!p.arquitetura?.length) return '';
  return `<div class="arq" data-arq>
    <span class="arq__pacote" aria-hidden="true"></span>
    ${p.arquitetura.map(cam => `<div class="arq__camada">
      <p class="arq__nome rotulo">${esc(c(cam, 'camada', lang))}</p>
      <ul class="arq__itens">${(cam.itens || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>`).join('')}
  </div>`;
}

function decisoes(p, lang) {
  if (!p.decisoes?.length) return '';
  return `<ol class="decisoes">${p.decisoes.map((d, i) => `<li class="decisao">
      <span class="decisao__num dado">${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(c(d, 'titulo', lang))}</h3>
      <p>${esc(c(d, 'texto', lang))}</p>
    </li>`).join('')}</ol>`;
}

function galeria(dados, p, lang, t) {
  const lista = (p.galeria || []).map(g => (typeof g === 'string' ? { src: g } : g)).filter(g => g.src);
  if (lista.length < 2) return '';
  return `<section class="galeria" aria-label="${t.telas}">
    <h2 class="rotulo galeria__titulo">${t.telas}</h2>
    ${c(p, 'nota_demo', lang) ? `<p class="galeria__nota">${esc(c(p, 'nota_demo', lang))}</p>` : ''}
    <div class="galeria__grade">
      ${lista.map(g => `<figure class="galeria__item"><a href="${caminhoImg(g.src)}" data-ampliar>${img(dados, g.src, c(g, 'legenda', lang) || c(p, 'titulo', lang), { sizes: '(min-width: 1024px) 45vw, 100vw' })}</a>${c(g, 'legenda', lang) ? `<figcaption>${esc(c(g, 'legenda', lang))}</figcaption>` : ''}</figure>`).join('\n      ')}
    </div>
  </section>`;
}

export function paginaProjeto(ctx, p) {
  const { dados, lang } = ctx;
  const t = T[lang];
  const lista = publicados(dados.projetos);
  const i = lista.findIndex(x => x.id === p.id);
  // Sem dar a volta na lista: o primeiro projeto não aponta para o último (e vice-versa).
  const anterior = i > 0 ? lista[i - 1] : null;
  const proximo = i < lista.length - 1 ? lista[i + 1] : null;
  const titulo = c(p, 'titulo', lang);
  const caminho = rotas.projeto(lang, p.id);
  const caminhoAlt = rotas.projeto(lang === 'en' ? 'pt' : 'en', p.id);
  const para = p.origem === 'pessoal' ? t.origem.pessoal : (p.cliente || t.origem[p.origem] || '');

  const meta = [
    [t.meu_papel, c(p, 'papel', lang)],
    [t.periodo, c(p, 'periodo', lang) || p.ano],
    [t.para, para]
  ].filter(([, x]) => x);

  const conteudo = p.caso
    ? [
        bloco(t.o_problema, `<p class="bloco__destaque">${esc(c(p, 'contexto', lang) || c(p, 'descricao', lang))}</p>`),
        bloco(t.decisoes, decisoes(p, lang)),
        bloco(t.arquitetura, arquitetura(p, lang)),
        bloco(t.resultado, c(p, 'impacto', lang) ? `<p class="bloco__destaque">${esc(c(p, 'impacto', lang))}</p>` : '')
      ].join('\n')
    : [
        bloco(lang === 'en' ? 'About' : 'Sobre', `<p class="bloco__destaque">${esc(c(p, 'descricao', lang))}</p>`),
        bloco(t.resultado, c(p, 'impacto', lang) ? `<p>${esc(c(p, 'impacto', lang))}</p>` : '')
      ].join('\n');

  const corpo = `<article class="projeto" data-projeto="${esc(p.id)}">
  <header class="envelope projeto__cabeca">
    <nav class="trilha rotulo" aria-label="${lang === 'en' ? 'Breadcrumb' : 'Trilha'}"><a href="${rotas.inicio(lang)}#trabalho">${t.nav_trabalho}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(titulo)}</span></nav>
    <p class="caso__meta">${situacao(p, lang)}${p.caso ? `<span class="rotulo">${t.caso}</span>` : ''}</p>
    <h1 class="projeto__titulo">${esc(titulo)}</h1>
    <p class="projeto__tagline">${esc(c(p, 'tagline', lang))}</p>
    ${acoes(p, lang, t)}
    <dl class="projeto__meta">
      ${meta.map(([k, x]) => `<div><dt class="rotulo">${esc(k)}</dt><dd>${esc(x)}</dd></div>`).join('')}
      ${p.stack?.length ? `<div class="projeto__stack"><dt class="rotulo">${t.tecnologias}</dt><dd><ul class="pilha">${p.stack.map(s => `<li>${esc(s)}</li>`).join('')}</ul></dd></div>` : ''}
    </dl>
  </header>
  <div class="envelope projeto__visual">${janela(dados, p, lang, { prioridade: true, sizes: '(min-width: 1240px) 1240px, 100vw' })}</div>
  ${p.metricas?.length ? `<div class="envelope"><dl class="metricas metricas--linha">${p.metricas.map(m => `<div><dt>${esc(c(m, 'rotulo', lang))}</dt><dd>${esc(v(m, lang))}</dd></div>`).join('')}</dl></div>` : ''}
  <div class="envelope projeto__corpo">
    ${p.caso ? `<p class="projeto__resumo">${esc(c(p, 'descricao', lang))}</p>` : ''}
    ${conteudo}
    ${galeria(dados, p, lang, t)}
  </div>
  <nav class="envelope vizinhos" aria-label="${lang === 'en' ? 'More projects' : 'Mais projetos'}">
    ${anterior ? `<a class="vizinho" href="${rotas.projeto(lang, anterior.id)}"><span class="rotulo">${t.anterior}</span><span class="vizinho__nome">${esc(c(anterior, 'titulo', lang))}</span></a>` : '<span></span>'}
    <a class="vizinho vizinho--todos" href="${rotas.projetos(lang)}"><span class="rotulo">${t.todos_projetos}</span><span class="vizinho__nome">${lista.length}</span></a>
    ${proximo ? `<a class="vizinho vizinho--proximo" href="${rotas.projeto(lang, proximo.id)}"><span class="rotulo">${t.proximo}</span><span class="vizinho__nome">${esc(c(proximo, 'titulo', lang))}</span></a>` : '<span></span>'}
  </nav>
</article>`;

  const descricao = (c(p, 'tagline', lang) + '. ' + c(p, 'descricao', lang)).slice(0, 300).replace(/\s+\S*$/, '') + '…';
  const tipo = p.caso || ['pessoal', 'empresa'].includes(p.origem) ? 'SoftwareApplication' : 'CreativeWork';
  const obra = {
    '@type': tipo,
    '@id': DOMINIO + rotas.projeto('pt', p.id) + '#projeto',
    name: titulo,
    description: c(p, 'descricao', lang),
    url: DOMINIO + caminho,
    image: p.imagem ? DOMINIO + caminhoImg(p.imagem) : undefined,
    inLanguage: t.lang,
    author: { '@id': DOMINIO + '/#davi' },
    creator: { '@id': DOMINIO + '/#davi' },
    dateCreated: p.ano || undefined,
    keywords: (p.stack || []).join(', ') || undefined,
    sameAs: [p.demo, p.repo].filter(Boolean)
  };
  if (tipo === 'SoftwareApplication') {
    obra.applicationCategory = p.grupo === 'rede' ? 'DeveloperApplication' : 'BusinessApplication';
    obra.operatingSystem = /Windows/.test((p.stack || []).join()) ? 'Windows, Web' : 'Web';
  }
  const jsonld = [{
    '@context': 'https://schema.org',
    '@graph': [
      obra,
      pessoaLD(dados, lang),
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Davi Castro', item: DOMINIO + rotas.inicio(lang) },
        { '@type': 'ListItem', position: 2, name: t.todos_projetos, item: DOMINIO + rotas.projetos(lang) },
        { '@type': 'ListItem', position: 3, name: titulo, item: DOMINIO + caminho }
      ] }
    ]
  }];

  return documento({ ...ctx, pagina: 'projeto', alternativa: caminhoAlt }, {
    titulo: `${titulo} — ${c(p, 'tagline', lang)} · Davi Castro`.slice(0, 120),
    descricao, caminho, caminhoAlt,
    ogImagem: `/assets/og/${lang === 'en' ? 'en-' : ''}${p.id}.png`, ogTipo: 'article',
    jsonld, corpo, classe: 'pagina-projeto'
  });
}
