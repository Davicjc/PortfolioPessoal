with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('ALL PROJECTS', "' + (idioma === 'en' ? 'ALL PROJECTS' : 'TODOS OS PROJETOS') + '")
text = text.replace('CAREER &<br>ABOUT', "' + (idioma === 'en' ? 'CAREER &<br>ABOUT' : 'CARREIRA &<br>SOBRE') + '")
text = text.replace('VIEW ALL<br>PROJECTS &rarr;', "' + (idioma === 'en' ? 'VIEW ALL<br>PROJECTS &rarr;' : 'VER TODOS OS<br>PROJETOS &rarr;') + '")
text = text.replace("LET\\'S BUILD", "' + (idioma === 'en' ? 'LET\\'S BUILD' : 'VAMOS CONSTRUIR') + '")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
