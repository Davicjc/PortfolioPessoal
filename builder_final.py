import os

# Load extracted parts
with open('seed_extracted.txt', 'r', encoding='utf-8') as f:
    seed_tag = f.read()
    
with open('module_extracted.txt', 'r', encoding='utf-8') as f:
    module_tag = f.read()

with open(r'C:\Users\davic\.gemini\antigravity-cli\brain\1aebbe85-9566-4425-b502-ede5fd3a3e6c\scratch\helpers.js', 'r', encoding='utf-8') as f:
    helpers = f.read()

html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>DAVI CASTRO \u2014 ENGINEER</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.29/bundled/lenis.min.js"></script>
<style>
/* 
   RADICAL AESTHETIC - ZERO PREVIOUS INFLUENCE
   Brutalist, Dark, Immersive WebGL-like feel using GSAP.
*/
:root {{
  --bg: #000000;
  --fg: #f5f5f5;
  --accent: #00ff6a; /* Cyber green */
  --muted: #444444;
  --font-display: 'Anton', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html {{ font-family: var(--font-body); background: var(--bg); color: var(--fg); font-size: 16px; overscroll-behavior: none; }}
body {{ overflow-x: hidden; width: 100vw; background: radial-gradient(circle at 50% 0%, rgba(0,255,106,0.05) 0%, transparent 60%); }}

/* Noise Texture Overlay */
body::after {{
  content: ""; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
  opacity: 0.04; pointer-events: none; z-index: 9999;
}}

/* Typography */
.t-disp {{ font-family: var(--font-display); text-transform: uppercase; line-height: 0.85; margin: 0; }}
.t-mono {{ font-family: var(--font-mono); text-transform: uppercase; letter-spacing: -0.02em; }}
.btn {{ background: transparent; color: var(--fg); border: 1px solid var(--muted); padding: 0.8rem 1.5rem; font-family: var(--font-mono); font-size: 0.85rem; cursor: pointer; border-radius: 4px; transition: all 0.3s; display: inline-block; text-align: center; }}
.btn:hover {{ background: var(--fg); color: var(--bg); }}
.btn[aria-pressed="true"] {{ background: var(--accent); color: var(--bg); border-color: var(--accent); }}
a {{ color: var(--accent); text-decoration: none; }}

/* Navigation */
nav {{ position: fixed; top: 0; width: 100%; padding: 2rem; display: flex; justify-content: space-between; align-items: flex-start; z-index: 100; mix-blend-mode: difference; }}
.nav-logo {{ font-size: 1.5rem; letter-spacing: -0.02em; }}
.nav-links {{ display: flex; gap: 2rem; }}
.nav-links button {{ background: none; border: none; color: var(--fg); font-family: var(--font-mono); cursor: pointer; transition: color 0.3s; font-size: 1rem; }}
.nav-links button:hover, .nav-links button[aria-pressed="true"] {{ color: var(--accent); }}

/* Sections */
.section {{ position: relative; width: 100vw; padding: 10vh 5vw; display: flex; flex-direction: column; justify-content: center; }}
.hero {{ min-height: 100vh; justify-content: center; overflow: hidden; }}
.hero-huge-1, .hero-huge-2 {{ font-size: clamp(4rem, 15vw, 12rem); white-space: nowrap; transform-origin: center; }}
.hero-huge-1 {{ color: var(--fg); }}
.hero-huge-2 {{ color: transparent; -webkit-text-stroke: 2px var(--muted); padding-left: 10vw; }}
.hero-meta {{ position: absolute; bottom: 5vh; left: 5vw; max-width: 400px; font-size: 1.1rem; line-height: 1.5; color: var(--muted); }}

/* Marquee (Skills) */
.marquee-container {{ width: 100%; overflow: hidden; padding: 5rem 0; border-top: 1px solid var(--muted); border-bottom: 1px solid var(--muted); }}
.marquee-inner {{ display: flex; width: max-content; }}
.marquee-item {{ font-size: clamp(3rem, 8vw, 6rem); color: var(--fg); margin-right: 4rem; -webkit-text-stroke: 1px var(--fg); color: transparent; transition: color 0.3s; }}
.marquee-item:hover {{ color: var(--accent); -webkit-text-stroke: 0; }}

/* Horizontal Projects Showcase */
.horizontal-scroll-wrapper {{ height: 100vh; display: flex; align-items: center; overflow: hidden; position: relative; }}
.horizontal-container {{ display: flex; height: 70vh; padding: 0 5vw; gap: 5vw; }}
.project-card {{ flex: 0 0 70vw; height: 100%; position: relative; border-radius: 10px; overflow: hidden; background: #111; cursor: pointer; display: flex; flex-direction: column; justify-content: flex-end; border: 1px solid var(--muted); }}
.project-img {{ position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: opacity 0.5s, transform 0.5s; }}
.project-card:hover .project-img {{ opacity: 1; transform: scale(1.05); }}
.project-info {{ position: relative; padding: 3rem; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.95), transparent); }}
.project-cat {{ font-family: var(--font-mono); color: var(--accent); margin-bottom: 1rem; }}
.project-title {{ font-size: clamp(2rem, 5vw, 4rem); margin-bottom: 0.5rem; }}
.project-desc {{ font-size: 1.1rem; max-width: 600px; }}
.project-links {{ display: flex; gap: 1rem; margin-top: 1.5rem; }}

/* Experiences Timeline */
.exp-section {{ padding: 150px 5vw; }}
.exp-title {{ font-size: clamp(3rem, 8vw, 6rem); margin-bottom: 4rem; }}
.exp-list {{ border-top: 1px solid var(--muted); }}
.exp-item {{ display: grid; grid-template-columns: 1fr 3fr; padding: 3rem 0; border-bottom: 1px solid var(--muted); transition: background 0.3s; }}
.exp-item:hover {{ background: rgba(255,255,255,0.02); }}
.exp-period {{ font-family: var(--font-mono); color: var(--accent); font-size: 1.2rem; }}
.exp-role {{ font-size: 2.5rem; margin-bottom: 1rem; font-family: var(--font-display); letter-spacing: 0.02em; }}
.exp-company {{ font-size: 1.2rem; color: var(--muted); margin-bottom: 1rem; }}
.exp-desc {{ font-size: 1.1rem; line-height: 1.6; max-width: 800px; }}

/* Footer Contact */
.footer {{ height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }}
.footer-huge {{ font-size: clamp(4rem, 12vw, 10rem); margin-bottom: 2rem; transition: color 0.5s; cursor: crosshair; }}
.footer-huge:hover {{ color: var(--accent); }}
.footer-links {{ display: flex; gap: 3rem; font-family: var(--font-mono); font-size: 1.2rem; }}
.footer-links a {{ color: var(--fg); text-transform: uppercase; }}
.footer-links a:hover {{ color: var(--accent); }}

@media(max-width: 800px) {{
  .exp-item {{ grid-template-columns: 1fr; gap: 1rem; padding: 2rem 0; }}
  .project-card {{ flex: 0 0 85vw; }}
}}
</style>
</head>
<body>

<nav>
  <div class="nav-logo t-disp">DAVI CASTRO<br><span style="font-size:0.4em; color:var(--muted); font-family:var(--font-mono);">SYSTEMS & INFRASTRUCTURE</span></div>
  <div class="nav-links">
    <button id="btn-pt" aria-pressed="true">PT</button>
    <button id="btn-en" aria-pressed="false">EN</button>
  </div>
</nav>

<main id="app"></main>

{seed_tag}
<script>
{helpers}

var DADOS = (function(){{
  try {{
    var salvo = JSON.parse(localStorage.getItem(CHAVE_CACHE) || 'null');
    if (salvo && salvo.projetos && salvo.site) return normalizar(salvo);
  }} catch (e) {{}}
  return normalizar(window.SEMENTE);
}})();

var app = document.getElementById('app');

function buildUI() {{
  var s = DADOS.site || {{}};
  var html = '';

  // HERO
  html += '<section class="section hero">';
  html += '<div class="hero-huge-1 t-disp" id="h-text-1">FULL STACK</div>';
  html += '<div class="hero-huge-2 t-disp" id="h-text-2">INFRASTRUCTURE</div>';
  html += '<div class="hero-meta">' + esc(c(s,'resumo')) + '</div>';
  html += '</section>';

  // MARQUEE (CAPACIDADES)
  if (DADOS.capacidades && DADOS.capacidades.length) {{
    html += '<div class="marquee-container"><div class="marquee-inner" id="marquee">';
    var skills = ordenar(DADOS.capacidades);
    for(var i=0; i<3; i++) {{
      skills.forEach(function(cap){{
        html += '<div class="marquee-item t-disp">' + esc(c(cap,'titulo')) + '</div>';
      }});
    }}
    html += '</div></div>';
  }}

  // HORIZONTAL PROJECTS
  if (DADOS.projetos && DADOS.projetos.length) {{
    var projs = publicados(DADOS.projetos);
    html += '<section class="section" id="projects-pin" style="padding:0; min-height:100vh;">';
    html += '<div class="horizontal-scroll-wrapper" id="h-scroll-wrap">';
    html += '<div class="horizontal-container" id="h-container">';
    projs.forEach(function(p){{
      html += '<div class="project-card">';
      if(p.imagens && p.imagens.length) {{
        html += '<img src="' + urlImagem(p.imagens[0]) + '" class="project-img">';
      }}
      html += '<div class="project-info">';
      html += '<div class="project-cat">' + esc(nomeCategoria(p.categoria)) + '</div>';
      html += '<div class="project-title t-disp">' + esc(c(p,'titulo')) + '</div>';
      html += '<div class="project-desc">' + esc(c(p,'tagline')) + '</div>';
      html += '<div class="project-links">';
      if (urlDemo(p)) html += '<a href="'+urlSegura(urlDemo(p))+'" target="_blank" class="btn">VIEW LIVE</a>';
      if (urlRepo(p)) html += '<a href="'+urlSegura(urlRepo(p))+'" target="_blank" class="btn">GITHUB</a>';
      html += '</div>';
      html += '</div></div>';
    }});
    html += '</div></div></section>';
  }}

  // EXPERIENCES
  if (DADOS.experiencias && DADOS.experiencias.length) {{
    html += '<section class="exp-section">';
    html += '<div class="exp-title t-disp">CAREER<br>PATH</div>';
    html += '<div class="exp-list">';
    ordenar(DADOS.experiencias).forEach(function(e){{
      html += '<div class="exp-item GSAP-fade">';
      html += '<div class="exp-period">' + esc(c(e,'periodo')) + '</div>';
      html += '<div>';
      html += '<div class="exp-role">' + esc(c(e,'cargo')) + '</div>';
      html += '<div class="exp-company">' + esc(e.empresa) + '</div>';
      html += '<div class="exp-desc">' + esc(c(e,'descricao')) + '</div>';
      html += '</div></div>';
    }});
    html += '</div></section>';
  }}

  // FOOTER CONTACT
  html += '<section class="footer">';
  html += '<div class="footer-huge t-disp">LET\\'S BUILD</div>';
  if (DADOS.contatos) {{
    html += '<div class="footer-links">';
    ordenar(DADOS.contatos).forEach(function(ct){{
      html += '<a href="' + urlSegura(ct.url) + '" target="_blank">' + esc(c(ct,'rotulo')) + '</a>';
    }});
    html += '</div>';
  }}
  html += '</section>';

  app.innerHTML = html;
}}

function urlDemo(p){{
  var arr = (p.links||[]).filter(function(x){{ return x && !x.repo && x.url; }});
  return arr.length ? arr[0].url : '';
}}
function urlRepo(p){{
  var arr = (p.links||[]).filter(function(x){{ return x && x.repo && x.url; }});
  return arr.length ? arr[0].url : '';
}}

var lenis;
function initGSAP() {{
  if (!window.gsap || !window.ScrollTrigger) return;
  
  if (!lenis) {{
    lenis = new Lenis({{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }});
    function raf(time) {{ lenis.raf(time); requestAnimationFrame(raf); }}
    requestAnimationFrame(raf);
  }}

  ScrollTrigger.getAll().forEach(t => t.kill());

  gsap.to("#h-text-1", {{ xPercent: -20, ease: "none", scrollTrigger: {{ trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }} }});
  gsap.to("#h-text-2", {{ xPercent: 20, ease: "none", scrollTrigger: {{ trigger: ".hero", start: "top top", end: "bottom top", scrub: 1 }} }});

  let marquee = document.getElementById('marquee');
  if (marquee) {{
    let tween = gsap.to(marquee, {{ xPercent: -50, repeat: -1, duration: 20, ease: "linear" }});
    ScrollTrigger.create({{
      trigger: ".marquee-container",
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {{ gsap.to(tween, {{ timeScale: self.direction === 1 ? 1 : -1, overwrite: true }}); }}
    }});
  }}

  var hContainer = document.getElementById('h-container');
  if (hContainer) {{
    var amountToScroll = hContainer.scrollWidth - window.innerWidth;
    if (amountToScroll > 0) {{
      gsap.to(hContainer, {{
        x: -amountToScroll,
        ease: "none",
        scrollTrigger: {{
          trigger: "#projects-pin",
          start: "top top",
          end: "+=" + amountToScroll,
          pin: true,
          animation: gsap.to(hContainer, {{ x: -amountToScroll, ease: "none" }}),
          scrub: 1
        }}
      }});
    }}
  }}

  var fades = document.querySelectorAll('.GSAP-fade');
  fades.forEach(f => {{
    gsap.fromTo(f, {{ opacity: 0, y: 50 }}, {{
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      scrollTrigger: {{ trigger: f, start: "top 85%" }}
    }});
  }});
}}

function rotear() {{
  buildUI();
  initGSAP();
}}

document.getElementById('btn-pt').addEventListener('click', function(){{
  idioma = 'pt'; localStorage.setItem('davicjc.idioma', 'pt');
  this.setAttribute('aria-pressed', 'true'); document.getElementById('btn-en').setAttribute('aria-pressed', 'false');
  rotear();
}});
document.getElementById('btn-en').addEventListener('click', function(){{
  idioma = 'en'; localStorage.setItem('davicjc.idioma', 'en');
  this.setAttribute('aria-pressed', 'true'); document.getElementById('btn-pt').setAttribute('aria-pressed', 'false');
  rotear();
}});

var salv = localStorage.getItem('davicjc.idioma');
if(salv === 'en') {{
  idioma = 'en'; document.getElementById('btn-en').setAttribute('aria-pressed', 'true'); document.getElementById('btn-pt').setAttribute('aria-pressed', 'false');
}}

rotear();

window.__hidratar = function(remoto){{
  if (!remoto) return;
  var novo = JSON.parse(JSON.stringify(DADOS));
  var semeado = !!remoto.site;
  ['site'].concat(COLECOES).forEach(function(k){{
    if (!remoto[k]) return;
    if (Array.isArray(remoto[k]) && !remoto[k].length && !semeado) return;
    novo[k] = remoto[k];
  }});
  novo = normalizar(novo);
  try {{ localStorage.setItem(CHAVE_CACHE, JSON.stringify(novo)); }} catch (e) {{}}
  if (canonico(novo) === canonico(DADOS)) return;
  DADOS = novo;
  rotear();
}};
</script>
{module_tag}
</body>
</html>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
