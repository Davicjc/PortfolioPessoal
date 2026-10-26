// /coffee: abas, valor do PIX, troca de rede cripto e botões de copiar.
// O build junta este arquivo com o qr.js em assets/js/cafe-app.js (um pedido só).
import { pixPayload, qrSvg } from './qr.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const dados = JSON.parse($('#cafe-dados').textContent);
const fmt = v => v.toLocaleString(dados.lang === 'en' ? 'en-US' : 'pt-BR', { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });

/* ── abas (setas trocam de aba, como pede o padrão de tabs) ── */
const abas = $$('[data-aba]');
function abrir(aba, foco = false) {
  abas.forEach(b => {
    const ativa = b === aba;
    b.setAttribute('aria-selected', String(ativa));
    b.tabIndex = ativa ? 0 : -1;
    $('#' + b.getAttribute('aria-controls')).toggleAttribute('data-oculto', !ativa);
  });
  if (foco) aba.focus();
  history.replaceState(null, '', '#' + aba.dataset.aba);
}
abas.forEach((b, i) => {
  b.addEventListener('click', () => abrir(b));
  b.addEventListener('keydown', e => {
    const passo = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (passo) { e.preventDefault(); abrir(abas[(i + passo + abas.length) % abas.length], true); }
  });
});
const pedida = abas.find(b => b.dataset.aba === location.hash.slice(1));
if (pedida) abrir(pedida);

/* ── PIX: o código e o QR acompanham o valor ── */
const codigo = $('[data-pix-codigo]');
const qr = $('[data-pix-qr]');
const rotuloValor = $('[data-pix-valor]');
const outro = $('[data-outro]');
function atualizarPix() {
  const escolhida = $('input[name="dose"]:checked');
  // Aceita 12,50 e 12.50; ponto de milhar (1.234,56) também.
  const digitado = String(outro.value).trim().replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  let valor = escolhida && escolhida.value !== 'outro' ? Number(escolhida.value) : Number(digitado);
  if (!(valor >= 1)) valor = 0;
  valor = Math.min(Math.round(valor * 100) / 100, 100000);
  const texto = pixPayload({ ...dados.pix, valor });
  codigo.textContent = texto;
  qr.innerHTML = qrSvg(texto, { rotulo: `QR Code Pix${valor ? ', ' + dados.reais + ' ' + fmt(valor) : ''}` });
  rotuloValor.textContent = valor ? `${dados.reais} ${fmt(valor)}` : (dados.lang === 'en' ? 'Any amount' : 'Valor livre');
}
$$('input[name="dose"]').forEach(r => r.addEventListener('change', () => { if (r.value === 'outro') outro.focus(); atualizarPix(); }));
outro.addEventListener('focus', () => { $('input[name="dose"][value="outro"]').checked = true; });
outro.addEventListener('input', atualizarPix);

/* ── cripto: rede escolhida → endereço, QR e aviso ── */
const endereco = $('[data-cripto-endereco]');
const qrCripto = $('[data-cripto-qr]');
const aviso = $('[data-cripto-aviso]');
$$('input[name="rede"]').forEach(r => r.addEventListener('change', () => {
  const w = dados.carteiras.find(c => c.id === r.value);
  endereco.textContent = w.endereco;
  qrCripto.innerHTML = qrSvg(w.uri + w.endereco, { rotulo: 'QR Code ' + w['rede_' + dados.lang] });
  aviso.textContent = w['aviso_' + dados.lang] + (w.redes ? ' ' : '');
  if (w.redes) aviso.insertAdjacentHTML('beforeend', `<span class="dado">${w.redes.join(' · ')}</span>`);
}));

/* ── copiar, com confirmação no próprio botão ── */
async function copiar(texto, botao) {
  try { await navigator.clipboard.writeText(texto); }
  catch {
    const area = Object.assign(document.createElement('textarea'), { value: texto });
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.append(area); area.select(); document.execCommand('copy'); area.remove();
  }
  const rotulo = botao.lastChild;
  const antes = rotulo.textContent;
  botao.dataset.copiado = '';
  rotulo.textContent = botao.dataset.feito;
  clearTimeout(botao._t);
  botao._t = setTimeout(() => { rotulo.textContent = antes; delete botao.dataset.copiado; }, 1800);
}
$$('[data-copiar]').forEach(b => b.addEventListener('click', () => copiar($(b.dataset.copiar).textContent.trim(), b)));
$$('[data-copiar-texto]').forEach(b => b.addEventListener('click', () => copiar(b.dataset.copiarTexto, b)));
