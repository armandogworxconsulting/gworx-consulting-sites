#!/usr/bin/env node
/**
 * Content-hash the CSS and JS, and point the HTML at the hashed copies.
 *
 * Why: styles.css and main.js are served from fixed URLs, so a browser that
 * cached them keeps the old copy until the cache expires — a change to the
 * CSS or JS could sit invisible for up to an hour even though the HTML had
 * already updated. Hashing the filename means a change produces a NEW URL,
 * which no one can have cached, so edits take effect immediately AND the
 * files can be cached for a year.
 *
 * Run this after editing assets/css/styles.css or assets/js/main.js:
 *
 *     node build.mjs
 *
 * The unhashed sources stay the editable originals; .assetsignore keeps them
 * out of the published site so only the hashed copies are served.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ASSETS = [
  { dir: "assets/css", base: "styles", ext: "css" },
  { dir: "assets/js", base: "main", ext: "js" },
];
const PAGES = ["index.html", "privacy.html", "terms.html", "404.html"];

const built = [];

for (const { dir, base, ext } of ASSETS) {
  const source = join(dir, `${base}.${ext}`);
  const bytes = readFileSync(source);
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
  const hashedName = `${base}.${hash}.${ext}`;

  // Drop hashed copies from previous builds so stale files are never served.
  const stale = readdirSync(dir).filter(
    (f) => f !== `${base}.${ext}` && f !== hashedName &&
           new RegExp(`^${base}\\.[0-9a-f]{10}\\.${ext}$`).test(f)
  );
  for (const f of stale) { unlinkSync(join(dir, f)); }

  writeFileSync(join(dir, hashedName), bytes);
  built.push({ source, hashedName, path: `${dir}/${hashedName}`, base, ext, dir, removed: stale });
}

for (const page of PAGES) {
  let html = readFileSync(page, "utf8");
  for (const { base, ext, dir, hashedName } of built) {
    // Matches the unhashed name and any previously hashed one.
    const ref = new RegExp(`${dir}/${base}(?:\\.[0-9a-f]{10})?\\.${ext}`, "g");
    html = html.replace(ref, `${dir}/${hashedName}`);
  }
  writeFileSync(page, html);
}

/* Fail loudly rather than publish a page still pointing at an unhashed file,
   which would be served as a 404 once .assetsignore excludes it. */
const problems = [];
for (const page of PAGES) {
  const html = readFileSync(page, "utf8");
  for (const { base, ext, dir } of built) {
    if (html.includes(`${dir}/${base}.${ext}`)) {
      problems.push(`${page} still references the unhashed ${dir}/${base}.${ext}`);
    }
  }
}
if (problems.length) {
  console.error("build failed:\n  " + problems.join("\n  "));
  process.exit(1);
}

for (const b of built) {
  console.log(`${b.source}  ->  ${b.path}${b.removed.length ? `  (removed ${b.removed.join(", ")})` : ""}`);
}
console.log(`rewrote ${PAGES.length} pages`);
