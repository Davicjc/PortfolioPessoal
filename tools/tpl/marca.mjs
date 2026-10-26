// Manual da marca (/brand/). A mesma página vira o PDF: cada .folha é uma página A4 deitada na impressão
// (tools/manual.mjs). Cores, tipos, espaços e movimento vêm de brand/tokens.json, não são copiados à mão.
import { esc, icone, monograma, documento, pessoaLD, publicados, DOMINIO } from './comum.mjs';

export const PDF_MANUAL = '/brand/davi-castro-manual-da-marca.pdf';

const lum = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const razao = (a, b) => contraste(a, b).toFixed(1).replace('.', ',') + ':1';
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).join(' ');
// clamp(2.75rem, 1.2rem + 6.4vw, 6.75rem) → "44–108 px"
const faixa = v => {
  const px = s => Math.round(parseFloat(s) * (s.endsWith('rem') ? 16 : 1));
  const m = /^clamp\(([^,]+),[^,]+,([^)]+)\)$/.exec(v);
  return m ? `${px(m[1].trim())}–${px(m[2].trim())} px` : `${px(v)} px`;
};

const TOTAL = 12;
function folha(n, id, rotulo, titulo, corpo, classe = '') {
  const num = String(n).padStart(2, '0');
  return `<section class="folha${classe ? ' ' + classe : ''}" id="${id}" aria-labelledby="${id}-titulo">
  <div class="folha__dentro">
    <header class="folha__cabeca"><p class="rotulo"><span class="folha__num">${num}</span> ${esc(rotulo)}</p><p class="rotulo folha__pag">${num} / ${TOTAL}</p></header>
    ${titulo ? `<h2 class="folha__titulo" id="${id}-titulo">${titulo}</h2>` : ''}
    <div class="folha__corpo">${corpo}</div>
    <footer class="folha__pe rotulo"><span>Davi Castro · Manual da marca 3.0</span><span>davicjc.com/brand</span></footer>
  </div>
</section>`;
}

// D com a haste aberta e o pacote (mesmo desenho de brand/gerar-marca.py).
const D = (traco = 9, no = 11, pacote = 7, fg = 'currentColor', cor = 'var(--link)') =>
  `<path d="M30 ${50 - no}V22H48A28 28 0 0 1 48 78H30V${50 + no}" fill="none" stroke="${fg}" stroke-width="${traco}" stroke-linejoin="round"/><circle cx="30" cy="50" r="${pacote}" fill="${cor}"/>`;

function capa(tok) {
  return `<section class="folha folha--capa" id="capa" aria-labelledby="capa-titulo">
  <div class="folha__dentro">
    <header class="folha__cabeca"><p class="rotulo"><a href="/">davi castro</a> / marca</p><p class="rotulo">Versão ${esc(tok.versao)} · outubro de 2026</p></header>
    <div class="capa">
      <div class="capa__texto">
        <h1 class="capa__titulo" id="capa-titulo">Manual da marca</h1>
        <p class="capa__sub">Como a marca de Davi Castro se desenha, se escreve e se move. Vale para o site, o currículo, as imagens de compartilhamento e qualquer peça nova.</p>
        <div class="capa__acoes">
          <a class="botao botao--sinal" href="${PDF_MANUAL}" download>Baixar o PDF${icone('baixo')}</a>
          <a class="botao botao--linha" href="#arquivos">Arquivos da marca</a>
        </div>
      </div>
      <div class="capa__simbolo" aria-hidden="true">
        <!-- O barramento sai do nó e atravessa a página; na tela, o pacote chega por ele uma vez. -->
        <svg class="capa__d" viewBox="18 12 68 76">
          <path d="M37 50H600" stroke="var(--cabo-forte)" stroke-width=".5"/>
          <path d="M30 39V22H48A28 28 0 0 1 48 78H30V61" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="round"/>
          <circle class="capa__pacote" cx="30" cy="50" r="7" fill="var(--link)"/>
        </svg>
      </div>
    </div>
    <footer class="folha__pe rotulo"><span>davicjc.com/brand</span><span>01 / ${TOTAL}</span></footer>
  </div>
</section>`;
}

function ideia() {
  const etapas = ['commit', 'build', 'deploy', 'no ar'];
  return folha(2, 'ideia', 'A ideia', 'Uma marca que funciona como os sistemas que eu faço.', `
    <div class="ideia">
      <div class="ideia__texto">
        <p class="folha__lead">Eu construo sistemas de ponta a ponta e mantenho no ar. A marca diz isso sem slogan: um D cuja haste é um barramento, aberto no meio para um nó. No nó fica um pacote verde, o sinal de que o sistema respondeu.</p>
        <div class="fluxo" aria-label="Do primeiro commit ao sistema no ar">
          ${etapas.map((e, i) => `<span class="fluxo__no${i === etapas.length - 1 ? ' fluxo__no--fim' : ''}"><i></i>${e}</span>`).join('<span class="fluxo__fio" aria-hidden="true"></span>')}
        </div>
        <p class="ideia__frase">Do primeiro commit ao sistema no ar.</p>
      </div>
      <ol class="principios-marca">
        <li><span class="dado">01</span><h3>Mostrar o sistema, não a promessa</h3><p>Telas reais, números que dá para conferir, links que abrem. A marca é a moldura, não o assunto.</p></li>
        <li><span class="dado">02</span><h3>Estado honesto</h3><p>Todo projeto diz a situação em que está: no ar, em desenvolvimento, descontinuado. Projeto parado não some do portfólio.</p></li>
        <li><span class="dado">03</span><h3>Um sinal por vez</h3><p>O verde aparece uma vez em cada peça. O movimento só acontece quando leva informação de um lugar a outro.</p></li>
      </ol>
    </div>`);
}

function construcao(tok) {
  const m = tok.marca;
  const grade = Array.from({ length: 11 }, (_, i) => i * 10)
    .map(v => `<path d="M${v} 0V100M0 ${v}H100" />`).join('');
  return folha(3, 'simbolo', 'O símbolo', 'O D: um barramento, um nó e um pacote.', `
    <div class="construcao">
      <figure class="construcao__desenho">
        <svg viewBox="-8 -8 116 116" role="img" aria-label="Construção do monograma D sobre uma grade de 100 unidades">
          <g class="construcao__grade" fill="none" stroke-width=".25">${grade}</g>
          <path d="M30 0V100M0 50H100" class="construcao__eixo" fill="none" stroke-width=".35" stroke-dasharray="1.5 1.5"/>
          <circle cx="48" cy="50" r="28" class="construcao__eixo" fill="none" stroke-width=".35" stroke-dasharray="1.5 1.5"/>
          <g color="var(--papel)">${D(m.traco, m.no, m.pacote)}</g>
          <circle cx="30" cy="50" r="${m.no}" fill="none" class="construcao__cota" stroke-width=".4"/>
          <g class="construcao__cotas" font-size="3.2">
            <path d="M84.5 22V78" stroke-width=".35"/><path d="M83 22H86M83 78H86" stroke-width=".35"/>
            <text x="87.5" y="51.2">56u</text>
            <path d="M48 91V95M76 91V95M48 93H76" stroke-width=".35"/>
            <text x="56.5" y="99.5">r 28u</text>
            <path d="M25.5 8V12M34.5 8V12M25.5 10H34.5" stroke-width=".35"/>
            <text x="22" y="5.8">traço ${m.traco}u</text>
            <path d="M14 39H18M14 61H18M16 39V61" stroke-width=".35"/>
            <text x="1" y="68.5">nó ${m.no * 2}u</text>
          </g>
        </svg>
      </figure>
      <div class="construcao__notas">
        <dl class="notas">
          <div><dt class="rotulo">Grade</dt><dd>${m.grade} unidades. O D ocupa 57,5 × 65u; o arco tem raio de 28u.</dd></div>
          <div><dt class="rotulo">Traço</dt><dd>${m.traco}u, com cantos arredondados. É o mesmo peso em todas as versões.</dd></div>
          <div><dt class="rotulo">Nó</dt><dd>A haste se abre ${m.no}u acima e ${m.no}u abaixo do centro. O traço nunca atravessa o pacote.</dd></div>
          <div><dt class="rotulo">Pacote</dt><dd>Círculo de ${m.pacote}u de raio, no centro do nó, sempre na cor de destaque.</dd></div>
        </dl>
        <div class="construcao__favicon">
          <svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="22" fill="var(--tinta)" stroke="var(--cabo)" stroke-width="1.5"/><g transform="translate(15.5 16) scale(.68)">${D(m.favicon.traco, m.favicon.no, m.favicon.pacote, 'var(--papel)')}</g></svg>
          <p>Abaixo de 32 px, use o desenho do favicon: traço ${m.favicon.traco}u, nó ${m.favicon.no * 2}u e pacote de ${m.favicon.pacote}u. Ele aguenta 16 px sem embolar.</p>
        </div>
      </div>
    </div>`);
}

function versoes() {
  const pecas = [
    ['marca-davi-castro', 'Marca horizontal', 'A versão padrão. Topo do site, cabeçalhos e capas.', 'larga'],
    ['assinatura-davi-castro', 'Assinatura', 'Currículo, propostas e rodapé de documentos. Tem versão em inglês.', 'larga'],
    ['d-monograma', 'Monograma', 'Favicon, avatar e ícone de app: quando o nome já está por perto ou não cabe.', ''],
    ['wordmark-davicjc', 'davicjc', 'O nome de usuário: domínio, GitHub e redes. O pingo do j é o pacote.', ''],
    ['cjc-simbolo', 'cjc', 'Selo secundário com as iniciais de Castro Jorge da Costa. Não substitui o D.', '']
  ];
  return folha(4, 'versoes', 'Versões', 'Cinco peças, cada uma com o seu lugar.', `
    <div class="versoes">
      ${pecas.map(([arq, nome, uso, tam]) => `<figure class="versao${tam ? ' versao--' + tam : ''}">
        <div class="versao__palco"><img src="/brand/${arq}.svg" alt="${esc(nome)}" loading="lazy"></div>
        <figcaption><strong>${esc(nome)}</strong><span>${esc(uso)}</span></figcaption>
      </figure>`).join('')}
    </div>`);
}

function fundos(tok) {
  return folha(5, 'fundos', 'Fundos, respiro e tamanho', 'Em qualquer fundo, com espaço para respirar.', `
    <div class="fundos">
      <div class="fundos__versoes">
        <figure class="fundo fundo--escuro"><img src="/brand/marca-davi-castro.svg" alt="Marca sobre fundo escuro" loading="lazy"><figcaption class="rotulo">Sobre escuro · padrão</figcaption></figure>
        <figure class="fundo fundo--claro"><img src="/brand/marca-davi-castro-claro.svg" alt="Marca sobre fundo claro" loading="lazy"><figcaption class="rotulo">Sobre claro · pacote ${esc(tok.cor['link-impresso'].hex)}</figcaption></figure>
        <figure class="fundo fundo--mono"><img src="/brand/marca-davi-castro-mono.svg" alt="Marca em uma cor" loading="lazy"><figcaption class="rotulo">Uma cor · carimbo e gravação</figcaption></figure>
        <p class="fundos__nota">Sobre foto ou tela, só com uma tarja de tinta ou de branco atrás. Nunca direto na imagem.</p>
      </div>
      <div class="fundos__regras">
        <figure class="respiro">
          <svg class="respiro__desenho" viewBox="6 2.5 91.5 95" role="img" aria-label="Área de proteção do monograma: n em volta do símbolo">
            <defs><pattern id="hachura" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V2.4" stroke="var(--link)" stroke-width=".45" opacity=".55"/></pattern></defs>
            <path d="M12 6.5h79.5v87H12z M23 17.5v65h57.5v-65z" fill="url(#hachura)" fill-rule="evenodd"/>
            <rect x="12" y="6.5" width="79.5" height="87" fill="none" stroke="var(--link)" stroke-width=".4" stroke-dasharray="1.6 1.2"/>
            <rect x="23" y="17.5" width="57.5" height="65" fill="none" stroke="var(--papel-3)" stroke-width=".3" stroke-dasharray=".8 .8"/>
            <g color="var(--papel)">${D()}</g>
            <g class="respiro__cotas" font-size="4.2" text-anchor="middle"><text x="51.75" y="13.6">n</text><text x="51.75" y="90.4">n</text><text x="17.5" y="51.4">n</text><text x="86" y="51.4">n</text></g>
          </svg>
          <figcaption><strong>Respiro</strong> Em volta de qualquer versão fica livre a altura de um nó: n = ${tok.marca.no}u. Nada entra nessa área, nem texto, nem borda, nem outra marca.</figcaption>
        </figure>
        <figure class="minimo">
          <div class="minimo__amostras">
            <span><img src="/brand/favicon.svg" alt="" width="16" height="16"><em class="dado">16 px</em></span>
            <span><img src="/brand/d-monograma.svg" alt="" width="32" height="34"><em class="dado">32 px</em></span>
            <span><img src="/brand/marca-davi-castro.svg" alt="" width="120"><em class="dado">120 px</em></span>
          </div>
          <figcaption><strong>Tamanho mínimo</strong> Monograma com 16 px usando o desenho do favicon. Marca horizontal e assinatura com pelo menos 120 px de largura.</figcaption>
        </figure>
      </div>
    </div>`);
}

function proibidos() {
  const certo = '<img src="/brand/marca-davi-castro.svg" alt="" loading="lazy">';
  const casos = [
    ['distorcer', 'Não distorça nem mude a proporção.', certo],
    ['cor', 'Não troque a cor do pacote.', `<svg viewBox="18 12 68 76" class="proibido__d">${D(9, 11, 7, 'var(--papel)', '#4F7BFF')}</svg>`],
    ['fechar', 'Não feche a haste por cima do nó.', `<svg viewBox="18 12 68 76" class="proibido__d"><path d="M30 22H48A28 28 0 0 1 48 78H30Z" fill="none" stroke="var(--papel)" stroke-width="9" stroke-linejoin="round"/><circle cx="30" cy="50" r="7" fill="var(--link)"/></svg>`],
    ['brilho', 'Sem brilho, sombra, contorno ou gradiente.', certo],
    ['girar', 'Não gire nem incline.', certo],
    ['fonte', 'Não recomponha o nome em outra fonte.', `<span class="proibido__fonte"><svg viewBox="18 12 68 76" class="proibido__d">${D(9, 11, 7, 'var(--papel)')}</svg>Davi Castro</span>`]
  ];
  return folha(6, 'proibidos', 'O que não fazer', 'Seis jeitos de estragar a marca.', `
    <ul class="proibidos">
      ${casos.map(([id, texto, peca]) => `<li class="proibido proibido--${id}">
        <div class="proibido__palco" aria-hidden="true">${peca}</div>
        <p><span class="led" style="--cor-situacao: var(--alarme)"></span>${esc(texto)}</p>
      </li>`).join('')}
    </ul>`);
}

function cores(tok) {
  const c = tok.cor;
  const tela = ['tinta', 'rack', 'patch', 'cabo', 'cabo-forte', 'papel', 'papel-2', 'papel-3', 'link', 'link-fundo', 'atividade', 'alarme', 'desligado'];
  const superficies = new Set(['tinta', 'rack', 'patch', 'cabo', 'cabo-forte', 'link-fundo']);
  const impressao = ['branco', 'tinta-impressa', 'link-impresso', 'apoio-impresso'];
  const USO = {
    tinta: 'Fundo principal', rack: 'Faixas e cartões', patch: 'Cartões elevados e campos', cabo: 'Bordas e divisórias',
    'cabo-forte': 'Foco e hover', papel: 'Texto principal', 'papel-2': 'Texto de apoio', 'papel-3': 'Legendas e metadados',
    link: 'O pacote: ação principal e “no ar”', 'link-fundo': 'Fundo de selos verdes', atividade: 'Em desenvolvimento',
    alarme: 'Erro e queda', desligado: 'Descontinuado e histórico', branco: 'Fundo do papel', 'tinta-impressa': 'Texto impresso',
    'link-impresso': 'O pacote em fundo claro', 'apoio-impresso': 'Texto de apoio no claro'
  };
  const amostra = (nome, sobre) => {
    const hex = c[nome].hex;
    const prova = superficies.has(nome) ? `texto ${razao(c.papel.hex, hex)}` : nome === 'branco' ? `texto ${razao(c['tinta-impressa'].hex, hex)}` : `${razao(hex, sobre)} no ${sobre === c.tinta.hex ? 'escuro' : 'branco'}`;
    return `<li class="amostra${nome === 'link' ? ' amostra--destaque' : ''}">
      <span class="amostra__cor" style="background:${hex}"></span>
      <span class="amostra__nome">${esc(nome)}</span>
      <span class="amostra__hex dado">${hex} <span class="amostra__rgb">${rgb(hex)}</span></span>
      <span class="amostra__uso">${esc(USO[nome] || '')}</span>
      <span class="amostra__prova dado">${prova}</span>
    </li>`;
  };
  return folha(7, 'cores', 'Cores', 'Tinta, papel e um sinal verde.', `
    <div class="cores">
      <div class="proporcao" aria-label="Proporção de referência">
        <span style="flex:68;background:var(--tinta)"><em>tinta 68%</em></span>
        <span style="flex:14;background:var(--rack)"><em>rack e patch 14%</em></span>
        <span style="flex:13;background:var(--papel);color:var(--tinta)"><em>papel 13%</em></span>
        <span style="flex:3;background:var(--link)"></span>
        <span style="flex:2;background:var(--atividade)"></span>
      </div>
      <p class="cores__nota">Proporção de referência numa tela. Verde (3%) e âmbar (2%) aparecem só como estado ou ação principal.</p>
      <ul class="amostras">${tela.map(n => amostra(n, c.tinta.hex)).join('')}</ul>
      <p class="rotulo cores__sub">Impressão e fundo claro</p>
      <ul class="amostras amostras--impressao">${impressao.map(n => amostra(n, c.branco.hex)).join('')}</ul>
    </div>`);
}

function tipografia(tok) {
  const f = tok.fonte;
  const escala = Object.entries(tok.escala);
  return folha(8, 'tipografia', 'Tipografia', 'Três famílias, cada uma com uma função.', `
    <div class="tipos">
      <div class="tipo tipo--display">
        <p class="rotulo">${esc(f.display.familia)} · largura ${f.display.largura} · ${f.display.pesos.join(', ')}</p>
        <p class="tipo__amostra">Do primeiro commit ao sistema no ar.</p>
        <p class="tipo__uso">Títulos e números grandes, sempre na largura expandida e com espaçamento de −2,2%.</p>
      </div>
      <div class="tipo tipo--texto">
        <p class="rotulo">${esc(f.texto.familia)} · ${f.texto.pesos.join(', ')}</p>
        <p class="tipo__amostra">Construo sistemas internos, sites e ferramentas que ficam em produção: do banco de dados à tela do celular, com o mesmo cuidado nas duas pontas.</p>
        <p class="tipo__uso">Texto corrido e interface. Linhas de até 68 caracteres.</p>
      </div>
      <div class="tipo tipo--dados">
        <p class="rotulo">${esc(f.dados.familia)} · ${f.dados.pesos.join(', ')}</p>
        <p class="tipo__amostra">NO AR · 2026 · v3.0 · 0123456789</p>
        <p class="tipo__uso">Números, rótulos, estados e código. Nunca em parágrafos.</p>
      </div>
      <table class="escala">
        <caption class="rotulo">Escala (fluida entre 360 e 1440 px de tela)</caption>
        <tbody>${escala.map(([nome, v]) => {
          const familia = ['mega', 'h1', 'h2', 'h3'].includes(nome) ? 'display' : nome === 'rotulo' ? 'dados' : 'texto';
          const maior = parseFloat((/,\s*([\d.]+)rem\)$/.exec(v) || [0, parseFloat(v)])[1]);
          return `<tr><th scope="row" class="dado">${esc(nome)}</th><td><span class="escala__a escala__a--${familia}" style="font-size:${Math.min(maior, 2.6)}rem">${nome === 'rotulo' ? 'NO AR' : 'Aa'}</span></td><td class="dado">${faixa(v)}</td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>`);
}

function situacoes(tok, dados) {
  const pub = publicados(dados.projetos);
  const noAr = pub.filter(p => (p.situacao || 'no_ar') === 'no_ar').length;
  const quando = {
    no_ar: 'Em produção e respondendo agora.',
    desenvolvimento: 'Sendo construído. Pode mudar a qualquer momento.',
    prototipo: 'Funciona na demonstração, ainda sem uso real.',
    aguardando: 'Pronto do meu lado; depende de outra pessoa para ir ao ar.',
    abandonado: 'Saiu do ar ou parou de ser mantido.',
    historico: 'Trabalho antigo, mantido como registro.'
  };
  return folha(9, 'situacoes', 'Estados e componentes', 'Todo projeto diz em que pé está.', `
    <div class="estados">
      <ul class="estados__lista">
        ${Object.entries(tok.situacao).map(([id, s]) => `<li data-situacao="${id}"><span class="situacao"><span class="led"></span>${esc(s.pt)}</span><span class="estados__quando">${esc(quando[id] || '')}</span><span class="dado estados__cor">cor ${esc(s.cor)} · ${esc(s.en)}</span></li>`).join('')}
      </ul>
      <div class="componentes">
        <div class="componente"><p class="rotulo">Ação principal e secundária</p><div class="componente__linha"><span class="botao botao--sinal">Abrir o sistema${icone('diagonal')}</span><span class="botao botao--linha">${icone('github')}Ver o código</span></div></div>
        <div class="componente"><p class="rotulo">Selo e filtro</p><div class="componente__linha"><span class="selo">${icone('cadeado', 'ic ic--mini')}Repositório privado</span><span class="filtro filtro--ativo">Todos <span class="dado">${pub.length}</span></span><span class="filtro"><span class="led"></span>No ar <span class="dado">${noAr}</span></span></div></div>
        <div class="componente"><p class="rotulo">Janela: toda tela real entra numa moldura</p>
          <div class="janela janela--mini"><div class="janela__barra"><span class="janela__url">${icone('cadeado', 'ic ic--mini')}velocidadeteste.audicomtelecom.com.br</span></div><div class="janela__tela"><figure class="janela__quadro ativo"><img src="/fotos/projetos/speedtest/resultado-1200.webp" alt="Teste de velocidade Audicom" loading="lazy"></figure></div></div>
        </div>
      </div>
    </div>`);
}

function grade(tok) {
  const mv = tok.movimento;
  const curva = (v, nome) => {
    const [x1, y1, x2, y2] = (/\(([^)]+)\)/.exec(v)[1]).split(',').map(Number);
    return `<figure class="curva"><svg viewBox="-4 -4 108 108" aria-hidden="true"><path d="M0 100H100M0 0V100" stroke="var(--cabo-forte)" stroke-width=".8" fill="none"/><path d="M0 100C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0" fill="none" stroke="var(--link)" stroke-width="2.4"/></svg><figcaption><strong>${esc(nome)}</strong><span class="dado">${esc(v)}</span></figcaption></figure>`;
  };
  return folha(10, 'grade', 'Grade, espaço e movimento', 'Medidas que se repetem em tudo.', `
    <div class="medidas">
      <div class="medida medida--grade">
        <p class="rotulo">Grade · ${esc(tok.grade.maximo)} no máximo · ${tok.grade.colunas} colunas · calha ${esc(tok.grade.calha)}</p>
        <div class="colunas" aria-hidden="true">${'<span></span>'.repeat(tok.grade.colunas)}</div>
        <p class="medida__nota">Margem lateral de ${esc(tok.grade['margem-celular'])} no celular, 32 px no tablet e 48 px a partir de 1280 px.</p>
      </div>
      <div class="medida medida--espaco">
        <p class="rotulo">Espaço · múltiplos de 4</p>
        <ul class="espacos">${tok.espaco.map(px => `<li><span style="width:${Math.min(px, 192) / 192 * 100}%"></span><em class="dado">${px}</em></li>`).join('')}</ul>
      </div>
      <div class="medida medida--raios">
        <p class="rotulo">Raios</p>
        <ul class="raios">${Object.entries(tok.raio).map(([n, v]) => `<li><span style="border-radius:${v === '999px' ? '999px' : v}"></span><em class="dado">${esc(n)} ${esc(v)}</em></li>`).join('')}</ul>
      </div>
      <div class="medida medida--movimento">
        <p class="rotulo">Movimento</p>
        <ul class="tempos">${['rapido', 'base', 'lento', 'trajeto'].map(k => `<li><span class="dado">${esc(mv[k])}</span><em>${{ rapido: 'hover e foco', base: 'transições de estado', lento: 'entrada de seções', trajeto: 'o pacote no barramento' }[k]}</em></li>`).join('')}</ul>
        <div class="curvas">${curva(mv.saida, 'Saída')}${curva(mv['entrada-saida'], 'Entrada e saída')}</div>
        <p class="medida__nota">Movimento só transporta informação: nada pisca, nada pulsa à toa. Com redução de movimento ligada, tudo aparece direto no estado final.</p>
      </div>
    </div>`);
}

function voz() {
  const pares = [
    ['Construí o sistema e mantenho no ar.', 'Soluções inovadoras de ponta a ponta.'],
    ['Mediana de resposta medida agora, no seu navegador.', 'Performance altíssima.'],
    ['Descontinuado em 2024.', 'Em breve, novidades!'],
    ['Desenvolvedor full stack.', 'Ninja, rockstar, guru.']
  ];
  return folha(11, 'voz', 'Voz', 'Escrevo como falo com um cliente: direto e com prova.', `
    <div class="voz">
      <ul class="voz__regras">
        <li><strong>Primeira pessoa.</strong> “Construí”, “migrei”, “mantenho”. Quem fez assina.</li>
        <li><strong>Número conferível ou nenhum número.</strong> Se não dá para checar, não entra.</li>
        <li><strong>O termo técnico certo, sem jargão de venda.</strong> Firestore é Firestore; “sinergia” não existe.</li>
        <li><strong>Português e inglês com o mesmo conteúdo.</strong> Cada língua escrita para quem lê, não traduzida palavra por palavra.</li>
        <li><strong>Caixa baixa no nome da marca</strong> (davi castro, davicjc). Em texto corrido, Davi Castro.</li>
      </ul>
      <table class="voz__tabela">
        <thead><tr><th scope="col"><span class="led"></span>Escreva</th><th scope="col"><span class="led" style="--cor-situacao: var(--alarme)"></span>Evite</th></tr></thead>
        <tbody>${pares.map(([sim, nao]) => `<tr><td>${esc(sim)}</td><td>${esc(nao)}</td></tr>`).join('')}</tbody>
      </table>
    </div>`);
}

function arquivos(dados) {
  const grupos = [
    ['Marca horizontal', ['marca-davi-castro.svg', 'marca-davi-castro-claro.svg', 'marca-davi-castro-mono.svg']],
    ['Assinatura', ['assinatura-davi-castro.svg', 'assinatura-davi-castro-claro.svg', 'assinatura-davi-castro-en.svg', 'assinatura-davi-castro-en-claro.svg', 'assinatura-davi-castro-mono.svg']],
    ['Monograma e ícones', ['d-monograma.svg', 'd-monograma-claro.svg', 'd-monograma-mono.svg', 'app-icon.svg', 'icon-512.png', 'favicon.svg']],
    ['davicjc e cjc', ['wordmark-davicjc.svg', 'wordmark-davicjc-claro.svg', 'cjc-simbolo.svg', 'assinatura-cjc.svg']],
    ['Fonte da verdade', ['tokens.json']]
  ];
  const email = (dados.contatos || []).find(x => /mailto:/.test(x.url || ''));
  return folha(12, 'arquivos', 'Aplicações e arquivos', 'Onde a marca aparece, e os arquivos.', `
    <div class="aplicacoes">
      <figure class="aplicacao aplicacao--og"><img src="/assets/og/inicio.jpg" alt="Imagem de compartilhamento da página inicial" width="1200" height="630" loading="lazy"><figcaption class="rotulo">Imagem de compartilhamento · 1200 × 630, gerada para cada página</figcaption></figure>
      <figure class="aplicacao aplicacao--icones">
        <div class="icones-amostra"><img src="/brand/app-icon.svg" alt="Ícone de app" width="84" height="84" loading="lazy"><img src="/brand/favicon.svg" alt="Favicon" width="40" height="40" loading="lazy"><span class="aba">${monograma('aba__d')}davi castro</span></div>
        <figcaption class="rotulo">Ícone de app, favicon e aba do navegador</figcaption>
      </figure>
      <div class="arquivos">
        ${grupos.map(([nome, lista]) => `<div class="arquivos__grupo"><p class="rotulo">${esc(nome)}</p><ul>${lista.map(a => `<li><a href="/brand/${a}" download>${esc(a)}</a></li>`).join('')}</ul></div>`).join('')}
        <p class="arquivos__nota">Fontes com licença SIL Open Font License: <a class="link" href="https://fonts.google.com/specimen/Archivo" rel="noopener">Archivo</a>, <a class="link" href="https://fonts.google.com/specimen/IBM+Plex+Sans" rel="noopener">IBM Plex Sans</a> e <a class="link" href="https://fonts.google.com/specimen/IBM+Plex+Mono" rel="noopener">IBM Plex Mono</a>.${email ? ` Dúvidas sobre o uso: <a class="link" href="${esc(email.url)}">${esc(email.valor)}</a>.` : ''}</p>
      </div>
    </div>`);
}

export function paginaMarca(ctx, tok) {
  const { dados } = ctx;
  const corpo = [capa(tok), ideia(), construcao(tok), versoes(), fundos(tok), proibidos(), cores(tok), tipografia(tok), situacoes(tok, dados), grade(tok), voz(), arquivos(dados)].join('\n');
  const jsonld = [{
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: DOMINIO + '/brand/', name: 'Manual da marca — Davi Castro', inLanguage: 'pt-BR', about: { '@id': DOMINIO + '/#davi' },
        associatedMedia: { '@type': 'MediaObject', contentUrl: DOMINIO + PDF_MANUAL, encodingFormat: 'application/pdf', name: 'Manual da marca Davi Castro (PDF)' } },
      pessoaLD(dados, 'pt')
    ]
  }];
  const html = documento({ ...ctx, pagina: 'marca', alternativa: '/en/' }, {
    titulo: 'Manual da marca — Davi Castro',
    descricao: 'Como a marca de Davi Castro se desenha, se escreve e se move: símbolo, versões, cores, tipografia, estados, movimento, voz e arquivos para baixar.',
    caminho: '/brand/', caminhoAlt: '/brand/', ogImagem: '/assets/og/inicio.jpg', jsonld, corpo, classe: 'pagina-marca'
  });
  // Só em português: sem hreflang; e a folha de estilo própria do manual.
  return html
    .replace(/<link rel="alternate" hreflang[^>]*>\n/g, '')
    .replace('</head>', `<link rel="stylesheet" href="/assets/css/marca.css?v=${dados._build.versoes.marca || '1'}">\n</head>`);
}
