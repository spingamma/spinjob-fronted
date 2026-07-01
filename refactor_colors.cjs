const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Primary
  { regex: /#1E3D51/ig, replacement: '#1A535C' },
  { regex: /#152e3d/ig, replacement: '#133d44' }, // Hover for primary
  
  // Secondary
  { regex: /#F67927/ig, replacement: '#F9842C' },
  { regex: /#e56b1f/ig, replacement: '#e0701b' }, // Hover for secondary
  
  // Neutral text
  { regex: /text-gray-500/g, replacement: 'text-[#757778]' },
  { regex: /text-gray-600/g, replacement: 'text-[#757778]' },
  { regex: /text-gray-700/g, replacement: 'text-[#757778]' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
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
console.log('Refactor complete!');
