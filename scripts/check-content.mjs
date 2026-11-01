#!/usr/bin/env node
// Yarışma kuralları için otomatik içerik denetimi.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["content", "products", "app", "components/ui"];
const TEXT_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".md", ".mdx", ".json", ".css", ".html", ".txt"]);

// Köklerin başında harf olmamalı; "eklem" için "eklemek" gibi fiilleri yakalamamak üzere ek listesi sınırlı.
const L = "[\\p{L}]";
const HEALTH = [
  ["şifa", "şifa\\p{L}*"],
  ["tedavi", "tedavi\\p{L}*"],
  ["iyileştir", "iyileştir\\p{L}*"],
  ["ağrı kes", "ağrı\\s+kes\\p{L}*"],
  ["uyku getir", "uyku\\s+getir\\p{L}*"],
  ["bağışıklık", "bağışıklık\\p{L}*"],
  ["antioksidan", "antioksidan\\p{L}*"],
  ["detoks", "detoks\\p{L}*"],
  ["zayıflat", "zayıflat\\p{L}*"],
  ["romatizma", "romatizma\\p{L}*"],
  ["eklem", "eklem(?:ler|leri|lerin|i|in|de|den)?"],
  ["hastalık", "hastalık\\p{L}*"],
  ["sağlık", "sağlık\\p{L}*"],
].map(([name, src]) => [name, new RegExp(`(?<!${L})${src}(?!${L})`, "iu")]);

const errors = [];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(extname(name))) out.push(p);
  }
  return out;
}

// a) sağlık iddiası
for (const d of SCAN_DIRS) {
  for (const file of walk(join(ROOT, d))) {
    const lines = readFileSync(file, "utf8").toLocaleLowerCase("tr").split("\n");
    lines.forEach((line, i) => {
      for (const [name, re] of HEALTH) {
        if (re.test(line)) errors.push(`Sağlık iddiası kökü "${name}": ${file.replace(ROOT + "/", "")}:${i + 1}`);
      }
    });
  }
}

// b) altbilgi ifadesi
const footer = join(ROOT, "components/ui/Footer.tsx");
if (!existsSync(footer) || !readFileSync(footer, "utf8").includes("GakCoding örnek çalışmasıdır")) {
  errors.push('components/ui/Footer.tsx içinde "GakCoding örnek çalışmasıdır" ifadesi yok.');
}

// c) public/ altında logo/amblem benzeri dosya adları
const BAD_NAME = /(logo|amblem|tescil|mahre[cç]|turkpatent|t[uü]rkpatent|bakanl[ıi]k|goturkiye|go-turkiye|co[gğ]rafi)/i;
(function scanPublic(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (BAD_NAME.test(name)) errors.push(`public/ altında yasak olabilecek dosya adı: ${p.replace(ROOT + "/", "")}`);
    if (statSync(p).isDirectory()) scanPublic(p);
  }
})(join(ROOT, "public"));

if (errors.length) {
  console.error("check:content BAŞARISIZ\n" + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log("check:content geçti.");
