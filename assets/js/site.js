// davicjc.com — comportamento do site. Sem dependências.
// Tudo aqui é melhoria progressiva: sem JavaScript, o conteúdo inteiro continua legível.

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const movimento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const lang = document.body.dataset.lang || 'pt';
const TXT = {
  pt: { resumo: (n, t, ms) => `${n}/${t} respondendo · mediana ${ms} ms`, nenhum: 'sem resposta do seu navegador', sem: 'sem resposta', fechar: 'Fechar' },
  en: { resumo: (n, t, ms) => `${n}/${t} responding · median ${ms} ms`, nenhum: 'no reply from your browser', sem: 'no reply', fechar: 'Close' }
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

/* ───────── A fibra: pings reais até sistemas em produção ───────── */
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
  const fibra = $('[data-fibra]');
  if (!fibra) return;
  const trilho = $('[data-trilho]', fibra);
  const origem = $('[data-origem] .led', fibra);
  const resumo = $('[data-resumo]', fibra);
  const estacoes = $$('.estacao', fibra);
  const horizontal = matchMedia('(min-width: 900px)');
  const ultimos = new Map();
  let visivel = true;

  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }).observe(fibra);

  const centro = el => { const a = el.getBoundingClientRect(), b = trilho.getBoundingClientRect(); return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 }; };

  function pacote(estacao, ms) {
    if (!movimento) return Promise.resolve();
    const no = $('.estacao__no', estacao);
    const p = document.createElement('span');
    p.className = 'pacote';
    trilho.append(p);
    const de = centro(origem), ate = centro(no);
    const duracao = Math.min(1700, Math.max(520, 420 + (ms || 300) * 4.2));
    const quadros = horizontal.matches
      ? [{ transform: `translateX(${de.x - 34}px)`, opacity: 0 }, { opacity: 1, offset: .12 }, { transform: `translateX(${ate.x - 34}px)`, opacity: 1 }]
      : [{ transform: `translateY(${de.y - 30}px)`, opacity: 0 }, { opacity: 1, offset: .12 }, { transform: `translateY(${ate.y - 30}px)`, opacity: 1 }];
    const anim = p.animate(quadros, { duration: duracao, easing: 'cubic-bezier(.45,.05,.25,1)' });
    return anim.finished.catch(() => {}).then(() => p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).finished.catch(() => {})).then(() => p.remove());
  }

  function mostrar(estacao, ms) {
    const alvo = $('[data-ms]', estacao);
    const rotulo = alvo.querySelector('.sr')?.outerHTML || '';
    if (ms == null) { estacao.dataset.estado = 'falha'; alvo.innerHTML = rotulo + TXT.sem; return; }
    estacao.dataset.estado = 'ok';
    alvo.innerHTML = `${rotulo}${Math.round(ms)}<small>ms</small>`;
  }

  function atualizarResumo() {
    const vals = estacoes.map(e => ultimos.get(e)).filter(x => x != null).sort((a, b) => a - b);
    if (!vals.length) { resumo.textContent = TXT.nenhum; return; }
    const mediana = vals[Math.floor((vals.length - 1) / 2)];
    resumo.textContent = TXT.resumo(vals.length, estacoes.length, Math.round(mediana));
  }

  async function primeiraRodada() {
    // Duas medições por destino: a primeira abre a conexão (DNS + TLS), a segunda mede o caminho.
    const medidas = estacoes.map(async e => {
      const url = e.dataset.url;
      const a = await medir(url);
      if (a == null) return null;
      const b = await medir(url);
      return b == null ? a : Math.min(a, b);
    });
    // Os pacotes saem em sequência, um pouco sobrepostos; cada valor só aparece quando o seu pacote chega.
    const chegadas = [];
    for (const [i, e] of estacoes.entries()) {
      const ms = await medidas[i];
      ultimos.set(e, ms);
      const chegada = pacote(e, ms).then(() => { mostrar(e, ms); atualizarResumo(); });
      chegadas.push(chegada);
      await Promise.race([chegada, new Promise(r => setTimeout(r, 260))]);
    }
    await Promise.all(chegadas);
  }

  async function aoVivo() {
    if (visivel && document.visibilityState === 'visible') {
      const e = estacoes[Math.floor(Math.random() * estacoes.length)];
      const ms = await medir(e.dataset.url, 4000);
      if (ms != null || ultimos.get(e) == null) {
        ultimos.set(e, ms);
        await pacote(e, ms);
        mostrar(e, ms);
        atualizarResumo();
      }
    }
    setTimeout(aoVivo, 3200 + Math.random() * 1800);
  }

  const inicio = movimento ? 1500 : 0;
  setTimeout(() => primeiraRodada().then(() => setTimeout(aoVivo, 2500)), inicio);
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
  const ir = n => {
    quadros[i].classList.remove('ativo');
    i = (n + quadros.length) % quadros.length;
    quadros[i].classList.add('ativo');
    if (legenda) legenda.textContent = quadros[i].dataset.legenda || '';
  };
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: .35 }).observe(j);
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
