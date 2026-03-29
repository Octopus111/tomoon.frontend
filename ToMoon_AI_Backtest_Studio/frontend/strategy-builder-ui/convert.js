const fs = require('fs');
let html = fs.readFileSync('components/canvas.html', 'utf8');

html = html.replace(
  '<div class="w-full px-2 pb-20 flex justify-center">\r\n        <div class="flex flex-col items-stretch w-full max-w-5xl mx-auto">',
  '<div class="w-full px-2 pb-20 flex justify-center">\r\n        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl mx-auto items-start">'
);
html = html.replace(
  '<div class="w-full px-2 pb-20 flex justify-center">\n        <div class="flex flex-col items-stretch w-full max-w-5xl mx-auto">',
  '<div class="w-full px-2 pb-20 flex justify-center">\n        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-7xl mx-auto items-start">'
);

// Replace connectors efficiently
html = html.replace(/<div id="connector-[^>]+><\/div>/g, '');

const subgridMatch = html.indexOf('        </div>\r\n\r\n        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">\r\n');
if (subgridMatch !== -1) {
  html = html.replace('        </div>\r\n\r\n        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">\r\n', '');
} else {
  html = html.replace('        </div>\n\n        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">\n', '');
}

fs.writeFileSync('components/canvas.html', html);
console.log('DOM modifications applied.');
