// Depoimento (/depoimento/ e /en/testimonial/): o formulário que cliente ou colega preenche.
// É uma página "só do formulário" (sem menu nem rodapé), para o link mandado pelo painel.
// O envio grava em depoimentos_recebidos; nada aparece no site antes de eu aprovar no /adm.
import { esc, icone, rotas, documento, publicados, c } from './comum.mjs';

const X = {
  pt: {
    titulo: 'Como foi trabalhar comigo?', rotulo: 'depoimento',
    lead: 'Conte em poucas linhas como foi. O depoimento aparece no meu site depois que eu conferir.',
    seo: 'Deixe um depoimento sobre um projeto ou um trabalho feito com Davi Castro, desenvolvedor full stack.',
    semjs: 'Esta página precisa de JavaScript para enviar. Sem problema: mande o seu depoimento por e-mail.',
    email: 'Mandar por e-mail'
  },
  en: {
    titulo: 'How was working with me?', rotulo: 'testimonial',
    lead: 'Tell me in a few lines how it went. Your testimonial shows up on my site after I review it.',
    seo: 'Leave a testimonial about a project or work done with Davi Castro, full-stack developer.',
    semjs: 'This page needs JavaScript to send. No problem: email me your testimonial instead.',
    email: 'Send by email'
  }
};

export function paginaDepoimento(ctx, cfg = {}) {
  const { dados, lang } = ctx;
  const x = X[lang];
  const caminho = rotas.depoimento(lang);
  const caminhoAlt = rotas.depoimento(lang === 'en' ? 'pt' : 'en');
  const email = 'contato@davicjc.com';
  const projetos = publicados(dados.projetos).map(p => c(p, 'titulo', lang)).filter(Boolean);

  const corpo = `<section class="avaliacao" aria-labelledby="avaliacao-titulo" data-avaliacao>
  <div class="envelope avaliacao__coluna">
    <header class="avaliacao__cabeca">
      <p class="rotulo secao__num"><a href="${rotas.inicio(lang)}">davi castro</a> / ${x.rotulo}</p>
      <h1 class="avaliacao__titulo" id="avaliacao-titulo">${x.titulo}</h1>
      <p class="avaliacao__lead">${x.lead}</p>
    </header>
    <div class="avaliacao__palco" data-palco></div>
    <div class="avaliacao__semjs">
      <p>${x.semjs}</p>
      <a class="botao botao--linha" href="mailto:${email}">${icone('email')}${x.email}</a>
    </div>
  </div>
</section>
<script type="application/json" id="avaliacao-dados">${JSON.stringify({
    lang, email, projetos, projeto: 'portfoliopessoal-9aa5b', chave: cfg.chave || '', turnstile: cfg.turnstile || '', inicio: rotas.inicio(lang)
  }).replace(/</g, '\\u003c')}</script>`;

  const v = dados._build.versoes;
  return documento({ ...ctx, pagina: 'depoimento', alternativa: caminhoAlt }, {
    titulo: `${x.titulo} — Davi Castro`, descricao: x.seo, caminho, caminhoAlt,
    ogImagem: lang === 'en' ? '/assets/og/inicio-en.jpg' : '/assets/og/inicio.jpg', corpo, classe: 'pagina-avaliacao'
  })
    // Página de formulário: fora do Google.
    .replace('<meta name="robots" content="index, follow, max-image-preview:large">', '<meta name="robots" content="noindex, follow">')
    .replace('</head>', `<link rel="stylesheet" href="/assets/css/pedido.css?v=${v.pedido || '1'}">\n<link rel="stylesheet" href="/assets/css/depoimento.css?v=${v.depoimento || '1'}">\n</head>`)
    .replace('</body>', `<script type="module" src="/assets/js/depoimento.js?v=${v.depoimentoJs || '1'}"></script>\n</body>`);
}
