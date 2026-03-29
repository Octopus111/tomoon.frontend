const fs = require('fs');

const path = 'components/canvas.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Change the wrapper from columns to a responsive vertical timeline-like stack
html = html.replace(
  '<div class="columns-1 md:columns-2 xl:columns-3 gap-6 w-full max-w-7xl mx-auto space-y-6">',
  '<div class="flex flex-col gap-6 w-full max-w-4xl mx-auto relative">'
);

// 2. Define the exact cards and their new styles
const cards = [
  { id: 'card-premise-edge', color: 'purple' },
  { id: 'card-strategy-identity', color: 'cyan' },
  { id: 'card-market-regime', color: 'blue' },
  { id: 'card-signal-logic', color: 'sky' },
  { id: 'card-execution', color: 'orange' },
  { id: 'card-risk-money', color: 'emerald' },
  { id: 'card-data-connection', color: 'indigo' },
  { id: 'card-validation-priority', color: 'amber' }
];

cards.forEach(card => {
  // Find the exact opening div for this card by regex matching <div id="..." data-module-card="..." ... >
  const regex = new RegExp(`<div id="${card.id}"[^>]*class="([^"]*)"[^>]*>`);
  const match = html.match(regex);
  
  if (match) {
    const fullTag = match[0];
    const oldClasses = match[1];
    
    // Create new elegant classes
    const newClasses = `bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl rounded-[24px] border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500 p-5 md:p-7 relative overflow-hidden group w-full mb-2`;
    
    // Add the decorative top glowing line inside the card tag right after it opens
    const glowLine = `\\n            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${card.color}-400/60 to-transparent dark:via-${card.color}-400/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>`;
    
    let newTag = fullTag.replace(oldClasses, newClasses);
    newTag += glowLine;
    
    html = html.replace(fullTag, newTag);
  }
});

// Also, the old data-connection card had different initial color classes in its header, but our regex replaces them nicely because it replaces the container class.

// 3. Improve the Module Navigator to look more elegant
const navOld = `<div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/75 dark:bg-slate-900/45 px-3 py-3">`;
const navNew = `<div class="rounded-3xl border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl px-4 py-4 shadow-sm hover:shadow-md transition-shadow">`;
html = html.replace(navOld, navNew);

// Make the nav buttons pill-shaped and sleeker
html = html.replace(/<button type="button" onclick="document\.getElementById\('card-[^']+'\)\?\.scrollIntoView\({ behavior: 'smooth', block: 'start' }\)" class="px-2\.5 py-2 rounded-lg border[^"]+">([^<]+)<\/button>/g, (match, text) => {
  // Extract color based on logic or just replace globally with a sleek unified theme
  return match.replace(/px-2\.5 py-2 rounded-lg border border-[^\/]+\/80 dark:border-[^\/]+\/60 bg-[^\/]+\/70 dark:bg-[^\/]+\/20/g, 
    'px-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 transition-all shadow-sm flex justify-center text-center items-center');
});


// 4. Update the "Blueprint Workspace" header
const headerOld = `<div class="rounded-3xl border border-slate-200 dark:border-dark-border bg-white/90 dark:bg-slate-900/45 shadow-sm p-5">`;
const headerNew = `<div class="rounded-3xl border flex flex-col items-center text-center border-slate-200/60 dark:border-slate-700/50 bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl shadow-sm p-8 md:p-10 mb-8 relative overflow-hidden">
          <div class="absolute -top-24 -left-24 w-48 h-48 bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-sky-400/20 dark:bg-sky-900/20 rounded-full blur-3xl pointer-events-none"></div>`;
html = html.replace(headerOld, headerNew);


// Fix loop status to float perfectly in flow
html = html.replace(
  '<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">',
  '<div class="flex flex-col items-center justify-center gap-6 z-10 w-full">'
);
html = html.replace(
  '<div class="min-w-[240px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/60 px-4 py-3">',
  '<div class="min-w-[240px] md:w-[320px] rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 px-5 py-4 shadow-sm">'
);

// Optional: fix the title centering
html = html.replace(
  '<div>\n              <p class="text-[11px] uppercase tracking-[0.2em]',
  '<div class="flex flex-col items-center">\n              <p class="text-[11px] uppercase tracking-[0.2em]'
);

fs.writeFileSync(path, html);
console.log('UI Overhauled');