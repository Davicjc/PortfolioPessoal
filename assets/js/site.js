// davicjc.com — comportamento do site. Sem dependências.
// Tudo aqui é melhoria progressiva: sem JavaScript, o conteúdo inteiro continua legível.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const movimento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const lang = document.body.dataset.lang || 'pt';
const TXT = {
  pt: { sem: 'sem resposta', fechar: 'Fechar', ovos: 'Duvido você achar os easter eggs da página!' },
  en: { sem: 'no reply', fechar: 'Close', ovos: 'Bet you can’t find this site’s easter eggs!' }
}[lang];

/* Rotas antigas da SPA (#/projetos, #/sobre, #/contato) continuam funcionando. */
(() => {
  const h = location.hash;
  const mapa = { '#/projetos': lang === 'en' ? '/en/projects/' : '/projetos/', '#/sobre': '#trajetoria', '#/contato': '#contato', '#/': '#conteudo' };
  const destino = Object.entries(mapa).find(([k]) => h === k || h.startsWith(k + '/'));
  if (destino) location.replace(destino[1].startsWith('#') ? location.pathname + destino[1] : destino[1]);
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'en' && lang === 'pt') location.replace('/en/');
})();

/* Cabeçalho: borda ao rolar e menu do celular. */
(() => {
  const topo = $('[data-topo]');
  if (!topo) return;
  const aoRolar = () => topo.toggleAttribute('data-rolou', scrollY > 8);
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();
  const botao = $('[data-menu]', topo);
  const fechar = () => { topo.removeAttribute('data-aberto'); botao?.setAttribute('aria-expanded', 'false'); };
  botao?.addEventListener('click', () => {
    const aberto = topo.toggleAttribute('data-aberto');
    botao.setAttribute('aria-expanded', String(aberto));
  });
  $$('.nav a', topo).forEach(a => a.addEventListener('click', fechar));
  addEventListener('keydown', e => e.key === 'Escape' && fechar());
})();

/* Relógio de Uberlândia no hero. */
(() => {
  const el = $('[data-relogio]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const tic = () => { el.textContent = fmt.format(new Date()) + (lang === 'en' ? ' local time' : ' agora'); };
  tic(); setInterval(tic, 20000);
})();

/* Entrada do hero só depois das fontes, para nada pular de lugar. */
(document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(() => document.body.classList.add('pronto')));

/* ───────── A parede de produção: telas reais correndo, com ping de verdade ─────────
   O movimento é todo CSS (só transform). Aqui: a parede para quando o topo sai da tela, e cada
   sistema com sonda é medido do navegador de quem visita; o tempo aparece na barra de todas as
   cópias daquela tela. */
async function medir(url, limite = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), limite);
  const t0 = performance.now();
  try {
    await fetch(url + (url.includes('?') ? '&' : '?') + '_=' + Date.now().toString(36), { mode: 'no-cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal: ctrl.signal });
    return performance.now() - t0;
  } catch { return null; } finally { clearTimeout(timer); }
}

(() => {
  const parede = $('[data-parede]');
  if (!parede) return;
  // Colunas que só o PC mostra: o lazy não as acha dentro do plano inclinado, então carregam já.
  if (matchMedia('(min-width: 900px)').matches) $$('img[loading="lazy"]', parede).forEach(i => { i.loading = 'eager'; });
  let visivel = true;
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; parede.classList.toggle('parada', !visivel); }).observe(parede);

  // A cada visita, cada coluna embaralha a própria ordem. As duas metades continuam iguais
  // (é o que deixa o laço sem emenda), então a segunda é refeita como cópia da primeira.
  const sorteia = lista => lista[Math.floor(Math.random() * lista.length)];
  for (const col of $$('.parede__coluna', parede)) {
    const metade = [...col.children].slice(0, col.children.length / 2);
    for (let i = metade.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [metade[i], metade[j]] = [metade[j], metade[i]]; }
    col.replaceChildren(...metade, ...metade.map(t => t.cloneNode(true)));
  }
  // A tela gêmea (mesma posição na outra metade) muda junto, senão o laço pularia na emenda.
  const gemea = t => { const irmas = [...t.parentNode.children], i = irmas.indexOf(t), n = irmas.length / 2; return irmas[(i + n) % irmas.length]; };

  // Chiado de TV: um quadro de ruído desenhado uma vez só e reaproveitado por todas as telas.
  if (movimento) {
    const quadro = document.createElement('canvas');
    quadro.width = quadro.height = 90;
    const g = quadro.getContext('2d');
    const px = g.createImageData(90, 90);
    for (let i = 0; i < px.data.length; i += 4) {
      const v = Math.random() < .5 ? Math.random() * 70 : 120 + Math.random() * 135;
      px.data[i] = px.data[i + 1] = px.data[i + 2] = v; px.data[i + 3] = 255;
    }
    g.putImageData(px, 0, 0);
    quadro.toBlob(b => b && parede.style.setProperty('--chiado', `url(${URL.createObjectURL(b)})`));
  }
  function chiar(tela, ms, forca) {
    for (const t of [tela, gemea(tela)]) {
      t.style.setProperty('--chiado-ms', ms + 'ms');
      t.style.setProperty('--chiado-forca', forca);
      t.classList.remove('chiando');
      void t.offsetWidth;
      t.classList.add('chiando');
      clearTimeout(t._chiado);
      t._chiado = setTimeout(() => t.classList.remove('chiando'), ms);
    }
  }
  // Só as telas que estão aparecendo agora, dentro do topo.
  const naTela = () => {
    const h = parede.getBoundingClientRect();
    return $$('.tela', parede).filter(t => {
      if (!t.offsetParent) return false;
      const r = t.getBoundingClientRect();
      return r.bottom > h.top + 40 && r.top < h.bottom - 40 && r.right > h.left + 40 && r.left < h.right - 40;
    });
  };
  // Canais: as telas sem sonda (as com sonda ficam fixas, por causa do ping).
  const canais = [...new Map($$('.tela:not([data-sonda])', parede).map(t => [$('img', t).getAttribute('src'), { src: $('img', t).getAttribute('src'), nome: $('.tela__nome', t).textContent, w: $('img', t).getAttribute('width'), h: $('img', t).getAttribute('height') }])).values()];
  function trocarCanal(tela) {
    const atual = $('img', tela).getAttribute('src');
    const prox = sorteia(canais.filter(c => c.src !== atual));
    if (!prox) return;
    const pre = new Image();
    pre.src = prox.src;
    pre.decode().catch(() => {}).finally(() => {
      chiar(tela, 640, .94);
      setTimeout(() => {
        for (const t of [tela, gemea(tela)]) {
          const img = $('img', t);
          img.src = prox.src;
          if (prox.w) { img.width = +prox.w; img.height = +prox.h; }
          $('.tela__nome', t).textContent = prox.nome;
        }
      }, 220);
    });
  }
  // Durante o easter egg (html.vox-on) a VoxTek manda nas telas: nada de trocar canal por baixo.
  const ativa = () => visivel && document.visibilityState === 'visible' && !document.documentElement.classList.contains('vox-on');
  // Interferência: de vez em quando uma tela chia rápido; uma em três vezes, troca de canal.
  function interferencia() {
    if (ativa()) {
      const telas = naTela();
      const t = sorteia(telas.filter(x => !x.classList.contains('chiando')));
      if (t) {
        if (!t.dataset.sonda && Math.random() < .35) trocarCanal(t);
        else chiar(t, 240 + Math.random() * 200, .45 + Math.random() * .3);
      }
    }
    setTimeout(interferencia, 1400 + Math.random() * 2200);
  }
  if (movimento) setTimeout(interferencia, 2600);

  const sondas = [...new Set($$('[data-sonda]', parede).map(t => t.dataset.sonda))];
  function mostrar(url, ms) {
    $$('[data-sonda]', parede).filter(t => t.dataset.sonda === url).forEach(t => {
      t.classList.toggle('sem-resposta', ms == null);
      const alvo = $('[data-ms]', t);
      if (!alvo) return;
      alvo.textContent = ms == null ? TXT.sem : Math.round(ms) + ' ms';
      alvo.classList.add('nova');
      requestAnimationFrame(() => requestAnimationFrame(() => alvo.classList.remove('nova')));
    });
  }
  // Duas medições por destino: a primeira abre a conexão (DNS + TLS), a segunda mede o caminho.
  async function primeira(url) {
    const a = await medir(url);
    const b = a == null ? null : await medir(url);
    mostrar(url, b == null ? a : Math.min(a, b));
  }
  // Ao vivo: de tempos em tempos um sistema é medido de novo, só com o topo à vista.
  async function aoVivo() {
    if (visivel && document.visibilityState === 'visible' && sondas.length) {
      const url = sondas[Math.floor(Math.random() * sondas.length)];
      const ms = await medir(url, 4000);
      if (ms != null) mostrar(url, ms);
    }
    setTimeout(aoVivo, 3600 + Math.random() * 2000);
  }
  const comecar = () => { sondas.forEach(primeira); setTimeout(aoVivo, 4000); };
  if (document.readyState === 'complete') comecar(); else addEventListener('load', comecar, { once: true });
})();


/* ───────── Barramento: o pacote desce acompanhando a leitura ───────── */
(() => {
  const bar = $('[data-barramento]');
  if (!bar || !movimento) { $$('.caso, .rede, .medios', bar || document).forEach(n => n.classList.add('aceso')); return; }
  const nos = $$(':scope > .caso, :scope > .rede, :scope > .medios', bar);
  let pedido = 0;
  const atualizar = () => {
    pedido = 0;
    const r = bar.getBoundingClientRect();
    const meio = innerHeight * .55;
    const progresso = Math.min(1, Math.max(0, (meio - r.top) / r.height));
    bar.style.setProperty('--pacote-y', (progresso * Math.max(0, r.height - 48)).toFixed(1) + 'px');
    nos.forEach(n => n.classList.toggle('aceso', n.getBoundingClientRect().top + 24 < meio));
  };
  addEventListener('scroll', () => { pedido ||= requestAnimationFrame(atualizar); }, { passive: true });
  addEventListener('resize', atualizar);
  atualizar();
})();

/* ───────── Janelas com várias telas ───────── */
$$('[data-carrossel]').forEach(j => {
  const quadros = $$('.janela__quadro', j);
  const legenda = $('[data-legenda-atual]', j);
  let i = 0, parado = false, visivel = false;
  // As telas seguintes chegam sem src (ver janela() no build): preenche a próxima antes de precisar dela.
  const preparar = n => {
    const img = $('img[data-src]', quadros[(n + quadros.length) % quadros.length]);
    if (!img) return;
    if (img.dataset.srcset) img.srcset = img.dataset.srcset;
    img.src = img.dataset.src;
    img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
  };
  const ir = n => {
    preparar(n);
    quadros[i].classList.remove('ativo');
    i = (n + quadros.length) % quadros.length;
    quadros[i].classList.add('ativo');
    if (legenda) legenda.textContent = quadros[i].dataset.legenda || '';
    preparar(i + 1);
  };
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) preparar(i + 1); }, { threshold: .35 }).observe(j);
  j.addEventListener('mouseenter', () => { parado = true; });
  j.addEventListener('mouseleave', () => { parado = false; });
  $('.janela__tela', j).addEventListener('click', () => ir(i + 1));
  if (movimento) setInterval(() => { if (visivel && !parado && document.visibilityState === 'visible') ir(i + 1); }, 4200);
});

/* ───────── Revelação ao rolar ───────── */
(() => {
  if (!movimento || !('IntersectionObserver' in window)) return;
  const alvos = $$('.secao__cabeca, .caso__texto, .caso__visual, .rede__cabeca, .rede__item, .medio, .entrega, .principio, .marco, .perfil, .depoimento, .certificados, .contato__email, .contato__canais, .prova, .bloco, .projeto__visual, .galeria__item, .vizinho, .metricas--linha');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visivel');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  alvos.forEach(el => {
    const irmaos = [...el.parentElement.children].filter(x => x.tagName === el.tagName);
    el.style.setProperty('--atraso', (irmaos.indexOf(el) % 3) * 90 + 'ms');
    el.setAttribute('data-revelar', '');
    io.observe(el);
  });
  $$('[data-arq]').forEach(a => new IntersectionObserver(([e]) => a.classList.toggle('visivel', e.isIntersecting)).observe(a));
})();
if (!movimento) $$('[data-arq]').forEach(a => a.classList.add('visivel'));

/* ───────── Números que contam ao aparecer ───────── */
(() => {
  if (!movimento) return;
  const fmt = new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'pt-BR');
  $$('[data-contar]').forEach(el => {
    const texto = el.textContent.trim();
    if (!/^\d{1,3}([.,]\d{3})*$/.test(texto)) return;
    const alvo = Number(texto.replace(/[.,]/g, ''));
    new IntersectionObserver(([e], io) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1300;
      const passo = t => {
        const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 4);
        el.textContent = fmt.format(Math.round(alvo * ease));
        if (k < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }, { threshold: .6 }).observe(el);
  });
})();

/* ───────── Filtros por situação e "ver mais" ───────── */
$$('[data-filtros]').forEach(grupo => {
  const lista = grupo.nextElementSibling?.matches('[data-entregas]') ? grupo.nextElementSibling : $('[data-entregas]');
  const mais = $('[data-mais]');
  const itens = $$('.entrega', lista);
  if (mais) {
    mais.hidden = false;
    mais.addEventListener('click', () => { itens.forEach(i => i.classList.add('revelada')); mais.hidden = true; });
  }
  grupo.addEventListener('click', e => {
    const b = e.target.closest('[data-filtro]');
    if (!b) return;
    $$('[data-filtro]', grupo).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.filtro;
    itens.forEach(i => {
      i.hidden = !!f && i.dataset.situacaoItem !== f;
      if (f) i.classList.add('revelada');
    });
    if (mais) mais.hidden = !!f || itens.every(i => i.classList.contains('revelada'));
  });
});

/* ───────── Copiar e-mail ───────── */
$$('[data-copiar]').forEach(b => b.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(b.dataset.copiar);
    const span = $('span', b), antes = span.textContent;
    span.textContent = b.dataset.copiado;
    setTimeout(() => { span.textContent = antes; }, 2200);
  } catch { location.href = 'mailto:' + b.dataset.copiar; }
}));

/* ───────── Sugestão de idioma (sem redirecionar: buscadores e quem quiser ler em PT ficam onde estão) ───────── */
(() => {
  const alt = $(`link[rel="alternate"][hreflang="${lang === 'pt' ? 'en' : 'pt-BR'}"]`);
  if (!alt) return;
  const prefere = (navigator.languages || [navigator.language || '']).map(l => l.toLowerCase());
  const querOutro = lang === 'pt' ? !prefere.some(l => l.startsWith('pt')) : prefere[0]?.startsWith('pt');
  let dispensado = false;
  try { dispensado = localStorage.getItem('davicjc.idioma') === 'dispensado'; } catch {}
  if (!querOutro || dispensado) return;
  const caixa = document.createElement('div');
  caixa.className = 'aviso-idioma';
  caixa.setAttribute('role', 'region');
  caixa.setAttribute('lang', lang === 'pt' ? 'en' : 'pt-BR');
  caixa.innerHTML = lang === 'pt'
    ? `<span>This site is also available in English.</span><a href="${new URL(alt.href).pathname}">Read in English</a>`
    : `<span>Este site também está em português.</span><a href="${new URL(alt.href).pathname}">Ler em português</a>`;
  const x = document.createElement('button');
  x.type = 'button';
  x.setAttribute('aria-label', lang === 'pt' ? 'Close' : 'Fechar');
  x.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  x.addEventListener('click', () => { caixa.remove(); try { localStorage.setItem('davicjc.idioma', 'dispensado'); } catch {} });
  caixa.append(x);
  setTimeout(() => document.body.append(caixa), 2600);
})();

/* ───────── Provocação: um balão discreto na primeira visita (e, depois, só de vez em quando) ───────── */
(() => {
  if (document.body.classList.contains('pagina-avaliacao')) return;
  let ja = null;
  try { ja = localStorage.getItem('provocacao'); } catch {}
  if (ja && Math.random() > .03) return;
  const mostrar = () => setTimeout(() => {
    if (document.documentElement.classList.contains('vox-on')) return;
    const balao = document.createElement('div');
    balao.className = 'provoca';
    balao.setAttribute('role', 'status');
    balao.innerHTML = `<span>${TXT.ovos}</span><button type="button" aria-label="${TXT.fechar}">×</button>`;
    // Se a sugestão de idioma estiver embaixo, o balão sobe para não ficar por cima dela.
    if ($('.aviso-idioma')) balao.style.bottom = '84px';
    document.body.append(balao);
    requestAnimationFrame(() => requestAnimationFrame(() => balao.classList.add('on')));
    const sair = () => { balao.classList.remove('on'); setTimeout(() => balao.remove(), 500); };
    $('button', balao).addEventListener('click', sair);
    setTimeout(sair, 7000);
    try { localStorage.setItem('provocacao', '1'); } catch {}
  }, 2000);
  if (document.readyState === 'complete') mostrar(); else addEventListener('load', mostrar, { once: true });
})();

/* ───────── Easter egg: ↑ ↑ ↓ ↓ ← → ← → (ou 13 toques em "Davi Castro" no celular) ───────── */
(() => {
  const codigo = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
  let pos = 0, carregando = false;
  const abrir = () => {
    if (carregando) return;
    carregando = true;
    import('/assets/js/vox.js?v=' + (document.body.dataset.vox || '1'))
      .then(m => m.iniciar({ lang }))
      .catch(e => console.warn('vox:', e))
      .finally(() => { carregando = false; });
  };
  addEventListener('keydown', e => {
    if (e.target.closest?.('input, textarea, [contenteditable]')) return;
    pos = e.key === codigo[pos] ? pos + 1 : (e.key === codigo[0] ? 1 : 0);
    if (pos === codigo.length) { pos = 0; abrir(); }
  });
  // Disparado em outra página: a transmissão começa quando a home abre.
  try { if (sessionStorage.getItem('vox-pendente') && $('[data-parede]')) { sessionStorage.removeItem('vox-pendente'); abrir(); } } catch {}
  const estado = $('.hero__titulo');
  if (estado) {
    let toques = [];
    estado.addEventListener('pointerdown', () => {
      const agora = Date.now();
      toques = toques.filter(t => agora - t < 6000).concat(agora);
      if (toques.length >= 13) { toques = []; abrir(); }
    });
  }
  const dica = lang === 'en'
    ? ['%c📺 Psst… a VoxTek signal is leaking into this site.', '%cType ↑ ↑ ↓ ↓ ← → ← → anywhere on the page (on a phone: tap “Davi Castro” 13 times).']
    : ['%c📺 Psst… tem um sinal da VoxTek vazando neste site.', '%cDigite ↑ ↑ ↓ ↓ ← → ← → em qualquer lugar da página (no celular: toque 13 vezes em “Davi Castro”).'];
  console.log(dica[0] + '\n' + dica[1], 'color:#7fe7ff;font:600 14px/1.6 monospace', 'color:#a9b3bf;font:12px/1.6 monospace');
})();
