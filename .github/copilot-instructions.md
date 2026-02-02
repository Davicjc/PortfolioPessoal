# Instruções Copilot - Portfolio Davi Castro

## Visão Geral do Projeto
Este é um site de portfólio pessoal bilíngue (Português/Inglês) para Davi Castro, um Desenvolvedor Full Stack especializado em sistemas de segurança corporativa, reconhecimento facial e desenvolvimento web. O site é implantado via GitHub Pages e apresenta design moderno glass morphism com efeitos CSS avançados.

## Arquitetura & Estrutura

### Arquivos Principais
- `index.html` - Versão em português (página principal/raiz)
- `en.html` - Versão em inglês com estrutura/estilo idênticos
- `Curriculo/index.html` - Página de CV independente com estilo diferente (baseado em Tailwind)
- `CNAME` - Configuração de domínio personalizado (davicjc.com)
- `/fotos/` - Assets de imagem organizados por categoria (me/, logo/, sobremimterceiros/)
- `/certificados/` - Certificados em PDF para links de download

### Padrão de Desenvolvimento Crítico
**SEMPRE manter sincronização bilíngue**: Ao editar conteúdo do portfólio (não estilo), as mudanças devem ser aplicadas em AMBOS `index.html` e `en.html`. Isso inclui:
- Adicionar/remover projetos
- Atualizar testimonials/depoimentos
- Modificar timeline de experiência
- Alterar informações de contato
- Adicionar novas habilidades ou certificações

## Arquitetura Técnica

### Sistema de Estilo
- **Abordagem de arquivo único**: Todo CSS está incorporado em tags `<style>` (sem arquivos CSS externos)
- **Propriedades CSS Customizadas**: Tematização consistente via variáveis `:root` (--accent-primary, --bg-primary, etc.)
- **Glass Morphism**: Uso intenso de `backdrop-filter`, efeitos `blur()`, e backgrounds rgba para aparência moderna de vidro
- **Design Responsivo**: Abordagem mobile-first com extensos `@media` queries
- **Efeitos Liquid Glass**: Efeitos hover de rastreamento de mouse usando propriedades CSS customizadas e JavaScript

### Componentes de Design Principais
- **Seção Hero**: Layout de duas colunas (texto + card de perfil) com estatísticas animadas
- **Estrutura Timeline**: Projetos e experiência usam timeline visual com círculos conectados
- **Cards Glass**: Testimonials, habilidades, projetos usam estilo glass morphism consistente
- **Menu Mobile**: Navegação deslizante com botão hamburger para dispositivos móveis
- **Sistema de Animação**: Animações fade-up baseadas em Intersection Observer por todo o site

### Funcionalidade JavaScript
- Navegação scroll suave
- Sistema de toggle do menu mobile
- Mudanças de estilo da navbar acionadas por scroll
- Rastreamento de mouse para efeitos liquid glass (propriedades CSS `--mouse-x`, `--mouse-y`)
- Intersection Observer para animações fade

## Padrões de Gerenciamento de Conteúdo

### Seção de Projetos
Os projetos são organizados em categorias de timeline:
1. **Sites & Desenvolvimento Web** - Sites de clientes e portfólio
2. **Projetos GitHub & Sistemas** - Projetos técnicos e software
3. **Sistemas Corporativos** - Soluções de segurança e empresariais

Cada card de projeto inclui: badges, título, descrição, tags de stack tecnológica e links externos.

### Estrutura de Testimonials
Testimonials requerem: conteúdo da citação, foto do autor (em `/fotos/sobremimterceiros/`), nome, cargo e link do LinkedIn. A versão em português usa "depoimentos", inglês usa "testimonials".

### Organização de Habilidades
Habilidades são agrupadas em categorias temáticas com cabeçalhos de ícone e listagens baseadas em tags. A seção de IA tem estilo destacado especial (classe `ai-highlight`).

## Fluxo de Trabalho de Desenvolvimento

### Adicionando Novo Conteúdo
1. Identificar se a mudança afeta conteúdo (requer atualização bilíngue) ou estilo (atualização única)
2. Para mudanças de conteúdo: Atualizar ambos `index.html` e `en.html` mantendo estrutura idêntica
3. Para novas imagens: Colocar no subdiretório apropriado de `/fotos/`
4. Para certificados: Adicionar PDF em `/certificados/` e linkar apropriadamente

### Considerações de Teste
- Testar comportamento responsivo através dos breakpoints (768px, 1024px pontos críticos)
- Verificar se efeitos glass funcionam em diferentes navegadores (fallbacks webkit-backdrop-filter)
- Garantir que menu mobile funcione corretamente
- Verificar scroll suave e performance das animações

### Notas de Deploy
- Site faz auto-deploy via GitHub Pages em commits da branch main
- Domínio customizado configurado através do arquivo CNAME
- Nenhum processo de build necessário - HTML/CSS/JS estático puro

## Performance & Compatibilidade
- Todos os assets estão incorporados ou usam links CDN (Google Fonts, FontAwesome)
- Uso intenso de animações CSS - monitorar performance em dispositivos de menor capacidade
- Efeitos backdrop-filter requerem suporte de navegador moderno
- Imagens devem ser otimizadas antes de adicionar aos diretórios `/fotos/`

## Padrões Comuns de Modificação
- **Novo projeto**: Adicionar à categoria timeline apropriada na seção de projetos, manter estrutura do card
- **Atualizar LinkedIn testimonial**: Modificar ambas versões HTML, garantir consistência da estrutura do link
- **Atualizações de habilidades**: Adicionar à categoria de habilidade apropriada, manter estilo das tags
- **Mudanças de experiência**: Atualizar estrutura timeline, preservar hierarquia visual
- **Adições de certificado**: Adicionar PDF em `/certificados/`, criar link cert-card em ambas versões HTML