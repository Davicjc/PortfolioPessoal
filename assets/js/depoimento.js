// davicjc.com — o formulário de depoimento (/depoimento/ e /en/testimonial/). Sem dependências.
// Grava em depoimentos_recebidos pela API REST do Firestore; as regras só deixam criar, com campos
// e tamanhos conferidos. Eu leio, aprovo ou apago no /adm. A foto é reduzida aqui mesmo (240 px).
import { naoRobo } from './robo.js';

const $ = (s, el = document) => el.querySelector(s);
const raiz = $('[data-avaliacao]');
const palco = $('[data-palco]', raiz || document);
const CFG = JSON.parse($('#avaliacao-dados')?.textContent || '{}');
const lang = CFG.lang === 'en' ? 'en' : 'pt';
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const LIMITE = 1200;

const T = {
  pt: {
    foto: 'Sua foto', foto_btn: 'Escolher foto', foto_trocar: 'Trocar foto', foto_dica: 'Opcional. Aparece redonda, ao lado do seu nome.',
    nome: 'Seu nome', cargo: 'Cargo e empresa', cargo_ph: 'Ex.: Gerente comercial · Empresa X',
    projeto: 'Sobre qual projeto ou trabalho?', projeto_ph: 'Ex.: o site da minha empresa',
    texto: 'Seu depoimento', texto_ph: 'Como foi trabalhar comigo? O que mudou depois do projeto?',
    origem: 'Por onde você me conheceu?', linkedin: 'Seu LinkedIn', email: 'Seu e-mail', email_dica: 'Só para eu avisar quando publicar. Não aparece no site.',
    obr: 'obrigatório', opc: 'opcional',
    autoriza: 'Autorizo publicar meu nome, cargo, foto e depoimento no davicjc.com.',
    enviar: 'Enviar depoimento', enviando: 'Enviando…',
    erro_nome: 'Diga o seu nome.', erro_texto: 'Escreva pelo menos uma frase (20 caracteres).', erro_email: 'Esse e-mail parece incompleto.',
    erro_autoriza: 'Marque a autorização para eu poder publicar.', erro_robo: 'Falta só confirmar que você não é um robô.',
    erro_foto: 'Não consegui ler essa imagem. Tente outra (JPG ou PNG).',
    falhou: 'Não consegui enviar agora. Tente de novo em instantes ou', falhou_link: 'mande por e-mail',
    fim_selo: 'recebido', fim_titulo: n => `Obrigado, ${n}!`, fim_txt: 'Seu depoimento chegou. Assim que eu conferir, ele aparece no site.', fim_voltar: 'Conhecer o meu trabalho',
    assunto: 'Depoimento para o davicjc.com',
    origens: [['trabalho', 'Trabalhamos juntos'], ['indicacao', 'Indicação'], ['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['google', 'Google'], ['github', 'GitHub'], ['outro', 'Outro']]
  },
  en: {
    foto: 'Your photo', foto_btn: 'Choose a photo', foto_trocar: 'Change photo', foto_dica: 'Optional. Shown as a circle next to your name.',
    nome: 'Your name', cargo: 'Role and company', cargo_ph: 'E.g. Sales manager · Company X',
    projeto: 'Which project or work is this about?', projeto_ph: 'E.g. my company website',
    texto: 'Your testimonial', texto_ph: 'How was working with me? What changed after the project?',
    origem: 'How did you find me?', linkedin: 'Your LinkedIn', email: 'Your email', email_dica: 'Only so I can tell you when it goes live. Not shown on the site.',
    obr: 'required', opc: 'optional',
    autoriza: 'I allow my name, role, photo and testimonial to be published on davicjc.com.',
    enviar: 'Send testimonial', enviando: 'Sending…',
    erro_nome: 'Please add your name.', erro_texto: 'Write at least one sentence (20 characters).', erro_email: 'That email looks incomplete.',
    erro_autoriza: 'Please tick the permission so I can publish it.', erro_robo: 'Just confirm you are not a robot.',
    erro_foto: 'I could not read that image. Try another one (JPG or PNG).',
    falhou: 'I could not send it right now. Try again in a moment or', falhou_link: 'send it by email',
    fim_selo: 'received', fim_titulo: n => `Thank you, ${n}!`, fim_txt: 'Your testimonial arrived. As soon as I review it, it shows up on the site.', fim_voltar: 'See my work',
    assunto: 'Testimonial for davicjc.com',
    origens: [['trabalho', 'We worked together'], ['indicacao', 'Referral'], ['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['google', 'Google'], ['github', 'GitHub'], ['outro', 'Other']]
  }
}[lang];

const ICONE = {
  pessoa: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ok: '<path d="m5 12.5 4.5 4.5L19 7.5"/>'
};
const svg = n => `<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONE[n]}</svg>`;

const rotulo = (txt, obr) => `<span class="campo__rotulo">${txt}<span class="${obr ? 'campo__obr' : 'campo__opc'}">${obr ? T.obr : T.opc}</span></span>`;

function renderForm() {
  // ?projeto=Nome deixa o campo preenchido (o link que o painel compartilha pode levar o projeto).
  const projeto = new URLSearchParams(location.search).get('projeto') || '';
  return `<form class="aval" novalidate>
    <div class="aval__foto">
      <span class="aval__circulo" data-circulo>${svg('pessoa')}</span>
      <span class="aval__foto-txt">
        <label class="botao botao--linha botao--pequeno" for="aval-arquivo" data-foto-btn>${T.foto_btn}</label>
        <input class="aval__arquivo" id="aval-arquivo" type="file" accept="image/*" data-arquivo>
        <small data-foto-msg>${T.foto_dica}</small>
      </span>
    </div>
    <label class="campo" data-campo="nome">${rotulo(T.nome, true)}<input name="nome" autocomplete="name" maxlength="120" required><span class="campo__msg"></span></label>
    <div class="aval__dupla">
      <label class="campo" data-campo="cargo">${rotulo(T.cargo)}<input name="cargo" autocomplete="organization-title" maxlength="160" placeholder="${esc(T.cargo_ph)}"><span class="campo__msg"></span></label>
      <label class="campo" data-campo="projeto">${rotulo(T.projeto)}<input name="projeto" list="aval-projetos" maxlength="120" placeholder="${esc(T.projeto_ph)}" value="${esc(projeto)}"><span class="campo__msg"></span></label>
    </div>
    <datalist id="aval-projetos">${(CFG.projetos || []).map(p => `<option value="${esc(p)}">`).join('')}</datalist>
    <label class="campo" data-campo="texto">${rotulo(T.texto, true)}<textarea name="texto" rows="5" maxlength="${LIMITE}" placeholder="${esc(T.texto_ph)}" required></textarea><span class="campo__msg"><span data-msg></span><span class="campo__conta" data-conta>0/${LIMITE}</span></span></label>
    <fieldset class="campo campo--chips"><legend class="campo__rotulo">${T.origem}<span class="campo__opc">${T.opc}</span></legend>
      <div class="chips">${T.origens.map(([v, t]) => `<label class="chip"><input type="radio" name="origem" value="${v}"><span>${t}</span></label>`).join('')}</div>
    </fieldset>
    <div class="aval__dupla">
      <label class="campo" data-campo="linkedin">${rotulo(T.linkedin)}<input name="linkedin" type="url" inputmode="url" maxlength="200" placeholder="linkedin.com/in/…"><span class="campo__msg"></span></label>
      <label class="campo" data-campo="email">${rotulo(T.email)}<input name="email" type="email" autocomplete="email" inputmode="email" maxlength="160"><span class="campo__msg">${T.email_dica}</span></label>
    </div>
    <label class="aval__isca" aria-hidden="true">Site<input name="site_url" tabindex="-1" autocomplete="off"></label>
    <label class="aval__autoriza" data-autoriza><input type="checkbox" name="autoriza"><span>${T.autoriza}</span></label>
    <div class="robo"><div class="robo__widget" data-robo></div><p class="robo__aviso" data-robo-aviso hidden>${T.erro_robo}</p></div>
    <div class="aval__acoes"><button type="submit" class="botao botao--sinal" data-enviar>${T.enviar}${svg('seta')}</button></div>
    <p class="aval__status" data-status aria-live="polite"></p>
  </form>`;
}

let foto = '';
let robo = false;

// Corta no centro e reduz para 240×240 em JPEG: cabe folgado no limite das regras do banco.
async function reduzir(arquivo) {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise((ok, falha) => { const i = new Image(); i.onload = () => ok(i); i.onerror = falha; i.src = url; });
    const lado = Math.min(img.naturalWidth, img.naturalHeight);
    const tela = document.createElement('canvas');
    tela.width = tela.height = 240;
    tela.getContext('2d').drawImage(img, (img.naturalWidth - lado) / 2, (img.naturalHeight - lado) / 2, lado, lado, 0, 0, 240, 240);
    let dados = tela.toDataURL('image/jpeg', .84);
    if (dados.length > 70000) dados = tela.toDataURL('image/jpeg', .7);
    return dados;
  } finally { URL.revokeObjectURL(url); }
}

function erro(form, nome, msg) {
  const c = $(`[data-campo="${nome}"]`, form);
  c.classList.toggle('erro', !!msg);
  const alvo = $('[data-msg]', c) || $('.campo__msg', c);
  if (msg) alvo.textContent = msg;
  else if (nome === 'email') alvo.textContent = T.email_dica;
  else alvo.textContent = '';
}

function validar(form) {
  const v = n => (form.elements[n].value || '').trim();
  const falhas = [];
  erro(form, 'nome', v('nome').length < 2 ? (falhas.push('nome'), T.erro_nome) : '');
  erro(form, 'texto', v('texto').length < 20 ? (falhas.push('texto'), T.erro_texto) : '');
  erro(form, 'email', v('email') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('email')) ? (falhas.push('email'), T.erro_email) : '');
  const autoriza = form.elements.autoriza.checked;
  $('[data-autoriza]', form).classList.toggle('erro', !autoriza);
  if (!autoriza) falhas.push('autoriza');
  return falhas;
}

const linkedin = s => (!s ? '' : /^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, ''));
const tipado = v => (typeof v === 'boolean' ? { booleanValue: v } : { stringValue: String(v) });

async function enviar(form) {
  const v = n => (form.elements[n]?.value || '').trim();
  const doc = {
    nome: v('nome'), texto: v('texto').slice(0, LIMITE), autoriza: true, lang, criado_em: new Date().toISOString(),
    cargo: v('cargo'), projeto: v('projeto'), linkedin: linkedin(v('linkedin')), email: v('email'),
    origem: form.elements.origem.value || ''
  };
  if (foto) doc.foto = foto;
  const agora = new Date();
  const p2 = n => String(n).padStart(2, '0');
  const id = `dr-${String(agora.getFullYear()).slice(2)}${p2(agora.getMonth() + 1)}${p2(agora.getDate())}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${CFG.projeto}/databases/(default)/documents/depoimentos_recebidos?documentId=${id}&key=${CFG.chave}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(doc).map(([k, x]) => [k, tipado(x)])) })
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return doc;
}

function renderFim(nome) {
  return `<div class="aval-fim">
    <span class="aval-fim__selo rotulo">${svg('ok')}${T.fim_selo}</span>
    <h2 tabindex="-1" data-fim-titulo>${esc(T.fim_titulo(nome.split(' ')[0]))}</h2>
    <p>${T.fim_txt}</p>
    <a class="botao botao--linha" href="${CFG.inicio || '/'}">${T.fim_voltar}${svg('seta')}</a>
  </div>`;
}

function ligar() {
  palco.innerHTML = renderForm();
  const form = $('form', palco);
  const texto = form.elements.texto;
  texto.addEventListener('input', () => { $('[data-conta]', form).textContent = `${texto.value.length}/${LIMITE}`; });
  form.addEventListener('input', e => { if (e.target.closest('.campo.erro')) validar(form); });
  form.elements.autoriza.addEventListener('change', () => $('[data-autoriza]', form).classList.toggle('erro', !form.elements.autoriza.checked && $('[data-autoriza]', form).classList.contains('erro')));

  $('[data-arquivo]', form).addEventListener('change', async e => {
    const arq = e.target.files?.[0];
    if (!arq) return;
    const msg = $('[data-foto-msg]', form);
    try {
      foto = await reduzir(arq);
      const circulo = $('[data-circulo]', form);
      circulo.innerHTML = `<img src="${foto}" alt="">`;
      circulo.classList.add('tem');
      $('[data-foto-btn]', form).textContent = T.foto_trocar;
      msg.textContent = T.foto_dica;
    } catch {
      foto = '';
      msg.textContent = T.erro_foto;
    }
  });

  naoRobo($('[data-robo]', form), {
    chave: CFG.turnstile, lang,
    aoPassar: () => { robo = true; $('[data-robo-aviso]', form).hidden = true; },
    aoExpirar: () => { robo = false; }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if ((form.elements.site_url.value || '').trim()) return; // robô
    const falhas = validar(form);
    if (falhas.length) { (form.elements[falhas[0]] || form.elements.autoriza).focus(); return; }
    if (!robo) { $('[data-robo-aviso]', form).hidden = false; return; }
    const botao = $('[data-enviar]', form);
    const status = $('[data-status]', form);
    botao.disabled = true;
    botao.firstChild.textContent = T.enviando;
    status.classList.remove('erro');
    status.textContent = '';
    try {
      const doc = await enviar(form);
      palco.innerHTML = renderFim(doc.nome);
      $('[data-fim-titulo]', palco).focus({ preventScroll: true });
      scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      const corpo = `${form.elements.nome.value}\n${form.elements.cargo.value}\n\n${form.elements.texto.value}`;
      status.classList.add('erro');
      status.innerHTML = `${T.falhou} <a class="link" href="mailto:${CFG.email}?subject=${encodeURIComponent(T.assunto)}&body=${encodeURIComponent(corpo)}">${T.falhou_link}</a>.`;
      botao.disabled = false;
      botao.firstChild.textContent = T.enviar;
    }
  });
}

if (raiz && palco) ligar();
