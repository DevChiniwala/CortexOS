import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('<Button') && !line.includes('onClick')) {
      // Check if the block has onClick (might be multi-line)
      let block = line;
      let j = i;
      while (!block.includes('>') && j < lines.length - 1) {
        j++;
        block += lines[j];
      }
      if (!block.includes('onClick') && !block.includes('type="submit"') && !block.includes('asChild')) {
        console.log(`${file}:${i+1}: ${line.trim()}`);
      }
    }
  });
});
