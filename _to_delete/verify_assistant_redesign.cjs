const fs = require("fs");
const babel = require("@babel/core");

for (const f of ["components/AssistantWidget.jsx"]) {
  try {
    babel.parse(fs.readFileSync(f, "utf8"), { presets: ["next/babel"], filename: f });
    console.log("OK  " + f);
  } catch (e) {
    console.log("FAIL " + f + ": " + e.message);
  }
}
