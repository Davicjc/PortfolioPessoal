---
name: atualiza-repositorio
description: Revisão completa do portfólio davicjc.com, de ponta a ponta. Use quando o Davi disser "claude atualiza meu repositório", "atualiza o portfólio", "atualiza tudo" ou "revisa o site". Ela procura projetos novos no GitHub, certificados novos, confere se os sistemas e as fotos estão em dia, valida as regras do Firebase, arruma o conteúdo pelo painel /adm, escolhe os destaques e publica.
---

# "Claude, atualiza meu repositório"

Roteiro para qualquer IA que pegar este repositório. O pedido é literal: **olhar tudo**, corrigir o que estiver
errado ou velho, decidir o que dá para decidir sozinho e entregar o site publicado, com um relatório curto no fim.

Antes de começar, leia `README.md` (como o site funciona), `PRODUCT.md`, `historico.md` (nesta pasta) e a
memória do projeto, se houver. Trabalhe em português, informal e direto, como o Davi escreve.

## Regras que não mudam

- **Posicionamento:** o Davi é desenvolvedor **full stack**. Redes e ISP são contexto da Audicom Telecom, não o foco.
- **Cargos e datas** seguem o ORCID `0009-0005-8485-455X`. Se o ORCID e o site discordarem, vale o ORCID.
- **Dados reais de clientes nunca entram** no site, em telas, prints ou testes: nada de planilhas de clientes, POPs
  ou pastas de casos da Audicom. Tela de sistema interno é gerada **rodando o sistema com dados fictícios**.
- **Senha do /adm é só dele.** Use a sessão já logada no Chrome dele. Se o painel pedir login, pare e peça para
  ele entrar. Nunca digite a senha nem tente outro caminho.
- **Conteúdo mora no Firestore.** Mudança de texto, projeto, depoimento ou certificado é feita **pelo painel**
  (`https://davicjc.com/adm/`), não editando `data/firestore.json` (o sync de hora em hora sobrescreve).
  Código, layout e textos de interface (`tools/tpl/textos.mjs`) mudam no repositório.
- **Nunca** ponha `pedidos` ou `depoimentos_recebidos` no `COLECOES` de `tools/sync.mjs`: o CI commitaria dados
  de clientes num repositório público.
- **Segredos:** nenhuma chave secreta, senha ou token entra no repositório (ele é público). Chaves públicas
  (apiKey do Firebase, sitekey do Turnstile) podem.
- **Push na `main` = produção** (Cloudflare Pages). O Davi autorizou commit e push direto, depois de testar.

## O que a IA decide sozinha e o que pergunta

**Decide e faz:** corrigir texto errado, desatualizado ou sem tradução; cadastrar projeto novo com textos PT/EN;
trocar prints velhos; escolher os destaques e a ordem; reordenar a parede de telas; aprovar depoimento legítimo
(com a autorização marcada) e traduzir; apagar spam da fila; atualizar números das "provas"; corrigir link quebrado.

**Pergunta antes:** apagar ou despublicar projeto; marcar sistema como descontinuado; mudar cargo, empresa ou
título do topo; publicar depoimento duvidoso; mexer em regras do Firebase no console (quem publica é ele);
qualquer coisa que custe dinheiro ou crie conta nova.

## Roteiro

### 0. Preparar
1. `git fetch && git status`; se a automação publicou algo, `git pull` antes de mexer.
2. `node tools/sync.mjs` puxa o banco. Depois, `node tools/build.mjs`, que tem de terminar com `build ok`.
3. Suba um servidor local (`python -m http.server 8765` na raiz) para os testes visuais.

### 1. Projetos novos no GitHub
1. `gh repo list Davicjc --limit 200 --json name,description,pushedAt,isPrivate,homepageUrl,primaryLanguage,stargazerCount`
   e, se ele tiver organizações, `gh org list` e os repositórios delas.
2. Compare com os projetos do banco (campo `repo` e `demo` em `data/firestore.json`).
3. Repositório novo com código de verdade (não fork vazio, não exercício de 1 commit) vira projeto no painel:
   título, frase de resumo, descrição, papel, stack, situação, ano, PT e EN, link do repo e do sistema no ar.
4. Projeto que já existe mas teve commits relevantes desde a última revisão: atualize descrição, stack e números.
5. Leia o README e o código para escrever com precisão. Não invente métrica: número só se der para conferir.

### 2. Certificados novos
1. Procure nas fontes registradas em `historico.md` → "Fontes de certificados". Na primeira vez, pergunte ao
   Davi onde eles costumam chegar e registre a resposta lá.
2. Candidatos comuns: pasta `certificados/` do repositório, `Downloads` e `Documentos` do PC (PDFs com
   "certificado", "certificate", "conclusão"), e-mails da Alura, Microsoft Learn, Credly, Sicoob, Hacker Rangers etc.
   (Gmail, se o conector estiver ligado), e a seção de licenças do LinkedIn quando ele mandar o print.
3. Para cada um novo: confira nome, emissor, data e link de validação. Salve o PDF em `certificados/<Emissor>/`
   e cadastre no painel (seção Certificados) com os links de PDF e de validação.

### 3. Sistemas no ar
1. Para cada projeto com `demo` e cada tela da parede com `sonda`: `curl -sS -o /dev/null -w "%{http_code} %{time_total}"`.
2. Fora do ar há mais de uma checagem: confirme pelo navegador e pergunte antes de mudar a situação.
3. Voltou ao ar, mudou de endereço ou tem domínio novo: atualize `demo`, `sonda` e o texto da barra da tela.

### 4. Fotos e telas em dia
1. Para cada projeto público, tire um print do sistema no ar (Playwright, 1440×900 e 390×844) e compare com
   `fotos/projetos/<id>*`. Mudou de verdade (layout, marca, seções)? Gere a tela nova.
2. Sistema interno: rode o sistema com dados fictícios e capture; nunca use print com dado real.
3. Para editar imagem (fundo, mockup, trocar texto dentro da imagem), delegue ao Gemini (`agy`, ver o CLAUDE.md
   global) e revise o resultado.
4. Formato: WebP de 1200 px mais a versão de 800 (`-800`); o build gera o resto. Confira os pesos.

### 5. Destaques (a IA escolhe)
Os destaques da home são os projetos com "É estudo de caso" marcado no painel; os dois primeiros da ordem viram
os grandes, o resto vai para "Mais sistemas". Escolha pelos critérios, nesta ordem:
1. No ar e em uso agora.
2. Mostra o full stack inteiro (interface, API, banco, deploy, apps).
3. Tem resultado que dá para conferir (usuários, ordens de serviço, tempo economizado).
4. É recente e tem telas boas.
5. Variedade: não deixe só sistemas internos da Audicom; misture com projeto de cliente e projeto próprio.
Ajuste também a ordem da parede de telas do topo (as telas mais fortes perto do título) e os números das provas.
Explique a escolha em uma linha no relatório.

### 6. Painel /adm: arrumar tudo
1. Abra `https://davicjc.com/adm/` no Chrome dele (extensão Claude in Chrome). Logado? Siga. Se não estiver, peça.
2. Passe por todas as seções: Página inicial, Projetos, Trajetória, Depoimentos, Certificados, Contatos.
   Procure campo vazio em EN, texto em PT na versão EN, erro de digitação, link quebrado e imagem faltando.
3. **Depoimentos recebidos:** aprove os legítimos, traduza `texto_en` e `cargo_en` no editor de Depoimentos,
   apague spam. Na dúvida, pergunte.
4. **Pedidos:** só leia e resuma no relatório (quantos novos, de quem, o que pedem). Não apague.
5. Salve cada mudança pelo botão do painel e confira o aviso "Salvo no banco".

### 7. Firebase e segurança
1. Compare `firestore.rules` com a cópia do painel (Banco e publicação). Têm de ser iguais.
2. Teste o que está **publicado** de fora, sem chave:
   - GET em `projetos`, `depoimentos` e `config/site` → 200;
   - GET em `pedidos` e `depoimentos_recebidos` → 403;
   - POST com campo a mais em `pedidos` → 403.
   Se o publicado estiver diferente do arquivo, avise e mande ele publicar (Firestore → Regras).
3. Turnstile ("não sou robô"): `/pedido/` e `/depoimento/` têm de carregar o widget sem erro no console em
   davicjc.com. A sitekey fica em `data/pedido.json`.
4. Procure chave secreta commitada por engano: `git grep -nE "(secret|token|senha|password)\s*[:=]"`.
5. Melhorias de segurança pendentes (proponha, não faça sem ele): validar o token do Turnstile no servidor
   (Pages Function + segredo) e fechar o `create` público; Firebase App Check.

### 8. Qualidade técnica
1. Build limpo e determinístico: clone limpo com `git -c core.autocrlf=false clone`, `CI=1 TZ=UTC node tools/build.mjs`
   e `git status` vazio. Esse é o teste que vale; o da árvore do Windows não pega CRLF.
2. Varra os links internos e externos de todas as páginas geradas (sitemap.xml) e corrija os 404.
3. Console sem erro em `/`, `/en/`, `/projetos/`, uma página de projeto, `/pedido/`, `/depoimento/`, `/coffee/`, `/Curriculo/`.
4. Prints em 360×800, 390×844, 412×915, 1366×768 e 1920×1080: hero com todos os botões na primeira tela no
   celular, nada estourando na horizontal, seções bem separadas.
5. Se o conteúdo mudou: `node tools/og.mjs` (cards) e `node tools/pdf.mjs` (currículo e manual).
6. Peso da home: anote no relatório (referência de 27/10/2026: 943 KB no PC e 662 KB no celular).

### 9. Melhorias
Liste até 5 melhorias com impacto real (conteúdo, SEO, desempenho, acessibilidade, conversão do pedido). Faça na
hora as pequenas e seguras. Para as grandes, descreva em uma linha e pergunte.

### 10. Publicar e relatar
1. Commits pequenos, um por assunto, mensagem em português.
2. `git fetch`, junte o que a automação publicou, `git push origin main`.
3. Confira em produção: `curl -s https://davicjc.com/ | grep -o 'estilo.css?v=[a-z0-9]*'` com o hash novo.
4. Acrescente uma entrada em `historico.md` (data, o que mudou, o que ficou pendente).
5. Relatório para o Davi: até 10 linhas, com o que foi feito, o que precisa dele e o próximo passo.
