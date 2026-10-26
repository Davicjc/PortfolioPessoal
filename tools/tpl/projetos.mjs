// Lista de todos os projetos publicados (/projetos/ e /en/projects/) e a página de erro 404.
import { T, SITUACAO } from './textos.mjs';
import { esc, c, rotas, icone, img, situacao, led, publicados, documento, pessoaLD, DOMINIO } from './comum.mjs';

export function paginaProjetos(ctx) {
  const { dados, lang } = ctx;
  const t = T[lang];
  const lista = publicados(dados.projetos);
  const contagem = lista.reduce((a, p) => ((a[p.situacao || 'no_ar'] = (a[p.situacao || 'no_ar'] || 0) + 1), a), {});
  const caminho = rotas.projetos(lang);
  const caminhoAlt = rotas.projetos(lang === 'en' ? 'pt' : 'en');
  const corpo = `<section class="secao secao--topo" aria-labelledby="lista-titulo">
  <div class="envelope">
    <header class="secao__cabeca">
      <p class="rotulo secao__num"><a href="${rotas.inicio(lang)}">davi castro</a> / ${t.nav_trabalho.toLowerCase()}</p>
      <h1 class="secao__titulo" id="lista-titulo">${t.lista_titulo}</h1>
      <p class="secao__sub">${t.lista_sub(lista.length)}</p>
    </header>
    <div class="filtros" role="group" aria-label="${lang === 'en' ? 'Filter by status' : 'Filtrar por situação'}" data-filtros>
      <button type="button" class="filtro" aria-pressed="true" data-filtro="">${t.todos} <span class="dado">${lista.length}</span></button>
      ${Object.keys(SITUACAO).filter(k => contagem[k]).map(k => `<button type="button" class="filtro" aria-pressed="false" data-filtro="${k}">${led(k)}${SITUACAO[k][lang]} <span class="dado">${contagem[k]}</span></button>`).join('\n      ')}
    </div>
    <ul class="entregas" data-entregas>
      ${lista.map(p => `<li class="entrega" data-situacao-item="${esc(p.situacao || 'no_ar')}">
        <a class="entrega__link" href="${rotas.projeto(lang, p.id)}">
          <span class="entrega__img">${img(dados, p.imagem, '', { sizes: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw' })}</span>
          <span class="caso__meta">${situacao(p, lang, { ativo: false })}<span class="rotulo">${esc(p.ano || '')}${p.caso ? ` · ${t.caso}` : ''}</span></span>
          <span class="entrega__titulo">${esc(c(p, 'titulo', lang))}</span>
          <span class="entrega__cliente">${esc(p.cliente && p.origem !== 'pessoal' ? p.cliente : t.origem[p.origem] || '')}</span>
          <span class="entrega__tagline">${esc(c(p, 'tagline', lang))}</span>
        </a>
      </li>`).join('\n      ')}
    </ul>
  </div>
</section>`;
  const jsonld = [{
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', url: DOMINIO + caminho, name: `${t.lista_titulo} — Davi Castro`, inLanguage: t.lang, about: { '@id': DOMINIO + '/#davi' },
        mainEntity: { '@type': 'ItemList', numberOfItems: lista.length, itemListElement: lista.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: DOMINIO + rotas.projeto(lang, p.id), name: c(p, 'titulo', lang) })) } },
      pessoaLD(dados, lang)
    ]
  }];
  return documento({ ...ctx, pagina: 'projetos', alternativa: caminhoAlt }, {
    titulo: `${t.lista_titulo} — Davi Castro`, descricao: t.lista_sub(lista.length) + ' ' + c(dados.site, 'seo_descricao', lang),
    caminho, caminhoAlt, ogImagem: lang === 'en' ? '/assets/og/inicio-en.png' : '/assets/og/inicio.png', jsonld, corpo, classe: 'pagina-lista'
  });
}

export function paginaErro(ctx) {
  const { lang } = ctx;
  const t = T[lang];
  const corpo = `<section class="erro envelope" aria-labelledby="erro-titulo">
  <p class="rotulo erro__codigo">${led('alarme')}HTTP 404 · ${lang === 'en' ? 'no route to host' : 'sem rota para o destino'}</p>
  <h1 id="erro-titulo" class="erro__titulo">${t.erro_titulo}</h1>
  <p class="secao__sub">${t.erro_texto}</p>
  <div class="hero__acoes">
    <a class="botao botao--sinal" href="${rotas.inicio(lang)}">${t.voltar_inicio}${icone('seta')}</a>
    <a class="botao botao--linha" href="${rotas.projetos(lang)}">${t.todos_projetos}</a>
  </div>
</section>`;
  const html = documento({ ...ctx, pagina: 'erro', alternativa: rotas.inicio(lang === 'en' ? 'pt' : 'en') }, {
    titulo: `404 — ${t.erro_titulo} · Davi Castro`, descricao: t.erro_texto,
    caminho: '/404', caminhoAlt: '/404', corpo, classe: 'pagina-erro'
  });
  // 404 não deve ser indexada nem ter canonical/hreflang apontando para ela mesma.
  return html.replace(/<link rel="(canonical|alternate)"[^>]*>\n/g, '').replace('index, follow, max-image-preview:large', 'noindex');
}
