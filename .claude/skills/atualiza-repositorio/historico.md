# Histórico das revisões

Cada revisão completa ("claude atualiza meu repositório") acrescenta uma entrada no fim. Serve para a próxima
IA saber o que já foi conferido e o que ficou pendente.

## Fontes de certificados

Ainda não registradas. Na primeira revisão, pergunte ao Davi onde os certificados novos costumam chegar
(e-mail, pasta do PC, LinkedIn, plataforma) e anote aqui.

## Pendências conhecidas

- Regras do Firestore com `depoimentos_recebidos` (28/10/2026): têm de ser publicadas no console para o
  formulário de depoimento gravar. Até lá, o envio falha e a página oferece o e-mail.
- Turnstile sem validação no servidor: o widget barra quem usa o formulário, mas a API do Firestore ainda
  aceita `create` direto. Fechar exige uma Pages Function que valide o token e um segredo na conta da Cloudflare
  do davicjc.com.
- Título da seção de projetos no banco: o painel ainda diz "Estudos de caso"; o nome combinado é "Destaques"
  ("Featured work" em inglês).

## Revisões

_(nenhuma ainda)_
