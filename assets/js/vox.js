// Easter egg: a VoxTek invade o site (homenagem a Hazbin Hotel).
// Carregado só depois do código ↑ ↑ ↓ ↓ ← → ← → (ou 5 toques em "Uberlândia, MG" no celular).
// Leva ao topo, as telas da parede chiam e viram o Vox, a página vai ficando vermelha, a
// transmissão toma a tela inteira (chiando, sem nunca voltar direito) e, aos 25 s, a TV desliga
// e tudo volta ao normal. A música toca chiada pelo Web Audio; nada fica rodando depois.

const DURACAO = 25;
const FOTOS = [1, 2, 3, 4, 5].map(n => `/assets/vox/vox-${n}.webp`);
// O crachá VoxTek do Davi aparece de vez em quando, não sempre (cerca de 1 em 8).
const CRACHA = '/assets/vox/voxtek-id.webp';
const MUSICA = '/assets/vox/musica.m4a';
const VIDEO = '/assets/vox/video.mp4';
const movimento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const sorteia = l => l[Math.floor(Math.random() * l.length)];
const entre = (a, b) => a + Math.random() * (b - a);
const fotoVox = () => (Math.random() < .12 ? CRACHA : sorteia(FOTOS));

const TXT = {
  pt: { vivo: 'AO VIVO', sinal: 'VoxTek · sinal sequestrado', desligar: 'Desligar', sintonizar: 'Sintonizar a VoxTek', tela: 'VOXTEK · AO VIVO' },
  en: { vivo: 'LIVE', sinal: 'VoxTek · signal hijacked', desligar: 'Turn off', sintonizar: 'Tune in to VoxTek', tela: 'VOXTEK · LIVE' }
};

const CSS = `
html.vox-on{overflow:hidden}
.vox-vermelho{position:fixed;inset:0;z-index:150;pointer-events:none;opacity:0;mix-blend-mode:multiply;background:radial-gradient(120% 90% at 50% 40%,#ff3347 0%,#b3001b 55%,#3a0006 100%);transition:opacity 9s cubic-bezier(.4,0,.6,1)}
.vox-vermelho.on{opacity:.82}
.vox-vermelho::after{content:'';position:absolute;inset:0;mix-blend-mode:screen;background:repeating-linear-gradient(180deg,rgba(255,40,60,.07) 0 1px,transparent 1px 3px)}
html.vox-on .tela .tela__led{background:#ff2b3d!important}
html.vox-on .parede .tela__vidro::before{opacity:.42;animation:chiado-grao 140ms steps(1) infinite}
html.vox-on .parede .tela.chiando .tela__vidro::before{animation:chiado-grao 90ms steps(1) infinite,chiado-vida var(--chiado-ms,560ms) cubic-bezier(.3,0,.2,1) both}
html.vox-on .parede .tela.chiando .tela__vidro img{animation:tremor 70ms steps(1) infinite}
html.vox-glitch .hero__titulo,.vox-rgb{animation:vox-rgb .14s steps(2) infinite}
.vox-artefatos{position:fixed;inset:0;z-index:210;pointer-events:none;overflow:hidden}
.vox-artefatos i{position:absolute;display:block}
.vox-faixa{left:-80px;right:-80px;backdrop-filter:var(--f);-webkit-backdrop-filter:var(--f);transform:translateX(var(--dx));border-block:1px solid rgba(255,255,255,.18)}
.vox-bloco{mix-blend-mode:difference;opacity:.9}
.vox-ruido{background:var(--chiado,#777) 0 0/96px 96px;mix-blend-mode:screen;image-rendering:pixelated}
.vox-barras{left:0;right:0;background:linear-gradient(90deg,#fff 0 14%,#ff0 14% 28%,#0ff 28% 42%,#0f0 42% 57%,#f0f 57% 71%,#f00 71% 85%,#00f 85%);mix-blend-mode:difference;opacity:.75}
main.vox-tranco{transform-origin:50% 50vh;transform:translate(var(--tx),var(--ty)) skewX(var(--sk))}
@keyframes vox-rgb{0%{text-shadow:-3px 0 #ff2b3d,3px 0 #22e0ff;transform:translateX(0)}50%{text-shadow:4px 0 #ff2b3d,-2px 0 #22e0ff;transform:translateX(-2px) skewX(-3deg)}100%{text-shadow:-1px 0 #ff2b3d,1px 0 #22e0ff;transform:translateX(1px)}}
.vox-hud{position:fixed;top:0;left:0;right:0;z-index:230;display:flex;align-items:center;gap:12px;height:64px;padding:0 16px;border-bottom:1px solid #6b0f1c;background:linear-gradient(180deg,#22030a,#140106);font:600 12px/1 var(--f-dados);letter-spacing:.12em;text-transform:uppercase;color:#ffd7db;pointer-events:none;opacity:0;transition:opacity .4s}
.vox-hud span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.vox-hud.on{opacity:1}
.vox-hud b{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:4px;background:#e2313d;color:#fff}
.vox-hud b i{width:8px;height:8px;border-radius:50%;background:#fff;animation:vox-pisca 1s steps(2) infinite}
@keyframes vox-pisca{50%{opacity:0}}
.vox-hud button{margin-left:auto;pointer-events:auto;min-height:40px;padding:0 14px;border:1px solid rgba(255,90,105,.6);border-radius:6px;background:rgba(20,0,4,.7);color:#fff;font:500 13px/1 var(--f-texto);letter-spacing:0;text-transform:none;cursor:pointer}
.vox-tv{position:fixed;inset:0;z-index:200;overflow:hidden;background:#000;opacity:0;transition:opacity .25s}
.vox-tv.on{opacity:1}
.vox-tv video,.vox-tv img{position:absolute;left:50%;top:50%;width:100vw;height:100vh;object-fit:cover;translate:-50% -50%;filter:saturate(1.35) contrast(1.15)}
.vox-tv .deitado{width:100vh;height:100vw;rotate:90deg}
.vox-tv canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;mix-blend-mode:screen;opacity:.6}
.vox-tv::before{content:'';position:absolute;inset:0;z-index:2;pointer-events:none;background:repeating-linear-gradient(180deg,rgba(0,0,0,.45) 0 1px,transparent 1px 3px),radial-gradient(130% 100% at 50% 50%,transparent 55%,rgba(60,0,8,.85) 100%)}
.vox-tv::after{content:'';position:absolute;left:0;right:0;height:22%;z-index:3;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(255,220,225,.16) 45%,rgba(255,255,255,.28) 50%,transparent);animation:vox-rolo 2.6s linear infinite}
@keyframes vox-rolo{from{top:-25%}to{top:105%}}
.vox-tv.desligando{animation:vox-desliga .62s cubic-bezier(.7,0,.3,1) forwards}
@keyframes vox-desliga{0%{transform:none;filter:none}45%{transform:scale(1,.006);filter:brightness(4)}100%{transform:scale(0,.006);filter:brightness(6);opacity:0}}
.vox-play{position:fixed;left:50%;top:50%;z-index:240;translate:-50% -50%;display:inline-flex;align-items:center;gap:12px;min-height:56px;padding:0 24px;border:1px solid #ff5a69;border-radius:12px;background:#1a0004;color:#fff;font:600 1.05rem/1 var(--f-display);cursor:pointer;box-shadow:0 0 0 6px rgba(226,49,61,.25),0 30px 80px -20px #000}
@media (prefers-reduced-motion:reduce){html.vox-on .parede .tela__vidro::before{animation:none}.vox-vermelho{transition-duration:1s}html.vox-glitch .hero__titulo{animation:none}.vox-tv::after{animation:none;display:none}}
`;

// Som de TV um pouco fora de sintonia: a música perde só o extremo grave e agudo, com uma
// saturação leve; por cima, um chiadinho de ruído branco que sobe e desce. Volume baixo.
function curva(k) {
  const n = 1024, c = new Float32Array(n);
  for (let i = 0; i < n; i++) { const x = i * 2 / n - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
  return c;
}
function montarSom() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const el = new Audio(MUSICA);
  el.preload = 'auto';
  const fonte = ctx.createMediaElementSource(el);
  const grave = ctx.createBiquadFilter(); grave.type = 'highpass'; grave.frequency.value = 110;
  const agudo = ctx.createBiquadFilter(); agudo.type = 'lowpass'; agudo.frequency.value = 7800;
  const sujo = ctx.createWaveShaper(); sujo.curve = curva(2.5); sujo.oversample = '2x';
  const musica = ctx.createGain(); musica.gain.value = .6;
  const mestre = ctx.createGain(); mestre.gain.value = 0;
  fonte.connect(grave).connect(agudo).connect(sujo).connect(musica).connect(mestre).connect(ctx.destination);
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const ruido = ctx.createBufferSource(); ruido.buffer = buf; ruido.loop = true;
  const faixa = ctx.createBiquadFilter(); faixa.type = 'bandpass'; faixa.frequency.value = 2400; faixa.Q.value = .7;
  const chiado = ctx.createGain(); chiado.gain.value = .025;
  ruido.connect(faixa).connect(chiado).connect(mestre);
  let ligado = false;
  return {
    async tocar() {
      await ctx.resume();
      await el.play();
      if (!ligado) { ruido.start(); ligado = true; }
      const t = ctx.currentTime;
      mestre.gain.cancelScheduledValues(t);
      mestre.gain.setValueAtTime(0, t);
      mestre.gain.linearRampToValueAtTime(.38, t + .5);
    },
    // Chiado sobe e desce; de vez em quando a música some por um instante (sinal caindo).
    mexer() {
      const t = ctx.currentTime;
      chiado.gain.setTargetAtTime(entre(.01, .045), t, .08);
      if (Math.random() < .05) { musica.gain.setTargetAtTime(.38, t, .03); musica.gain.setTargetAtTime(.6, t + entre(.06, .16), .05); }
    },
    parar() {
      const t = ctx.currentTime;
      mestre.gain.cancelScheduledValues(t);
      mestre.gain.setTargetAtTime(0, t, .12);
      setTimeout(() => { el.pause(); ctx.close().catch(() => {}); }, 700);
    }
  };
}

// Estática em tela cheia: um quadro pequeno redesenhado a cada frame e esticado (pixelado).
function estatica(canvas) {
  canvas.width = 160; canvas.height = 90;
  const g = canvas.getContext('2d');
  const px = g.createImageData(160, 90);
  return () => {
    for (let i = 0; i < px.data.length; i += 4) {
      const v = Math.random() < .55 ? Math.random() * 60 : 110 + Math.random() * 145;
      px.data[i] = v; px.data[i + 1] = v * .82; px.data[i + 2] = v * .86; px.data[i + 3] = 255;
    }
    g.putImageData(px, 0, 0);
  };
}

let rodando = false;

export function iniciar({ lang = 'pt' } = {}) {
  if (rodando) return;
  const parede = document.querySelector('[data-parede]');
  // Fora da home: vai para o topo da home e a transmissão começa lá.
  if (!parede) {
    try { sessionStorage.setItem('vox-pendente', '1'); } catch {}
    location.assign(lang === 'en' ? '/en/' : '/');
    return;
  }
  rodando = true;
  const T = TXT[lang] || TXT.pt;
  const raiz = document.documentElement;

  const estilo = document.createElement('style');
  estilo.textContent = CSS;
  document.head.append(estilo);

  const som = montarSom();
  const vermelho = Object.assign(document.createElement('div'), { className: 'vox-vermelho' });
  const hud = Object.assign(document.createElement('div'), { className: 'vox-hud' });
  hud.innerHTML = `<b><i></i>${T.vivo}</b><span>${T.sinal}</span><button type="button">${T.desligar} ×</button>`;
  document.body.append(vermelho, hud);

  // As telas da parede guardam o que mostravam, para voltar igualzinho no fim.
  const telas = [...parede.querySelectorAll('.tela')];
  telas.forEach(t => { const img = t.querySelector('img'); t.dataset.voxSrc = img.getAttribute('src'); t.dataset.voxNome = t.querySelector('.tela__nome').textContent; });

  const timers = [];
  const depois = (s, f) => timers.push(setTimeout(f, s * 1000));
  let tv = null, desenhar = null, quadro = 0, fim = false;

  // Artefatos de sinal ruim por cima de tudo: faixas rasgadas (filtro no que está atrás),
  // blocos de cor estourada, pedaços de estática e barras de cor. Cada um vive uma fração de segundo.
  const artefatos = Object.assign(document.createElement('div'), { className: 'vox-artefatos' });
  artefatos.style.setProperty('--chiado', getComputedStyle(parede).getPropertyValue('--chiado') || 'none');
  document.body.append(artefatos);
  const FILTROS = ['invert(1)', 'hue-rotate(150deg) saturate(3)', 'contrast(3) brightness(1.5)', 'grayscale(1) contrast(5)', 'invert(1) hue-rotate(180deg)', 'saturate(6) hue-rotate(-40deg)'];
  const CORES = ['#ff2b3d', '#22e0ff', '#ffffff', '#7a00ff', '#00ff6a', '#ffe600'];
  function artefato(forca) {
    const el = document.createElement('i');
    const W = innerWidth, H = innerHeight, sorte = Math.random();
    if (sorte < .42) {
      el.className = 'vox-faixa';
      el.style.cssText = `top:${entre(0, H)}px;height:${entre(3, 14 + 46 * forca)}px;--dx:${entre(-90, 90) * forca}px;--f:${sorteia(FILTROS)}`;
    } else if (sorte < .78) {
      el.className = 'vox-bloco';
      el.style.cssText = `left:${entre(-40, W)}px;top:${entre(0, H)}px;width:${entre(20, 120 + 260 * forca)}px;height:${entre(6, 30 + 90 * forca)}px;background:${sorteia(CORES)}`;
    } else if (sorte < .94) {
      el.className = 'vox-ruido';
      el.style.cssText = `left:${entre(-40, W)}px;top:${entre(0, H)}px;width:${entre(60, 200 + 300 * forca)}px;height:${entre(20, 60 + 140 * forca)}px;background-position:${entre(0, 96)}px ${entre(0, 96)}px`;
    } else {
      el.className = 'vox-barras';
      el.style.cssText = `top:${entre(0, H)}px;height:${entre(10, 40 + 80 * forca)}px`;
    }
    artefatos.append(el);
    setTimeout(() => el.remove(), entre(50, 140 + 160 * forca));
  }
  const principal = document.querySelector('main');
  const textos = [...document.querySelectorAll('.hero__kicker, .hero__cargo, .hero__lead, .hero__simular, .hero__acoes')];
  function tranco(forca) {
    if (!principal) return;
    principal.style.setProperty('--tx', `${entre(-14, 14) * forca}px`);
    principal.style.setProperty('--ty', `${entre(-8, 8) * forca}px`);
    principal.style.setProperty('--sk', `${entre(-1.6, 1.6) * forca}deg`);
    principal.classList.add('vox-tranco');
    setTimeout(() => principal.classList.remove('vox-tranco'), entre(50, 110));
    const txt = sorteia(textos);
    if (txt) { txt.classList.add('vox-rgb'); setTimeout(() => txt.classList.remove('vox-rgb'), entre(120, 420)); }
  }
  // Intensidade: começa fraca, cresce até a TV e segue forte durante a transmissão.
  const forcaEm = s => Math.min(1, Math.max(.15, (s - 1) / 8));
  function agendarBugs() {
    if (!movimento) return;
    for (let s = 1; s < DURACAO - .8; s += entre(.05, .16)) {
      depois(s, () => {
        const f = forcaEm(s);
        for (let k = 0, n = 1 + Math.floor(Math.random() * (1 + 4 * f)); k < n; k++) artefato(f);
        if (Math.random() < .18 + .3 * f) tranco(f);
      });
    }
  }

  function viraVox(t, forte, trocar = true) {
    if (forte && movimento) {
      t.style.setProperty('--chiado-ms', Math.round(entre(320, 900)) + 'ms');
      t.style.setProperty('--chiado-forca', '.96');
      t.classList.remove('chiando'); void t.offsetWidth; t.classList.add('chiando');
      setTimeout(() => t.classList.remove('chiando'), 900);
    }
    if (!trocar) return;
    setTimeout(() => {
      if (fim) return;
      t.querySelector('img').src = fotoVox();
      t.querySelector('.tela__nome').textContent = T.tela;
    }, forte ? 160 : 0);
  }

  // Invasão: as telas à vista viram uma a uma, chiando; as outras viram de uma vez no fim.
  function invadir() {
    const h = parede.getBoundingClientRect();
    const vistas = telas.filter(t => { const r = t.getBoundingClientRect(); return t.offsetParent && r.bottom > h.top && r.top < h.bottom && r.right > h.left && r.left < h.right; });
    vistas.sort(() => Math.random() - .5).forEach((t, i) => depois(i * entre(.08, .2), () => viraVox(t, true)));
    depois(7, () => telas.filter(t => !vistas.includes(t)).forEach(t => viraVox(t, false)));
    // Depois de virar, as telas não param de chiar: rajadas de 1 a 3 telas a cada fração de
    // segundo, metade delas trocando de Vox, até a TV entrar.
    const alvo = () => sorteia(vistas.length ? vistas : telas);
    for (let s = 1.2; s < 10; s += entre(.07, .17)) depois(s, () => { for (let k = 0, n = 1 + Math.floor(Math.random() * 3); k < n; k++) viraVox(alvo(), true, Math.random() < .5); });
  }

  // A transmissão em tela cheia: o vídeo (deitado em tela larga) ou, sem ele, as fotos.
  function ligarTv() {
    tv = Object.assign(document.createElement('div'), { className: 'vox-tv', role: 'img' });
    tv.setAttribute('aria-label', T.sinal);
    const largo = innerWidth > innerHeight;
    const video = Object.assign(document.createElement('video'), { muted: true, loop: true, autoplay: true, playsInline: true, src: VIDEO });
    if (largo) video.classList.add('deitado');
    const canvas = document.createElement('canvas');
    desenhar = estatica(canvas);
    tv.append(video, canvas);
    document.body.append(tv);
    requestAnimationFrame(() => tv.classList.add('on'));
    let fotos = null;
    video.addEventListener('error', () => {
      video.remove();
      // As fotos já são horizontais: não giram.
      const img = Object.assign(document.createElement('img'), { src: fotoVox(), alt: '' });
      tv.insertBefore(img, canvas);
      fotos = setInterval(() => { if (!fim) img.src = fotoVox(); }, 1300);
      timers.push(fotos);
    }, { once: true });
    video.play?.().catch(() => {});
  }

  // Um frame: estática (sempre um pouco, nunca limpa), tremor e o vermelho da HUD.
  function loop() {
    if (fim) return;
    quadro++;
    if (tv && desenhar) {
      if (quadro % 2 === 0) desenhar();
      const canvas = tv.querySelector('canvas');
      // "Volta mas nunca volta bem": a estática oscila e às vezes toma a tela.
      const alvo = movimento ? (Math.random() < .08 ? entre(.8, .97) : entre(.28, .62)) : .4;
      canvas.style.opacity = alvo.toFixed(2);
      const midia = tv.querySelector('video, img');
      if (midia && movimento) midia.style.transform = Math.random() < .12 ? `translate(${entre(-14, 14)}px, ${entre(-6, 6)}px) skewX(${entre(-4, 4)}deg)` : '';
    }
    requestAnimationFrame(loop);
  }

  function encerrar() {
    if (fim) return;
    fim = true;
    timers.forEach(id => { clearTimeout(id); clearInterval(id); });
    som?.parar();
    hud.classList.remove('on');
    raiz.classList.remove('vox-glitch');
    const limpar = () => {
      tv?.remove();
      vermelho.style.transition = 'opacity .8s ease';
      vermelho.classList.remove('on');
      telas.forEach(t => {
        t.classList.remove('chiando');
        t.querySelector('img').src = t.dataset.voxSrc;
        t.querySelector('.tela__nome').textContent = t.dataset.voxNome;
        delete t.dataset.voxSrc; delete t.dataset.voxNome;
      });
      setTimeout(() => {
        vermelho.remove(); hud.remove(); artefatos.remove(); estilo.remove();
        principal?.classList.remove('vox-tranco');
        textos.forEach(t => t.classList.remove('vox-rgb'));
        raiz.classList.remove('vox-on');
        removeEventListener('keydown', tecla);
        rodando = false;
      }, 850);
    };
    if (tv && movimento) { tv.classList.add('desligando'); setTimeout(limpar, 640); } else limpar();
  }
  const tecla = e => { if (e.key === 'Escape') encerrar(); };
  addEventListener('keydown', tecla);
  hud.querySelector('button').addEventListener('click', encerrar);

  function comecar() {
    raiz.classList.add('vox-on');
    scrollTo({ top: 0, behavior: movimento ? 'smooth' : 'auto' });
    hud.classList.add('on');
    depois(.4, invadir);
    agendarBugs();
    depois(2, () => { vermelho.classList.add('on'); if (movimento) raiz.classList.add('vox-glitch'); });
    depois(10, ligarTv);
    if (som) for (let s = .5; s < DURACAO; s += entre(.25, .6)) depois(s, () => som.mexer());
    depois(DURACAO - .6, encerrar);
    requestAnimationFrame(loop);
  }

  // A música precisa de um gesto do usuário. O código (ou os toques) quase sempre basta; se o
  // navegador barrar (iPhone, ou quando veio de outra página), aparece um botão para sintonizar.
  if (!som) { comecar(); return; }
  som.tocar().then(comecar).catch(() => {
    const botao = Object.assign(document.createElement('button'), { className: 'vox-play', type: 'button' });
    botao.innerHTML = `▶ ${T.sintonizar}`;
    document.body.append(botao);
    hud.classList.add('on');
    botao.addEventListener('click', () => { botao.remove(); som.tocar().catch(() => {}).finally(comecar); }, { once: true });
  });
}
