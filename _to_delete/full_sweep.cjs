const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

function walk(dir, exts, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "_to_delete") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
}

let jsxFiles = [];
walk("app", [".jsx", ".tsx"], jsxFiles);
walk("components", [".jsx", ".tsx"], jsxFiles);

let plainJsFiles = [];
walk("app/api", [".js", ".ts"], plainJsFiles);
walk("lib", [".js", ".ts"], plainJsFiles);

let jsxFail = 0;
for (const f of jsxFiles) {
  try {
    babel.parse(fs.readFileSync(f, "utf8"), { presets: ["next/babel"], filename: f });
  } catch (e) {
    jsxFail++;
    console.log("FAIL(jsx) " + f + ": " + e.message);
  }
}

console.log(`jsx/tsx swept: ${jsxFiles.length}, failures: ${jsxFail}`);

const { execSync } = require("child_process");
let plainFail = 0;
for (const f of plainJsFiles) {
  try {
    execSync(`node --check "${f}"`, { stdio: "pipe" });
  } catch (e) {
    plainFail++;
    console.log("FAIL(check) " + f + ": " + e.stderr.toString().split("\n")[0]);
  }
}
console.log(`plain js/ts swept: ${plainJsFiles.length}, failures: ${plainFail}`);
