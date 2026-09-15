import os

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
/* RADICAL AESTHETIC - ZERO PREVIOUS INFLUENCE */
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
body {{ overflow-x: hidden; width: 100vw; background: radial-gradient(circle at 50% 0%, rgba(0,255,106,0.05) 0%, transparent 60%); min-height: 100vh; }}

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
nav {{ position: fixed; top: 0; width: 100%; padding: 1.5rem 5vw; display: flex; justify-content: space-between; align-items: center; z-index: 100; mix-blend-mode: difference; }}
.nav-logo {{ font-size: 1.5rem; letter-spacing: -0.02em; cursor: pointer; }}
.nav-logo a {{ color: var(--fg); }}
.nav-center {{ display: flex; gap: 2rem; }}
.nav-center a {{ font-family: var(--font-mono); color: var(--muted); font-size: 0.9rem; transition: color 0.3s; }}
.nav-center a:hover, .nav-center a.active {{ color: var(--accent); }}
.nav-links {{ display: flex; gap: 1rem; }}
.nav-links button {{ background: none; border: none; color: var(--fg); font-family: var(--font-mono); cursor: pointer; transition: color 0.3s; font-size: 0.9rem; }}
.nav-links button:hover, .nav-links button[aria-pressed="true"] {{ color: var(--accent); }}

/* Sections */
.page-container {{ opacity: 0; transition: opacity 0.5s ease-out; }}
.page-container.visible {{ opacity: 1; }}

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

/* Browser Mockup Frame */
.browser-frame {{
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: #111;
}}
.browser-bar {{
  height: 30px; background: #050505; border-bottom: 1px solid var(--muted);
  display: flex; align-items: center; padding: 0 1rem; gap: 6px;
}}
.browser-bar i {{
  width: 10px; height: 10px; border-radius: 50%; background: #444;
}}
.browser-bar i:nth-child(1) {{ background: #ef4444; }}
.browser-bar i:nth-child(2) {{ background: #f59e0b; }}
.browser-bar i:nth-child(3) {{ background: #10b981; }}

/* Horizontal Projects Showcase */
.horizontal-scroll-wrapper {{ height: 100vh; display: flex; align-items: center; overflow: hidden; position: relative; }}
.horizontal-container {{ display: flex; height: 70vh; padding: 0 5vw; gap: 5vw; }}
.project-card {{ flex: 0 0 70vw; height: 100%; position: relative; border-radius: 12px; overflow: hidden; background: #111; display: flex; flex-direction: column; justify-content: flex-end; border: 1px solid var(--muted); }}
.project-img {{ width: 100%; height: calc(100% - 30px); object-fit: cover; opacity: 0.6; transition: opacity 0.5s, transform 0.5s; }}
.project-card:hover .project-img {{ opacity: 0.9; transform: scale(1.05); }}
.project-info {{ position: absolute; bottom: 0; left: 0; padding: 3rem; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.95), transparent); pointer-events: none; }}
.project-info * {{ pointer-events: auto; }}
.project-cat {{ font-family: var(--font-mono); color: var(--accent); margin-bottom: 1rem; }}
.project-title {{ font-size: clamp(2rem, 5vw, 4rem); margin-bottom: 0.5rem; }}
.project-desc {{ font-size: 1.1rem; max-width: 600px; }}
.project-links {{ display: flex; gap: 1rem; margin-top: 1.5rem; }}

/* Projects Grid (For /projetos page) */
.page-title {{ font-size: clamp(4rem, 10vw, 8rem); margin-bottom: 2rem; padding-top: 15vh; }}
.projects-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; margin-top: 4rem; }}
.grid-card {{ position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--muted); aspect-ratio: 16/10; display: flex; flex-direction: column; justify-content: flex-end; }}
.grid-img {{ width: 100%; height: calc(100% - 30px); object-fit: cover; opacity: 0.6; transition: all 0.4s; }}
.grid-card:hover .grid-img {{ opacity: 0.9; transform: scale(1.05); }}
.grid-info {{ position: absolute; bottom: 0; left: 0; padding: 1.5rem; width: 100%; background: linear-gradient(to top, rgba(0,0,0,1), transparent); }}
.grid-title {{ font-family: var(--font-display); font-size: 2rem; margin-bottom: 0.5rem; }}
.grid-links {{ display: flex; gap: 0.5rem; margin-top: 1rem; }}
.grid-links .btn {{ padding: 0.5rem 1rem; font-size: 0.75rem; }}

/* Experiences Timeline (For /sobre page) */
.exp-list {{ border-top: 1px solid var(--muted); margin-top: 4rem; }}
.exp-item {{ display: grid; grid-template-columns: 1fr 3fr; padding: 3rem 0; border-bottom: 1px solid var(--muted); transition: background 0.3s; }}
.exp-item:hover {{ background: rgba(255,255,255,0.02); }}
.exp-period {{ font-family: var(--font-mono); color: var(--accent); font-size: 1.2rem; }}
.exp-role {{ font-size: 2.5rem; margin-bottom: 1rem; font-family: var(--font-display); letter-spacing: 0.02em; }}
.exp-company {{ font-size: 1.2rem; color: var(--muted); margin-bottom: 1rem; }}
.exp-desc {{ font-size: 1.1rem; line-height: 1.6; max-width: 800px; }}

/* Footer Contact */
.footer {{ height: 50vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border-top: 1px solid var(--muted); }}
.footer-huge {{ font-size: clamp(3rem, 10vw, 8rem); margin-bottom: 2rem; transition: color 0.5s; cursor: crosshair; }}
.footer-huge:hover {{ color: var(--accent); }}
.footer-links {{ display: flex; gap: 3rem; font-family: var(--font-mono); font-size: 1.2rem; }}
.footer-links a {{ color: var(--fg); text-transform: uppercase; }}
.footer-links a:hover {{ color: var(--accent); }}

@media(max-width: 800px) {{
  nav {{ flex-wrap: wrap; gap: 1rem; }}
  .nav-center {{ width: 100%; justify-content: space-between; order: 3; margin-top: 1rem; }}
  .exp-item {{ grid-template-columns: 1fr; gap: 1rem; padding: 2rem 0; }}
  .project-card {{ flex: 0 0 85vw; padding: 0; }}
  .project-info {{ padding: 2rem; }}
}}
</style>
</head>
<body>

<nav>
  <div class="nav-logo t-disp"><a href="#/">DAVI CASTRO</a></div>
  <div class="nav-center" id="nav-menu">
    <a href="#/" data-route="/">HOME</a>
    <a href="#/projetos" data-route="/projetos">PROJECTS</a>
    <a href="#/sobre" data-route="/sobre">ABOUT</a>
  </div>
  <div class="nav-links">
    <button id="btn-pt" aria-pressed="true">PT</button>
    <button id="btn-en" aria-pressed="false">EN</button>
  </div>
</nav>

<main id="app" class="page-container"></main>

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

function urlDemo(p){{
  var arr = (p.links||[]).filter(function(x){{ return x && !x.repo && x.url; }});
  return arr.length ? arr[0].url : '';
}}
function urlRepo(p){{
  var arr = (p.links||[]).filter(function(x){{ return x && x.repo && x.url; }});
  return arr.length ? arr[0].url : '';
}}

function renderHome() {{
  var s = DADOS.site || {{}};
  var html = '';

  html += '<section class="section hero">';
  html += '<div class="hero-huge-1 t-disp" id="h-text-1">FULL STACK</div>';
  html += '<div class="hero-huge-2 t-disp" id="h-text-2">INFRASTRUCTURE</div>';
  html += '<div class="hero-meta">' + esc(c(s,'resumo')) + '</div>';
  html += '</section>';

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

  if (DADOS.projetos && DADOS.projetos.length) {{
    var projs = publicados(DADOS.projetos).filter(p => p.destaque);
    if(projs.length === 0) projs = publicados(DADOS.projetos).slice(0, 4);
    
    html += '<section class="section" id="projects-pin" style="padding:0; min-height:100vh;">';
    html += '<div class="horizontal-scroll-wrapper" id="h-scroll-wrap">';
    html += '<div class="horizontal-container" id="h-container">';
    projs.forEach(function(p){{
      html += '<div class="project-card">';
      
      // Beautiful browser frame + Image
      html += '<div class="browser-frame">';
      html += '<div class="browser-bar"><i></i><i></i><i></i></div>';
      if(p.imagem) {{
        html += '<img src="' + urlImagem(p.imagem) + '" class="project-img">';
      }}
      html += '</div>';

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
    
    var t_view = idioma === 'en' ? 'VIEW ALL<br>PROJECTS &rarr;' : 'VER TODOS OS<br>PROJETOS &rarr;';
    html += '<div class="project-card" style="display:flex; align-items:center; justify-content:center; background:var(--accent);">';
    html += '<a href="#/projetos" class="t-disp" style="font-size:clamp(3rem, 6vw, 5rem); color:var(--bg); text-decoration:none;">' + t_view + '</a>';
    html += '</div>';
    
    html += '</div></div></section>';
  }}

  app.innerHTML = html;
}}

function renderProjects() {{
  var html = '<section class="section" style="min-height: 100vh; justify-content: flex-start;">';
  var t_all = idioma === 'en' ? 'ALL PROJECTS' : 'TODOS OS PROJETOS';
  html += '<h1 class="page-title t-disp GSAP-fade">' + t_all + '</h1>';
  
  if (DADOS.projetos && DADOS.projetos.length) {{
    var projs = publicados(DADOS.projetos);
    html += '<div class="projects-grid">';
    projs.forEach(function(p){{
      html += '<div class="grid-card GSAP-fade">';
      
      html += '<div class="browser-frame">';
      html += '<div class="browser-bar"><i></i><i></i><i></i></div>';
      if(p.imagem) {{
        html += '<img src="' + urlImagem(p.imagem) + '" class="grid-img">';
      }}
      html += '</div>';

      html += '<div class="grid-info">';
      html += '<div class="project-cat" style="font-size:0.8rem;">' + esc(nomeCategoria(p.categoria)) + '</div>';
      html += '<div class="grid-title">' + esc(c(p,'titulo')) + '</div>';
      html += '<div class="grid-links">';
      if (urlDemo(p)) html += '<a href="'+urlSegura(urlDemo(p))+'" target="_blank" class="btn">LIVE</a>';
      if (urlRepo(p)) html += '<a href="'+urlSegura(urlRepo(p))+'" target="_blank" class="btn">CODE</a>';
      html += '</div>';
      html += '</div></div>';
    }});
    html += '</div>';
  }}
  html += '</section>';
  app.innerHTML = html;
}}

function renderAbout() {{
  var html = '<section class="section" style="min-height: 100vh; justify-content: flex-start;">';
  var t_car = idioma === 'en' ? 'CAREER &<br>ABOUT' : 'CARREIRA &<br>SOBRE';
  html += '<h1 class="page-title t-disp GSAP-fade" style="margin-bottom:0;">' + t_car + '</h1>';
  
  if (DADOS.experiencias && DADOS.experiencias.length) {{
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
    html += '</div>';
  }}
  html += '</section>';
  app.innerHTML = html;
}}

function buildFooter() {{
  var html = '<section class="footer">';
  var t_build = idioma === 'en' ? 'LET\\'S BUILD' : 'VAMOS CONSTRUIR';
  html += '<div class="footer-huge t-disp">' + t_build + '</div>';
  if (DADOS.contatos) {{
    html += '<div class="footer-links">';
    ordenar(DADOS.contatos).forEach(function(ct){{
      html += '<a href="' + urlSegura(ct.url) + '" target="_blank">' + esc(c(ct,'rotulo')) + '</a>';
    }});
    html += '</div>';
  }}
  html += '</section>';
  app.insertAdjacentHTML('beforeend', html);
}}

var lenis;
function initGSAP(hash) {{
  if (!window.gsap || !window.ScrollTrigger) return;
  
  if (!lenis) {{
    lenis = new Lenis({{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }});
    function raf(time) {{ lenis.raf(time); requestAnimationFrame(raf); }}
    requestAnimationFrame(raf);
  }}

  ScrollTrigger.getAll().forEach(t => t.kill());
  window.scrollTo(0, 0);

  if (hash === '#/' || hash === '') {{
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
  }}

  var fades = document.querySelectorAll('.GSAP-fade');
  fades.forEach(f => {{
    gsap.fromTo(f, {{ opacity: 0, y: 30 }}, {{
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      scrollTrigger: {{ trigger: f, start: "top 90%" }}
    }});
  }});
}}

function updateNav(hash) {{
  var links = document.querySelectorAll('#nav-menu a');
  var match = hash === '' ? '#/' : hash;
  links.forEach(l => {{
    if(l.getAttribute('href') === match) l.classList.add('active');
    else l.classList.remove('active');
  }});
  
  var l_home = document.querySelector('[data-route="/"]');
  var l_proj = document.querySelector('[data-route="/projetos"]');
  var l_sobre = document.querySelector('[data-route="/sobre"]');
  if (l_home) l_home.innerText = idioma === 'en' ? 'HOME' : 'IN\u00cdCIO';
  if (l_proj) l_proj.innerText = idioma === 'en' ? 'PROJECTS' : 'PROJETOS';
  if (l_sobre) l_sobre.innerText = idioma === 'en' ? 'ABOUT' : 'SOBRE';
}}

function rotear() {{
  app.classList.remove('visible');
  
  setTimeout(() => {{
    var hash = location.hash || '#/';
    if (hash === '#/') renderHome();
    else if (hash === '#/projetos') renderProjects();
    else if (hash === '#/sobre') renderAbout();
    else renderHome();
    
    buildFooter();
    initGSAP(hash);
    updateNav(hash);
    
    app.classList.add('visible');
  }}, 50);
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

window.addEventListener('hashchange', rotear);
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
