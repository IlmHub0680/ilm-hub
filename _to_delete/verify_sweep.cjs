const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOTS = ['app', 'components', 'lib'];
const EXCLUDE_DIRS = new Set(['node_modules', '.next', 'app/api']);
const EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);

let files = [];
function walk(dir) {
  const rel = path.relative('.', dir);
  if (EXCLUDE_DIRS.has(rel)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relFull = path.relative('.', full);
    if (EXCLUDE_DIRS.has(relFull)) continue;
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTS.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
}
for (const r of ROOTS) {
  if (fs.existsSync(r)) walk(r);
}

console.log('Files to check (excluding app/api, node_modules, .next):', files.length);

let errors = [];
for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    babel.parse(code, {
      presets: ['next/babel'],
      filename: f,
      babelrc: false,
      configFile: false,
    });
  } catch (e) {
    errors.push({ file: f, error: e.message });
  }
}

if (errors.length === 0) {
  console.log('ALL CLEAN:', files.length, 'files parsed successfully.');
} else {
  console.log('ERRORS FOUND:', errors.length);
  for (const e of errors) {
    console.log('---', e.file, '---');
    console.log(e.error);
  }
}
