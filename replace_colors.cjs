const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /B95221/ig, replacement: '1D565F' },
  { regex: /F67927/ig, replacement: '1D565F' },
  { regex: /9A4219/ig, replacement: '123940' },
  { regex: /e06516/ig, replacement: '123940' },
  { regex: /A3471D/ig, replacement: '123940' },
  { regex: /9A421A/ig, replacement: '123940' },
  { regex: /a3471c/ig, replacement: '123940' },
  { regex: /orange-50/g, replacement: 'teal-50' },
  { regex: /orange-100/g, replacement: 'teal-100' },
  { regex: /orange-500/g, replacement: 'teal-500' },
  { regex: /orange-600/g, replacement: 'teal-600' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.match(/\.(jsx|js|css)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Color replacement complete.');
