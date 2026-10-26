// Easter egg: uma cabeça de TV sequestra a transmissão do site (homenagem a Hazbin Hotel).
// Carregado só depois do código ↑ ↑ ↓ ↓ ← → ← → (ou 5 toques em "● Em produção" no celular).
// O personagem é um desenho original; as músicas tocam pelos vídeos OFICIAIS do Prime Video no
// YouTube (incorporados, nada é hospedado aqui).

const CANAIS = [
  { titulo: "Don't You Forget", pt: 'rxpdF0V8j8M', en: 'aljv1mbIYBQ', fonte: { pt: 'Prime Video Brasil · dublada', en: 'Prime Video · sing-along' } },
  { titulo: 'VOX POPULI', pt: 'iDB-HyrwHjQ', en: 'PrmkVVlbfrE', fonte: { pt: 'Prime Video Brasil · dublada', en: 'Prime Video · sing-along' } },
  { titulo: 'Poison', pt: 'xEGWKXwUb54', en: 'xEGWKXwUb54', angel: true, fonte: { pt: 'Prime Video · em inglês (sem dublagem oficial no YouTube)', en: 'Prime Video' } }
];

const TXT = {
  pt: { sinal: 'Sinal sequestrado', aoVivo: 'AO VIVO', canal: 'Canal', trocar: 'trocar de canal', desligar: 'Desligar', restaurado: 'Sinal restaurado. Pode voltar ao portfólio.', fala: 'Este portfólio agora tem um patrocinador.', angel: 'Ei, ei! Esse canal agora é meu, docinho.', anterior: 'Canal anterior', proximo: 'Próximo canal', rotulo: 'Transmissão sequestrada' },
  en: { sinal: 'Signal hijacked', aoVivo: 'LIVE', canal: 'Channel', trocar: 'switch channel', desligar: 'Turn off', restaurado: 'Signal restored. Back to the portfolio.', fala: 'This portfolio now has a sponsor.', angel: 'Hey, hey! This channel is mine now, sugar.', anterior: 'Previous channel', proximo: 'Next channel', rotulo: 'Hijacked broadcast' }
};

const CSS = `
.vox{position:fixed;inset:0;z-index:200;display:grid;place-items:center;background:radial-gradient(120% 90% at 30% 20%,#0d2236 0%,#060b14 55%,#03050a 100%);color:#e8f6ff;font-family:var(--f-texto);overflow:hidden;opacity:0;transition:opacity .35s ease}
.vox.on{opacity:1}
.vox::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px);pointer-events:none;mix-blend-mode:overlay}
.vox__topo{position:absolute;top:18px;left:20px;right:20px;display:flex;align-items:center;gap:14px;font:500 12px/1 var(--f-dados);letter-spacing:.12em;text-transform:uppercase}
.vox__vivo{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:4px;background:#e2313d;color:#fff}
.vox__vivo i{width:8px;height:8px;border-radius:50%;background:#fff}
.vox__sinal{color:#7fe7ff}
.vox__fechar{margin-left:auto;display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border:1px solid rgba(127,231,255,.4);border-radius:6px;background:rgba(5,12,22,.6);color:#e8f6ff;font:500 13px/1 var(--f-texto);letter-spacing:0;text-transform:none;cursor:pointer}
.vox__fechar:hover{border-color:#7fe7ff}
.vox__palco{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:clamp(12px,3vw,40px);width:min(1180px,94vw)}
.vox__tv{position:relative;padding:clamp(10px,1.4vw,18px);border-radius:26px;background:linear-gradient(160deg,#2c6aa8,#16365a 60%,#0e2440);box-shadow:inset 0 2px 0 rgba(255,255,255,.18),0 40px 90px -30px rgba(0,0,0,.9)}
.vox__tela{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000}
.vox__tela iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.vox__estatica{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;opacity:0;pointer-events:none;transition:opacity .2s}
.vox__estatica.on{opacity:1}
.vox__rodape{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;margin-top:12px;font:500 12px/1.4 var(--f-dados);color:#9fd8ee}
.vox__rodape b{color:#fff;font-weight:600;letter-spacing:.04em}
.vox__botoes{margin-left:auto;display:flex;gap:6px}
.vox__botoes button{width:40px;height:36px;border:1px solid rgba(127,231,255,.35);border-radius:6px;background:rgba(5,12,22,.5);color:#e8f6ff;font:600 15px/1 var(--f-dados);cursor:pointer}
.vox__botoes button:hover{border-color:#7fe7ff}
.vox__boneco{position:relative;width:clamp(150px,20vw,260px);transform:translateY(120%);transition:transform .9s cubic-bezier(.2,1.3,.4,1)}
.vox.on .vox__boneco{transform:none}
.vox__balao{position:absolute;bottom:100%;right:10%;width:max-content;max-width:230px;margin-bottom:10px;padding:10px 12px;border-radius:10px;background:#e8f6ff;color:#08121e;font:600 13px/1.35 var(--f-texto);opacity:0;transform:translateY(6px);transition:opacity .3s,transform .3s}
.vox__balao.on{opacity:1;transform:none}
.vox__olhos{transition:transform .35s cubic-bezier(.3,.9,.3,1)}
.vox__boca{transform-origin:110px 112px;animation:vox-fala 1.1s ease-in-out infinite}
@keyframes vox-fala{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.82)}}
.vox__angel{position:absolute;right:-10px;bottom:24%;width:clamp(120px,16vw,200px);transform:translateX(130%) rotate(-8deg);transition:transform .7s cubic-bezier(.2,1.2,.4,1);pointer-events:none}
.vox__angel.on{transform:translateX(18%) rotate(-8deg)}
.vox__angel .vox__balao{right:auto;left:-40%;bottom:96%}
.vox__aviso{position:fixed;left:50%;bottom:22px;z-index:201;translate:-50% 0;padding:10px 16px;border-radius:8px;background:#0f1318;border:1px solid #313b47;color:#e8edf2;font:500 13px/1.4 var(--f-texto);opacity:0;transition:opacity .4s}
.vox__aviso.on{opacity:1}
html.vox-glitch body>*:not(.vox){animation:vox-glitch .5s steps(2) 2}
@keyframes vox-glitch{0%{transform:translateX(0);filter:none}25%{transform:translateX(-6px) skewX(-4deg);filter:hue-rotate(80deg) saturate(2)}50%{transform:translateX(5px);filter:invert(.1)}75%{transform:translateX(-3px) skewX(3deg)}100%{transform:none;filter:none}}
html.vox-aberto{overflow:hidden}
html.vox-aberto body>*:not(.vox):not(.vox__aviso){transform:perspective(1400px) rotateX(7deg) scale(.94);filter:brightness(.35) saturate(.2);transition:transform .7s cubic-bezier(.2,.8,.2,1),filter .7s}
@media (max-width:760px){.vox__palco{grid-template-columns:1fr;justify-items:center}.vox__boneco{order:-1;width:130px}.vox__balao{right:auto;left:70%}.vox__topo{flex-wrap:wrap}.vox__rodape{justify-content:center}.vox__botoes{margin-left:0}}
@media (prefers-reduced-motion:reduce){.vox,.vox__boneco,.vox__angel{transition:none}.vox__boca{animation:none}html.vox-glitch body>*:not(.vox){animation:none}}
`;

// Personagem original: cabeça de TV de tubo com sorriso de pixel, terno e gravata vermelha.
const BONECO = `<svg viewBox="0 0 220 300" aria-hidden="true">
  <path d="M60 200 L110 230 L160 200 L178 300 L42 300 Z" fill="#141c2e"/>
  <path d="M84 196 L110 300 L136 196 Z" fill="#e8f6ff"/>
  <path d="M104 204 L116 204 L120 262 L110 276 L100 262 Z" fill="#e2313d"/>
  <path d="M60 200 L96 214 L84 268 Z M160 200 L124 214 L136 268 Z" fill="#0b1120"/>
  <rect x="96" y="176" width="28" height="22" rx="4" fill="#1e3d63"/>
  <rect x="18" y="38" width="184" height="146" rx="26" fill="#2c6aa8"/>
  <rect x="18" y="38" width="184" height="146" rx="26" fill="url(#vox-brilho)"/>
  <rect x="34" y="52" width="152" height="118" rx="18" fill="#06121f"/>
  <path d="M74 38 L58 6 M146 38 L162 6" stroke="#1e3d63" stroke-width="6" stroke-linecap="round"/>
  <circle cx="58" cy="6" r="6" fill="#e2313d"/><circle cx="162" cy="6" r="6" fill="#e2313d"/>
  <g class="vox__olhos" fill="#7fe7ff">
    <rect x="66" y="78" width="26" height="22" rx="6"/>
    <rect x="128" y="78" width="26" height="22" rx="6"/>
  </g>
  <g class="vox__boca">
    <path d="M62 116 Q110 152 158 116 L150 112 Q110 140 70 112 Z" fill="#7fe7ff"/>
    <path d="M76 120 L80 130 M90 124 L92 136 M104 126 L104 139 M118 126 L118 139 M132 124 L130 136 M146 120 L142 130" stroke="#06121f" stroke-width="3"/>
  </g>
  <defs><linearGradient id="vox-brilho" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
</svg>`;

// Participação: um demônio-aranha fofo, branco e rosa, com quatro mãos acenando (desenho original).
const ANGEL = `<svg viewBox="0 0 200 220" aria-hidden="true">
  <ellipse cx="100" cy="120" rx="62" ry="70" fill="#f6eef3"/>
  <circle cx="64" cy="70" r="26" fill="#ffffff"/><circle cx="100" cy="56" r="30" fill="#ffffff"/><circle cx="136" cy="70" r="26" fill="#ffffff"/>
  <circle cx="74" cy="132" r="11" fill="#f4a3c4"/><circle cx="126" cy="150" r="9" fill="#f4a3c4"/>
  <ellipse cx="82" cy="100" rx="11" ry="13" fill="#2a0f22"/><ellipse cx="118" cy="100" rx="11" ry="13" fill="#2a0f22"/>
  <circle cx="85" cy="96" r="4" fill="#ff6fb1"/><circle cx="121" cy="96" r="4" fill="#ff6fb1"/>
  <path d="M84 122 Q100 136 116 122" stroke="#2a0f22" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="104" y="124" width="6" height="7" rx="1" fill="#f2c94c"/>
  <path d="M86 160 L100 168 L114 160 L114 176 L100 168 L86 176 Z" fill="#e2313d"/>
  <g fill="#f6eef3" stroke="#e8c9d8" stroke-width="2">
    <path d="M40 120 Q12 104 14 84"/><circle cx="14" cy="80" r="9"/>
    <path d="M160 120 Q188 104 186 84"/><circle cx="186" cy="80" r="9"/>
    <path d="M44 150 Q18 150 10 136"/><circle cx="8" cy="132" r="8"/>
    <path d="M156 150 Q182 150 190 136"/><circle cx="192" cy="132" r="8"/>
  </g>
</svg>`;

let aberto = null;

export function iniciar({ lang = 'pt' } = {}) {
  if (aberto) return;
  const t = TXT[lang] || TXT.pt;
  const movimento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.getElementById('vox-css')) {
    const s = document.createElement('style'); s.id = 'vox-css'; s.textContent = CSS; document.head.append(s);
  }
  const anterior = document.activeElement;
  const raiz = document.createElement('div');
  raiz.className = 'vox';
  raiz.setAttribute('role', 'dialog');
  raiz.setAttribute('aria-modal', 'true');
  raiz.setAttribute('aria-label', t.rotulo);
  raiz.innerHTML = `
    <div class="vox__topo"><span class="vox__vivo"><i></i>${t.aoVivo}</span><span class="vox__sinal">VoxTek · ${t.sinal}</span>
      <button type="button" class="vox__fechar" data-fechar>${t.desligar} <kbd>Esc</kbd></button></div>
    <div class="vox__palco">
      <div>
        <div class="vox__tv"><div class="vox__tela" data-tela><canvas class="vox__estatica" width="160" height="90" data-estatica></canvas></div></div>
        <div class="vox__rodape"><span><b data-canal-num></b> · <span data-canal-titulo></span> — <span data-canal-fonte></span></span>
          <span class="vox__botoes"><button type="button" data-ant aria-label="${t.anterior}">←</button><button type="button" data-prox aria-label="${t.proximo}">→</button></span></div>
      </div>
      <div class="vox__boneco">${BONECO}<div class="vox__balao" data-balao>${t.fala}</div></div>
    </div>
    <div class="vox__angel" data-angel>${ANGEL}<div class="vox__balao" data-balao-angel>${t.angel}</div></div>`;
  document.body.append(raiz);

  const tela = raiz.querySelector('[data-tela]');
  const estatica = raiz.querySelector('[data-estatica]');
  const olhos = raiz.querySelector('.vox__olhos');
  const balao = raiz.querySelector('[data-balao]');
  const angel = raiz.querySelector('[data-angel]');
  const balaoAngel = raiz.querySelector('[data-balao-angel]');
  let canal = 0, ruidoId = 0, timers = [];
  const depois = (ms, f) => timers.push(setTimeout(f, ms));

  // Chiado de TV entre um canal e outro.
  function chiado(ms = 650) {
    if (!movimento) return;
    const c = estatica.getContext('2d');
    const img = c.createImageData(160, 90);
    estatica.classList.add('on');
    const fim = performance.now() + ms;
    cancelAnimationFrame(ruidoId);
    const quadro = agora => {
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = v * .8; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255; }
      c.putImageData(img, 0, 0);
      if (agora < fim) ruidoId = requestAnimationFrame(quadro); else estatica.classList.remove('on');
    };
    ruidoId = requestAnimationFrame(quadro);
  }

  function sintonizar(n) {
    canal = (n + CANAIS.length) % CANAIS.length;
    const c = CANAIS[canal];
    const id = c[lang] || c.en;
    chiado();
    tela.querySelector('iframe')?.remove();
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
    f.title = c.titulo;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    tela.prepend(f);
    raiz.querySelector('[data-canal-num]').textContent = `${t.canal} ${canal + 1}/${CANAIS.length}`;
    raiz.querySelector('[data-canal-titulo]').textContent = c.titulo;
    raiz.querySelector('[data-canal-fonte]').textContent = c.fonte[lang] || c.fonte.en;
    angel.classList.toggle('on', !!c.angel);
    balaoAngel.classList.toggle('on', !!c.angel);
  }

  // Ele olha para um lado, para o outro, e encara quem está vendo.
  function olhar() {
    if (!movimento) return;
    const passos = [[-14, 0], [14, 0], [-14, 2], [0, 0]];
    passos.forEach(([x, y], i) => depois(500 + i * 650, () => { olhos.style.transform = `translate(${x}px, ${y}px)`; }));
    depois(3300, () => balao.classList.add('on'));
    depois(7800, () => balao.classList.remove('on'));
  }

  function fechar() {
    timers.forEach(clearTimeout);
    cancelAnimationFrame(ruidoId);
    document.removeEventListener('keydown', teclas, true);
    raiz.classList.remove('on');
    document.documentElement.classList.remove('vox-aberto');
    setTimeout(() => raiz.remove(), 380);
    const aviso = document.createElement('div');
    aviso.className = 'vox__aviso'; aviso.setAttribute('role', 'status'); aviso.textContent = t.restaurado;
    document.body.append(aviso);
    requestAnimationFrame(() => aviso.classList.add('on'));
    setTimeout(() => { aviso.classList.remove('on'); setTimeout(() => aviso.remove(), 500); }, 2600);
    anterior?.focus?.();
    aberto = null;
  }
  function teclas(e) {
    if (e.key === 'Escape') { e.preventDefault(); fechar(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); sintonizar(canal + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); sintonizar(canal - 1); }
  }
  raiz.querySelector('[data-fechar]').addEventListener('click', fechar);
  raiz.querySelector('[data-prox]').addEventListener('click', () => sintonizar(canal + 1));
  raiz.querySelector('[data-ant]').addEventListener('click', () => sintonizar(canal - 1));
  document.addEventListener('keydown', teclas, true);

  // Entrada: a página treme, tomba para trás e a transmissão entra no ar.
  const html = document.documentElement;
  if (movimento) { html.classList.add('vox-glitch'); setTimeout(() => html.classList.remove('vox-glitch'), 1000); }
  setTimeout(() => {
    html.classList.add('vox-aberto');
    raiz.classList.add('on');
    sintonizar(0);
    olhar();
    raiz.querySelector('[data-fechar]').focus({ preventScroll: true });
  }, movimento ? 520 : 0);
  aberto = { fechar };
}
