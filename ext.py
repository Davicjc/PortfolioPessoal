with open('index.backup.html', 'r', encoding='utf-8') as f:
    text = f.read()

idx_module = text.find('<script type="module">')
if idx_module != -1:
    idx_script_end = text.find('</script>', idx_module)
    if idx_script_end != -1:
        mod_str = text[idx_module:idx_script_end + 9]
        with open('module_extracted.txt', 'w', encoding='utf-8') as sf:
            sf.write(mod_str)
        print('Extracted module', len(mod_str))
