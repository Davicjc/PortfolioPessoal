const fs = require('fs');

function updateLinks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldPattern = /href="\/certificados\//g;
    const newPattern = 'href="https://davicjc.com/certificados/';
    content = content.replace(oldPattern, newPattern);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✓ Atualizado: ' + filePath);
}

updateLinks('Curriculo/index.html');
updateLinks('Curriculo/en.html');

console.log('✓ Todos os links foram atualizados!');
