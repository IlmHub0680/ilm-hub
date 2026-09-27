const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

let files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(entry.name))) {
      files.push(full);
    }
  }
}
walk('app/api');
console.log('app/api files to check:', files.length);

let errors = [];
for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    babel.parse(code, { presets: ['next/babel'], filename: f, babelrc: false, configFile: false });
  } catch (e) {
    errors.push({ file: f, error: e.message });
  }
}
if (errors.length === 0) {
  console.log('ALL CLEAN:', files.length, 'files parsed successfully.');
} else {
  console.log('ERRORS FOUND:', errors.length);
  for (const e of errors) { console.log('---', e.file, '---'); console.log(e.error); }
}
