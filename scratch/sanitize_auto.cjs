const fs = require('fs');
const path = require('path');

const structuralKeys = {
  'textstart': 'text-start',
  'px4Pe10': 'px-4 pe-10',
  'end3': 'end-3',
  'end0': 'end-0',
  'bordere': 'border-e',
  'start3': 'start-3',
  'ps10Pe4': 'ps-10 pe-4',
  'bgprimary5Borders4Bordersprimary': 'bg-primary/5 border-s-4 border-s-primary',
  'ms2': '-ms-2',
  'borders': 'border-s',
  'me2': 'me-2',
  'me1': 'me-1',
  'textend': 'text-end',
  'flexrow': 'flex-row',
  'pe10': 'pe-10',
  'ps11Pe10': 'ps-11 pe-10',
  'lgorder2': 'lg:order-2',
  'lgorder1': 'lg:order-1',
  'order1': 'order-1',
  'order2': 'order-2',
  'autoKey8778': '→'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [key, value] of Object.entries(structuralKeys)) {
    const exactMatchDouble = new RegExp(`className=\\{t\\("auto\\.${key}"\\)\\}`, 'g');
    if (exactMatchDouble.test(content)) {
      content = content.replace(exactMatchDouble, `className="${value}"`);
      modified = true;
    }
    const exactMatchSingle = new RegExp(`className=\\{t\\('auto\\.${key}'\\)\\}`, 'g');
    if (exactMatchSingle.test(content)) {
      content = content.replace(exactMatchSingle, `className="${value}"`);
      modified = true;
    }

    const templateMatchDouble = new RegExp(`\\$\\{t\\("auto\\.${key}"\\)\\}`, 'g');
    if (templateMatchDouble.test(content)) {
      content = content.replace(templateMatchDouble, value);
      modified = true;
    }
    const templateMatchSingle = new RegExp(`\\$\\{t\\('auto\\.${key}'\\)\\}`, 'g');
    if (templateMatchSingle.test(content)) {
      content = content.replace(templateMatchSingle, value);
      modified = true;
    }
    
    if (key === 'autoKey8778') {
      content = content.replace(/t\("auto\.autoKey8778"\)/g, `"${value}"`);
      content = content.replace(/t\('auto\.autoKey8778'\)/g, `"${value}"`);
      modified = true;
    }
  }

  // Also replace simple cases like t("auto.bordere") used inside conditionals
  // e.g. condition ? t("auto.bordere") : "" -> condition ? "border-e" : ""
  for (const [key, value] of Object.entries(structuralKeys)) {
      const bareMatchDouble = new RegExp(`t\\("auto\\.${key}"\\)`, 'g');
      if (bareMatchDouble.test(content)) {
          content = content.replace(bareMatchDouble, `"${value}"`);
          modified = true;
      }
      const bareMatchSingle = new RegExp(`t\\('auto\\.${key}'\\)`, 'g');
      if (bareMatchSingle.test(content)) {
          content = content.replace(bareMatchSingle, `"${value}"`);
          modified = true;
      }
  }

  if (content.match(/dir=\{t\(['"]auto\.ltr['"]\)\}/)) {
      content = content.replace(/dir=\{t\(['"]auto\.ltr['"]\)\}/g, '');
      modified = true;
  }
  if (content.match(/lang=\{t\(['"]auto\.enus['"]\)\}/)) {
      content = content.replace(/lang=\{t\(['"]auto\.enus['"]\)\}/g, '');
      modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Modified:', filePath);
  }
}

function scan(dir) {
  fs.readdirSync(dir).forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      scan(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.tsx')) {
      processFile(p);
    }
  });
}

scan('src');
console.log('Done.');
