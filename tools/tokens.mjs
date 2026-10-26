#!/usr/bin/env node
// Gera assets/css/tokens.css a partir de brand/tokens.json.
// A marca tem uma fonte só: site, manual, currículo e imagens de compartilhamento leem os mesmos valores.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = JSON.parse(readFileSync(join(RAIZ, 'brand/tokens.json'), 'utf8'));

const linhas = [];
for (const [nome, v] of Object.entries(t.cor)) linhas.push(`  --${nome}: ${v.hex};`);
for (const [nome, v] of Object.entries(t.escala)) linhas.push(`  --fs-${nome}: ${v};`);
t.espaco.forEach((px, i) => linhas.push(`  --e${i + 1}: ${px / 16}rem;`));
for (const [nome, v] of Object.entries(t.raio)) linhas.push(`  --r-${nome}: ${v};`);
for (const [nome, v] of Object.entries(t.movimento)) if (nome !== 'regra') linhas.push(`  --m-${nome}: ${v};`);
linhas.push(`  --maximo: ${t.grade.maximo};`, `  --calha: ${t.grade.calha};`, `  --margem: ${t.grade['margem-celular']};`);
linhas.push(`  --f-display: "${t.fonte.display.familia}", "Arial Narrow", system-ui, sans-serif;`);
linhas.push(`  --f-texto: "${t.fonte.texto.familia}", system-ui, -apple-system, "Segoe UI", sans-serif;`);
linhas.push(`  --f-dados: "${t.fonte.dados.familia}", ui-monospace, "Cascadia Mono", Consolas, monospace;`);
linhas.push(`  --display-largura: ${t.fonte.display.largura};`);

const situacoes = Object.entries(t.situacao)
  .map(([id, s]) => `[data-situacao="${id}"] { --cor-situacao: var(--${s.cor}); }`)
  .join('\n');

const css = `/* Gerado por tools/tokens.mjs a partir de brand/tokens.json. Não edite à mão. */
:root {
${linhas.join('\n')}
}
${situacoes}
`;
mkdirSync(join(RAIZ, 'assets/css'), { recursive: true });
writeFileSync(join(RAIZ, 'assets/css/tokens.css'), css);
console.log('tokens.css: ' + linhas.length + ' variáveis');
