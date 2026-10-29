// Pedido (/pedido/ e /en/order/): o briefing guiado. O cliente escolhe a análise rápida ou a completa,
// e cada resposta monta, ao vivo, a maquete do projeto dele numa tela igual às da parede da home.
// As perguntas moram em assets/js/pedido.js; aqui fica a casca da página, o SEO e o caminho sem JavaScript.
import { esc, icone, rotas, documento, pessoaLD, DOMINIO } from './comum.mjs';

const X = {
  pt: {
    titulo: 'Vamos montar o seu projeto', rotulo: 'pedido',
    lead: 'Responda do seu jeito e veja o projeto tomando forma enquanto responde. No fim, sai um pedido completo, pronto para eu ler e te responder.',
    seo: 'Peça um site, loja virtual, sistema ou app para Davi Castro, desenvolvedor full stack: um briefing guiado, rápido ou completo, que monta a maquete do seu projeto enquanto você responde.',
    maquete: 'Prévia do seu projeto', ficha: 'Ficha do pedido',
    semjs: 'Esta página precisa de JavaScript para montar o pedido. Sem problema: me conte o que você precisa por um destes canais.',
    whats: 'Falar no WhatsApp', whats_msg: 'Oi, Davi! Quero fazer um pedido de projeto.', email: 'Mandar um e-mail'
  },
  en: {
    titulo: 'Let’s shape your project', rotulo: 'order',
    lead: 'Answer your way and watch the project take shape as you go. At the end you get a complete brief, ready for me to read and reply to.',
    seo: 'Order a website, online store, web system or app from Davi Castro, full-stack developer: a guided brief, quick or complete, that builds a mockup of your project as you answer.',
    maquete: 'Your project preview', ficha: 'Brief summary',
    semjs: 'This page needs JavaScript to build the brief. No problem: tell me what you need through one of these channels.',
    whats: 'Message me on WhatsApp', whats_msg: 'Hi Davi! I’d like to start a project.', email: 'Send an email'
  }
};

export function paginaPedido(ctx, cfg = {}) {
  const { dados, lang } = ctx;
  const x = X[lang];
  const caminho = rotas.pedido(lang);
  const caminhoAlt = rotas.pedido(lang === 'en' ? 'pt' : 'en');
  const ct = id => (dados.contatos || []).find(k => k.id === id) || {};
  const whats = ct('ct-whatsapp').url || '';
  const email = (ct('ct-email').valor && /@/.test(ct('ct-email').valor)) ? ct('ct-email').valor : 'contato@davicjc.com';

  const corpo = `<section class="pedido" aria-labelledby="pedido-titulo" data-pedido>
  <div class="envelope pedido__grade">
    <div class="pedido__fluxo">
      <header class="pedido__cabeca">
        <p class="rotulo secao__num"><a href="${rotas.inicio(lang)}">davi castro</a> / ${x.rotulo}</p>
        <h1 class="pedido__titulo" id="pedido-titulo">${x.titulo}</h1>
        <p class="pedido__lead">${x.lead}</p>
      </header>
      <div class="pedido__palco" data-palco></div>
      <div class="pedido__semjs">
        <p>${x.semjs}</p>
        <div class="pedido__semjs-acoes">
          ${whats ? `<a class="botao botao--sinal" href="${esc(whats)}?text=${encodeURIComponent(x.whats_msg)}" rel="noopener">${icone('whatsapp')}${x.whats}</a>` : ''}
          <a class="botao botao--linha" href="mailto:${esc(email)}">${icone('email')}${x.email}</a>
        </div>
      </div>
    </div>
    <aside class="pedido__lado" aria-label="${x.maquete}">
      <div class="maquete" data-maquete aria-hidden="true"></div>
      <div class="ficha" data-ficha aria-label="${x.ficha}"></div>
    </aside>
  </div>
</section>
<script type="application/json" id="pedido-dados">${JSON.stringify({
    lang, whats: whats.replace(/^https:\/\/wa\.me\//, ''), email,
    // A gravação no Firestore só liga depois que as regras de firestore.rules forem publicadas
    // (hoje a leitura do banco é pública e o pedido ficaria visível). Até lá, o envio é por WhatsApp ou e-mail.
    banco: !!cfg.gravar_no_firestore, projeto: 'portfoliopessoal-9aa5b', chave: cfg.chave || '', turnstile: cfg.turnstile || ''
  }).replace(/</g, '\\u003c')}</script>`;

  const jsonld = [{
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: DOMINIO + caminho, name: `${x.titulo} — Davi Castro`, inLanguage: lang === 'en' ? 'en' : 'pt-BR', about: { '@id': DOMINIO + '/#davi' }, potentialAction: { '@type': 'CommunicateAction', name: x.titulo } },
      pessoaLD(dados, lang)
    ]
  }];
  const v = dados._build.versoes;
  return documento({ ...ctx, pagina: 'pedido', alternativa: caminhoAlt }, {
    titulo: `${x.titulo} — Davi Castro`, descricao: x.seo, caminho, caminhoAlt,
    ogImagem: lang === 'en' ? '/assets/og/inicio-en.jpg' : '/assets/og/inicio.jpg', jsonld, corpo, classe: 'pagina-pedido'
  })
    .replace('</head>', `<link rel="stylesheet" href="/assets/css/pedido.css?v=${v.pedido || '1'}">\n</head>`)
    .replace('</body>', `<script type="module" src="/assets/js/pedido.js?v=${v.pedidoJs || '1'}"></script>\n</body>`);
}
