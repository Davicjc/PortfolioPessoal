// BR Code do PIX (EMVCo + CRC16-CCITT) e QR Code (ISO/IEC 18004, versões 1–10, correção L), sem dependências.
// O mesmo módulo roda no build (QR já pronto no HTML, funciona sem JavaScript) e no navegador (troca de valor).

function campo(id, valor) {
  const s = String(valor ?? '');
  return s ? id + String(s.length).padStart(2, '0') + s : '';
}
const ascii = (s, max) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase().trim().slice(0, max);

export function crc16(texto) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Pix "copia e cola" estático; com valor, o app do banco já abre preenchido.
export function pixPayload({ chave, nome, cidade, valor = 0, txid = '***' }) {
  const tx = txid === '***' ? '***' : ascii(txid, 25).replace(/\s+/g, '') || '***';
  const corpo = '000201'
    + campo('26', campo('00', 'br.gov.bcb.pix') + campo('01', String(chave).trim()))
    + '52040000' + '5303986'
    + (valor > 0 ? campo('54', Number(valor).toFixed(2)) : '')
    + '5802BR'
    + campo('59', ascii(nome, 25))
    + campo('60', ascii(cidade, 15))
    + campo('62', campo('05', tx))
    + '6304';
  return corpo + crc16(corpo);
}

/* ── QR Code ── */
// [versão, total de palavras, palavras de correção por bloco, blocos, centros dos padrões de alinhamento]
const VERSOES = [null,
  [1, 26, 7, 1, []], [2, 44, 10, 1, [6, 18]], [3, 70, 15, 1, [6, 22]], [4, 100, 20, 1, [6, 26]], [5, 134, 26, 1, [6, 30]],
  [6, 172, 18, 2, [6, 34]], [7, 196, 20, 2, [6, 22, 38]], [8, 242, 24, 2, [6, 24, 42]], [9, 292, 30, 2, [6, 26, 46]], [10, 346, 18, 4, [6, 28, 50]]];
const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
{ let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x = (x << 1) ^ (x & 128 ? 0x11d : 0); } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

export function qrMatriz(texto) {
  const bytes = [...new TextEncoder().encode(texto)];
  const cfg = VERSOES.slice(1).find(c => bytes.length <= c[1] - c[2] * c[3] - (c[0] <= 9 ? 2 : 3));
  if (!cfg) throw new Error('Texto longo demais para o QR (máx. versão 10).');
  const [ver, total, ec, blocos, alinhamento] = cfg;
  const dados = total - ec * blocos;
  const bits = [];
  const poe = (v, n) => { for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1); };
  poe(4, 4); poe(bytes.length, ver <= 9 ? 8 : 16);
  bytes.forEach(b => poe(b, 8));
  for (let t = 0; t < 4 && bits.length < dados * 8; t++) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const cw = [];
  for (let i = 0; i < bits.length; i += 8) cw.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  for (let p = 0xec; cw.length < dados; p = p === 0xec ? 0x11 : 0xec) cw.push(p);

  let gerador = [1];
  for (let i = 0; i < ec; i++) {
    const prox = new Array(gerador.length + 1).fill(0);
    gerador.forEach((g, j) => { prox[j] ^= g; prox[j + 1] ^= mul(g, EXP[i]); });
    gerador = prox;
  }
  const db = [], eb = [];
  const base = Math.floor(dados / blocos), sobra = dados % blocos;
  for (let b = 0, o = 0; b < blocos; b++) {
    const n = base + (b >= blocos - sobra ? 1 : 0);
    const bloco = cw.slice(o, o + n); o += n;
    const msg = bloco.concat(new Array(ec).fill(0));
    for (let i = 0; i < bloco.length; i++) { const k = msg[i]; if (k) gerador.forEach((g, j) => { msg[i + j] ^= mul(g, k); }); }
    db.push(bloco); eb.push(msg.slice(bloco.length));
  }
  const saida = [];
  for (let i = 0; i < base + (sobra ? 1 : 0); i++) db.forEach(b => { if (i < b.length) saida.push(b[i]); });
  for (let i = 0; i < ec; i++) eb.forEach(b => saida.push(b[i]));
  const fluxo = saida.flatMap(c => [7, 6, 5, 4, 3, 2, 1, 0].map(s => (c >> s) & 1));

  const N = 17 + ver * 4;
  const m = Array.from({ length: N }, () => new Uint8Array(N));
  const reservado = Array.from({ length: N }, () => new Uint8Array(N));
  const poeMod = (r, c, v) => { if (r >= 0 && r < N && c >= 0 && c < N) { m[r][c] = v ? 1 : 0; reservado[r][c] = 1; } };
  const localizador = (R, C) => {
    for (let r = -1; r <= 7; r++) for (let c = -1; c <= 7; c++)
      poeMod(R + r, C + c, (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6)) || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
  };
  localizador(0, 0); localizador(0, N - 7); localizador(N - 7, 0);
  for (let i = 8; i < N - 8; i++) { poeMod(6, i, i % 2 === 0); poeMod(i, 6, i % 2 === 0); }
  // Alinhamento: só os três cantos dos localizadores ficam de fora. Os que cruzam a linha de sincronismo
  // (versão 7 em diante) são desenhados por cima dela.
  const na = alinhamento.length;
  alinhamento.forEach((r, i) => alinhamento.forEach((c, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) return;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) poeMod(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
  }));
  poeMod(4 * ver + 9, 8, 1);
  for (let i = 0; i < 9; i++) { reservado[8][i] = 1; reservado[i][8] = 1; }
  for (let i = 0; i < 8; i++) { reservado[8][N - 1 - i] = 1; reservado[N - 1 - i][8] = 1; }
  if (ver >= 7) {
    let resto = ver;
    for (let i = 0; i < 12; i++) resto = (resto << 1) ^ ((resto >> 11) * 0x1f25);
    const info = (ver << 12) | resto;
    for (let i = 0; i < 18; i++) { const bit = (info >> i) & 1, a = N - 11 + (i % 3), b = Math.floor(i / 3); poeMod(b, a, bit); poeMod(a, b, bit); }
  }
  let k = 0, sobe = true;
  for (let dir = N - 1; dir >= 1; dir -= 2) {
    if (dir === 6) dir = 5;
    for (let n = 0; n < N; n++) {
      const r = sobe ? N - 1 - n : n;
      for (let d = 0; d < 2; d++) {
        const c = dir - d;
        if (!reservado[r][c]) m[r][c] = (k < fluxo.length ? fluxo[k++] : 0) ^ ((r + c) % 2 === 0 ? 1 : 0);
      }
    }
    sobe = !sobe;
  }
  // Formato: correção L com a máscara 0 (111011111000100). O bit mais significativo vai em (8,0) e em (N−1,8);
  // gravar na ordem inversa deixa o QR ilegível para os leitores (era o defeito do gerador antigo do /coffee).
  const formato = 0x77c4;
  const f1 = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
  const f2 = [[N - 1, 8], [N - 2, 8], [N - 3, 8], [N - 4, 8], [N - 5, 8], [N - 6, 8], [N - 7, 8], [8, N - 8], [8, N - 7], [8, N - 6], [8, N - 5], [8, N - 4], [8, N - 3], [8, N - 2], [8, N - 1]];
  for (let i = 0; i < 15; i++) { const b = (formato >> (14 - i)) & 1; m[f1[i][0]][f1[i][1]] = b; m[f2[i][0]][f2[i][1]] = b; }
  return m;
}

// SVG com zona de silêncio de 4 módulos (o mínimo da norma), escuro sobre claro.
export function qrSvg(texto, { rotulo = 'QR Code', escuro = '#0B0F14', claro = '#FFFFFF' } = {}) {
  const m = qrMatriz(texto), N = m.length, z = 4, t = N + z * 2;
  let d = '';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (m[r][c]) d += `M${c + z} ${r + z}h1v1h-1z`;
  return `<svg viewBox="0 0 ${t} ${t}" shape-rendering="crispEdges" role="img" aria-label="${rotulo}"><rect width="${t}" height="${t}" fill="${claro}"/><path d="${d}" fill="${escuro}"/></svg>`;
}
