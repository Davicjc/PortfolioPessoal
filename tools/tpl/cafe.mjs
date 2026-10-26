// Me pague um café (/coffee/ e /en/coffee/). Só meios de pagamento configurados de verdade, vindos de data/cafe.json.
// Os QR Codes saem prontos no HTML (funcionam sem JavaScript); o assets/js/cafe.js troca o valor do PIX e a rede.
import { esc, icone, rotas, documento, pessoaLD, DOMINIO } from './comum.mjs';
import { pixPayload, qrSvg } from '../../assets/js/qr.js';

const X = {
  pt: {
    titulo: 'Me pague um café', rotulo: 'café',
    lead: 'Se algum projeto meu te ajudou, um café me ajuda a manter os outros no ar. Sem cadastro: escolha o jeito mais fácil para você.',
    seo: 'Apoie os projetos de Davi Castro com um café: Pix, PayPal (cartão, de qualquer país) ou cripto pela carteira Phantom.',
    abas: { pix: 'Pix', paypal: 'PayPal', cripto: 'Cripto' },
    valor: 'Valor', outro: 'Outro valor', reais: 'R$',
    copiar_codigo: 'Copiar o Pix copia e cola', copiar_chave: 'Copiar a chave', copiado: 'Copiado',
    chave: 'Chave Pix', codigo: 'Pix copia e cola',
    qr_legenda: 'Aponte a câmera do app do banco',
    pix_nota: 'No celular, copie o código e cole na área Pix do app do seu banco. O código é gerado no seu navegador, com o valor escolhido; confira o destinatário antes de confirmar.',
    paypal_texto: 'Cartão de crédito ou saldo PayPal, de qualquer país. Você escolhe o valor na página do PayPal, em reais.',
    paypal_botao: 'Doar pelo PayPal',
    cripto_texto: 'Carteira Phantom. Envie só pela rede indicada: o que vai pela rede errada não volta.',
    rede: 'Rede', endereco: 'Endereço', copiar_endereco: 'Copiar o endereço',
    depois_titulo: 'Mandou um café?',
    depois_texto: 'Se quiser, me avise. Eu respondo e agradeço pessoalmente.',
    whats: 'Avisar no WhatsApp', whats_msg: 'Oi, Davi! Te mandei um café ☕', email: 'Mandar um e-mail'
  },
  en: {
    titulo: 'Buy me a coffee', rotulo: 'coffee',
    lead: 'If something I built helped you, a coffee helps me keep the rest running. No sign-up: pick whatever is easiest for you.',
    seo: 'Support Davi Castro’s projects with a coffee: PayPal (any card, any country), Pix in Brazil, or crypto through a Phantom wallet.',
    abas: { pix: 'Pix', paypal: 'PayPal', cripto: 'Crypto' },
    pix_intro: 'For people in Brazil: Pix is the instant payment built into every Brazilian bank app.',
    valor: 'Amount', outro: 'Other amount', reais: 'R$',
    copiar_codigo: 'Copy the Pix code', copiar_chave: 'Copy the key', copiado: 'Copied',
    chave: 'Pix key', codigo: 'Pix copy-and-paste code',
    qr_legenda: 'Scan it with your banking app',
    pix_nota: 'On a phone, copy the code and paste it in your bank app’s Pix area. The code is generated in your browser with the amount you picked; check the recipient before confirming.',
    paypal_texto: 'Credit card or PayPal balance, from any country. You choose the amount on PayPal’s page (charged in BRL).',
    paypal_botao: 'Donate with PayPal',
    cripto_texto: 'Phantom wallet. Send only on the network shown: funds sent on the wrong network can’t be recovered.',
    rede: 'Network', endereco: 'Address', copiar_endereco: 'Copy the address',
    depois_titulo: 'Sent a coffee?',
    depois_texto: 'Let me know if you like. I’ll reply and thank you personally.',
    whats: 'Tell me on WhatsApp', whats_msg: 'Hi Davi! I sent you a coffee ☕', email: 'Send an email'
  }
};

const brl = (v, lang) => v.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });

export function paginaCafe(ctx, cafe) {
  const { dados, lang } = ctx;
  const x = X[lang];
  const caminho = rotas.cafe(lang);
  const caminhoAlt = rotas.cafe(lang === 'en' ? 'pt' : 'en');
  const padrao = (cafe.doses.find(d => d.padrao) || cafe.doses[0]).valor;
  const codigo = pixPayload({ ...cafe.pix, valor: padrao });
  const carteira = cafe.carteiras[0];
  const ct = id => (dados.contatos || []).find(k => k.id === id) || {};
  const whats = ct('ct-whatsapp').url;
  const email = ct('ct-email');
  // Em inglês o PayPal vem primeiro: quem lê de fora quase nunca tem Pix.
  const ordem = lang === 'en' ? ['paypal', 'pix', 'cripto'] : ['pix', 'paypal', 'cripto'];

  const painelPix = `${x.pix_intro ? `<p class="pix__intro">${x.pix_intro}</p>` : ''}<div class="pix">
      <fieldset class="doses">
        <legend class="rotulo">${x.valor}</legend>
        ${cafe.doses.map(d => `<label class="dose"><input type="radio" name="dose" value="${d.valor}"${d.valor === padrao ? ' checked' : ''}><span class="dose__nome">${esc(d[lang])}</span><span class="dose__valor dado">${x.reais} ${brl(d.valor, lang)}</span></label>`).join('')}
        <label class="dose dose--outro"><input type="radio" name="dose" value="outro"><span class="dose__nome">${x.outro}</span><span class="dose__campo"><span class="dado">${x.reais}</span><input type="text" inputmode="decimal" autocomplete="off" maxlength="9" placeholder="25,00" aria-label="${x.outro}" data-outro></span></label>
      </fieldset>
      <div class="pix__acoes">
        <button type="button" class="botao botao--sinal" data-copiar="#pix-codigo" data-feito="${x.copiado}">${icone('copiar')}${x.copiar_codigo}</button>
        <button type="button" class="botao botao--linha" data-copiar-texto="${esc(cafe.pix.chave)}" data-feito="${x.copiado}">${icone('copiar')}${x.copiar_chave}</button>
      </div>
      <dl class="pix__dados">
        <div><dt class="rotulo">${x.chave}</dt><dd class="dado">${esc(cafe.pix.chave)}</dd></div>
        <div><dt class="rotulo">${x.codigo}</dt><dd><code id="pix-codigo" class="pix__codigo" data-pix-codigo>${esc(codigo)}</code></dd></div>
      </dl>
      <figure class="qr">
        <div class="qr__cartao" data-pix-qr>${qrSvg(codigo, { rotulo: `QR Code Pix, ${x.reais} ${brl(padrao, lang)}` })}</div>
        <figcaption><span class="dado" data-pix-valor>${x.reais} ${brl(padrao, lang)}</span> · ${x.qr_legenda}</figcaption>
      </figure>
      <p class="cafe__nota">${x.pix_nota}</p>
    </div>`;

  const painelPaypal = `<div class="paypal">
      <p class="cafe__texto">${x.paypal_texto}</p>
      <a class="botao botao--sinal" href="${esc(cafe.paypal)}" target="_blank" rel="noopener">${x.paypal_botao}${icone('diagonal')}</a>
    </div>`;

  const painelCripto = `<div class="cripto">
      <fieldset class="redes">
        <legend class="rotulo">${x.rede}</legend>
        ${cafe.carteiras.map((w, i) => `<label class="rede-op"><input type="radio" name="rede" value="${esc(w.id)}"${i === 0 ? ' checked' : ''}><span>${esc(w['rede_' + lang])}</span></label>`).join('')}
      </fieldset>
      <figure class="qr qr--cripto">
        <div class="qr__cartao" data-cripto-qr>${qrSvg(carteira.uri + carteira.endereco, { rotulo: `QR Code ${carteira['rede_' + lang]}` })}</div>
      </figure>
      <dl class="cripto__dados">
        <div><dt class="rotulo">${x.endereco}</dt><dd><code class="cripto__endereco" id="cripto-endereco" data-cripto-endereco>${esc(carteira.endereco)}</code></dd></div>
      </dl>
      <button type="button" class="botao botao--linha" data-copiar="#cripto-endereco" data-feito="${x.copiado}">${icone('copiar')}${x.copiar_endereco}</button>
      <p class="cafe__nota" data-cripto-aviso>${esc(carteira['aviso_' + lang])}${carteira.redes ? ` <span class="dado">${esc(carteira.redes.join(' · '))}</span>` : ''}</p>
      <p class="cafe__nota">${x.cripto_texto}</p>
    </div>`;

  const paineis = { pix: painelPix, paypal: painelPaypal, cripto: painelCripto };
  const corpo = `<section class="secao secao--topo cafe-topo" aria-labelledby="cafe-titulo">
  <div class="envelope">
    <p class="rotulo secao__num"><a href="${rotas.inicio(lang)}">davi castro</a> / ${x.rotulo}</p>
    <h1 class="secao__titulo" id="cafe-titulo">${x.titulo}</h1>
    <p class="secao__sub">${x.lead}</p>
  </div>
</section>
<section class="envelope cafe" aria-label="${x.titulo}">
  <div class="cafe__abas" role="tablist" aria-label="${lang === 'en' ? 'Payment method' : 'Forma de pagamento'}">
    ${ordem.map((k, i) => `<button type="button" role="tab" id="aba-${k}" aria-controls="painel-${k}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''} data-aba="${k}">${x.abas[k]}</button>`).join('')}
  </div>
  ${ordem.map((k, i) => `<div class="cafe__painel" role="tabpanel" id="painel-${k}" aria-labelledby="aba-${k}" tabindex="0"${i ? ' data-oculto' : ''}>
    <h2 class="cafe__painel-titulo">${x.abas[k]}</h2>
    ${paineis[k]}
  </div>`).join('\n  ')}
  <aside class="cafe__depois">
    <h2>${x.depois_titulo}</h2>
    <p>${x.depois_texto}</p>
    <div class="cafe__depois-acoes">
      ${whats ? `<a class="botao botao--linha botao--pequeno" href="${esc(whats)}?text=${encodeURIComponent(x.whats_msg)}" target="_blank" rel="noopener">${icone('whatsapp')}${x.whats}</a>` : ''}
      ${email.url ? `<a class="botao botao--linha botao--pequeno" href="${esc(email.url)}">${icone('email')}${x.email}</a>` : ''}
    </div>
  </aside>
</section>
<script type="application/json" id="cafe-dados">${JSON.stringify({ pix: cafe.pix, carteiras: cafe.carteiras, lang, reais: x.reais }).replace(/</g, '\\u003c')}</script>`;

  const jsonld = [{
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: DOMINIO + caminho, name: `${x.titulo} — Davi Castro`, inLanguage: lang === 'en' ? 'en' : 'pt-BR', about: { '@id': DOMINIO + '/#davi' } },
      pessoaLD(dados, lang)
    ]
  }];
  const v = dados._build.versoes;
  return documento({ ...ctx, pagina: 'cafe', alternativa: caminhoAlt }, {
    titulo: `${x.titulo} — Davi Castro`, descricao: x.seo, caminho, caminhoAlt,
    ogImagem: lang === 'en' ? '/assets/og/inicio-en.jpg' : '/assets/og/inicio.jpg', jsonld, corpo, classe: 'pagina-cafe'
  })
    .replace('</head>', `<link rel="stylesheet" href="/assets/css/cafe.css?v=${v.cafe || '1'}">\n</head>`)
    .replace('</body>', `<script type="module" src="/assets/js/cafe-app.js?v=${v.cafeJs || '1'}"></script>\n</body>`);
}
