const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

const jsxFiles = [
  "components/SiteHeader.jsx",
  "components/SiteFooter.jsx",
  "components/AssistantWidget.jsx",
  "app/bookstore/page.jsx",
];

for (const f of jsxFiles) {
  try {
    babel.parse(fs.readFileSync(f, "utf8"), { presets: ["next/babel"], filename: f });
    console.log("OK  " + f);
  } catch (e) {
    console.log("FAIL " + f + ": " + e.message);
  }
}
