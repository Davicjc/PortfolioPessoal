"""python brand/google-play/gerar_play.py
Ícone (512×512) e cabeçalho (4096×2304) da página do desenvolvedor no Google Play.
JPEG/PNG 24 bits, sem transparência, até 1 MB cada."""
import json
import tempfile
import subprocess
import sys
from pathlib import Path

import fitz
from PIL import Image, ImageChops

RAIZ = Path(__file__).resolve().parents[2]
AQUI = Path(__file__).resolve().parent
SAIDA = RAIZ / 'brand' / 'google-play'
SAIDA.mkdir(exist_ok=True)
COR = {k: v['hex'] for k, v in json.loads((RAIZ / 'brand/tokens.json').read_text(encoding='utf-8'))['cor'].items()}
LIMITE = 1_000_000

# ── ícone: quadrado cheio (o Play arredonda/recorta sozinho), D como no icon-512 ──
traco, no, pacote, lado, ocupa = 9, 11, 7, 512, .46
# Centraliza pela letra branca (haste até a curva); o pacote verde sobra para fora da haste.
x0, y0, x1, y1 = 30 - traco / 2, 22 - traco / 2, 76 + traco / 2, 78 + traco / 2
esc = lado * ocupa / (y1 - y0)
tx, ty = lado / 2 - (x0 + x1) / 2 * esc, lado / 2 - (y0 + y1) / 2 * esc
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lado} {lado}" width="{lado}" height="{lado}">'
       f'<rect width="{lado}" height="{lado}" fill="{COR["tinta"]}"/>'
       f'<g transform="translate({tx:.2f} {ty:.2f}) scale({esc:.4f})">'
       f'<path d="M30 {50 - no}V22H48A28 28 0 0 1 48 78H30V{50 + no}" fill="none" stroke="{COR["papel"]}" stroke-width="{traco}" stroke-linejoin="round"/>'
       f'<circle cx="30" cy="50" r="{pacote}" fill="{COR["link"]}"/></g></svg>')
def rasteriza(tx):
    s = svg.replace(f'translate({tx0:.2f} ', f'translate({tx:.2f} ')
    pix = fitz.open(stream=s.encode(), filetype='svg')[0].get_pixmap(alpha=False)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)


def centro_de_massa(im):
    """x do centro de peso visual: cada pixel pesa o quanto se afasta do fundo."""
    fundo = Image.new('RGB', im.size, COR['tinta'])
    peso = ImageChops.difference(im, fundo).convert('L')
    hist = [sum(peso.getpixel((x, y)) for y in range(lado)) for x in range(lado)]
    return sum(x * h for x, h in enumerate(hist)) / sum(hist)


# Centro óptico: o D pesa à esquerda (haste + pacote) e a curva aberta deixa a direita leve.
# Centralizar pela caixa deixa o D parecendo puxado para a esquerda; centraliza pelo peso.
tx0 = tx
icone = rasteriza(tx)
AJUSTE = 6  # px a mais para a direita, a olho (pedido do Davi)
tx += (lado - 1) / 2 - centro_de_massa(icone) + AJUSTE
icone = rasteriza(tx)
icone.save(SAIDA / 'play-icone-512.png', optimize=True)

# ── cabeçalho: Chrome headless, 1024×576 CSS em escala 4 ──
chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
modelo = (AQUI / 'play-header.html').read_text(encoding='utf-8').replace('RAIZ/', RAIZ.as_uri() + '/')
TMP = Path(tempfile.mkdtemp())
pagina = TMP / '_play-header.html'
pagina.write_text(modelo, encoding='utf-8')
png = TMP / '_play-header.png'
subprocess.run([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=4',
                '--window-size=1024,576', '--virtual-time-budget=5000', '--allow-file-access-from-files',
                f'--user-data-dir={TMP / "chrome"}', f'--screenshot={png}', pagina.as_uri()],
               check=True, timeout=120, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
cab = Image.open(png).convert('RGB')
assert cab.size == (4096, 2304), cab.size
for q in (92, 90, 88, 86, 84, 82, 80, 78, 75):
    destino = SAIDA / 'play-cabecalho-4096x2304.jpg'
    cab.save(destino, quality=q, optimize=True, progressive=True, subsampling=0 if q >= 88 else 2)
    if destino.stat().st_size < LIMITE:
        break

for f in sorted((*SAIDA.glob("play-*.jpg"), *SAIDA.glob("play-*.png"))):
    im = Image.open(f)
    print(f, im.size, im.mode, f'{f.stat().st_size / 1024:.0f} KB', f'q={q}' if f.suffix == '.jpg' else '')
