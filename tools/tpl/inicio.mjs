// Página inicial (PT em /, EN em /en/).
import { T, SITUACAO } from './textos.mjs';
import { esc, c, v, rotas, icone, img, situacao, led, publicados, documento, pessoaLD, caminhoImg, DOMINIO, linkCv, baixaCv } from './comum.mjs';

const dominio = url => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return ''; } };
const PLAY_STORE = 'https://play.google.com/store/apps/dev?id=7777556041006462891';

// Título com cada palavra num <span>: o pacote passa por baixo e acende uma de cada vez.
const palavras = texto => esc(texto).split(' ').map((p, i) => `<span class="palavra" style="--i:${i}">${p}</span>`).join(' ');

// A parede de produção: telas reais dos sistemas, numa parede em perspectiva. Na entrada elas
// ligam uma a uma (como os monitores de uma sala de controle); as que têm sonda só ligam
// quando o sistema responde ao ping feito pelo navegador de quem visita.
function parede(ctx) {
  const { dados } = ctx;
  const telas = dados.site.parede || [];
  return `<div class="parede" aria-hidden="true" data-parede>
      <div class="parede__plano" data-plano>
        ${telas.map((x, i) => {
          const imagens = [x.src, ...(x.alt || [])].map(caminhoImg);
          const meta = dados._imgs?.[imagens[0]] || {};
          // Telas grandes na perspectiva pedem a versão de 1200 px; o celular fica com a de 800.
          const menor = imagens[0].replace('-1200', '-800');
          const srcset = menor !== imagens[0] && dados._imgs?.[menor] ? ` srcset="${menor} 800w, ${imagens[0]} 1200w" sizes="(max-width: 899px) 300px, 1100px"` : '';
          return `<figure class="tela" style="--i:${i}" data-imagens="${esc(imagens.join('|'))}"${x.sonda ? ` data-sonda="${esc(x.sonda)}"` : ''}>
          <div class="tela__barra"><span class="tela__led"></span><span class="tela__nome">${esc(x.nome)}</span><span class="tela__ms" data-ms></span></div>
          <div class="tela__vidro"><img src="${imagens[0]}"${srcset}${meta.w ? ` width="${meta.w}" height="${meta.h}"` : ''} alt="" loading="${i < 12 ? 'eager' : 'lazy'}" decoding="async"${i === 5 ? ' fetchpriority="high"' : ''}></div>
        </figure>`;
        }).join('\n        ')}
      </div>
    </div>`;
}

function hero(ctx) {
  const { dados, lang, t } = ctx;
  const s = dados.site;
  return `<section class="hero" aria-labelledby="hero-titulo">
  <div class="parede__mascara" aria-hidden="true"></div>
  <div class="envelope hero__texto">
    <p class="hero__kicker rotulo">
      <span class="hero__estado">${led('no_ar')}${t.em_producao}</span>
      <span>Uberlândia, MG · <span data-relogio>UTC−3</span></span>
    </p>
    <h1 id="hero-titulo" class="hero__titulo">${palavras(c(s, 'titulo', lang))}</h1>
    <p class="hero__cargo"><span>${esc(c(s, 'cargo', lang))}</span>${s.empresa ? `<span class="hero__sep" aria-hidden="true"> · </span><span>${esc(s.empresa)}</span>` : ''}</p>
    ${parede(ctx)}
    <div class="hero__base">
      <p class="hero__lead">${esc(c(s, 'lead', lang))}</p>
      <a class="hero__simular" href="${rotas.pedido(lang)}">
        <span class="hero__simular-txt"><span class="hero__simular-nome">${t.simular}</span><span class="hero__simular-sub"><span class="txt-longo">${t.simular_sub}</span><span class="txt-curto">${t.simular_sub_curto}</span></span></span>
        <span class="hero__simular-ir">${icone('seta')}</span>
      </a>
      <div class="hero__acoes">
        <a class="botao botao--linha" href="#trabalho"><span class="txt-longo">${t.ver_casos}</span><span class="txt-curto">${t.ver_casos_curto}</span>${icone('seta')}</a>
        <a class="botao botao--linha" href="${linkCv(dados, lang)}"${baixaCv(dados, lang)}>${t.cv_pdf}${icone('baixo')}</a>
        <span class="hero__redes">${[['ct-github', 'github', 'GitHub'], ['ct-linkedin', 'linkedin', 'LinkedIn'], ['ct-googleplay', 'googleplay', t.google_play, PLAY_STORE]].map(([id, ic, nome, padrao]) => {
          // A Google Play ainda não está no painel: com um contato ct-googleplay lá, ele passa a valer.
          const url = (dados.contatos || []).find(x => x.id === id)?.url || padrao;
          return url ? `<a class="hero__rede" href="${esc(url)}" rel="me noopener" aria-label="${esc(nome)}" title="${esc(nome)}">${icone(ic)}</a>` : '';
        }).join('')}<a class="hero__cafe" href="${rotas.cafe(lang)}" aria-label="${t.rodape_cafe}" title="${t.rodape_cafe}">${icone('cafe')}<span>${t.rodape_cafe}</span></a></span>
      </div>
    </div>
  </div>
</section>`;
}

function provas(ctx) {
  const { dados, lang } = ctx;
  const lista = dados.site.provas || [];
  return `<section class="provas" aria-label="${lang === 'en' ? 'In numbers' : 'Em números'}">
  <div class="envelope">
    <dl class="provas__grade">
      ${lista.map(p => `<div class="prova"><dt class="prova__rotulo">${esc(c(p, 'rotulo', lang))}</dt><dd class="prova__valor" data-contar>${esc(v(p, lang))}</dd></div>`).join('\n      ')}
    </dl>
  </div>
</section>`;
}

function cabecaSecao({ numero, titulo, sub, id }) {
  return `<header class="secao__cabeca">
    <p class="rotulo secao__num">${numero}</p>
    <h2 class="secao__titulo" id="${id}-titulo">${esc(titulo)}</h2>
    ${sub ? `<p class="secao__sub">${esc(sub)}</p>` : ''}
  </header>`;
}

function metricas(lista, lang, classe = 'metricas') {
  if (!lista?.length) return '';
  return `<dl class="${classe}">${lista.map(m => `<div><dt>${esc(c(m, 'rotulo', lang))}</dt><dd>${esc(v(m, lang))}</dd></div>`).join('')}</dl>`;
}

const pilha = (stack, n = 6) => (stack || []).length
  ? `<ul class="pilha" aria-label="Stack">${stack.slice(0, n).map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '';

// Janela de navegador desenhada em CSS; com galeria, vira um carrossel com legenda.
export function janela(dados, p, lang, { prioridade = false, sizes = '(min-width: 1024px) 58vw, 100vw' } = {}) {
  const host = dominio(p.demo) || (p.repo ? 'github.com/Davicjc' : 'davicjc.com');
  const galeria = (p.galeria || []).filter(g => g && (g.src || typeof g === 'string'));
  const quadros = galeria.length
    ? galeria.map((g, i) => {
        const src = typeof g === 'string' ? g : g.src;
        const leg = typeof g === 'string' ? '' : c(g, 'legenda', lang);
        // Só a primeira tela vem com src: as outras ficam empilhadas no mesmo lugar e o navegador baixaria
        // todas de uma vez. O site.js preenche cada uma pouco antes de o carrossel chegar nela.
        let tag = img(dados, src, `${c(p, 'titulo', lang)} — ${leg}`, { sizes, carregar: i === 0 && prioridade ? 'eager' : 'lazy', prioridade: i === 0 && prioridade });
        if (i > 0) tag = tag.replace(' src="', ' data-src="').replace(' srcset="', ' data-srcset="');
        return `<figure class="janela__quadro${i === 0 ? ' ativo' : ''}" data-legenda="${esc(leg)}">${tag}</figure>`;
      }).join('')
    : `<figure class="janela__quadro ativo">${img(dados, p.imagem, c(p, 'titulo', lang), { sizes, carregar: prioridade ? 'eager' : 'lazy', prioridade })}</figure>`;
  const primeira = galeria[0] && typeof galeria[0] !== 'string' ? c(galeria[0], 'legenda', lang) : '';
  // A moldura tem a proporção da própria tela (16:9 no NexusAtlas, 16:10 nos outros): a imagem aparece inteira.
  const src0 = galeria.length ? (typeof galeria[0] === 'string' ? galeria[0] : galeria[0].src) : p.imagem;
  const medidas = dados._imgs?.[caminhoImg(src0)];
  const proporcao = medidas?.w ? ` style="--proporcao: ${medidas.w} / ${medidas.h}"` : '';
  const moldura = `<div class="janela${galeria.length > 1 ? ' janela--carrossel' : ''}"${galeria.length > 1 ? ' data-carrossel' : ''}>
    <div class="janela__barra"><span class="janela__url">${p.demo ? icone('cadeado', 'ic ic--mini') : ''}${esc(host)}</span>${galeria.length > 1 ? `<span class="janela__legenda rotulo" data-legenda-atual aria-live="polite">${esc(primeira)}</span>` : ''}</div>
    <div class="janela__tela"${proporcao}>${quadros}</div>
  </div>`;
  if (!p.celular) return moldura;
  // O telefone fica fora da janela: sobreposto no canto em telas largas, embaixo e centralizado no celular.
  const celular = `<div class="celular">${img(dados, p.celular, `${c(p, 'titulo', lang)} — ${lang === 'en' ? 'on a phone' : 'no celular'}`, { sizes: '(min-width: 640px) 16vw, 50vw' })}</div>`;
  return `<div class="vitrine">${moldura}${celular}</div>`;
}

function casoGrande(ctx, p, i) {
  const { dados, lang, t } = ctx;
  return `<article class="caso" data-caso="${esc(p.id)}">
  <span class="caso__n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
  <div class="caso__texto">
    <p class="caso__meta">${situacao(p, lang)}<span class="rotulo">${esc(c(p, 'periodo', lang) || p.ano || '')}</span></p>
    <h3 class="caso__titulo"><a href="${rotas.projeto(lang, p.id)}">${esc(c(p, 'titulo', lang))}</a></h3>
    <p class="caso__tagline">${esc(c(p, 'tagline', lang))}</p>
    ${metricas(p.metricas, lang)}
    ${pilha(p.stack)}
    <a class="link-seta" href="${rotas.projeto(lang, p.id)}">${t.ler_caso}${icone('seta')}</a>
  </div>
  <div class="caso__visual">${janela(dados, p, lang, { prioridade: i === 0 })}</div>
</article>`;
}

function trioRede(ctx, lista) {
  const { dados, lang, t } = ctx;
  if (!lista.length) return '';
  return `<div class="rede">
  <div class="rede__cabeca">
    <h3 class="rede__titulo">${esc(t.rede_titulo)}</h3>
    <p class="rede__sub">${esc(t.rede_sub)}</p>
  </div>
  <div class="rede__grade">
    ${lista.map(p => `<article class="rede__item">
      <a class="rede__img" href="${rotas.projeto(lang, p.id)}" tabindex="-1" aria-hidden="true">${img(dados, p.imagem, '', { sizes: '(min-width: 1024px) 30vw, 100vw' })}</a>
      <p class="caso__meta">${situacao(p, lang, { ativo: false })}<span class="rotulo">${esc(p.ano || '')}</span></p>
      <h4 class="rede__nome"><a href="${rotas.projeto(lang, p.id)}">${esc(c(p, 'titulo', lang))}</a></h4>
      <p class="rede__tagline">${esc(c(p, 'tagline', lang))}</p>
      ${p.metricas?.[0] ? `<p class="rede__metrica"><strong>${esc(v(p.metricas[0], lang))}</strong> ${esc(c(p.metricas[0], 'rotulo', lang))}</p>` : ''}
      <a class="link-seta" href="${rotas.projeto(lang, p.id)}">${t.ler_caso}${icone('seta')}</a>
    </article>`).join('\n    ')}
  </div>
</div>`;
}

function casoMedio(ctx, p) {
  const { dados, lang, t } = ctx;
  return `<article class="medio">
  <a class="medio__img" href="${rotas.projeto(lang, p.id)}" tabindex="-1" aria-hidden="true">${img(dados, p.imagem, '', { sizes: '(min-width: 1024px) 30vw, 100vw' })}</a>
  <p class="caso__meta">${situacao(p, lang, { ativo: false })}<span class="rotulo">${esc(p.ano || '')}</span></p>
  <h3 class="medio__titulo"><a href="${rotas.projeto(lang, p.id)}">${esc(c(p, 'titulo', lang))}</a></h3>
  <p class="medio__tagline">${esc(c(p, 'tagline', lang))}</p>
  ${metricas((p.metricas || []).slice(0, 2), lang, 'metricas metricas--duas')}
  <a class="link-seta" href="${rotas.projeto(lang, p.id)}">${t.ler_caso}${icone('seta')}</a>
</article>`;
}

function trabalho(ctx) {
  const { dados, lang, t } = ctx;
  const s = dados.site;
  const casos = publicados(dados.projetos).filter(p => p.caso);
  const rede = casos.filter(p => p.grupo === 'rede');
  const resto = casos.filter(p => p.grupo !== 'rede');
  const grandes = resto.slice(0, 2);
  const medios = resto.slice(2);
  return `<section id="trabalho" class="secao" aria-labelledby="trabalho-titulo">
  <div class="envelope">
    ${cabecaSecao({ numero: '01', id: 'trabalho', titulo: c(s, 'trabalhos_titulo', lang) || t.nav_destaques, sub: c(s, 'trabalhos_sub', lang) })}
    <div class="barramento" data-barramento>
      <span class="barramento__pacote" aria-hidden="true"></span>
      ${grandes.map((p, i) => casoGrande(ctx, p, i)).join('\n')}
      ${trioRede(ctx, rede)}
      ${medios.length ? `<div class="medios"><h3 class="rotulo medios__titulo">${esc(c(s, 'medios_titulo', lang) || t.mais_casos)}</h3><div class="medios__grade">${medios.map(p => casoMedio(ctx, p)).join('\n')}</div></div>` : ''}
    </div>
  </div>
</section>`;
}

function entregas(ctx) {
  const { dados, lang, t } = ctx;
  const s = dados.site;
  const lista = publicados(dados.projetos).filter(p => !p.caso);
  const contagem = lista.reduce((a, p) => ((a[p.situacao || 'no_ar'] = (a[p.situacao || 'no_ar'] || 0) + 1), a), {});
  const filtros = Object.keys(SITUACAO).filter(k => contagem[k]);
  const VISIVEIS = 9;
  return `<section id="entregas" class="secao secao--faixa" aria-labelledby="entregas-titulo">
  <div class="envelope">
    ${cabecaSecao({ numero: '02', id: 'entregas', titulo: c(s, 'entregas_titulo', lang), sub: c(s, 'entregas_sub', lang) })}
    <div class="filtros" role="group" aria-label="${lang === 'en' ? 'Filter by status' : 'Filtrar por situação'}" data-filtros>
      <button type="button" class="filtro" aria-pressed="true" data-filtro="">${t.todos} <span class="dado">${lista.length}</span></button>
      ${filtros.map(k => `<button type="button" class="filtro" aria-pressed="false" data-filtro="${k}">${led(k)}${SITUACAO[k][lang]} <span class="dado">${contagem[k]}</span></button>`).join('\n      ')}
    </div>
    <ul class="entregas" data-entregas>
      ${lista.map((p, i) => `<li class="entrega" data-situacao-item="${esc(p.situacao || 'no_ar')}"${i >= VISIVEIS ? ' data-extra' : ''}>
        <a class="entrega__link" href="${rotas.projeto(lang, p.id)}">
          <span class="entrega__img">${img(dados, p.imagem, '', { sizes: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw' })}</span>
          <span class="caso__meta">${situacao(p, lang, { ativo: false })}<span class="rotulo">${esc(p.ano || '')}</span></span>
          <span class="entrega__titulo">${esc(c(p, 'titulo', lang))}</span>
          <span class="entrega__cliente">${esc(p.cliente && p.origem !== 'pessoal' ? p.cliente : t.origem[p.origem] || '')}</span>
          <span class="entrega__tagline">${esc(c(p, 'tagline', lang))}</span>
        </a>
      </li>`).join('\n      ')}
    </ul>
    ${lista.length > VISIVEIS ? `<button type="button" class="botao botao--linha entregas__mais" data-mais hidden>${t.mais(lista.length - VISIVEIS)}${icone('baixo')}</button>` : ''}
  </div>
</section>`;
}

function principios(ctx) {
  const { dados, lang, t } = ctx;
  const lista = dados.site.principios || [];
  if (!lista.length) return '';
  return `<section id="como-trabalho" class="secao" aria-labelledby="como-titulo">
  <div class="envelope">
    ${cabecaSecao({ numero: '03', id: 'como', titulo: c(dados.site, 'principios_titulo', lang) || t.nav_trabalho })}
    <ol class="principios">
      ${lista.map((p, i) => `<li class="principio"><span class="principio__num dado">${String(i + 1).padStart(2, '0')}</span><h3>${esc(c(p, 'titulo', lang))}</h3><p>${esc(c(p, 'texto', lang))}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>`;
}

function trajetoria(ctx) {
  const { dados, lang, t } = ctx;
  const s = dados.site;
  const exps = publicados(dados.experiencias);
  const certs = publicados(dados.certificados);
  const emissores = Object.entries(certs.reduce((a, x) => ((a[x.emissor] = (a[x.emissor] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]);
  const contatos = dados.contatos || [];
  const orcid = s.orcid;
  return `<section id="trajetoria" class="secao secao--faixa" aria-labelledby="trajetoria-titulo">
  <div class="envelope">
    ${cabecaSecao({ numero: '04', id: 'trajetoria', titulo: c(s, 'trajetoria_titulo', lang), sub: c(s, 'trajetoria_sub', lang) })}
    <div class="trajetoria">
      <aside class="perfil">
        <img class="perfil__foto" src="/fotos/me/me.jpg" width="200" height="200" alt="Davi Castro" loading="lazy" decoding="async">
        <p class="perfil__nome">Davi Castro</p>
        <p class="perfil__cargo">${esc(c(s, 'cargo', lang))}</p>
        <dl class="perfil__dados">
          <div><dt class="rotulo">${t.formacao}</dt><dd>${esc(c(s, 'formatura', lang))}</dd></div>
          <div><dt class="rotulo">${lang === 'en' ? 'Languages' : 'Idiomas'}</dt><dd>${lang === 'en' ? 'Portuguese (native) · English (advanced)' : 'Português (nativo) · Inglês (avançado)'}</dd></div>
          ${orcid ? `<div><dt class="rotulo">ORCID</dt><dd><a class="link" href="https://orcid.org/${esc(orcid)}" rel="me">${esc(orcid)}</a></dd></div>` : ''}
        </dl>
        <div class="perfil__acoes">
          <a class="botao botao--linha botao--pequeno" href="${linkCv(dados, 'pt')}"${baixaCv(dados, 'pt')}>${t.cv_pt}${icone('baixo')}</a>
          <a class="botao botao--linha botao--pequeno" href="${linkCv(dados, 'en')}"${baixaCv(dados, 'en')}>${t.cv_en}${icone('baixo')}</a>
        </div>
      </aside>
      <ol class="linha-tempo">
        ${exps.map(e => `<li class="marco${e.atual ? ' marco--atual' : ''}${e.tipo === 'formacao' ? ' marco--formacao' : ''}">
          <p class="marco__periodo rotulo">${e.atual ? led('no_ar') : ''}${esc(c(e, 'periodo', lang))}</p>
          <div class="marco__corpo">
            ${e.tipo === 'formacao' ? `<p class="rotulo marco__tipo">${t.formacao}</p>` : ''}
            <h3 class="marco__empresa">${esc(c(e, 'empresa', lang))}</h3>
            <p class="marco__cargo">${esc(c(e, 'cargo', lang))}</p>
            ${c(e, 'area', lang) ? `<p class="marco__area">${esc(c(e, 'area', lang))}</p>` : ''}
            ${c(e, 'descricao', lang) ? `<p class="marco__texto">${esc(c(e, 'descricao', lang))}</p>` : ''}
            ${c(e, 'progressao', lang) ? `<p class="marco__progressao dado">${esc(c(e, 'progressao', lang))}</p>` : ''}
          </div>
        </li>`).join('\n        ')}
      </ol>
    </div>
    <details class="certificados">
      <summary><span class="certificados__titulo">${t.certificados}</span><span class="certificados__sub">${t.certificados_sub(certs.length)}</span><span class="certificados__emissores rotulo">${emissores.map(([e, n]) => `${esc(e)} ${n}`).join(' · ')}</span></summary>
      <ul class="certificados__lista">
        ${certs.map(x => `<li><span class="rotulo">${esc(x.emissor)}</span><span>${esc(c(x, 'titulo', lang))}</span><span class="certificados__links">${(x.links || []).map(l => `<a class="link" href="${esc(caminhoImg(l.url))}">${l.label === 'validar' ? (lang === 'en' ? 'verify' : 'validar') : 'pdf'}</a>`).join(' ')}</span></li>`).join('\n        ')}
      </ul>
    </details>
  </div>
</section>`;
}

function depoimentos(ctx) {
  const { dados, lang, t } = ctx;
  const lista = publicados(dados.depoimentos);
  if (!lista.length) return '';
  const destaque = lista.reduce((a, b) => (c(b, 'texto', lang).length > c(a, 'texto', lang).length ? b : a));
  const outros = lista.filter(d => d !== destaque);
  const pessoa = d => `<footer class="pessoa">
      ${d.foto ? `<img class="pessoa__foto" src="${esc(caminhoImg(d.foto))}" width="44" height="44" alt="" loading="lazy" decoding="async">` : ''}
      <span><strong>${d.linkedin ? `<a href="${esc(d.linkedin)}" rel="noopener">${esc(d.nome.trim())}</a>` : esc(d.nome.trim())}</strong><span>${esc(c(d, 'cargo', lang))}${d.projeto_vinculado ? ` · ${t.sobre_projeto} ${esc(d.projeto_vinculado)}` : ''}</span></span>
    </footer>`;
  return `<section id="depoimentos" class="secao" aria-labelledby="depoimentos-titulo">
  <div class="envelope">
    ${cabecaSecao({ numero: '05', id: 'depoimentos', titulo: c(dados.site, 'depoimentos_titulo', lang) || t.depoimentos })}
    <figure class="depoimento depoimento--destaque">
      <blockquote><p>${esc(c(destaque, 'texto', lang))}</p></blockquote>
      <figcaption>${pessoa(destaque)}</figcaption>
    </figure>
    <div class="depoimentos">
      ${outros.map(d => `<figure class="depoimento"><blockquote><p>${esc(c(d, 'texto', lang))}</p></blockquote><figcaption>${pessoa(d)}</figcaption></figure>`).join('\n      ')}
    </div>
    <div class="depoimentos__convite">
      <p>${t.dep_convite}</p>
      <a class="botao botao--linha" href="${rotas.depoimento(lang)}">${t.dep_botao}${icone('seta')}</a>
    </div>
  </div>
</section>`;
}

function contato(ctx) {
  const { dados, lang, t } = ctx;
  const s = dados.site;
  const contatos = publicados(dados.contatos);
  const email = contatos.find(x => /^mailto:/.test(x.url || '')) || { valor: 'contato@davicjc.com', url: 'mailto:contato@davicjc.com' };
  const icones = { 'ct-whatsapp': 'whatsapp', 'ct-linkedin': 'linkedin', 'ct-github': 'github', 'ct-orcid': 'orcid' };
  const outros = contatos.filter(x => x !== email);
  return `<section id="contato" class="secao contato" aria-labelledby="contato-titulo">
  <div class="envelope">
    <p class="rotulo secao__num">06</p>
    <h2 class="contato__titulo" id="contato-titulo">${esc(c(s, 'contato_titulo', lang))}</h2>
    <p class="secao__sub">${esc(c(s, 'contato_sub', lang))}</p>
    <a class="contato__pedido" href="${rotas.pedido(lang)}">
      <span class="rotulo">${t.pedido_rotulo}</span>
      <span class="contato__pedido-titulo">${t.pedido_titulo}</span>
      <span class="contato__pedido-txt">${t.pedido_txt}</span>
      <span class="contato__pedido-ir">${icone('seta')}</span>
    </a>
    <div class="contato__email">
      <a class="contato__endereco" href="${esc(email.url)}">${esc(email.valor)}${icone('diagonal')}</a>
      <button type="button" class="botao botao--linha botao--pequeno" data-copiar="${esc(email.valor)}" data-copiado="${esc(t.copiado)}">${icone('copiar')}<span>${t.copiar}</span></button>
    </div>
    <ul class="contato__canais" aria-label="${t.outros_canais}">
      ${outros.map(x => `<li><a href="${esc(x.url)}" rel="${/orcid|github|linkedin/.test(x.url) ? 'me noopener' : 'noopener'}">${icone(icones[x.id] || 'diagonal')}<span class="rotulo">${esc(c(x, 'rotulo', lang))}</span><span>${esc(x.valor)}</span></a></li>`).join('\n      ')}
    </ul>
  </div>
</section>`;
}

export function paginaInicio(ctx) {
  const { dados, lang } = ctx;
  const s = dados.site;
  const caminho = rotas.inicio(lang);
  const caminhoAlt = rotas.inicio(lang === 'en' ? 'pt' : 'en');
  const corpo = [hero, provas, trabalho, entregas, principios, trajetoria, depoimentos, contato].map(f => f(ctx)).join('\n');
  const pessoa = pessoaLD(dados, lang);
  const jsonld = [{
    '@context': 'https://schema.org',
    '@graph': [
      pessoa,
      { '@type': 'WebSite', '@id': DOMINIO + '/#site', url: DOMINIO + '/', name: 'Davi Castro', alternateName: 'davicjc', inLanguage: ['pt-BR', 'en'], publisher: { '@id': DOMINIO + '/#davi' } },
      { '@type': 'ProfilePage', '@id': DOMINIO + caminho + '#pagina', url: DOMINIO + caminho, name: c(s, 'seo_titulo', lang), inLanguage: T[lang].lang, isPartOf: { '@id': DOMINIO + '/#site' }, mainEntity: { '@id': DOMINIO + '/#davi' }, dateModified: dados._build.ts }
    ]
  }];
  return documento({ ...ctx, pagina: 'inicio', alternativa: caminhoAlt }, {
    titulo: c(s, 'seo_titulo', lang), descricao: c(s, 'seo_descricao', lang),
    caminho, caminhoAlt, ogImagem: lang === 'en' ? '/assets/og/inicio-en.jpg' : '/assets/og/inicio.jpg', ogTipo: 'profile',
    jsonld, corpo, classe: 'pagina-inicio'
  });
}
