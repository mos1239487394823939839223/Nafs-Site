const fs = require('fs');
const path = require('path');

const matches = [];

function scan(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      const m = content.match(/t\(['"]auto\.[a-zA-Z0-9_]+['"]\)/g);
      if (m) {
        m.forEach(x => matches.push(x));
      }
    }
  });
}

scan('src');

const counts = {};
matches.forEach(m => counts[m] = (counts[m] || 0) + 1);

console.log(JSON.stringify(counts, null, 2));
