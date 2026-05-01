const fs = require('fs');
const path = require('path');

const issues = [];

function scan(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      if (file !== 'node_modules') scan(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.tsx')) {
      const content = fs.readFileSync(p, 'utf8');
      
      // Heuristic: Find all blocks starting with function Name(...) {
      const regex = /function\s+([A-Z][a-zA-Z0-9]*)\s*\(([^)]*)\)\s*\{/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        const start = match.index;
        
        // Find the closing brace of this function (simple brace counting)
        let braceCount = 1;
        let end = -1;
        for (let i = start + match[0].length; i < content.length; i++) {
          if (content[i] === '{') braceCount++;
          else if (content[i] === '}') braceCount--;
          
          if (braceCount === 0) {
            end = i;
            break;
          }
        }
        
        if (end !== -1) {
          const body = content.substring(start, end);
          if (body.includes('t(')) {
            // Check if t is defined in this body or in params
            const params = match[2];
            const hasDefinition = 
              params.includes('t') || 
              body.includes('const { t') || 
              body.includes('const {t') || 
              body.includes('const [t') ||
              body.includes('let { t') ||
              body.includes('var { t') ||
              body.includes('const t =') ||
              body.includes('let t =');
            
            if (!hasDefinition) {
              issues.push({ file: p, component: name });
            }
          }
        }
      }
    }
  });
}

scan('src');
console.log(JSON.stringify(issues, null, 2));
