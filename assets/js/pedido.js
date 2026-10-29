// davicjc.com — o pedido guiado (/pedido/ e /en/order/). Sem dependências.
// Um motor só, guiado por dados: cada pergunta declara em que modo aparece (rápido, completo ou os dois),
// e a maquete é uma função do estado inteiro. Responder qualquer coisa redesenha a prévia na hora.

import { naoRobo } from './robo.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const raiz = $('[data-pedido]');
const CFG = JSON.parse($('#pedido-dados')?.textContent || '{}');
const lang = CFG.lang === 'en' ? 'en' : 'pt';
const L = o => (o == null ? '' : typeof o === 'string' ? o : o[lang] ?? o.pt);
const movimento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const so = s => String(s ?? '').replace(/\D/g, '');
const CHAVE_RASCUNHO = 'pedido:v1';

/* ───────── Textos da interface ───────── */
const T = L({
  pt: {
    modo_titulo: 'Como você prefere?',
    rapido: 'Análise rápida', rapido_meta: '~2 min · 6 perguntas',
    rapido_txt: 'Para quem já sabe o que quer ou só quer um primeiro papo. O essencial para eu te responder com uma ideia de caminho.',
    completo: 'Análise completa', completo_meta: '~10 min · 15 perguntas',
    completo_txt: 'Um briefing de verdade: cores, páginas, funções, referências. Sai daqui com tudo que eu preciso para orçar sem reunião.',
    recomendado: 'mais detalhado', continuar: 'Continuar de onde parei', continuar_meta: (n, t) => `passo ${n} de ${t}`,
    voltar: 'Voltar', proximo: 'Próximo', pular: 'Pular esta', gerar: 'Gerar meu pedido', robo_falta: 'Falta só confirmar que você não é um robô, logo acima.',
    porque: 'por que pergunto', passo: 'passo', de: 'de', faltam: m => (m <= 1 ? 'falta menos de 1 min' : `faltam ~${m} min`),
    escolha_varios: 'Pode marcar quantos quiser.', escolha_um: 'Escolha uma.',
    obrigatorio: 'obrigatório', opcional: 'opcional',
    erro_nome: 'Diga como posso te chamar.', erro_email: 'Esse e-mail parece incompleto.', erro_tel: 'Coloque o telefone com DDD.',
    erro_cnpj: 'Esse CNPJ não confere. Pode deixar em branco.', cnpj_ok: 'CNPJ válido', cnpj_busca: 'Consultando o CNPJ…',
    privacidade: 'Uso estes dados só para responder ao seu pedido: nada de lista de e-mail, nada vendido ou repassado. Se você informar o CNPJ, o nome da empresa é buscado na base pública da Receita (BrasilAPI).',
    status_pronto: 'pronto · falta você enviar', status_aberto: c => `aberto no ${c} · confirme o envio por lá`, status_banco: 'na fila · registrado no painel', status_copiado: 'copiado · cole onde preferir',
    pronto: 'Seu pedido está pronto', pronto_txt: 'Agora é só me enviar. A mensagem já vai escrita, com tudo o que você respondeu.',
    registrado: 'Registrado no meu painel. Se quiser, me avise também pelo WhatsApp.', falhou: 'Não consegui registrar por aqui. Envie pelo WhatsApp ou e-mail, que chega do mesmo jeito.',
    enviando: 'Registrando…',
    enviar_whats: 'Enviar pelo WhatsApp', enviar_email: 'Enviar por e-mail', copiar: 'Copiar o resumo', copiado: 'Copiado',
    detalhar: 'Detalhar mais (análise completa)', recomecar: 'Começar outro pedido', editar: 'Revisar respostas',
    os: 'ordem de serviço', protocolo: 'protocolo', status: 'status', status_v: 'na fila · leitura pessoal do Davi',
    resposta: 'Eu leio cada pedido pessoalmente e respondo pelo canal que você escolheu.',
    tamanho: 'tamanho estimado', tamanhos: ['Pequeno', 'Médio', 'Grande', 'Robusto'],
    tamanho_nota: 'Uma régua para conversarmos, não um orçamento.',
    ficha_vazia: 'As respostas aparecem aqui conforme você avança.',
    esboco: p => `esboço ${p}%`, no_ar: 'v0.1 · pronto para começar',
    seu_negocio: 'Seu negócio', dominio_padrao: 'seunegocio.com.br',
    cta: { vender: 'Comprar agora', contatos: 'Pedir orçamento', agendar: 'Agendar horário', credibilidade: 'Conheça a empresa', operacao: 'Entrar no sistema', portfolio: 'Ver trabalhos', informar: 'Ler mais', comunidade: 'Fazer parte', padrao: 'Fale comigo' },
    titulos: { site: 'Tudo o que seu cliente precisa saber, num lugar só', landing: 'Uma oferta. Um botão. Resultado.', loja: 'Os produtos que seus clientes procuram', naosei: 'Seu projeto começa aqui' },
    resumo_cab: 'Pedido de projeto', resumo_modo: { rapido: 'análise rápida', completo: 'análise completa' }
  },
  en: {
    modo_titulo: 'How would you like to do this?',
    rapido: 'Quick brief', rapido_meta: '~2 min · 6 questions',
    rapido_txt: 'For when you already know what you want, or just want a first chat. The essentials for me to reply with a direction.',
    completo: 'Complete brief', completo_meta: '~10 min · 15 questions',
    completo_txt: 'A real brief: colors, pages, features, references. You leave with everything I need to quote without a meeting.',
    recomendado: 'most detailed', continuar: 'Pick up where I left off', continuar_meta: (n, t) => `step ${n} of ${t}`,
    voltar: 'Back', proximo: 'Next', pular: 'Skip this one', gerar: 'Build my brief', robo_falta: 'Just confirm you are not a robot, right above.',
    porque: 'why I ask', passo: 'step', de: 'of', faltam: m => (m <= 1 ? 'under a minute left' : `~${m} min left`),
    escolha_varios: 'Pick as many as you like.', escolha_um: 'Pick one.',
    obrigatorio: 'required', opcional: 'optional',
    erro_nome: 'Tell me what to call you.', erro_email: 'That email looks incomplete.', erro_tel: 'Add your phone with the area code.',
    erro_cnpj: 'That CNPJ doesn’t check out. You can leave it blank.', cnpj_ok: 'Valid CNPJ', cnpj_busca: 'Looking up the CNPJ…',
    privacidade: 'I use this only to reply to your request: no mailing list, never sold or shared. If you enter a CNPJ, the company name is looked up in Brazil’s public registry (BrasilAPI).',
    status_pronto: 'ready · waiting for you to send it', status_aberto: c => `opened in ${c} · confirm sending there`, status_banco: 'queued · saved to the dashboard', status_copiado: 'copied · paste it wherever you like',
    pronto: 'Your brief is ready', pronto_txt: 'Now just send it to me. The message is already written, with everything you answered.',
    registrado: 'Saved to my dashboard. Feel free to ping me on WhatsApp too.', falhou: 'I couldn’t save it here. Send it by WhatsApp or email and it reaches me just the same.',
    enviando: 'Saving…',
    enviar_whats: 'Send on WhatsApp', enviar_email: 'Send by email', copiar: 'Copy the summary', copiado: 'Copied',
    detalhar: 'Add more detail (complete brief)', recomecar: 'Start another brief', editar: 'Review answers',
    os: 'work order', protocolo: 'ref', status: 'status', status_v: 'queued · read personally by Davi',
    resposta: 'I read every brief myself and reply through the channel you chose.',
    tamanho: 'estimated size', tamanhos: ['Small', 'Medium', 'Large', 'Robust'],
    tamanho_nota: 'A yardstick for our conversation, not a quote.',
    ficha_vazia: 'Your answers show up here as you go.',
    esboco: p => `sketch ${p}%`, no_ar: 'v0.1 · ready to start',
    seu_negocio: 'Your business', dominio_padrao: 'yourbusiness.com',
    cta: { vender: 'Buy now', contatos: 'Get a quote', agendar: 'Book a time', credibilidade: 'About us', operacao: 'Sign in', portfolio: 'See the work', informar: 'Read more', comunidade: 'Join us', padrao: 'Talk to me' },
    titulos: { site: 'Everything your customers need to know, in one place', landing: 'One offer. One button. Results.', loja: 'The products your customers are looking for', naosei: 'Your project starts here' },
    resumo_cab: 'Project brief', resumo_modo: { rapido: 'quick brief', completo: 'complete brief' }
  }
});

/* ───────── Ícones de traço (24×24) para os tipos de projeto ───────── */
const IC = {
  site: '<rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4M3 8h18"/>',
  landing: '<path d="M5 19 19 5M19 5h-7M19 5v7"/><circle cx="6" cy="18" r="2"/>',
  loja: '<path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  sistema: '<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M9 3v18M9 9h12M14 14h4M14 17h2"/>',
  app: '<rect x="7" y="2.5" width="10" height="19" rx="2.2"/><path d="M11 18.5h2"/>',
  naosei: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2 1-1.2 1.9v.5M12 17h.01"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>', volta: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  whats: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9.2 8.8c.3 2.7 2.3 4.8 5 5.2l1-1.1-1.6-.9-.8.8c-1-.5-1.9-1.4-2.4-2.4l.8-.8-.9-1.6-1.1.8Z"/>',
  email: '<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m3.5 6 8.5 7 8.5-7"/>',
  copiar: '<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  ok: '<path d="m5 12.5 4.2 4.2L19 7"/>'
};
const svg = (k, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || ''}</svg>`;

/* ───────── As opções ───────── */
const TIPOS = [
  { v: 'site', pts: 3, t: { pt: 'Site para a empresa', en: 'Business website' }, d: { pt: 'Mostra quem você é, o que faz e como falar com você.', en: 'Shows who you are, what you do and how to reach you.' }, dica: { pt: 'O formato mais pedido. Bem feito, ele trabalha por você 24 horas: aparece no Google e já filtra quem chega.', en: 'The most requested format. Done right, it works for you around the clock: shows up on Google and pre-qualifies leads.' } },
  { v: 'landing', pts: 1, t: { pt: 'Página de vendas', en: 'Landing page' }, d: { pt: 'Uma página só, feita para uma oferta ou campanha.', en: 'A single page built for one offer or campaign.' }, dica: { pt: 'Ótima para anúncios: um objetivo, um botão, nada que distraia. É o jeito mais rápido de colocar algo no ar.', en: 'Great for ads: one goal, one button, nothing to distract. The fastest way to get something live.' } },
  { v: 'loja', pts: 6, t: { pt: 'Loja virtual', en: 'Online store' }, d: { pt: 'Catálogo, carrinho e pagamento online.', en: 'Catalog, cart and online payment.' }, dica: { pt: 'Dá para começar com catálogo e pedido pelo WhatsApp, e ligar o pagamento online depois, sem refazer nada.', en: 'You can start with a catalog and WhatsApp orders, then switch on online payment later without rebuilding.' } },
  { v: 'sistema', pts: 7, t: { pt: 'Sistema ou painel web', en: 'Web system or dashboard' }, d: { pt: 'Cadastros, controle, relatórios: troca planilha por ferramenta.', en: 'Records, control, reports: swaps spreadsheets for a real tool.' }, dica: { pt: 'Sistema sob medida acaba com retrabalho. Foi o que fiz no NexusAtlas, um SaaS de ordens de serviço com apps de Windows e Android.', en: 'A custom system ends rework. That’s what I built with NexusAtlas, a field-service SaaS with Windows and Android apps.' } },
  { v: 'app', pts: 8, t: { pt: 'App de celular', en: 'Mobile app' }, d: { pt: 'Android ou iPhone, para seus clientes ou sua equipe.', en: 'Android or iPhone, for your customers or your team.' }, dica: { pt: 'Às vezes um site que se instala no celular (PWA) resolve com bem menos custo. Eu te digo com sinceridade qual faz sentido.', en: 'Sometimes a website that installs on the phone (PWA) does the job for far less. I’ll tell you honestly which makes sense.' } },
  { v: 'naosei', pts: 3, t: { pt: 'Ainda não sei', en: 'Not sure yet' }, d: { pt: 'Me conte o problema que eu te ajudo a escolher.', en: 'Tell me the problem and I’ll help you choose.' }, dica: { pt: 'Sem problema nenhum. As próximas perguntas me ajudam a sugerir o formato certo.', en: 'No problem at all. The next questions help me suggest the right format.' } }
];
const OBJETIVOS = [
  { v: 'vender', t: { pt: 'Vender pela internet', en: 'Sell online' } },
  { v: 'contatos', t: { pt: 'Receber pedidos de orçamento', en: 'Get quote requests' } },
  { v: 'credibilidade', t: { pt: 'Passar credibilidade', en: 'Build credibility' } },
  { v: 'agendar', t: { pt: 'Agendar horários', en: 'Take bookings' } },
  { v: 'operacao', t: { pt: 'Organizar a operação interna', en: 'Organize internal operations' } },
  { v: 'portfolio', t: { pt: 'Mostrar meus trabalhos', en: 'Show my work' } },
  { v: 'informar', t: { pt: 'Publicar conteúdo', en: 'Publish content' } },
  { v: 'comunidade', t: { pt: 'Área para clientes ou membros', en: 'Customer or member area' } }
];
const SEGMENTOS = [
  ['saude', 'Saúde', 'Health'], ['beleza', 'Beleza e estética', 'Beauty'], ['alimentacao', 'Alimentação', 'Food'], ['educacao', 'Educação', 'Education'],
  ['comercio', 'Comércio', 'Retail'], ['servicos', 'Serviços', 'Services'], ['tecnologia', 'Tecnologia', 'Tech'], ['industria', 'Indústria', 'Industry'],
  ['juridico', 'Jurídico e finanças', 'Legal & finance'], ['esporte', 'Esporte', 'Sports'], ['social', 'Igreja, ONG ou projeto social', 'Church, NGO or social'], ['outro', 'Outro', 'Other']
].map(([v, pt, en]) => ({ v, t: { pt, en } }));
const PUBLICO = [
  ['jovens', 'Jovens', 'Young people'], ['adultos', 'Adultos', 'Adults'], ['maduro', 'Público 60+', 'Seniors (60+)'], ['empresas', 'Outras empresas', 'Other businesses'],
  ['local', 'Gente da minha cidade', 'Local customers'], ['nacional', 'Brasil inteiro', 'Nationwide'], ['exterior', 'Outros países', 'Other countries']
].map(([v, pt, en]) => ({ v, t: { pt, en } }));
// Cada estilo muda a tipografia, os cantos e o peso da maquete.
const ESTILOS = [
  { v: 'sobrio', t: { pt: 'Sóbrio e confiável', en: 'Sober and trustworthy' }, d: { pt: 'Fontes retas, cores contidas. Saúde, direito, finanças.', en: 'Straight type, restrained color. Health, law, finance.' }, f: 'sans', raio: 4, peso: 600 },
  { v: 'moderno', t: { pt: 'Moderno e tecnológico', en: 'Modern and techy' }, d: { pt: 'Contraste alto, letras largas, cara de produto.', en: 'High contrast, wide letters, product feel.' }, f: 'display', raio: 10, peso: 700 },
  { v: 'elegante', t: { pt: 'Elegante e premium', en: 'Elegant and premium' }, d: { pt: 'Serifa fina, muito respiro. Moda, joias, estética.', en: 'Fine serif, lots of air. Fashion, jewelry, aesthetics.' }, f: 'serif', raio: 0, peso: 400 },
  { v: 'alegre', t: { pt: 'Alegre e próximo', en: 'Friendly and warm' }, d: { pt: 'Cantos redondos, tom de conversa. Comida, crianças, pets.', en: 'Round corners, chatty tone. Food, kids, pets.' }, f: 'round', raio: 18, peso: 800 },
  { v: 'ousado', t: { pt: 'Ousado e chamativo', en: 'Bold and loud' }, d: { pt: 'Títulos enormes, caixa alta. Esporte, eventos, música.', en: 'Huge headlines, all caps. Sports, events, music.' }, f: 'impacto', raio: 0, peso: 800 },
  { v: 'minimalista', t: { pt: 'Minimalista', en: 'Minimalist' }, d: { pt: 'Só o essencial. Arquitetura, design, tecnologia.', en: 'Only the essentials. Architecture, design, tech.' }, f: 'mini', raio: 2, peso: 400 }
];
// Paletas: fundo, superfície, texto, destaque.
const PALETAS = [
  { v: 'floresta', t: { pt: 'Verde e areia', en: 'Green and sand' }, c: ['#F4F1EA', '#E7E1D4', '#1F2A22', '#2F6B4F'] },
  { v: 'oceano', t: { pt: 'Azul confiança', en: 'Trust blue' }, c: ['#F3F6FB', '#E2E9F4', '#13233A', '#1F5FD1'] },
  { v: 'noite', t: { pt: 'Grafite e laranja', en: 'Graphite and orange' }, c: ['#121417', '#1D2126', '#ECEEF1', '#FF7A2F'] },
  { v: 'vinho', t: { pt: 'Vinho e dourado', en: 'Wine and gold' }, c: ['#1C1013', '#2A181D', '#F3E9E1', '#C9A15B'] },
  { v: 'rosa', t: { pt: 'Rosa suave', en: 'Soft pink' }, c: ['#FFF5F6', '#FBE3E7', '#3A1F2B', '#E2557B'] },
  { v: 'sol', t: { pt: 'Preto e amarelo', en: 'Black and yellow' }, c: ['#0E0E0E', '#1B1B1B', '#F5F5F0', '#F5C518'] },
  { v: 'terra', t: { pt: 'Terracota', en: 'Terracotta' }, c: ['#FBF3EC', '#F1E2D5', '#3B2418', '#C4572F'] },
  { v: 'menta', t: { pt: 'Menta fresca', en: 'Fresh mint' }, c: ['#F0FBF7', '#DCF3EA', '#10302A', '#12A58A'] }
];
const IDENTIDADE = [
  ['logo', 'Logo', 'Logo'], ['manual', 'Manual de marca', 'Brand guide'], ['fotos', 'Fotos profissionais', 'Professional photos'], ['textos', 'Textos prontos', 'Ready-made copy'],
  ['dominio', 'Domínio (.com.br)', 'Domain name'], ['hospedagem', 'Hospedagem', 'Hosting'], ['nada', 'Nada ainda: começo do zero', 'Nothing yet: starting from scratch']
].map(([v, pt, en]) => ({ v, t: { pt, en } }));
const PAGINAS = {
  site: [['inicio', 'Início', 'Home'], ['sobre', 'Sobre', 'About'], ['servicos', 'Serviços', 'Services'], ['portfolio', 'Portfólio', 'Portfolio'], ['depoimentos', 'Depoimentos', 'Testimonials'], ['precos', 'Preços e planos', 'Pricing'], ['blog', 'Blog', 'Blog'], ['faq', 'Perguntas frequentes', 'FAQ'], ['equipe', 'Equipe', 'Team'], ['contato', 'Contato', 'Contact']],
  loja: [['vitrine', 'Vitrine', 'Storefront'], ['categorias', 'Categorias', 'Categories'], ['produto', 'Página do produto', 'Product page'], ['carrinho', 'Carrinho', 'Cart'], ['checkout', 'Pagamento', 'Checkout'], ['conta', 'Minha conta', 'My account'], ['rastreio', 'Rastreio do pedido', 'Order tracking'], ['blog', 'Blog', 'Blog']],
  sistema: [['login', 'Login', 'Sign-in'], ['dashboard', 'Painel com números', 'Dashboard'], ['cadastros', 'Cadastros', 'Records'], ['relatorios', 'Relatórios', 'Reports'], ['agenda', 'Agenda', 'Calendar'], ['financeiro', 'Financeiro', 'Finance'], ['usuarios', 'Usuários e permissões', 'Users and roles'], ['config', 'Configurações', 'Settings']],
  app: [['login', 'Login', 'Sign-in'], ['inicio', 'Tela inicial', 'Home screen'], ['perfil', 'Perfil', 'Profile'], ['notificacoes', 'Notificações', 'Notifications'], ['pagamentos', 'Pagamentos', 'Payments'], ['chat', 'Chat', 'Chat'], ['mapa', 'Mapa', 'Map'], ['config', 'Configurações', 'Settings']]
};
const paginasDe = tipo => (PAGINAS[tipo] || PAGINAS.site).map(([v, pt, en]) => ({ v, t: { pt, en } }));
const FUNCOES = [
  { v: 'whatsapp', pts: 1, t: { pt: 'Botão do WhatsApp', en: 'WhatsApp button' } },
  { v: 'formulario', pts: 1, t: { pt: 'Formulário de contato', en: 'Contact form' } },
  { v: 'agendamento', pts: 3, t: { pt: 'Agendamento online', en: 'Online booking' } },
  { v: 'pagamento', pts: 4, t: { pt: 'Pagamento (Pix e cartão)', en: 'Payments (cards, Pix)' }, dica: { pt: 'Pix e cartão entram por um intermediador (Mercado Pago, Stripe…). A taxa é por venda e não tem mensalidade.', en: 'Cards and Pix go through a provider (Stripe, Mercado Pago…). Fees are per sale, no monthly cost.' } },
  { v: 'login', pts: 3, t: { pt: 'Login de clientes', en: 'Customer login' } },
  { v: 'painel', pts: 4, t: { pt: 'Painel para eu editar o conteúdo', en: 'Admin to edit my content' }, dica: { pt: 'Você mesmo troca textos, fotos e preços, sem depender de ninguém. Este site aqui tem um.', en: 'You change copy, photos and prices yourself, no one in between. This very site has one.' } },
  { v: 'blog', pts: 2, t: { pt: 'Blog ou notícias', en: 'Blog or news' } },
  { v: 'instagram', pts: 1, t: { pt: 'Feed do Instagram', en: 'Instagram feed' } },
  { v: 'mapa', pts: 1, t: { pt: 'Mapa e como chegar', en: 'Map and directions' } },
  { v: 'chat', pts: 3, t: { pt: 'Chat de atendimento', en: 'Live chat' } },
  { v: 'idiomas', pts: 2, t: { pt: 'Mais de um idioma', en: 'Multiple languages' } },
  { v: 'notificacoes', pts: 3, t: { pt: 'Notificações e lembretes', en: 'Notifications and reminders' } },
  { v: 'relatorios', pts: 3, t: { pt: 'Relatórios e gráficos', en: 'Reports and charts' } },
  { v: 'integracao', pts: 5, t: { pt: 'Integrar com outro sistema', en: 'Integrate with another system' }, dica: { pt: 'ERP, planilha, nota fiscal, API de terceiros… Integração é minha praia. Na observação, me diga qual sistema.', en: 'ERP, spreadsheets, invoicing, third-party APIs… integrations are my thing. Name the system in the notes.' } },
  { v: 'seo', pts: 1, t: { pt: 'Aparecer bem no Google', en: 'Rank well on Google' } }
];
const PRAZOS = [
  { v: 'urgente', t: { pt: 'Para ontem', en: 'Yesterday' }, d: { pt: 'até 2 semanas', en: 'within 2 weeks' }, dica: { pt: 'Dá, se o escopo for enxuto: a gente lança o essencial primeiro e completa em etapas.', en: 'Doable if we keep it lean: launch the essentials first and add the rest in stages.' } },
  { v: 'mes', t: { pt: 'Em um mês', en: 'Within a month' }, d: { pt: 'o ritmo mais comum', en: 'the most common pace' } },
  { v: 'trimestre', t: { pt: 'Em 2 ou 3 meses', en: 'In 2–3 months' }, d: { pt: 'para projetos maiores', en: 'for bigger projects' } },
  { v: 'sempressa', t: { pt: 'Sem pressa', en: 'No rush' }, d: { pt: 'quero fazer bem feito', en: 'I want it done right' } }
];
// Faixas de investimento que o cliente imagina (edite aqui quando quiser).
const ORCAMENTOS = [
  { v: 'ate2', t: { pt: 'Até R$ 2 mil', en: 'Up to R$ 2k' } },
  { v: '2a5', t: { pt: 'R$ 2 a 5 mil', en: 'R$ 2–5k' } },
  { v: '5a15', t: { pt: 'R$ 5 a 15 mil', en: 'R$ 5–15k' } },
  { v: '15mais', t: { pt: 'Acima de R$ 15 mil', en: 'Over R$ 15k' } },
  { v: 'conversar', t: { pt: 'Prefiro conversar', en: 'I’d rather talk' }, dica: { pt: 'Tranquilo. Eu monto duas ou três opções de tamanhos diferentes para você comparar.', en: 'That’s fine. I’ll put together two or three options of different sizes to compare.' } }
];
const DEPOIS = [
  { v: 'painel', t: { pt: 'Eu mesmo atualizo', en: 'I’ll update it myself' }, d: { pt: 'com um painel simples', en: 'with a simple admin' } },
  { v: 'manutencao', t: { pt: 'Manutenção mensal', en: 'Monthly maintenance' }, d: { pt: 'você cuida de tudo', en: 'you look after everything' } },
  { v: 'entrega', t: { pt: 'Só a entrega', en: 'Just the delivery' }, d: { pt: 'depois eu me viro', en: 'I’ll take it from there' } },
  { v: 'naosei', t: { pt: 'Ainda não sei', en: 'Not sure yet' }, d: { pt: 'me explica as opções', en: 'walk me through it' } }
];
const ORIGEM = [['google', 'Google'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['github', 'GitHub'], ['indicacao', 'Indicação', 'Referral'], ['outro', 'Outro', 'Other']].map(([v, pt, en]) => ({ v, t: { pt, en: en || pt } }));
const PREFERENCIA = [['whatsapp', 'WhatsApp', 'WhatsApp'], ['email', 'E-mail', 'Email'], ['ligacao', 'Ligação', 'Phone call']].map(([v, pt, en]) => ({ v, t: { pt, en } }));
const HORARIO = [['manha', 'Manhã', 'Morning'], ['tarde', 'Tarde', 'Afternoon'], ['noite', 'Noite', 'Evening']].map(([v, pt, en]) => ({ v, t: { pt, en } }));

/* ───────── As perguntas ───────── */
// modos: R = rápida, C = completa. tipo: um | varios | negocio | cor | links | texto | contato.
const PERGUNTAS = [
  { id: 'tipo', modos: 'RC', tipo: 'um', opcoes: () => TIPOS, avanca: true, icones: true,
    t: { pt: 'O que vamos construir?', en: 'What are we building?' },
    p: { pt: 'Cada formato tem estrutura, prazo e custo bem diferentes. Olhe a tela ao lado: ela muda de forma conforme a escolha.', en: 'Each format has a very different structure, timeline and cost. Watch the screen beside: it changes shape with your pick.' } },
  { id: 'negocio', modos: 'C', tipo: 'negocio',
    t: { pt: 'Me conte do seu negócio', en: 'Tell me about your business' },
    p: { pt: 'O nome vira o endereço e o logo da maquete. O segmento me diz o que costuma funcionar para quem trabalha com isso.', en: 'The name becomes the mockup’s address and logo. The industry tells me what tends to work in your field.' } },
  { id: 'objetivo', modos: 'RC', tipo: 'varios', opcoes: () => OBJETIVOS,
    t: { pt: 'O que ele precisa fazer por você?', en: 'What should it do for you?' },
    p: { pt: 'Um projeto bom nasce de um objetivo claro. O primeiro que você marcar vira o botão principal da página.', en: 'Good projects start from a clear goal. The first one you pick becomes the page’s main button.' } },
  { id: 'publico', modos: 'C', tipo: 'varios', opcoes: () => PUBLICO,
    t: { pt: 'Quem é o seu cliente?', en: 'Who is your customer?' },
    p: { pt: 'Define o tom do texto, o tamanho da letra e até o idioma. Marque "60+" e veja a letra da maquete crescer.', en: 'It sets the tone of voice, the type size and even the language. Pick "60+" and watch the mockup’s text grow.' } },
  { id: 'estilo', modos: 'RC', tipo: 'um', opcoes: () => ESTILOS, amostra: true,
    t: { pt: 'Qual a cara que ele deve ter?', en: 'What should it feel like?' },
    p: { pt: 'Personalidade visual: fonte, cantos e peso das letras. Experimente vários. A prévia troca na hora.', en: 'Visual personality: typeface, corners and weight. Try a few; the preview switches instantly.' } },
  { id: 'cor', modos: 'RC', tipo: 'cor',
    t: { pt: 'E as cores?', en: 'And the colors?' },
    p: { pt: 'Cor é a primeira coisa que a pessoa sente, antes de ler qualquer palavra. Se você já tem as cores da marca, escolha "Já tenho".', en: 'Color is the first thing people feel, before reading a word. If you already have brand colors, choose "I have mine".' } },
  { id: 'identidade', modos: 'C', tipo: 'varios', opcoes: () => IDENTIDADE, exclusivo: 'nada',
    t: { pt: 'O que você já tem pronto?', en: 'What do you already have?' },
    p: { pt: 'Ajuda a saber o que eu crio do zero e o que aproveito. Foto boa e texto pronto encurtam muito o prazo.', en: 'Tells me what I create from scratch and what I reuse. Good photos and ready copy shorten the timeline a lot.' } },
  { id: 'paginas', modos: 'C', tipo: 'varios', opcoes: r => paginasDe(r.tipo),
    t: r => (r.tipo === 'sistema' || r.tipo === 'app' ? { pt: 'Quais telas ele precisa ter?', en: 'Which screens does it need?' } : { pt: 'Quais páginas ele precisa ter?', en: 'Which pages does it need?' }),
    p: { pt: 'Cada página marcada entra no menu e ganha um bloco na maquete. Não sabe? Marque o que imagina; eu ajusto depois.', en: 'Each page you pick joins the menu and gets a block in the mockup. Unsure? Pick what you imagine; I’ll adjust later.' } },
  { id: 'funcoes', modos: 'C', tipo: 'varios', opcoes: () => FUNCOES,
    t: { pt: 'Que funções não podem faltar?', en: 'Which features are a must?' },
    p: { pt: 'Aqui mora boa parte do tamanho do projeto. Repare na régua "tamanho estimado" mexendo enquanto você marca.', en: 'This is where most of the project’s size lives. Watch the "estimated size" gauge move as you pick.' } },
  { id: 'referencias', modos: 'C', tipo: 'links',
    t: { pt: 'Sites ou apps que você admira', en: 'Sites or apps you admire' },
    p: { pt: 'Uma referência vale mais que mil adjetivos. E saber o que você não quer evita retrabalho.', en: 'One reference beats a thousand adjectives. And knowing what you don’t want avoids rework.' } },
  { id: 'prazo', modos: 'RC', tipo: 'um', opcoes: () => PRAZOS, avanca: true,
    t: { pt: 'Para quando você precisa?', en: 'When do you need it?' },
    p: { pt: 'Com o prazo eu planejo as etapas e te digo, com franqueza, o que dá para entregar até lá.', en: 'With a deadline I plan the stages and tell you honestly what can be delivered by then.' } },
  { id: 'orcamento', modos: 'C', tipo: 'um', opcoes: () => ORCAMENTOS, avanca: true,
    t: { pt: 'Quanto você imagina investir?', en: 'What budget do you have in mind?' },
    p: { pt: 'Não é para cobrar mais: é para eu propor o que cabe no seu bolso. Quase sempre dá para começar menor e crescer.', en: 'Not to charge more: it’s so I propose what fits. You can almost always start smaller and grow.' } },
  { id: 'depois', modos: 'C', tipo: 'um', opcoes: () => DEPOIS, avanca: true,
    t: { pt: 'E depois que estiver no ar?', en: 'And once it’s live?' },
    p: { pt: 'Site parado envelhece. Saber quem vai cuidar dele muda como eu construo.', en: 'A site left alone ages. Knowing who will look after it changes how I build it.' } },
  { id: 'observacoes', modos: 'C', tipo: 'texto',
    t: { pt: 'Algo mais que eu deva saber?', en: 'Anything else I should know?' },
    p: { pt: 'Ideias, medos, aquele detalhe que você não achou lugar para dizer. Tudo ajuda.', en: 'Ideas, worries, that detail you found no place for. It all helps.' } },
  { id: 'contato', modos: 'RC', tipo: 'contato',
    t: { pt: 'Por onde eu te respondo?', en: 'How should I reach you?' },
    p: { pt: 'Nome, e-mail e telefone são obrigatórios para eu conseguir te responder. CNPJ é opcional, e com ele eu preencho o nome da empresa sozinho.', en: 'Name, email and phone are required so I can reply. CNPJ (Brazilian company ID) is optional.' } }
];

/* ───────── Estado ───────── */
let estado = { modo: null, passo: 0, r: { objetivo: [], publico: [], identidade: [], paginas: [], funcoes: [], refs: ['', '', ''] }, protocolo: '' };
const lista = () => PERGUNTAS.filter(q => q.modos.includes(estado.modo === 'rapido' ? 'R' : 'C'));
const rascunho = {
  ler() { try { return JSON.parse(localStorage.getItem(CHAVE_RASCUNHO) || 'null'); } catch { return null; } },
  gravar() { try { localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(estado)); } catch {} },
  apagar() { try { localStorage.removeItem(CHAVE_RASCUNHO); } catch {} }
};

/* ───────── Contas da maquete ───────── */
const achar = (arr, v) => arr.find(o => o.v === v);
function pontos(r) {
  let p = (achar(TIPOS, r.tipo)?.pts) ?? 0;
  for (const f of r.funcoes || []) p += achar(FUNCOES, f)?.pts || 0;
  p += Math.max(0, (r.paginas || []).length - 3) * .6;
  if ((r.publico || []).includes('exterior') && !(r.funcoes || []).includes('idiomas')) p += 1;
  if (r.identidade?.includes('nada')) p += 2;
  return p;
}
const nivel = p => (p < 6 ? 0 : p < 12 ? 1 : p < 20 ? 2 : 3);
function paleta(r) {
  if (r.cor === 'marca') {
    const escuro = r.cor_tema === 'escuro';
    const a = r.cor_1 || '#2F6B4F';
    return escuro ? ['#111316', '#1C2024', '#EEF0F2', a] : ['#FAFAF8', '#EEEDE8', '#1D2023', a];
  }
  return (achar(PALETAS, r.cor) || (r.cor === 'sugestao' ? sugerida(r) : null) || { c: ['#F4F5F7', '#E6E8EC', '#1E2228', '#3D7BF0'] }).c;
}
// "Me sugere": uma paleta coerente com o estilo e o segmento.
function sugerida(r) {
  const porEstilo = { sobrio: 'oceano', moderno: 'noite', elegante: 'vinho', alegre: 'terra', ousado: 'sol', minimalista: 'floresta' };
  const porSegmento = { saude: 'menta', beleza: 'rosa', alimentacao: 'terra', juridico: 'oceano', tecnologia: 'noite', esporte: 'sol' };
  return achar(PALETAS, porSegmento[r.segmento] || porEstilo[r.estilo] || 'oceano');
}
const dominio = r => {
  const nome = (r.empresa || r.nome_negocio || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 22);
  return nome ? nome + (lang === 'en' && !(r.publico || []).includes('local') ? '.com' : '.com.br') : T.dominio_padrao;
};
const marcaNome = r => (r.empresa || r.nome_negocio || '').trim() || T.seu_negocio;
const cta = r => T.cta[(r.objetivo || [])[0]] || T.cta.padrao;
function preenchimento() {
  const qs = lista().filter(q => q.id !== 'contato');
  if (!estado.modo) return 0;
  const feito = qs.filter(q => respondida(q)).length;
  return Math.round((feito / (qs.length + 1)) * 100);
}
function respondida(q) {
  const r = estado.r;
  if (q.tipo === 'varios') return (r[q.id] || []).length > 0;
  if (q.tipo === 'negocio') return !!(r.nome_negocio || r.segmento || r.frase);
  if (q.tipo === 'links') return r.refs.some(Boolean) || !!r.nao_quero;
  if (q.tipo === 'texto') return !!(r.observacoes || r.origem);
  if (q.tipo === 'contato') return contatoValido(r).ok;
  return !!r[q.id];
}

/* ───────── A maquete ───────── */
// Monta o "site" do cliente num tamanho fixo (640×400) e escala para caber. As cores e a tipografia
// são custom properties registradas no CSS, então mudam com transição; blocos novos entram animados.
const elMaquete = $('[data-maquete]');
const elFicha = $('[data-ficha]');
let blocosAntes = new Set();
let fichaAntes = {};

function blocosSite(r) {
  const p = r.paginas?.length ? r.paginas : (r.tipo === 'landing' ? ['servicos', 'depoimentos', 'contato'] : ['servicos', 'sobre', 'contato']);
  const out = [];
  for (const k of p) {
    if (k === 'inicio') continue;
    if (k === 'servicos' || k === 'precos') out.push([k, `<div class="mq-b mq-cards${k === 'precos' ? ' mq-cards--preco' : ''}">${'<span><i></i><i></i><i class="c"></i></span>'.repeat(3)}</div>`]);
    else if (k === 'portfolio' || k === 'vitrine' || k === 'categorias') out.push([k, `<div class="mq-b mq-galeria">${'<span></span>'.repeat(k === 'vitrine' ? 8 : 6)}</div>`]);
    else if (k === 'depoimentos') out.push([k, '<div class="mq-b mq-quote"><b>“</b><span><i></i><i class="c"></i></span><em></em></div>']);
    else if (k === 'equipe') out.push([k, `<div class="mq-b mq-equipe">${'<span><em></em><i></i></span>'.repeat(4)}</div>`]);
    else if (k === 'blog') out.push([k, `<div class="mq-b mq-blog">${'<span><em></em><i></i><i class="c"></i></span>'.repeat(3)}</div>`]);
    else if (k === 'faq') out.push([k, `<div class="mq-b mq-faq">${'<span><i></i><b>+</b></span>'.repeat(4)}</div>`]);
    else if (k === 'contato') out.push([k, '<div class="mq-b mq-form"><span><i></i><i></i><i class="g"></i></span><em class="mq-btn"></em></div>']);
    else if (k === 'produto') out.push([k, '<div class="mq-b mq-produto"><em></em><span><i></i><i class="c"></i><b class="mq-preco">R$ 89,90</b><em class="mq-btn"></em></span></div>']);
    else if (k === 'carrinho' || k === 'checkout') out.push([k, `<div class="mq-b mq-linhas">${'<span><em></em><i></i><b></b></span>'.repeat(k === 'carrinho' ? 2 : 1)}<em class="mq-btn"></em></div>`]);
    else out.push([k, '<div class="mq-b mq-texto"><em></em><span><i></i><i></i><i class="c"></i></span></div>']);
  }
  const f = r.funcoes || [];
  if (f.includes('agendamento')) out.push(['agendamento', `<div class="mq-b mq-agenda"><span class="mq-mes">${'<i></i>'.repeat(28)}</span><span class="mq-horas"><i></i><i class="on"></i><i></i><i></i></span></div>`]);
  if (f.includes('pagamento')) out.push(['pagamento', '<div class="mq-b mq-pag"><span class="mq-cartao"><i></i><i class="c"></i></span><span class="mq-pix">PIX</span><em class="mq-btn"></em></div>']);
  if (f.includes('mapa')) out.push(['mapa', '<div class="mq-b mq-mapa"><span><b></b></span></div>']);
  if (f.includes('instagram')) out.push(['instagram', `<div class="mq-b mq-insta">${'<span></span>'.repeat(6)}</div>`]);
  if (f.includes('relatorios')) out.push(['relatorios', `<div class="mq-b mq-grafico">${[38, 62, 45, 80, 58, 92, 70].map(h => `<i style="--h:${h}%"></i>`).join('')}</div>`]);
  return out;
}

function htmlNavegador(r) {
  const nav = (r.paginas?.length ? r.paginas : ['sobre', 'servicos', 'contato']).filter(k => k !== 'inicio').slice(0, 4)
    .map(k => `<i>${esc(L(achar(paginasDe(r.tipo), k)?.t) || k)}</i>`).join('');
  const f = r.funcoes || [];
  const titulo = (r.frase || '').trim() || T.titulos[r.tipo] || T.titulos.site;
  const blocos = blocosSite(r);
  const extras = `${f.includes('idiomas') || (r.publico || []).includes('exterior') ? '<span class="mq-idioma">PT · EN</span>' : ''}${f.includes('login') ? '<span class="mq-entrar">↪</span>' : ''}${r.tipo === 'loja' ? '<span class="mq-sacola">2</span>' : ''}`;
  return {
    blocos,
    html: `<div class="mq-nav"><span class="mq-logo"><em></em><b>${esc(marcaNome(r))}</b></span><span class="mq-links">${nav}</span>${extras}<span class="mq-cta">${esc(cta(r))}</span></div>
    <div class="mq-hero"><div class="mq-hero__txt"><b class="mq-h">${esc(titulo.slice(0, 70))}</b><i></i><i class="c"></i><span class="mq-btn mq-btn--grande">${esc(cta(r))}</span></div><div class="mq-foto"></div></div>
    <div class="mq-blocos">${blocos.map(([k, h]) => h.replace('class="mq-b', `data-k="${k}" class="mq-b`)).join('')}</div>
    <div class="mq-rodape"><span>${esc(marcaNome(r))}</span><span>${esc(r.telefone || '')}</span><span>${esc(r.email || '')}</span></div>`
  };
}

function htmlSistema(r) {
  const telas = r.paginas?.length ? r.paginas : ['dashboard', 'cadastros', 'relatorios', 'config'];
  const nomes = telas.map(k => `<i${k === telas[0] ? ' class="on"' : ''}>${esc(L(achar(paginasDe('sistema'), k)?.t) || k)}</i>`).join('');
  const blocos = [];
  blocos.push(['kpis', `<div class="mq-b mq-kpis">${['128', '94%', '37', 'R$ 18k'].map(n => `<span><i></i><b>${n}</b></span>`).join('')}</div>`]);
  if (telas.includes('relatorios') || telas.includes('dashboard') || (r.funcoes || []).includes('relatorios')) blocos.push(['grafico', `<div class="mq-b mq-grafico">${[38, 62, 45, 80, 58, 92, 70, 66, 84].map(h => `<i style="--h:${h}%"></i>`).join('')}</div>`]);
  if (telas.includes('agenda') || (r.funcoes || []).includes('agendamento')) blocos.push(['agenda', `<div class="mq-b mq-agenda"><span class="mq-mes">${'<i></i>'.repeat(28)}</span><span class="mq-horas"><i></i><i class="on"></i><i></i><i></i></span></div>`]);
  blocos.push(['tabela', `<div class="mq-b mq-tabela">${'<span><i></i><i></i><i></i><b></b></span>'.repeat(5)}</div>`]);
  return {
    blocos,
    html: `<div class="mq-sis"><div class="mq-lateral"><span class="mq-logo"><em></em><b>${esc(marcaNome(r))}</b></span>${nomes}</div>
      <div class="mq-sis__corpo"><div class="mq-sis__topo"><b>${esc(L(achar(paginasDe('sistema'), telas[0])?.t) || 'Painel')}</b><span class="mq-busca"></span>${(r.funcoes || []).includes('notificacoes') ? '<span class="mq-sino"></span>' : ''}<em class="mq-avatar"></em></div>
      <div class="mq-blocos">${blocos.map(([k, h]) => h.replace('class="mq-b', `data-k="${k}" class="mq-b`)).join('')}</div></div></div>`
  };
}

function htmlApp(r) {
  const telas = r.paginas?.length ? r.paginas : ['inicio', 'perfil', 'notificacoes', 'config'];
  const f = r.funcoes || [];
  const blocos = [];
  blocos.push(['destaque', `<div class="mq-b mq-app-destaque"><b>${esc(marcaNome(r))}</b><i></i><span class="mq-btn">${esc(cta(r))}</span></div>`]);
  if (telas.includes('pagamentos') || f.includes('pagamento')) blocos.push(['pagamento', '<div class="mq-b mq-pag"><span class="mq-cartao"><i></i><i class="c"></i></span><span class="mq-pix">PIX</span></div>']);
  if (telas.includes('mapa') || f.includes('mapa')) blocos.push(['mapa', '<div class="mq-b mq-mapa"><span><b></b></span></div>']);
  if (telas.includes('chat') || f.includes('chat')) blocos.push(['chat', '<div class="mq-b mq-conversa"><i></i><i class="eu"></i><i></i></div>']);
  blocos.push(['lista', `<div class="mq-b mq-app-lista">${'<span><em></em><i></i><i class="c"></i></span>'.repeat(3)}</div>`]);
  return {
    blocos,
    html: `<div class="mq-app"><div class="mq-app__status"><b>9:41</b><span></span></div>
      <div class="mq-app__topo"><span class="mq-logo"><em></em><b>${esc(marcaNome(r))}</b></span>${telas.includes('notificacoes') || f.includes('notificacoes') ? '<span class="mq-sino"></span>' : ''}</div>
      <div class="mq-blocos">${blocos.map(([k, h]) => h.replace('class="mq-b', `data-k="${k}" class="mq-b`)).join('')}</div>
      <div class="mq-app__abas">${telas.slice(0, 4).map((k, i) => `<i${i === 0 ? ' class="on"' : ''}></i>`).join('')}</div></div>`
  };
}

let escalaObs;
function desenharMaquete(final = false) {
  if (!elMaquete) return;
  const r = estado.r;
  const est = achar(ESTILOS, r.estilo) || { f: 'sans', raio: 8, peso: 650 };
  const [fundo, sup, texto, acento] = paleta(r);
  const forma = r.tipo === 'app' ? 'app' : r.tipo === 'sistema' ? 'sistema' : 'site';
  const { html, blocos } = forma === 'app' ? htmlApp(r) : forma === 'sistema' ? htmlSistema(r) : htmlNavegador(r);

  if (!elMaquete.firstElementChild) {
    elMaquete.innerHTML = `<div class="maquete__barra"><span class="maquete__led"></span><span class="maquete__url" data-url></span><span class="maquete__esboco" data-esboco></span></div>
      <div class="maquete__vidro" data-vidro><div class="mq" data-mq><div class="mq__pagina" data-pagina></div><span class="mq-whats" data-whats></span></div></div>`;
    escalaObs = new ResizeObserver(() => escalar());
    escalaObs.observe($('[data-vidro]', elMaquete));
  }
  const mq = $('[data-mq]', elMaquete);
  elMaquete.dataset.forma = forma;
  mq.dataset.fonte = est.f;
  mq.dataset.estilo = r.estilo || '';
  mq.classList.toggle('mq--maduro', (r.publico || []).includes('maduro'));
  mq.classList.toggle('mq--fotos', (r.identidade || []).includes('fotos'));
  mq.classList.toggle('mq--logo', (r.identidade || []).includes('logo') || (r.identidade || []).includes('manual'));
  mq.classList.toggle('mq--claro', luminancia(fundo) > .5);
  const s = mq.style;
  s.setProperty('--m-fundo', fundo); s.setProperty('--m-sup', sup); s.setProperty('--m-texto', texto); s.setProperty('--m-acento', acento);
  s.setProperty('--m-raio', est.raio + 'px'); s.setProperty('--m-peso', est.peso);
  $('[data-whats]', mq).classList.toggle('on', (r.funcoes || []).includes('whatsapp'));

  const pagina = $('[data-pagina]', mq);
  pagina.innerHTML = html;
  const agora = new Set(blocos.map(b => b[0]));
  let foco = null;
  for (const el of $$('[data-k]', pagina)) {
    if (!blocosAntes.has(el.dataset.k) && blocosAntes.size + agora.size > 0 && estado.modo) {
      el.classList.add('entra');
      foco = foco || el;
    }
  }
  blocosAntes = agora;
  // A "câmera" desce até o bloco que acabou de entrar e volta ao topo quando a mudança é no topo.
  const alvo = foco && forma === 'site' ? Math.max(0, Math.min(foco.offsetTop - 120, pagina.offsetHeight - 400)) : 0;
  pagina.style.setProperty('--rolar', -alvo + 'px');

  $('[data-url]', elMaquete).textContent = dominio(r);
  $('[data-esboco]', elMaquete).textContent = final ? T.no_ar : T.esboco(preenchimento());
  elMaquete.classList.toggle('ligada', final);
  escalar();
}
function escalar() {
  const vidro = $('[data-vidro]', elMaquete);
  if (!vidro) return;
  vidro.style.setProperty('--escala', (vidro.clientWidth / 640).toFixed(4));
}
function luminancia(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => v / 255);
  return .2126 * r + .7152 * g + .0722 * b;
}

/* ───────── A ficha (o pedido sendo escrito) ───────── */
function linhasFicha() {
  const r = estado.r;
  const nomes = (arr, vs) => (vs || []).map(v => L(achar(arr, v)?.t)).filter(Boolean);
  const cor = r.cor === 'marca' ? (lang === 'en' ? 'Brand colors' : 'Cores da marca') : r.cor === 'sugestao' ? (lang === 'en' ? 'Davi suggests' : 'Sugestão do Davi') : L(achar(PALETAS, r.cor)?.t);
  const lin = [
    ['tipo', lang === 'en' ? 'Format' : 'Formato', L(achar(TIPOS, r.tipo)?.t)],
    ['negocio', lang === 'en' ? 'Business' : 'Negócio', [r.nome_negocio, L(achar(SEGMENTOS, r.segmento)?.t)].filter(Boolean).join(' · ')],
    ['objetivo', lang === 'en' ? 'Goals' : 'Objetivos', nomes(OBJETIVOS, r.objetivo).join(', ')],
    ['publico', lang === 'en' ? 'Audience' : 'Público', nomes(PUBLICO, r.publico).join(', ')],
    ['estilo', lang === 'en' ? 'Style' : 'Estilo', L(achar(ESTILOS, r.estilo)?.t)],
    ['cor', lang === 'en' ? 'Colors' : 'Cores', cor, paleta(r)],
    ['identidade', lang === 'en' ? 'Has ready' : 'Já tem', nomes(IDENTIDADE, r.identidade).join(', ')],
    ['paginas', r.tipo === 'sistema' || r.tipo === 'app' ? (lang === 'en' ? 'Screens' : 'Telas') : (lang === 'en' ? 'Pages' : 'Páginas'), (r.paginas || []).length ? `${r.paginas.length} · ${nomes(paginasDe(r.tipo), r.paginas).slice(0, 3).join(', ')}${r.paginas.length > 3 ? '…' : ''}` : ''],
    ['funcoes', lang === 'en' ? 'Features' : 'Funções', (r.funcoes || []).length ? `${r.funcoes.length} · ${nomes(FUNCOES, r.funcoes).slice(0, 3).join(', ')}${r.funcoes.length > 3 ? '…' : ''}` : ''],
    ['referencias', lang === 'en' ? 'References' : 'Referências', r.refs.filter(Boolean).length ? String(r.refs.filter(Boolean).length) : ''],
    ['prazo', lang === 'en' ? 'Timeline' : 'Prazo', L(achar(PRAZOS, r.prazo)?.t)],
    ['orcamento', lang === 'en' ? 'Budget' : 'Investimento', L(achar(ORCAMENTOS, r.orcamento)?.t)],
    ['depois', lang === 'en' ? 'After launch' : 'Depois', L(achar(DEPOIS, r.depois)?.t)]
  ];
  const ids = new Set(lista().map(q => q.id));
  return lin.filter(([k]) => ids.has(k) || !estado.modo);
}
function desenharFicha() {
  if (!elFicha) return;
  const linhas = linhasFicha();
  const p = pontos(estado.r);
  const n = nivel(p);
  const segmentos = 12;
  const acesos = Math.max(estado.r.tipo ? 1 : 0, Math.min(segmentos, Math.round(p / 26 * segmentos)));
  const algum = linhas.some(l => l[2]);
  elFicha.innerHTML = `<p class="ficha__titulo rotulo">${lang === 'en' ? 'brief' : 'ficha do pedido'}${estado.protocolo ? ` · <span class="dado">${esc(estado.protocolo)}</span>` : ''}</p>
    ${algum ? '' : `<p class="ficha__vazia">${T.ficha_vazia}</p>`}
    <dl class="ficha__linhas">${linhas.filter(l => l[2]).map(([k, rot, val, cores]) => `<div class="ficha__linha${fichaAntes[k] !== val ? ' mudou' : ''}" data-k="${k}"><dt class="rotulo">${rot}</dt><dd>${cores ? `<span class="ficha__cores">${cores.map(c => `<i style="background:${c}"></i>`).join('')}</span>` : ''}${esc(val)}</dd></div>`).join('')}</dl>
    <div class="ficha__regua${estado.r.tipo ? '' : ' vazia'}" role="img" aria-label="${T.tamanho}: ${T.tamanhos[n]}">
      <p class="rotulo">${T.tamanho} <b>${estado.r.tipo ? T.tamanhos[n] : '—'}</b></p>
      <span class="ficha__segmentos">${Array.from({ length: segmentos }, (_, i) => `<i class="${i < acesos ? 'on' : ''}${i >= 9 ? ' alto' : i >= 6 ? ' medio' : ''}" style="--i:${i}"></i>`).join('')}</span>
      <p class="ficha__nota">${T.tamanho_nota}</p>
    </div>`;
  fichaAntes = Object.fromEntries(linhas.map(l => [l[0], l[2]]));
}
const atualizar = () => { desenharMaquete(); desenharFicha(); rascunho.gravar(); atualizarTrilho(); };

/* ───────── O palco: os passos ───────── */
const palco = $('[data-palco]');
let direcao = 1;
let robo = false;
let soltarRobo = null;

function trilho() {
  const qs = lista();
  return `<div class="trilho" data-trilho>
    <div class="trilho__linha">${qs.map((q, i) => `<i class="${i < estado.passo ? 'feito' : ''}${i === estado.passo ? ' agora' : ''}"></i>`).join('')}<span class="trilho__pacote" style="--p:${qs.length > 1 ? estado.passo / (qs.length - 1) : 0}"></span></div>
    <p class="trilho__texto rotulo" aria-live="polite"><span class="dado">${String(estado.passo + 1).padStart(2, '0')} / ${String(qs.length).padStart(2, '0')}</span><span>${T.faltam(Math.ceil((qs.length - estado.passo - 1) * (estado.modo === 'rapido' ? .35 : .65)))}</span></p>
  </div>`;
}
function atualizarTrilho() {
  const t = $('[data-trilho]', palco);
  if (!t) return;
  const qs = lista();
  $$('.trilho__linha i', t).forEach((i, k) => i.classList.toggle('respondida', !!qs[k] && respondida(qs[k])));
}

function opcaoHtml(q, o, marcado) {
  const tipoInput = q.tipo === 'varios' ? 'checkbox' : 'radio';
  const amostra = q.amostra ? `<span class="opcao__amostra" data-fonte="${o.f}" style="--a-raio:${o.raio}px;--a-peso:${o.peso}">Aa</span>` : '';
  const icone = q.icones ? `<span class="opcao__icone">${svg(o.v)}</span>` : '';
  return `<label class="opcao${o.d ? ' opcao--cartao' : ''}${q.icones ? ' opcao--icone' : ''}${q.amostra ? ' opcao--amostra' : ''}">
    <input type="${tipoInput}" name="${q.id}" value="${o.v}"${marcado ? ' checked' : ''}>
    ${icone}${amostra}<span class="opcao__txt"><span class="opcao__t">${esc(L(o.t))}</span>${o.d ? `<span class="opcao__d">${esc(L(o.d))}</span>` : ''}</span>
    <span class="opcao__marca">${svg('ok')}</span>
  </label>`;
}
const dicaDe = q => {
  const r = estado.r;
  const ops = q.opcoes ? q.opcoes(r) : [];
  if (q.tipo === 'um') return L(achar(ops, r[q.id])?.dica);
  if (q.tipo === 'varios') { const ult = (r[q.id] || []).slice().reverse().find(v => achar(ops, v)?.dica); return ult ? L(achar(ops, ult).dica) : ''; }
  return '';
};

function corpoPergunta(q) {
  const r = estado.r;
  if (q.tipo === 'um' || q.tipo === 'varios') {
    const ops = q.opcoes(r);
    const valores = q.tipo === 'varios' ? (r[q.id] || []) : [r[q.id]];
    return `<p class="passo__instrucao">${q.tipo === 'varios' ? T.escolha_varios : T.escolha_um}</p>
      <div class="opcoes${q.icones || q.amostra || ops.some(o => o.d) ? ' opcoes--cartoes' : ''}" role="${q.tipo === 'varios' ? 'group' : 'radiogroup'}" aria-labelledby="passo-titulo">${ops.map(o => opcaoHtml(q, o, valores.includes(o.v))).join('')}</div>`;
  }
  if (q.tipo === 'negocio') {
    return `<div class="campos">
      ${campo('nome_negocio', lang === 'en' ? 'Business name' : 'Nome do negócio', { valor: r.nome_negocio, dica: lang === 'en' ? 'e.g. Ana’s Bakery' : 'ex.: Padaria da Ana', auto: 'organization' })}
      <fieldset class="campo campo--chips"><legend class="campo__rotulo">${lang === 'en' ? 'Industry' : 'Segmento'}</legend>
        <div class="chips" role="radiogroup">${SEGMENTOS.map(o => `<label class="chip"><input type="radio" name="segmento" value="${o.v}"${r.segmento === o.v ? ' checked' : ''}><span>${esc(L(o.t))}</span></label>`).join('')}</div>
      </fieldset>
      ${campo('frase', lang === 'en' ? 'In one sentence: what do you do, and for whom?' : 'Em uma frase: o que você faz e para quem?', { valor: r.frase, area: true, max: 140, dica: lang === 'en' ? 'e.g. Sourdough bread delivered to homes in the north side' : 'ex.: Pão de fermentação natural entregue em casa na zona norte', conta: true })}
    </div>`;
  }
  if (q.tipo === 'cor') {
    const marca = r.cor === 'marca';
    return `<div class="paletas" role="radiogroup" aria-labelledby="passo-titulo">
      ${PALETAS.map(o => `<label class="paleta"><input type="radio" name="cor" value="${o.v}"${r.cor === o.v ? ' checked' : ''}><span class="paleta__amostra">${o.c.map(c => `<i style="background:${c}"></i>`).join('')}</span><span class="paleta__nome">${esc(L(o.t))}</span></label>`).join('')}
      <label class="paleta paleta--marca"><input type="radio" name="cor" value="marca"${marca ? ' checked' : ''}><span class="paleta__amostra paleta__amostra--marca"><i style="background:${esc(r.cor_1 || '#2F6B4F')}"></i><i style="background:${esc(r.cor_2 || '#E9E4D8')}"></i></span><span class="paleta__nome">${lang === 'en' ? 'I have mine' : 'Já tenho as cores'}</span></label>
      <label class="paleta paleta--sugestao"><input type="radio" name="cor" value="sugestao"${r.cor === 'sugestao' ? ' checked' : ''}><span class="paleta__amostra paleta__amostra--sugestao"><i></i></span><span class="paleta__nome">${lang === 'en' ? 'Suggest one' : 'Me sugere'}</span></label>
    </div>
    <div class="marca-cores"${marca ? '' : ' hidden'} data-marca-cores>
      <label class="seletor"><input type="color" name="cor_1" value="${esc(r.cor_1 || '#2F6B4F')}"><span>${lang === 'en' ? 'Main color' : 'Cor principal'}</span></label>
      <label class="seletor"><input type="color" name="cor_2" value="${esc(r.cor_2 || '#E9E4D8')}"><span>${lang === 'en' ? 'Second color' : 'Cor secundária'}</span></label>
      <div class="alternar" role="radiogroup" aria-label="${lang === 'en' ? 'Background' : 'Fundo'}">
        <label><input type="radio" name="cor_tema" value="claro"${r.cor_tema !== 'escuro' ? ' checked' : ''}><span>${lang === 'en' ? 'Light' : 'Claro'}</span></label>
        <label><input type="radio" name="cor_tema" value="escuro"${r.cor_tema === 'escuro' ? ' checked' : ''}><span>${lang === 'en' ? 'Dark' : 'Escuro'}</span></label>
      </div>
    </div>`;
  }
  if (q.tipo === 'links') {
    return `<div class="campos">
      ${r.refs.map((v, i) => campo('ref_' + i, `${lang === 'en' ? 'Reference' : 'Referência'} ${i + 1}`, { valor: v, tipo: 'url', dica: i === 0 ? 'https://…' : '', opcional: true, auto: 'off', modo: 'url' })).join('')}
      ${campo('gosta', lang === 'en' ? 'What do you like about them?' : 'O que você gosta neles?', { valor: r.gosta, area: true, max: 400, dica: lang === 'en' ? 'e.g. the clean menu, the big photos, how quick it is to buy' : 'ex.: o menu limpo, as fotos grandes, como é rápido comprar', opcional: true })}
      ${campo('nao_quero', lang === 'en' ? 'And something you do NOT want?' : 'E algo que você NÃO quer?', { valor: r.nao_quero, area: true, max: 300, dica: lang === 'en' ? 'e.g. pop-ups, too much text, looking like a template' : 'ex.: pop-up, texto demais, cara de modelo pronto', opcional: true })}
    </div>`;
  }
  if (q.tipo === 'texto') {
    return `<div class="campos">
      ${campo('observacoes', lang === 'en' ? 'Notes' : 'Observações', { valor: r.observacoes, area: true, max: 1500, dica: lang === 'en' ? 'Anything goes.' : 'Vale tudo.', opcional: true, conta: true })}
      <fieldset class="campo campo--chips"><legend class="campo__rotulo">${lang === 'en' ? 'How did you find me?' : 'Como você me conheceu?'} <span class="campo__opc">${T.opcional}</span></legend>
        <div class="chips">${ORIGEM.map(o => `<label class="chip"><input type="radio" name="origem" value="${o.v}"${r.origem === o.v ? ' checked' : ''}><span>${esc(L(o.t))}</span></label>`).join('')}</div>
      </fieldset>
    </div>`;
  }
  // contato
  return `<div class="campos campos--contato">
    ${campo('nome', lang === 'en' ? 'Your name' : 'Seu nome', { valor: r.nome, auto: 'name', obrigatorio: true })}
    ${campo('email', 'E-mail', { valor: r.email, tipo: 'email', auto: 'email', obrigatorio: true, modo: 'email' })}
    ${campo('telefone', lang === 'en' ? 'Phone / WhatsApp' : 'Telefone / WhatsApp', { valor: r.telefone, tipo: 'tel', auto: 'tel', obrigatorio: true, modo: 'tel', dica: lang === 'en' ? '+1 555 123 4567' : '(34) 99999-9999' })}
    ${campo('empresa', lang === 'en' ? 'Company' : 'Empresa', { valor: r.empresa ?? r.nome_negocio, auto: 'organization', opcional: true })}
    ${campo('cnpj', 'CNPJ', { valor: r.cnpj, opcional: true, modo: 'numeric', dica: '00.000.000/0000-00', auto: 'off' })}
    <fieldset class="campo campo--chips campo--meio"><legend class="campo__rotulo">${lang === 'en' ? 'Best way to reply' : 'Prefiro resposta por'}</legend>
      <div class="chips">${PREFERENCIA.map(o => `<label class="chip"><input type="radio" name="preferencia" value="${o.v}"${(r.preferencia || 'whatsapp') === o.v ? ' checked' : ''}><span>${esc(L(o.t))}</span></label>`).join('')}</div>
    </fieldset>
    <fieldset class="campo campo--chips campo--meio"><legend class="campo__rotulo">${lang === 'en' ? 'Best time' : 'Melhor horário'} <span class="campo__opc">${T.opcional}</span></legend>
      <div class="chips">${HORARIO.map(o => `<label class="chip"><input type="checkbox" name="horario" value="${o.v}"${(r.horario || []).includes(o.v) ? ' checked' : ''}><span>${esc(L(o.t))}</span></label>`).join('')}</div>
    </fieldset>
    <label class="mel" aria-hidden="true">Website<input type="text" name="site_url" tabindex="-1" autocomplete="off"></label>
    <p class="privacidade">${T.privacidade}</p>
  </div>`;
}
function campo(nome, rotulo, o = {}) {
  const id = 'c-' + nome;
  const attrs = `id="${id}" name="${nome}"${o.auto ? ` autocomplete="${o.auto}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}${o.dica ? ` placeholder="${esc(o.dica)}"` : ''}${o.modo ? ` inputmode="${o.modo}"` : ''}${o.obrigatorio ? ' required aria-required="true"' : ''} aria-describedby="${id}-msg"`;
  const valor = esc(o.valor || '');
  return `<div class="campo${o.area ? ' campo--area' : ''}" data-campo="${nome}">
    <label class="campo__rotulo" for="${id}">${rotulo} ${o.obrigatorio ? `<span class="campo__obr">${T.obrigatorio}</span>` : o.opcional ? `<span class="campo__opc">${T.opcional}</span>` : ''}</label>
    ${o.area ? `<textarea ${attrs} rows="3">${valor}</textarea>` : `<input type="${o.tipo || 'text'}" ${attrs} value="${valor}">`}
    <p class="campo__msg" id="${id}-msg">${o.conta ? `<span class="campo__conta dado">${(o.valor || '').length}/${o.max}</span>` : ''}</p>
  </div>`;
}

function renderIntro() {
  const salvo = rascunho.ler();
  const temSalvo = salvo && salvo.modo && Object.values(salvo.r || {}).some(v => (Array.isArray(v) ? v.some(Boolean) : !!v));
  raiz.classList.remove('iniciado', 'concluido');
  const qsR = PERGUNTAS.filter(q => q.modos.includes('R')).length;
  const qsC = PERGUNTAS.filter(q => q.modos.includes('C')).length;
  return `<div class="passo passo--intro">
    <h2 class="passo__titulo" id="passo-titulo" tabindex="-1">${T.modo_titulo}</h2>
    <div class="modos">
      <button type="button" class="modo" data-modo="rapido">
        <span class="modo__meta rotulo">${T.rapido_meta}</span>
        <span class="modo__nome">${T.rapido}</span>
        <span class="modo__txt">${T.rapido_txt}</span>
        <span class="modo__pontos" aria-hidden="true">${'<i></i>'.repeat(qsR)}</span>
        <span class="modo__ir">${svg('seta')}</span>
      </button>
      <button type="button" class="modo modo--completo" data-modo="completo">
        <span class="modo__meta rotulo">${T.completo_meta} <span class="modo__selo">${T.recomendado}</span></span>
        <span class="modo__nome">${T.completo}</span>
        <span class="modo__txt">${T.completo_txt}</span>
        <span class="modo__pontos" aria-hidden="true">${'<i></i>'.repeat(qsC)}</span>
        <span class="modo__ir">${svg('seta')}</span>
      </button>
    </div>
    ${temSalvo ? `<button type="button" class="continuar" data-continuar>${svg('volta', 'ic ic--vira')}<span>${T.continuar}</span><span class="rotulo">${T.continuar_meta((salvo.passo || 0) + 1, PERGUNTAS.filter(q => q.modos.includes(salvo.modo === 'rapido' ? 'R' : 'C')).length)}</span></button>` : ''}
  </div>`;
}

function renderPasso() {
  const qs = lista();
  const q = qs[estado.passo];
  const titulo = L(typeof q.t === 'function' ? q.t(estado.r) : q.t);
  const ultimo = estado.passo === qs.length - 1;
  const dica = dicaDe(q);
  const pulavel = q.tipo !== 'contato' && !['tipo'].includes(q.id);
  return `${trilho()}
  <form class="passo" data-q="${q.id}" novalidate>
    <h2 class="passo__titulo" id="passo-titulo" tabindex="-1">${esc(titulo)}</h2>
    <p class="passo__porque"><span class="rotulo">${T.porque}</span>${esc(L(q.p))}</p>
    ${corpoPergunta(q)}
    <p class="passo__dica" data-dica${dica ? '' : ' hidden'}>${esc(dica || '')}</p>
    ${q.tipo === 'contato' ? `<div class="robo"><div class="robo__widget" data-robo></div><p class="robo__aviso" data-robo-aviso hidden>${T.robo_falta}</p></div>` : ''}
    <div class="passo__acoes">
      <button type="button" class="botao botao--linha" data-voltar>${svg('volta')}${T.voltar}</button>
      ${pulavel && !respondida(q) ? `<button type="button" class="passo__pular" data-pular>${T.pular}</button>` : ''}
      <button type="submit" class="botao botao--sinal" data-proximo>${ultimo ? T.gerar : T.proximo}${svg('seta')}</button>
    </div>
  </form>`;
}

function trocar(html, foco = true) {
  const velho = palco.firstElementChild ? [...palco.children] : [];
  const novo = document.createElement('div');
  novo.className = 'palco__cena';
  novo.innerHTML = html;
  if (movimento && velho.length) {
    velho.forEach(v => { v.style.position = 'absolute'; v.style.inset = '0 0 auto 0'; v.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-28 * direcao}px)` }], { duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' }).finished.then(() => v.remove()); });
    palco.append(novo);
    novo.animate([{ opacity: 0, transform: `translateX(${36 * direcao}px)` }, { opacity: 1, transform: 'none' }], { duration: 460, delay: 120, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    $$('.opcao, .paleta, .chip, .campo, .modo', novo).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 180 + Math.min(i, 12) * 32, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
  } else {
    velho.forEach(v => v.remove());
    palco.append(novo);
  }
  ligarCena(novo);
  if (foco) {
    const h = $('#passo-titulo', novo);
    h?.focus({ preventScroll: true });
    // No celular a maquete fica grudada no topo: o passo novo começa logo abaixo dela.
    const folga = innerWidth < 900 && raiz.classList.contains('iniciado') && !raiz.classList.contains('concluido') ? 72 + elMaquete.offsetHeight + 14 : 84;
    // No fim, o celular mostra a maquete "ligando" antes da ordem de serviço.
    const t = (innerWidth < 900 && raiz.classList.contains('concluido') ? elMaquete : palco).getBoundingClientRect().top;
    if (t < folga - 4 || t > innerHeight * .5) scrollTo({ top: scrollY + t - folga, behavior: movimento ? 'smooth' : 'auto' });
  }
}

function irPara(i) {
  const qs = lista();
  direcao = i >= estado.passo ? 1 : -1;
  estado.passo = Math.max(0, Math.min(qs.length - 1, i));
  raiz.classList.add('iniciado');
  trocar(renderPasso());
  atualizar();
}
function comecar(modo) {
  estado.modo = modo;
  estado.passo = 0;
  direcao = 1;
  irPara(0);
}

/* ───────── Interações de cada cena ───────── */
function ligarCena(cena) {
  $$('[data-modo]', cena).forEach(b => b.addEventListener('click', () => comecar(b.dataset.modo)));
  $('[data-continuar]', cena)?.addEventListener('click', () => {
    const salvo = rascunho.ler();
    if (!salvo) return;
    estado = { ...estado, ...salvo, r: { ...estado.r, ...salvo.r } };
    irPara(salvo.passo || 0);
  });
  const form = $('form.passo', cena);
  // O "não sou robô" vive só no passo do contato; sair dele remove o widget.
  soltarRobo?.();
  soltarRobo = null;
  robo = false;
  const alvoRobo = $('[data-robo]', cena);
  if (alvoRobo) {
    soltarRobo = naoRobo(alvoRobo, {
      chave: CFG.turnstile, lang,
      aoPassar: () => { robo = true; $('[data-robo-aviso]', cena).hidden = true; },
      aoExpirar: () => { robo = false; }
    });
  }
  if (!form) {
    ligarFinal(cena);
    return;
  }
  const q = lista().find(x => x.id === form.dataset.q);
  form.addEventListener('submit', e => { e.preventDefault(); avancar(q, form); });
  $('[data-voltar]', form).addEventListener('click', () => (estado.passo === 0 ? voltarIntro() : irPara(estado.passo - 1)));
  $('[data-pular]', form)?.addEventListener('click', () => irPara(estado.passo + 1));
  form.addEventListener('change', e => mudou(q, form, e.target));
  form.addEventListener('input', e => { if (e.target.matches('input[type=text], input[type=email], input[type=tel], input[type=url], textarea, input[type=color]')) mudou(q, form, e.target); });
  // Enter num campo de uma linha avança; no textarea, quebra a linha.
  form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input[type=radio], input[type=checkbox]')) { e.preventDefault(); e.target.click(); } });
}
function voltarIntro() {
  direcao = -1;
  trocar(renderIntro());
  estado.modo && atualizar();
}

let avancoAuto;
function mudou(q, form, alvo) {
  const r = estado.r;
  const nome = alvo.name;
  if (!nome || nome === 'site_url') return;
  if (alvo.type === 'checkbox') {
    if (q.exclusivo && nome === q.id) {
      // "Nada ainda" desmarca o resto, e marcar qualquer outra desmarca o "nada".
      if (alvo.value === q.exclusivo && alvo.checked) $$(`input[name="${nome}"]`, form).forEach(i => { if (i !== alvo) i.checked = false; });
      else if (alvo.checked) { const x = $(`input[name="${nome}"][value="${q.exclusivo}"]`, form); if (x) x.checked = false; }
    }
    const atual = $$(`input[name="${nome}"]:checked`, form).map(i => i.value);
    // Mantém a ordem em que a pessoa marcou: o primeiro objetivo vira o botão da maquete.
    const antes = r[nome] || [];
    r[nome] = [...antes.filter(v => atual.includes(v)), ...atual.filter(v => !antes.includes(v))];
  } else if (/^ref_\d$/.test(nome)) {
    r.refs[+nome.slice(4)] = alvo.value.trim();
  } else if (nome === 'telefone') {
    alvo.value = mascaraTelefone(alvo.value);
    r.telefone = alvo.value;
  } else if (nome === 'cnpj') {
    alvo.value = mascaraCnpj(alvo.value);
    r.cnpj = alvo.value;
    conferirCnpj(form);
  } else {
    r[nome] = alvo.value;
  }
  if (nome === 'tipo' && r.paginas?.length) r.paginas = r.paginas.filter(v => paginasDe(r.tipo).some(o => o.v === v));
  if (nome === 'cor') $('[data-marca-cores]', form)?.toggleAttribute('hidden', r.cor !== 'marca');
  if (nome === 'cor_1' || nome === 'cor_2') { const a = $$('.paleta__amostra--marca i', form); if (a[+(nome === 'cor_2')]) a[+(nome === 'cor_2')].style.background = alvo.value; }
  const conta = alvo.closest('[data-campo]') && $('.campo__conta', alvo.closest('[data-campo]'));
  if (conta) conta.textContent = `${alvo.value.length}/${alvo.maxLength}`;
  if (q.tipo === 'contato') limparErro(alvo);

  // A dica didática acompanha a última escolha.
  const dica = $('[data-dica]', form);
  if (dica) {
    const txt = dicaDe(q);
    if (txt !== dica.textContent) {
      dica.textContent = txt;
      dica.toggleAttribute('hidden', !txt);
      if (txt && movimento) dica.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
  }
  $('[data-pular]', form)?.remove();
  atualizar();

  if (q.avanca && alvo.type === 'radio' && nome === q.id) {
    clearTimeout(avancoAuto);
    avancoAuto = setTimeout(() => { if (estado.r[q.id] === alvo.value && $('form.passo', palco)?.dataset.q === q.id) irPara(estado.passo + 1); }, dicaDe(q) ? 1500 : 650);
  }
}
function avancar(q, form) {
  clearTimeout(avancoAuto);
  if (q.tipo === 'contato') {
    const v = contatoValido(estado.r);
    if (!v.ok) { mostrarErros(form, v.erros); return; }
    if (($('[name="site_url"]', form)?.value || '').trim()) return; // robô
    if (!robo) { $('[data-robo-aviso]', form).hidden = false; return; }
    concluir();
    return;
  }
  irPara(estado.passo + 1);
}

/* ───────── Contato: máscaras e validação ───────── */
function mascaraTelefone(v) {
  // Número de fora: cada país agrupa de um jeito, então só limpa e deixa os espaços de quem digitou.
  if (v.trim().startsWith('+') && !v.trim().startsWith('+55')) return '+' + v.replace(/[^\d ]/g, '').replace(/ {2,}/g, ' ').trimStart().slice(0, 20);
  let d = so(v.replace(/^\s*\+55/, ''));
  if (d.length > 11) d = d.slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
function mascaraCnpj(v) {
  const d = so(v).slice(0, 14);
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
}
function cnpjValido(v) {
  const d = so(v);
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false;
  const dv = n => {
    const pesos = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const s = pesos.reduce((acc, p, i) => acc + p * +d[i], 0) % 11;
    return s < 2 ? 0 : 11 - s;
  };
  return dv(12) === +d[12] && dv(13) === +d[13];
}
function contatoValido(r) {
  const erros = {};
  if ((r.nome || '').trim().length < 2) erros.nome = T.erro_nome;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((r.email || '').trim())) erros.email = T.erro_email;
  const tel = so(r.telefone);
  if ((r.telefone || '').trim().startsWith('+') ? tel.length < 8 : tel.length < 10) erros.telefone = T.erro_tel;
  if ((r.cnpj || '').trim() && !cnpjValido(r.cnpj)) erros.cnpj = T.erro_cnpj;
  return { ok: !Object.keys(erros).length, erros };
}
function mostrarErros(form, erros) {
  let primeiro;
  for (const [k, msg] of Object.entries(erros)) {
    const c = $(`[data-campo="${k}"]`, form);
    if (!c) continue;
    c.classList.add('erro');
    $('input, textarea', c).setAttribute('aria-invalid', 'true');
    $('.campo__msg', c).textContent = msg;
    if (movimento) c.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 360, easing: 'ease-out' });
    primeiro = primeiro || $('input, textarea', c);
  }
  primeiro?.focus();
}
function limparErro(alvo) {
  const c = alvo.closest('[data-campo]');
  if (!c || !c.classList.contains('erro')) return;
  c.classList.remove('erro');
  alvo.removeAttribute('aria-invalid');
  if (c.dataset.campo !== 'cnpj') $('.campo__msg', c).textContent = '';
}
// Com um CNPJ válido, a razão social vem da BrasilAPI (dados públicos da Receita) e preenche a empresa.
let cnpjConsultado = '';
async function conferirCnpj(form) {
  const c = $('[data-campo="cnpj"]', form);
  const msg = $('.campo__msg', c);
  const d = so(estado.r.cnpj);
  c.classList.remove('erro', 'ok');
  msg.textContent = '';
  if (d.length < 14) return;
  if (!cnpjValido(d)) { c.classList.add('erro'); msg.textContent = T.erro_cnpj; return; }
  c.classList.add('ok');
  msg.textContent = T.cnpj_ok;
  if (cnpjConsultado === d) return;
  cnpjConsultado = d;
  const empresa = $('[name="empresa"]', form);
  if (empresa.value.trim()) return;
  msg.textContent = T.cnpj_busca;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`, { signal: ctrl.signal, referrerPolicy: 'no-referrer' });
    if (res.ok) {
      const j = await res.json();
      const nome = j.nome_fantasia || j.razao_social || '';
      if (nome && !empresa.value.trim()) {
        empresa.value = nome.replace(/\b(\p{L})(\p{L}*)/gu, (m, a, b) => a + b.toLowerCase());
        estado.r.empresa = empresa.value;
        if (movimento) empresa.animate([{ backgroundColor: 'rgba(70,224,140,.18)' }, { backgroundColor: 'transparent' }], { duration: 900 });
        atualizar();
      }
    }
  } catch {}
  if (so(estado.r.cnpj) === d) msg.textContent = T.cnpj_ok;
}

/* ───────── O fim: a ordem de serviço ───────── */
function gerarProtocolo() {
  const agora = new Date();
  const p2 = n => String(n).padStart(2, '0');
  const sorte = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PED-${String(agora.getFullYear()).slice(2)}${p2(agora.getMonth() + 1)}${p2(agora.getDate())}-${sorte}`;
}
function resumoTexto() {
  const r = estado.r;
  const linhas = linhasFicha().filter(l => l[2]);
  const nomes = (arr, vs) => (vs || []).map(v => L(achar(arr, v)?.t)).filter(Boolean).join(', ');
  const b = s => `*${s}*`;
  const partes = [
    `${b(`${T.resumo_cab} ${estado.protocolo}`)} (${T.resumo_modo[estado.modo]})`,
    '',
    `${lang === 'en' ? 'Name' : 'Nome'}: ${r.nome}`,
    `E-mail: ${r.email}`,
    `${lang === 'en' ? 'Phone' : 'Telefone'}: ${r.telefone}`,
    r.empresa || r.nome_negocio ? `${lang === 'en' ? 'Company' : 'Empresa'}: ${r.empresa || r.nome_negocio}` : null,
    r.cnpj ? `CNPJ: ${r.cnpj}` : null,
    `${lang === 'en' ? 'Reply by' : 'Resposta por'}: ${L(achar(PREFERENCIA, r.preferencia || 'whatsapp')?.t)}${(r.horario || []).length ? ` · ${nomes(HORARIO, r.horario)}` : ''}`,
    '',
    ...linhas.map(([k, rot, val]) => {
      if (k === 'objetivo') return `${rot}: ${nomes(OBJETIVOS, r.objetivo)}`;
      if (k === 'paginas') return `${rot}: ${nomes(paginasDe(r.tipo), r.paginas)}`;
      if (k === 'funcoes') return `${rot}: ${nomes(FUNCOES, r.funcoes)}`;
      if (k === 'cor') return `${rot}: ${val}${r.cor === 'marca' ? ` (${r.cor_1 || ''} ${r.cor_2 || ''}, ${r.cor_tema === 'escuro' ? (lang === 'en' ? 'dark' : 'escuro') : (lang === 'en' ? 'light' : 'claro')})` : ''}`;
      if (k === 'referencias') return `${rot}: ${r.refs.filter(Boolean).join(' · ')}`;
      return `${rot}: ${val}`;
    }),
    r.frase ? `${lang === 'en' ? 'In one sentence' : 'Em uma frase'}: ${r.frase}` : null,
    r.gosta ? `${lang === 'en' ? 'Likes' : 'Gosta'}: ${r.gosta}` : null,
    r.nao_quero ? `${lang === 'en' ? 'Does not want' : 'Não quer'}: ${r.nao_quero}` : null,
    r.observacoes ? `${lang === 'en' ? 'Notes' : 'Observações'}: ${r.observacoes}` : null,
    r.origem ? `${lang === 'en' ? 'Found me via' : 'Me conheceu por'}: ${L(achar(ORIGEM, r.origem)?.t)}` : null,
    estado.r.tipo ? `${T.tamanho[0].toUpperCase() + T.tamanho.slice(1)}: ${T.tamanhos[nivel(pontos(r))]}` : null
  ];
  // Linhas ausentes somem; as vazias de propósito separam os blocos.
  return partes.filter(l => l !== null).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function renderFinal(status = '') {
  const r = estado.r;
  const linhas = linhasFicha().filter(l => l[2]);
  const data = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date());
  const barras = [...estado.protocolo].map(ch => ch.charCodeAt(0) % 4 + 1).map(w => `<i style="--w:${w}"></i>`).join('');
  return `<div class="final">
    <h2 class="passo__titulo" id="passo-titulo" tabindex="-1">${T.pronto}</h2>
    <p class="final__txt">${T.pronto_txt}</p>
    <div class="os">
      <span class="os__fenda" aria-hidden="true"></span>
      <article class="os__papel" aria-label="${T.os} ${esc(estado.protocolo)}">
        <header class="os__cabeca"><span class="rotulo">${T.os}</span><span class="dado">${esc(estado.protocolo)}</span></header>
        <dl class="os__dados">
          <div><dt>${lang === 'en' ? 'client' : 'cliente'}</dt><dd>${esc(r.nome)}${r.empresa ? ` · ${esc(r.empresa)}` : ''}</dd></div>
          ${linhas.map(([k, rot, val], i) => `<div style="--k:${i + 1}"><dt>${rot}</dt><dd>${esc(val)}</dd></div>`).join('')}
          <div><dt>${T.tamanho}</dt><dd>${T.tamanhos[nivel(pontos(r))]}</dd></div>
          <div><dt>${T.status}</dt><dd class="os__status os__status--pendente" data-os-status><span class="led"></span><span>${CFG.banco ? T.enviando : T.status_pronto}</span></dd></div>
        </dl>
        <footer class="os__pe"><span class="os__barras" aria-hidden="true">${barras}</span><span class="dado">${data}</span></footer>
      </article>
    </div>
    <p class="final__status" data-status aria-live="polite">${status}</p>
    <div class="final__acoes">
      ${CFG.whats ? `<a class="botao botao--sinal" data-enviar-whats href="#" target="_blank" rel="noopener">${svg('whats')}${T.enviar_whats}</a>` : ''}
      <a class="botao botao--linha" data-enviar-email href="#">${svg('email')}${T.enviar_email}</a>
      <button type="button" class="botao botao--linha" data-copiar-resumo>${svg('copiar')}<span>${T.copiar}</span></button>
    </div>
    <p class="final__nota">${T.resposta}</p>
    <div class="final__mais">
      ${estado.modo === 'rapido' ? `<button type="button" class="link-seta" data-detalhar>${T.detalhar}${svg('seta')}</button>` : ''}
      <button type="button" class="passo__pular" data-editar>${T.editar}</button>
      <button type="button" class="passo__pular" data-recomecar>${T.recomecar}</button>
    </div>
  </div>`;
}
// O papel diz a verdade: "pronto" (âmbar) até a pessoa tocar num canal, ou até o banco confirmar.
function marcarStatus(texto, feito = true) {
  const s = $('[data-os-status]', palco);
  if (!s) return;
  $('span:last-child', s).textContent = texto;
  s.classList.toggle('os__status--pendente', !feito);
}
// Links mailto: longos não abrem em alguns clientes de e-mail; o corte é feito já codificado.
function linkEmail(texto) {
  const base = `mailto:${CFG.email}?subject=${encodeURIComponent(`${T.resumo_cab} ${estado.protocolo}`)}&body=`;
  const nota = lang === 'en' ? '\n\n(full summary on WhatsApp or pasted below)' : '\n\n(resumo completo no WhatsApp ou colado abaixo)';
  let corpo = texto.replace(/\*/g, '');
  if ((base + encodeURIComponent(corpo)).length <= 1900) return base + encodeURIComponent(corpo);
  while (corpo.length && (base + encodeURIComponent(corpo + nota)).length > 1900) corpo = corpo.slice(0, Math.floor(corpo.length * .92));
  return base + encodeURIComponent(corpo.replace(/\n[^\n]*$/, '') + nota);
}
function ligarFinal(cena) {
  const texto = resumoTexto();
  const w = $('[data-enviar-whats]', cena);
  if (w) {
    w.href = `https://wa.me/${CFG.whats}?text=${encodeURIComponent(texto)}`;
    w.addEventListener('click', () => marcarStatus(T.status_aberto('WhatsApp')));
  }
  const m = $('[data-enviar-email]', cena);
  if (m) {
    m.href = linkEmail(texto);
    m.addEventListener('click', () => marcarStatus(T.status_aberto(lang === 'en' ? 'your email app' : 'seu e-mail')));
  }
  $('[data-copiar-resumo]', cena)?.addEventListener('click', async e => {
    const b = e.currentTarget;
    try { await navigator.clipboard.writeText(texto.replace(/\*/g, '')); $('span', b).textContent = T.copiado; marcarStatus(T.status_copiado, false); setTimeout(() => { $('span', b).textContent = T.copiar; }, 1800); } catch {}
  });
  $('[data-detalhar]', cena)?.addEventListener('click', () => {
    // Leva o que já foi respondido para a análise completa e começa pela primeira pergunta nova.
    estado.modo = 'completo';
    const qs = lista();
    const i = qs.findIndex(q => !respondida(q));
    elMaquete.classList.remove('ligada');
    irPara(i < 0 ? 0 : i);
  });
  $('[data-editar]', cena)?.addEventListener('click', () => { elMaquete.classList.remove('ligada'); irPara(0); });
  $('[data-recomecar]', cena)?.addEventListener('click', () => {
    rascunho.apagar();
    estado = { modo: null, passo: 0, r: { objetivo: [], publico: [], identidade: [], paginas: [], funcoes: [], refs: ['', '', ''] }, protocolo: '' };
    blocosAntes = new Set();
    elMaquete.classList.remove('ligada');
    voltarIntro();
    desenharMaquete(); desenharFicha();
  });
}

function concluir() {
  // Protocolo novo a cada envio: revisar e mandar de novo não colide com o pedido anterior no banco.
  estado.protocolo = gerarProtocolo();
  raiz.classList.add('concluido');
  direcao = 1;
  trocar(renderFinal(CFG.banco ? T.enviando : ''));
  desenharMaquete(true);
  desenharFicha();
  rascunho.gravar();
  if (movimento) {
    elMaquete.classList.remove('ligando');
    void elMaquete.offsetWidth;
    elMaquete.classList.add('ligando');
    setTimeout(() => elMaquete.classList.remove('ligando'), 900);
  }
  if (CFG.banco) gravarNoBanco();
}

// Firestore pela API REST (sem SDK). Só roda com "gravar_no_firestore" ligado em data/pedido.json.
const tipado = v => {
  if (v == null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(tipado) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tipado(x)])) } };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  return { stringValue: String(v) };
};
async function gravarNoBanco() {
  const r = estado.r;
  const doc = {
    protocolo: estado.protocolo, modo: estado.modo, lang, criado_em: new Date().toISOString(), origem: location.pathname,
    nome: r.nome.trim(), email: r.email.trim(), telefone: r.telefone.trim(), empresa: (r.empresa || r.nome_negocio || '').trim(), cnpj: (r.cnpj || '').trim(),
    resumo: resumoTexto().replace(/\*/g, '').slice(0, 12000),
    respostas: Object.fromEntries(Object.entries(r).filter(([k]) => !['nome', 'email', 'telefone', 'empresa', 'cnpj'].includes(k)))
  };
  const status = () => $('[data-status]', palco);
  try {
    const res = await fetch(`https://firestore.googleapis.com/v1/projects/${CFG.projeto}/databases/(default)/documents/pedidos?documentId=${encodeURIComponent(estado.protocolo)}&key=${CFG.chave}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: tipado(doc).mapValue.fields })
    });
    if (status()) status().textContent = res.ok ? T.registrado : T.falhou;
    marcarStatus(res.ok ? T.status_banco : T.status_pronto, res.ok);
  } catch {
    if (status()) status().textContent = T.falhou;
    marcarStatus(T.status_pronto, false);
  }
}

/* ───────── Começo ───────── */
if (raiz && palco) {
  raiz.classList.add('pronto-js');
  trocar(renderIntro(), false);
  desenharMaquete();
  desenharFicha();
  // Atalho: /pedido/#rapido ou #completo abre direto no modo.
  const h = location.hash.replace('#', '');
  if (h === 'rapido' || h === 'completo' || h === 'quick' || h === 'complete') comecar(h === 'quick' ? 'rapido' : h === 'complete' ? 'completo' : h);
}
