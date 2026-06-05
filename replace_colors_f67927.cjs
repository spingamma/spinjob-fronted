const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /B95221/ig, replacement: 'F67927' },
  { regex: /9A4219/ig, replacement: 'e06516' },
  { regex: /A3471D/ig, replacement: 'e06516' },
  { regex: /9A421A/ig, replacement: 'e06516' },
  { regex: /a3471c/ig, replacement: 'e06516' }
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
console.log('Color replacement to F67927 complete.');
