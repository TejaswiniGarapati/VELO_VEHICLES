const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\VELO\\frontend\\src';

const replacements = [
  [/rgba\(\s*15\s*,\s*23\s*,\s*42\s*,\s*[0-9.]+\s*\)/g, 'var(--card-bg)'],
  [/rgba\(\s*30\s*,\s*41\s*,\s*59\s*,\s*[0-9.]+\s*\)/g, 'var(--input-bg)'],
  [/rgba\(\s*51\s*,\s*65\s*,\s*85\s*,\s*[0-9.]+\s*\)/g, 'var(--input-bg-hover)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.0[58]\s*\)/g, 'var(--card-border)'],
  [/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.1\s*\)/g, 'var(--input-border)'],
  [/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.[1234]\s*\)/g, 'var(--card-shadow)'],
  [/rgba\(\s*59\s*,\s*130\s*,\s*246\s*,\s*[0-9.]+\s*\)/g, 'var(--primary-glow)'],
  [/#60a5fa/g, 'var(--primary)'],
  [/#3b82f6/g, 'var(--primary-hover)'],
  [/linear-gradient\(135deg,\s*#60a5fa\s*0%,\s*#3b82f6\s*100%\)/g, 'var(--brand-gradient)'],
  [/linear-gradient\(135deg,\s*#1e3a8a\s*0%,\s*#3b82f6\s*50%,\s*#60a5fa\s*100%\)/g, 'var(--decor-gradient)'],
  [/rgba\(\s*16\s*,\s*185\s*,\s*129\s*,\s*0\.15\s*\)/g, 'var(--success-bg)'],
  [/#34d399/g, 'var(--success)'],
  [/rgba\(\s*239\s*,\s*68\s*,\s*68\s*,\s*0\.15\s*\)/g, 'var(--error-bg)'],
  [/#f87171/g, 'var(--error)'],
  [/#ef4444/g, 'var(--error)'],
  [/rgba\(\s*245\s*,\s*158\s*,\s*11\s*,\s*0\.15\s*\)/g, 'var(--warning-bg)'],
  [/#fbbf24/g, 'var(--warning)'],
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done!');
