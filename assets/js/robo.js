// davicjc.com — o "não sou robô" (Cloudflare Turnstile) do fim do pedido e do depoimento.
// O script da Cloudflare só é baixado quando um formulário chega ao fim. Fora do davicjc.com
// (localhost, prévias) usa a chave de teste da Cloudflare, que sempre passa.
// Se o script não carregar (bloqueador, rede ruim), o formulário não trava: aoPassar recebe null.

const CHAVE_TESTE = '1x00000000000000000000AA';
let carregando = null;

function carregar() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  carregando ??= new Promise((ok, falha) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => (window.turnstile ? ok(window.turnstile) : falha(new Error('turnstile')));
    s.onerror = () => falha(new Error('turnstile'));
    setTimeout(() => falha(new Error('tempo')), 12000);
    document.head.append(s);
  }).catch(e => { carregando = null; throw e; });
  return carregando;
}

// Desenha o widget em `alvo` e devolve uma função que o remove.
export function naoRobo(alvo, { chave, lang = 'pt', aoPassar, aoExpirar } = {}) {
  const nosso = /(^|\.)davicjc\.com$/.test(location.hostname);
  let id = null;
  let vivo = true;
  carregar().then(ts => {
    if (!vivo || !alvo.isConnected) return;
    id = ts.render(alvo, {
      sitekey: nosso && chave ? chave : CHAVE_TESTE,
      theme: 'dark',
      size: 'flexible',
      language: lang === 'en' ? 'en' : 'pt-br',
      callback: token => aoPassar?.(token),
      'expired-callback': () => aoExpirar?.(),
      'error-callback': () => aoExpirar?.()
    });
  }).catch(() => { if (vivo) aoPassar?.(null); });
  return () => {
    vivo = false;
    if (id != null) try { window.turnstile.remove(id); } catch {}
  };
}
