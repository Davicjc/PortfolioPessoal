# Instruções Copilot — Portfólio Davi Castro

## Visão geral
Portfólio pessoal de Davi Castro (davicjc), desenvolvedor full stack e técnico de redes. Site estático, sem etapa de build, com o conteúdo vindo do **Firestore** e editável pelo painel em `/adm`.

## Arquivos
- `index.html` — o site inteiro: home (`#/`) e aba de projetos (`#/projetos`), roteados por hash. CSS e JS embutidos.
- `adm/index.html` — painel administrativo (Firebase Auth + Firestore). Não indexado (`robots.txt` e `noindex`). Traz a carga inicial do banco embutida em `<script type="application/json" id="semente">`, usada pelo botão "Popular o banco" — sem requisição de rede, funciona até aberto do disco.
- `Curriculo/index.html` (PT) e `Curriculo/en.html` (EN) — currículo A4, pensado para impressão em PDF e leitura por ATS. Os dois têm a mesma estrutura: mudou um, mude o outro.
- `fotos/projetos/*.webp` — capturas dos projetos (1200px, WebP). Mantenha abaixo de ~60KB cada.
- `certificados/` — PDFs linkados pela lista de certificados.

## Dados
- **O Firestore é a fonte de verdade.** Coleções: `projetos`, `experiencias`, `depoimentos`, `certificados`, `clientes`, `capacidades`, `contatos`, e o documento `config/site`.
- Campos traduzíveis usam o par `campo_pt` / `campo_en`. O site lê o idioma atual e cai para `_pt` se `_en` estiver vazio.
- Todo item tem `id`, `ordem` e `publicado` (`false` oculta do site sem apagar).
- O `index.html` carrega uma **semente embutida** entre `/* SEMENTE:INICIO */` e `/* SEMENTE:FIM */`: pinta a página na hora, serve aos buscadores e mantém o site de pé se o Firebase falhar. O painel exporta o JSON para atualizá-la.
- Enquanto `config/site` não existe no banco, coleções vazias no Firestore são ignoradas e a semente vale. Depois que existe, uma coleção vazia no banco esconde a seção no site.
- Para adicionar um campo: declare-o no esquema da seção em `adm/index.html` (array `SECOES`) e leia-o na função de renderização correspondente em `index.html`.

## Segurança
- Todo conteúdo vindo do banco passa por `esc()` antes de entrar no HTML. Nunca concatene valor do banco sem escapar.
- Links passam por `urlSegura()` (só http(s), mailto, tel e caminhos relativos); imagens por `urlImagem()`, que também aceita `data:image/...`.
- A escrita no banco é protegida pelas regras do Firestore (e-mail do dono). As regras estão no painel, em "Banco de dados".

## Design
- Tipografia: Archivo (títulos), IBM Plex Sans (texto), IBM Plex Mono (rótulos e dados).
- Paleta em variáveis `:root`, com tema escuro em `:root[data-tema="escuro"]`. Único acento: `--sinal` (verde).
- Assinatura visual: o diagrama de camadas no hero (interface → aplicação → servidores → rede → dispositivos).
- Movimento contido; `prefers-reduced-motion` é respeitado.

## Deploy
- Estático puro. `adm.davicjc.com`, se apontar para o mesmo site, é redirecionado para `/adm/` por um script no topo do `index.html`.
