#!/usr/bin/env node
// Puxa o conteúdo do Firestore pela API REST pública (as regras liberam leitura) e grava data/firestore.json.
// Sem SDK e sem chave: é o mesmo que um visitante consegue ler. O painel /adm continua sendo o único lugar que escreve.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJETO = 'portfoliopessoal-9aa5b';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJETO}/databases/(default)/documents`;
const COLECOES = ['projetos', 'experiencias', 'capacidades', 'depoimentos', 'certificados', 'clientes', 'contatos', 'categorias'];
const SAIDA = join(RAIZ, 'data/firestore.json');

// Converte o formato tipado do REST ({stringValue: ...}) em JSON comum.
function valor(v) {
  if (v == null) return null;
  const [tipo, x] = Object.entries(v)[0];
  switch (tipo) {
    case 'stringValue': case 'booleanValue': case 'timestampValue': case 'doubleValue': return x;
    case 'integerValue': return Number(x);
    case 'nullValue': return null;
    case 'arrayValue': return (x.values || []).map(valor);
    case 'mapValue': return Object.fromEntries(Object.entries(x.fields || {}).map(([k, vv]) => [k, valor(vv)]));
    default: return x;
  }
}
const documento = d => ({ id: d.name.split('/').pop(), ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, valor(v)])), _atualizado: d.updateTime });
// Chaves em ordem alfabética e documentos por id: o REST não garante ordem, e o arquivo só deve mudar
// quando o conteúdo muda (a automação agendada commita apenas diferenças reais).
const ordenado = o => (Array.isArray(o) ? o.map(ordenado) : o && typeof o === 'object' ? Object.fromEntries(Object.keys(o).sort().map(k => [k, ordenado(o[k])])) : o);

async function listar(colecao) {
  const docs = [];
  let pagina = '';
  do {
    const r = await fetch(`${BASE}/${colecao}?pageSize=300${pagina ? '&pageToken=' + pagina : ''}`);
    if (!r.ok) throw new Error(`${colecao}: HTTP ${r.status}`);
    const j = await r.json();
    docs.push(...(j.documents || []).map(documento));
    pagina = j.nextPageToken || '';
  } while (pagina);
  return docs;
}

async function principal() {
  const dados = {};
  const site = await fetch(`${BASE}/config/site`);
  if (!site.ok) throw new Error('config/site: HTTP ' + site.status);
  dados.site = documento(await site.json());
  for (const c of COLECOES) dados[c] = (await listar(c)).sort((a, b) => a.id.localeCompare(b.id));
  mkdirSync(dirname(SAIDA), { recursive: true });
  writeFileSync(SAIDA, JSON.stringify(ordenado(dados), null, 1) + '\n');
  console.log('Firestore → data/firestore.json · ' + COLECOES.map(c => `${c} ${dados[c].length}`).join(' · '));
}

principal().catch(e => {
  // Sem rede ou com o Firebase fora do ar, o build segue com o último retrato salvo.
  if (existsSync(SAIDA)) { console.warn('sync falhou (' + e.message + '); usando o último data/firestore.json'); process.exit(0); }
  console.error(e); process.exit(1);
});
