import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceTailwindClasses(content) {
  let newContent = content;
  
  // Tailwind values: numbers, fractions, arbitrary values, 'auto', 'full', 'px'
  const val = '(\\d+|auto|full|px|[0-9]+/[0-9]+|\\[.*?\\])';
  
  // Margins
  newContent = newContent.replace(new RegExp(`(?<=\\s|"|'|\`|:)(-?)ml-${val}(?=\\s|"|'|\`)`, 'g'), '$1ms-$2');
  newContent = newContent.replace(new RegExp(`(?<=\\s|"|'|\`|:)(-?)mr-${val}(?=\\s|"|'|\`)`, 'g'), '$1me-$2');
  
  // Paddings
  newContent = newContent.replace(new RegExp(`(?<=\\s|"|'|\`|:)(-?)pl-${val}(?=\\s|"|'|\`)`, 'g'), '$1ps-$2');
  newContent = newContent.replace(new RegExp(`(?<=\\s|"|'|\`|:)(-?)pr-${val}(?=\\s|"|'|\`)`, 'g'), '$1pe-$2');

  // Positions (left, right)
  newContent = newContent.replace(new RegExp(`(?<=\\s|"|'|\`|:)(-?)left-${val}(?=\\s|"|'|\`)`, 'g'), '$1start-$2');
  newContent = newContent.replace(new RegExp(`(?<=\\s|"|'|\`|:)(-?)right-${val}(?=\\s|"|'|\`)`, 'g'), '$1end-$2');

  // Borders width/color (border-l, border-l-2, border-l-blue-500)
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(border-l)(-\d+|)(?=\s|"|'|`)/g, 'border-s$2');
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(border-r)(-\d+|)(?=\s|"|'|`)/g, 'border-e$2');
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(border-l-)([a-zA-Z0-9-\[\]]+)(?=\s|"|'|`)/g, 'border-s-$2');
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(border-r-)([a-zA-Z0-9-\[\]]+)(?=\s|"|'|`)/g, 'border-e-$2');

  // Rounded corners
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(rounded-l|rounded-r)(-\d+|-[a-z]+|-[23]xl|)(?=\s|"|'|`)/g, (match, p1, p2) => {
    return (p1 === 'rounded-l' ? 'rounded-s' : 'rounded-e') + p2;
  });
  
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(rounded-tl|rounded-tr|rounded-bl|rounded-br)(-\d+|-[a-z]+|-[23]xl|)(?=\s|"|'|`)/g, (match, p1, p2) => {
    const map = {
        'rounded-tl': 'rounded-ss',
        'rounded-tr': 'rounded-se',
        'rounded-bl': 'rounded-es',
        'rounded-br': 'rounded-ee'
    };
    return map[p1] + p2;
  });

  // Text alignment
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(text-left)(?=\s|"|'|`)/g, 'text-start');
  newContent = newContent.replace(/(?<=\s|"|'|`|:)(text-right)(?=\s|"|'|`)/g, 'text-end');
  
  return newContent;
}

let modifiedFiles = 0;

walk('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.ts')) {
    const original = fs.readFileSync(filePath, 'utf-8');
    const modified = replaceTailwindClasses(original);
    if (original !== modified) {
      fs.writeFileSync(filePath, modified, 'utf-8');
      modifiedFiles++;
    }
  }
});

console.log(`Successfully refactored Tailwind classes in ${modifiedFiles} files.`);
