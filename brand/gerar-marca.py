#!/usr/bin/env python3
"""Gera a marca Davi Castro: SVGs com o texto convertido em contorno (não dependem de fonte instalada)
e os ícones PNG/ICO. Cores e geometria vêm de brand/tokens.json; as letras, das fontes do próprio site.

    python brand/gerar-marca.py

Precisa de fonttools + brotli (ler woff2), uharfbuzz (kerning), PyMuPDF e Pillow (rasterizar).
"""
import io
import json
from pathlib import Path

import fitz
import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.teePen import TeePen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / 'brand'
TOK = json.loads((SAIDA / 'tokens.json').read_text(encoding='utf-8'))
COR = {k: v['hex'] for k, v in TOK['cor'].items()}
M = TOK['marca']

# Cada peça sai em três versões: para fundo escuro (sem sufixo), para fundo claro e em uma cor só.
TEMAS = {
    '':       {'fg': COR['papel'], 'pacote': COR['link'], 'apoio': COR['papel-3'], 'fio': COR['cabo-forte']},
    '-claro': {'fg': COR['tinta-impressa'], 'pacote': COR['link-impresso'], 'apoio': COR['apoio-impresso'], 'fio': '#C9D0D8'},
    '-mono':  {'fg': COR['tinta-impressa'], 'pacote': COR['tinta-impressa'], 'apoio': COR['tinta-impressa'], 'fio': COR['tinta-impressa']},
}
CARGO = {'pt': 'desenvolvedor full stack', 'en': 'full-stack developer'}


def n(x):
    return f'{x:.2f}'.rstrip('0').rstrip('.')


class Fonte:
    """Fonte variável do site, instanciada nos eixos pedidos, com o HarfBuzz cuidando do kerning."""

    def __init__(self, arquivo, eixos=None):
        tt = TTFont(RAIZ / 'assets/fonts' / arquivo)
        tt.flavor = None
        bruto = io.BytesIO()
        tt.save(bruto)
        self.tt = TTFont(io.BytesIO(bruto.getvalue()))
        self.eixos = eixos or {}
        self.glifos = self.tt.getGlyphSet(location=self.eixos) if self.eixos else self.tt.getGlyphSet()
        self.upm = self.tt['head'].unitsPerEm
        self.ordem = self.tt.getGlyphOrder()
        self.altura_x = self.tt['OS/2'].sxHeight
        self.hb = hb.Font(hb.Face(hb.Blob(bruto.getvalue())))
        if self.eixos:
            self.hb.set_variations(self.eixos)

    def texto(self, s, x, base, tam, track=0.0, pacote_no_j=None):
        """Desenha s com a linha de base em y=base. Devolve (path d, limites, pingo do j).
        Com pacote_no_j, o pingo do j sai do contorno e volta como círculo (o pacote)."""
        buf = hb.Buffer()
        buf.add_str(s)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {'kern': True, 'liga': False})
        esc = tam / self.upm
        caneta = SVGPathPen(self.glifos, ntos=n)
        limites = BoundsPen(self.glifos)
        pingo = None
        cx = x
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            nome = self.ordem[info.codepoint]
            t = TransformPen(TeePen(caneta, limites), (esc, 0, 0, -esc, cx + pos.x_offset * esc, base))
            if pacote_no_j and nome == 'j':
                rec = DecomposingRecordingPen(self.glifos)
                self.glifos[nome].draw(rec)
                contornos, atual = [], []
                for op, args in rec.value:
                    atual.append((op, args))
                    if op in ('closePath', 'endPath'):
                        contornos.append(atual)
                        atual = []
                assert len(contornos) == 2, f'j com {len(contornos)} contornos'

                def caixa(cont):
                    b = BoundsPen(None)
                    for op, args in cont:
                        getattr(b, op)(*args)
                    return b.bounds

                # O pingo é o contorno que começa acima da altura-x.
                ponto = max(contornos, key=lambda c: caixa(c)[1])
                assert caixa(ponto)[1] > self.altura_x * .9, 'pingo do j não encontrado'
                for cont in contornos:
                    if cont is ponto:
                        continue
                    for op, args in cont:
                        getattr(t, op)(*args)
                x0, y0, x1, y1 = caixa(ponto)
                ox = cx + pos.x_offset * esc
                pingo = (ox + (x0 + x1) / 2 * esc, base - (y0 + y1) / 2 * esc, min(x1 - x0, y1 - y0) / 2 * esc)
            else:
                self.glifos[nome].draw(t)
            cx += pos.x_advance * esc + track * tam
        return caneta.getCommands(), limites.bounds, pingo


ARCHIVO = Fonte('archivo-500_700.woff2', {'wght': 600, 'wdth': TOK['fonte']['display']['largura']})
MONO = Fonte('ibm-plex-mono-400.woff2')


# ── símbolos ──────────────────────────────────────────────────────────────────

def d_monograma(t, traco=M['traco'], no=M['no'], pacote=M['pacote']):
    """D: a haste é o barramento, aberta no meio para o nó; o pacote verde ocupa o nó.
    Traço aberto (sem máscara nem anel na cor do fundo): funciona sobre qualquer fundo."""
    return (f'<path d="M30 {n(50 - no)}V22H48A28 28 0 0 1 48 78H30V{n(50 + no)}" fill="none" stroke="{t["fg"]}" '
            f'stroke-width="{n(traco)}" stroke-linejoin="round"/>'
            f'<circle cx="30" cy="50" r="{n(pacote)}" fill="{t["pacote"]}"/>')


# Limites visuais do D na grade de 100 (o pacote encosta mais à esquerda que a haste).
D_CAIXA = (30 - M['pacote'], 22 - M['traco'] / 2, 48 + 28 + M['traco'] / 2, 78 + M['traco'] / 2)


def c_arco(cx, cy, r):
    import math
    a = math.radians(42)
    return (f'M{n(cx + r * math.cos(-a))} {n(cy + r * math.sin(-a))} '
            f'A{n(r)} {n(r)} 0 1 0 {n(cx + r * math.cos(a))} {n(cy + r * math.sin(a))}')


def cjc(t, traco=7.5):
    """cjc: as iniciais de Castro Jorge da Costa. O j é o barramento; o pingo, o pacote."""
    tracos = [c_arco(24, 50, 18.5), 'M54 32.5V76A13 13 0 0 1 41 89', c_arco(87.5, 50, 18.5)]
    return (f'<g fill="none" stroke="{t["fg"]}" stroke-width="{n(traco)}" stroke-linecap="round" stroke-linejoin="round">'
            + ''.join(f'<path d="{d}"/>' for d in tracos) + '</g>'
            f'<circle cx="54" cy="17" r="5.5" fill="{t["pacote"]}"/>')


def svg(w, h, corpo, titulo, fundo=None, x0=0, y0=0):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{n(x0)} {n(y0)} {n(w)} {n(h)}" width="{n(w)}" height="{n(h)}" '
            f'role="img" aria-label="{titulo}"><title>{titulo}</title>'
            + (f'<rect x="{n(x0)}" y="{n(y0)}" width="{n(w)}" height="{n(h)}" fill="{fundo}"/>' if fundo else '')
            + corpo + '</svg>\n')


def grava(nome, conteudo):
    (SAIDA / nome).write_text(conteudo, encoding='utf-8')
    return nome


# ── peças ─────────────────────────────────────────────────────────────────────

def pecas():
    feitos = []
    for suf, t in TEMAS.items():
        # 1. Monograma D, com o respiro de um nó embutido na caixa.
        r = M['no']
        x0, y0, x1, y1 = D_CAIXA
        feitos.append(grava(f'd-monograma{suf}.svg', svg(x1 - x0 + 2 * r, y1 - y0 + 2 * r, d_monograma(t), 'D — monograma Davi Castro', x0=x0 - r, y0=y0 - r)))

        # 2. Símbolo cjc.
        feitos.append(grava(f'cjc-simbolo{suf}.svg', svg(112, 100, cjc(t), 'cjc — símbolo Davi Castro')))

        # 3. Marca horizontal: D + davi castro, como no topo do site. Nome centrado no nó pela altura-x.
        tam = 46
        base = 50 + ARCHIVO.altura_x * tam / ARCHIVO.upm / 2
        d, (bx0, by0, bx1, by1), _ = ARCHIVO.texto('davi castro', 112, base, tam, -0.02)
        corpo = d_monograma(t) + f'<path d="{d}" fill="{t["fg"]}"/>'
        feitos.append(grava(f'marca-davi-castro{suf}.svg', svg(bx1 + 4 - 18, 76, corpo, 'Davi Castro', x0=18, y0=12)))

        # 4. Assinatura: D | davi castro + cargo em mono, nas duas línguas.
        for lang, cargo in CARGO.items():
            nome_d, (_, _, nx1, _), _ = ARCHIVO.texto('davi castro', 126, 54, 44, -0.02)
            cargo_d, (_, _, cx1, _), _ = MONO.texto(cargo, 128, 82, 15, 0.02)
            corpo = (d_monograma(t) + f'<path d="M108 20V80" stroke="{t["fio"]}" stroke-width="1"/>'
                     f'<path d="{nome_d}" fill="{t["fg"]}"/><path d="{cargo_d}" fill="{t["apoio"]}"/>')
            sufixo_lang = '' if lang == 'pt' else '-en'
            feitos.append(grava(f'assinatura-davi-castro{sufixo_lang}{suf}.svg',
                                svg(max(nx1, cx1) + 6 - 14, 80, corpo, f'Davi Castro — {cargo}', x0=14, y0=10)))

        # 5. Wordmark davicjc: o pingo do j é o pacote.
        d, (bx0, by0, bx1, by1), (px, py, pr) = ARCHIVO.texto('davicjc', 0, 64, 80, -0.02, pacote_no_j=True)
        corpo = f'<path d="{d}" fill="{t["fg"]}"/><circle cx="{n(px)}" cy="{n(py)}" r="{n(pr)}" fill="{t["pacote"]}"/>'
        topo = min(by0, py - pr)
        feitos.append(grava(f'wordmark-davicjc{suf}.svg', svg(bx1 - bx0 + 8, by1 - topo + 8, corpo, 'davicjc', x0=bx0 - 4, y0=topo - 4)))

        # 6. Assinatura compacta: cjc + davi castro.
        nome_d, (_, _, nx1, _), _ = ARCHIVO.texto('davi castro', 136, 50 + ARCHIVO.altura_x * 40 / ARCHIVO.upm / 2, 40, -0.02)
        corpo = cjc(t) + f'<path d="{nome_d}" fill="{t["fg"]}"/>'
        feitos.append(grava(f'assinatura-cjc{suf}.svg', svg(nx1 + 4, 100, corpo, 'cjc — Davi Castro')))
    return feitos


def centrado(lado, ocupa, traco=M['traco'], no=M['no'], pacote=M['pacote']):
    """D centrado num quadrado de `lado`, com a altura do D ocupando a fração `ocupa`."""
    x0, y0, x1, y1 = (30 - pacote, 22 - traco / 2, 76 + traco / 2, 78 + traco / 2)
    esc = lado * ocupa / (y1 - y0)
    tx = lado / 2 - (x0 + x1) / 2 * esc
    ty = lado / 2 - (y0 + y1) / 2 * esc
    return f'<g transform="translate({n(tx)} {n(ty)}) scale({n(esc)})">{d_monograma(TEMAS[""], traco, no, pacote)}</g>'


def icones():
    tinta, cabo = COR['tinta'], COR['cabo']
    fav = M['favicon']
    feitos = []
    # Ícone de app: cantos arredondados, fio de borda, D com 46% da altura.
    app = (f'<rect width="512" height="512" rx="112" fill="{tinta}"/>'
           f'<rect x="1" y="1" width="510" height="510" rx="111" fill="none" stroke="{cabo}" stroke-width="2"/>'
           + centrado(512, .46))
    app = svg(512, 512, app, 'Davi Castro')
    feitos.append(grava('app-icon.svg', app))
    # Favicon: traço mais grosso e nó maior para sobreviver a 16 px.
    favicon = f'<rect width="100" height="100" rx="22" fill="{tinta}"/>' + centrado(100, .62, fav['traco'], fav['no'], fav['pacote'])
    favicon = svg(100, 100, favicon, 'Davi Castro')
    feitos.append(grava('favicon.svg', favicon))
    # Sangrado (sem cantos): o sistema recorta. Maskable mantém o D dentro dos 80% do centro.
    sangrado = lambda lado, ocupa: svg(lado, lado, f'<rect width="{lado}" height="{lado}" fill="{tinta}"/>' + centrado(lado, ocupa), 'Davi Castro')

    def png(svg_txt, lado, nome):
        doc = fitz.open(stream=svg_txt.encode(), filetype='svg')
        escala = lado / doc[0].rect.width
        pix = doc[0].get_pixmap(matrix=fitz.Matrix(escala, escala), alpha=True)
        pix.save(SAIDA / nome)
        feitos.append(nome)
        return SAIDA / nome

    png(app, 192, 'icon-192.png')
    png(app, 512, 'icon-512.png')
    png(sangrado(512, .40), 512, 'icon-maskable-512.png')
    png(sangrado(180, .46), 180, 'apple-touch-icon.png')
    png(favicon, 32, 'favicon-32.png')
    grande = png(favicon, 256, '_favicon-256.png')
    Image.open(grande).save(RAIZ / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
    grande.unlink()
    feitos.remove('_favicon-256.png')
    feitos.append('../favicon.ico')
    # Card de compartilhamento padrão (fallback das páginas sem card próprio): o da home.
    og = RAIZ / 'assets/og/inicio.jpg'
    if og.exists():
        Image.open(og).convert('RGB').save(SAIDA / 'og.png', optimize=True)
        feitos.append('og.png')
    return feitos


if __name__ == '__main__':
    for nome in pecas() + icones():
        print('marca ·', nome)
