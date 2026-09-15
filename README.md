<p align="center">
  <img src="fotos/logo/download.png" alt="Logo Davi Castro" width="96">
</p>

<h1 align="center">Davi Castro — Portfólio</h1>

<p align="center">
  <strong>Desenvolvedor Full Stack · Infraestrutura de Redes</strong><br>
  <a href="https://davicjc.com">davicjc.com</a> ·
  <a href="https://linkedin.com/in/davicjc">LinkedIn</a> ·
  <a href="https://github.com/Davicjc">GitHub</a>
</p>

---

## O que é

Portfólio pessoal com duas partes:

- **Site** (`index.html`) — home enxuta e aba **Projetos** (`#/projetos`) com layout alternado imagem/texto. Cada projeto com demonstração pública abre dentro do próprio site, num visor com modo computador e celular.
- **Painel** (`adm/index.html`) — edita todo o conteúdo do site: projetos, trajetória, depoimentos, certificados, clientes, contatos e os textos da home, em português e inglês.

O conteúdo mora no **Firestore**. O site é estático, sem etapa de build, e funciona em qualquer hospedagem de arquivos.

## Estrutura

```
📦 PortfolioPessoal
├── index.html              # site: home + aba de projetos + visor embutido
├── adm/
│   └── index.html          # painel administrativo (com a carga inicial do banco embutida)
├── Curriculo/
│   ├── index.html          # currículo em português (A4, pronto para PDF)
│   └── en.html             # currículo em inglês
├── Currículo - Davi Castro Jorge da Costa.pdf
├── Resume - Davi Castro Jorge da Costa.pdf
├── fotos/
│   ├── projetos/           # capturas dos projetos em WebP
│   ├── me/  logo/  sobremimterceiros/
├── certificados/           # PDFs dos certificados
├── robots.txt  sitemap.xml
```

## Como os dados funcionam

1. O `index.html` traz uma cópia embutida do conteúdo (a "semente"). A página pinta na hora, buscadores leem tudo e o site continua no ar mesmo se o Firebase cair.
2. Em seguida, lê o Firestore e, se algo mudou, atualiza a tela. A última leitura fica guardada no navegador para a próxima visita abrir já atualizada.
3. O painel grava direto no Firestore — a mudança aparece no site na próxima visita.

Para atualizar a semente embutida, use **Banco de dados → Exportar JSON** no painel e cole o conteúdo entre `/* SEMENTE:INICIO */` e `/* SEMENTE:FIM */` no `index.html`.

## Configuração do Firebase (uma vez só)

Projeto: `portfoliopessoal-9aa5b`

1. **Criar o banco** — Console → *Firestore Database* → *Criar banco de dados* → modo **produção** → região `southamerica-east1 (São Paulo)`.
2. **Publicar as regras** — *Firestore → Regras*, cole e publique:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{documento=**} {
         allow read: if true;
         allow write: if request.auth != null
                      && request.auth.token.email == 'davicjc@gmail.com';
       }
     }
   }
   ```
3. **Ativar o login** — *Authentication → Começar → Método de login → E-mail/senha → Ativar*. Depois, em *Usuários → Adicionar usuário*, crie `davicjc@gmail.com` com uma senha forte.
4. **Autorizar os domínios** — *Authentication → Configurações → Domínios autorizados*: adicione `davicjc.com` e `adm.davicjc.com`.
5. **Popular o banco** — abra o painel (`davicjc.com/adm` depois de publicado, ou o `adm/index.html` direto do disco), entre e clique em **Popular o banco agora**. São 81 documentos: 24 projetos, 5 experiências, 5 depoimentos, 24 certificados, 14 clientes, 4 capacidades, 4 contatos e a configuração da home.

Imagens enviadas pelo painel são comprimidas no navegador. Com o **Storage** ativo, vão para lá; sem ele (plano gratuito), ficam guardadas no próprio documento. As regras do Storage estão no painel, em *Banco de dados*.

## `adm.davicjc.com`

O `index.html` redireciona qualquer acesso por `adm.davicjc.com` para `/adm/`. Basta o subdomínio apontar para o mesmo site:

- **Cloudflare Pages**: no projeto, *Custom domains → Set up a domain → `adm.davicjc.com`*.
- **GitHub Pages** (aceita só um domínio por repositório): crie no Cloudflare uma *Redirect Rule* de `adm.davicjc.com/*` para `https://davicjc.com/adm/`, com um registro DNS `adm` com proxy ativado.

## Rodar localmente

```bash
python -m http.server 8000
# ou
npx serve .
```

Abra `http://localhost:8000` (site) e `http://localhost:8000/adm/` (painel). `localhost` já vem autorizado no Firebase.

---

<p align="center">Desenvolvido e mantido por <strong>Davi Castro</strong> · 2026</p>
