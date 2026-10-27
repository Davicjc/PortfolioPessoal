# Instruções para assistentes — Portfólio Davi Castro (davicjc.com, versão 3)

## Visão geral
Portfólio de Davi Castro, **desenvolvedor full stack** (rede/provedor é contexto do trabalho na Audicom, não o foco). Site **estático gerado**: o conteúdo mora no Firestore, é editado no painel `/adm` e `tools/build.mjs` gera as páginas. Não há framework nem dependências; só Node 20+ (e o Chrome para cards e PDFs).

## Não edite à mão (são gerados)
`index.html`, `en/`, `projetos/`, `404.html`, `brand/index.html`, `Curriculo/*.html`, `coffee/`, `sitemap.xml`, `llms.txt`, `data/conteudo.json`, `data/gerados.json`, `assets/css/estilo.css`, `assets/css/curriculo.css`, `assets/css/tokens.css`, `assets/js/cafe-app.js`, `assets/og/*`, os PDFs e os SVGs/ícones de `brand/`.
Mude a fonte e rode o gerador correspondente.

## Onde mexer
- **Templates:** `tools/tpl/` (`inicio.mjs`, `projeto.mjs`, `projetos.mjs`, `curriculo.mjs`, `cafe.mjs`, `marca.mjs`, `comum.mjs` com `<head>`, cabeçalho e rodapé, `textos.mjs` com os textos fixos PT/EN).
- **Estilos:** `assets/css/site.css` (site), `marca.css` (/brand/), `cv.css` (currículo), `cafe.css` (/coffee/). Tokens só em `brand/tokens.json` → `node tools/tokens.mjs`.
- **Scripts do navegador:** `assets/js/site.js`, `vox.js` (easter egg), `cafe.js` + `qr.js` (Pix/QR, também usados no build).
- **Conteúdo:** só pelo `/adm` (Firestore). O banco é a única fonte: `data/firestore.json` é um retrato dele gerado pelo `tools/sync.mjs`, nunca editado à mão. `data/cafe.json` tem os meios de pagamento.

## Comandos
```
node tools/sync.mjs    # Firestore → data/firestore.json
node tools/build.mjs   # gera tudo
node tools/og.mjs      # cards 1200×630 (Chrome)
node tools/pdf.mjs     # PDFs do currículo e do manual (Chrome)
python brand/gerar-marca.py   # SVGs e ícones da marca
```
O build é determinístico: a data vem do conteúdo (updateTime do Firestore). Rodar duas vezes não pode mudar nenhum arquivo; a automação `.github/workflows/atualizar.yml` depende disso.

## Regras de conteúdo
- Cargos e datas exatamente como no ORCID 0009-0005-8485-455X. Números só se forem conferíveis.
- Campos traduzíveis: `campo_pt` / `campo_en`; o site cai para `_pt` quando falta o `_en`.
- Telas de sistemas internos sempre com dados fictícios. Nunca usar dados reais de clientes.
- Todo valor vindo do banco passa por `esc()` antes de entrar no HTML.

## Design
Archivo (títulos, sempre largura 112), IBM Plex Sans (texto), IBM Plex Mono (dados, nunca em parágrafo). Fundo tinta `#090C10`, uma cor de destaque (`#46E08C`, o "pacote"), estados por cor (no ar, em desenvolvimento, descontinuado). Movimento só quando leva informação; `prefers-reduced-motion` mostra o estado final. Manual completo em `/brand/`.

## Deploy
Cloudflare Pages publica a branch `main` (push na main = produção). `adm.davicjc.com` cai em `/adm/` por um script no `<head>`.
