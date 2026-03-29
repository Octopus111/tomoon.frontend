const fs = require('fs');
let html = fs.readFileSync('components/canvas.html', 'utf8');

// remove all connector elements
html = html.replace(/\s*<div id="connector-[a-zA-Z0-9-]+" class="[^"]*"><\/div>/g, '');

fs.writeFileSync('components/canvas.html', html);
