/* Uso: coloque archivo-500.ttf, archivo-600.ttf (Google Fonts, OFL) e plexmono-400.ttf nesta pasta,
   rode "npm i opentype.js@1.3.4" e depois "node gerar-marca.js ." para regenerar todos os SVGs. */
/* Gera a marca davicjc em SVG puro (texto convertido em contorno, sem depender de fonte).
   Geometria: grade de 4u, traço 7.5u, pontas redondas. O "j" é o barramento e o pingo é o pacote. */
const fs = require('fs'), path = require('path'), o = require('opentype.js');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const C = {
  dark:  { bg: '#0a0d12', fg: '#e8edf3', sig: '#4ade80', dim: '#808b9b' },
  light: { bg: '#f4f6f8', fg: '#0a0d12', sig: '#16a34a', dim: '#5b6675' }
};
const S = 7.5;                       // traço
const r2 = n => Math.round(n * 100) / 100;

/* ── símbolo cjc ─────────────────────────────────────────────── */
function cArc(cx, cy, r){
  const a = 42 * Math.PI / 180;
  const x1 = cx + r * Math.cos(-a), y1 = cy + r * Math.sin(-a);
  const x2 = cx + r * Math.cos(a),  y2 = cy + r * Math.sin(a);
  return `M${r2(x1)} ${r2(y1)} A${r} ${r} 0 1 0 ${r2(x2)} ${r2(y2)}`;
}
const CJC = {
  w: 112, h: 100,
  strokes: [cArc(24, 50, 18.5), 'M54 32.5 V76 A13 13 0 0 1 41 89', cArc(87.5, 50, 18.5)],
  dot: { cx: 54, cy: 17, r: 5.5 }
};
function cjcGroup(col, s = S){
  return `<g fill="none" stroke="${col.fg}" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round">` +
    CJC.strokes.map(d => `<path d="${d}"/>`).join('') + `</g>` +
    `<circle cx="${CJC.dot.cx}" cy="${CJC.dot.cy}" r="${CJC.dot.r}" fill="${col.sig}"/>`;
}

/* ── monograma D: a haste é o barramento, interrompida pelo nó verde (o pacote) ── */
function dGroup(col, s = 8, ring = true){
  const bg = col.bg;
  return `<g fill="none" stroke="${col.fg}" stroke-width="${s}" stroke-linecap="round" stroke-linejoin="round">` +
    `<path d="M30 22 H48 A28 28 0 0 1 48 78 H30 Z"/></g>` +
    (ring ? `<circle cx="30" cy="50" r="9.5" fill="${bg}"/>` : '') +
    `<circle cx="30" cy="50" r="6.5" fill="${col.sig}"/>`;
}

/* ── texto → contorno ─────────────────────────────────────────── */
const fonts = {
  a600: o.loadSync(path.join(__dirname, 'archivo-600.ttf')),
  a500: o.loadSync(path.join(__dirname, 'archivo-500.ttf')),
  mono: o.loadSync(path.join(__dirname, 'plexmono-400.ttf'))
};
function textPath(font, str, x, y, size, track = 0){
  let d = '', cx = x, prev = null; const sc = size / font.unitsPerEm;
  for (const ch of str){
    const g = font.charToGlyph(ch);
    if (prev) cx += font.getKerningValue(prev, g) * sc;
    d += g.getPath(cx, y, size).toPathData(2);
    cx += g.advanceWidth * sc + track * size;
    prev = g;
  }
  return { d, end: cx - track * size };
}

/* wordmark davicjc: Archivo 600, j sem pingo + pacote verde redondo */
function wordmark(col, x, y, size){
  const f = fonts.a600, sc = size / f.unitsPerEm, track = -0.02;
  const t = textPath(f, 'davicȷc', x, y, size, track);
  // posição do j sem pingo: soma dos avanços até ele
  let cx = x, prev = null;
  for (const ch of 'davic'){ const g = f.charToGlyph(ch); if (prev) cx += f.getKerningValue(prev, g) * sc; cx += g.advanceWidth * sc + track * size; prev = g; }
  const gj = f.charToGlyph('ȷ'); cx += f.getKerningValue(prev, gj) * sc;
  const dotX = cx + 126 * sc, dotY = y - 668 * sc, dotR = 62 * sc;
  return { svg: `<path d="${t.d}" fill="${col.fg}"/><circle cx="${r2(dotX)}" cy="${r2(dotY)}" r="${r2(dotR)}" fill="${col.sig}"/>`, end: t.end };
}

function svg(w, h, body, bg, title){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r2(w)} ${r2(h)}" width="${r2(w)}" height="${r2(h)}" role="img" aria-label="${title}">` +
    `<title>${title}</title>` + (bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : '') + body + `</svg>\n`;
}
const write = (n, s) => fs.writeFileSync(path.join(OUT, n), s);

for (const [mode, col] of Object.entries(C)){
  const sfx = mode === 'dark' ? '' : '-claro';
  // 1. símbolo cjc (área de respiro = 1 traço já embutida no viewBox)
  write(`cjc-simbolo${sfx}.svg`, svg(112, 100, cjcGroup(col), null, 'cjc — símbolo Davi Castro'));
  // 2. monograma D
  write(`d-monograma${sfx}.svg`, svg(100, 100, dGroup(col), null, 'D — monograma Davi Castro'));
  // 3. wordmark davicjc
  { const wm = wordmark(col, 0, 62, 80); write(`wordmark-davicjc${sfx}.svg`, svg(wm.end + 2, 82, wm.svg, null, 'davicjc')); }
  // 4. assinatura: D + davi castro + linha mono
  {
    const name = textPath(fonts.a600, 'davi castro', 124, 52, 46, -0.025);
    const tag  = textPath(fonts.mono, 'full stack · infraestrutura de redes', 126, 82, 15, 0.02);
    const w = Math.max(name.end, tag.end) + 4;
    const body = `<g transform="translate(0 0)">${dGroup(col)}</g>` +
      `<path d="M106 18 V82" stroke="${col.dim}" stroke-width="1" opacity=".55"/>` +
      `<path d="${name.d}" fill="${col.fg}"/><path d="${tag.d}" fill="${col.dim}"/>`;
    write(`assinatura-davi-castro${sfx}.svg`, svg(w, 100, body, null, 'Davi Castro — full stack · infraestrutura de redes'));
  }
  // 5. assinatura compacta: símbolo cjc + Davi Castro
  {
    const name = textPath(fonts.a600, 'Davi Castro', 140, 63, 40, -0.025);
    const body = `<g transform="translate(4 0)">${cjcGroup(col)}</g>` + `<path d="${name.d}" fill="${col.fg}"/>`;
    write(`assinatura-cjc${sfx}.svg`, svg(name.end + 4, 100, body, null, 'cjc — Davi Castro'));
  }
}

// 6. ícone de app (512) e favicon — sempre sobre tinta
{
  const col = C.dark;
  const icon = `<rect width="512" height="512" rx="112" fill="${col.bg}"/>` +
    `<rect x="1" y="1" width="510" height="510" rx="111" fill="none" stroke="#1e2632" stroke-width="2"/>` +
    `<g transform="translate(65.2 76) scale(3.6)">${dGroup(col)}</g>`;
  write('app-icon.svg', svg(512, 512, icon, null, 'Davi Castro'));
  // favicon: traço mais grosso para sobreviver a 16px, sem anel
  const fav = `<rect width="100" height="100" rx="22" fill="${col.bg}"/>` +
    `<g transform="translate(-.35 2.5) scale(.95)"><g fill="none" stroke="${col.fg}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"><path d="M30 22 H48 A28 28 0 0 1 48 78 H30 Z"/></g>` +
    `<circle cx="30" cy="50" r="14" fill="${col.bg}"/><circle cx="30" cy="50" r="10" fill="${col.sig}"/></g>`;
  write('favicon.svg', svg(100, 100, fav, null, 'Davi Castro'));
}
console.log(fs.readdirSync(OUT).join('\n'));
