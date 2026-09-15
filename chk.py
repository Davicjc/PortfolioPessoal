import re
with open('seed_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'\"([a-zA-Z0-9_]+)\"\s*:\s*\"([^\"]+\.(?:jpg|png|webp|gif))\"', text)
print("Image extensions found:", len(matches))
print(matches[:10])

# Just dump the first project
idx = text.find('"projetos":')
idx2 = text.find('{', idx)
idx3 = text.find('}', idx2)
print("First project:", text[idx2:idx3+1])
