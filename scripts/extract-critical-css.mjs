import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const cssPath = path.join(rootDir, "styles.css");
const criticalPath = path.join(rootDir, "critical.css");

const criticalSelectorHints = [
  ":root",
  "*",
  "html",
  "body",
  "a",
  "img",
  "h1",
  "h2",
  "h3",
  "p",
  "dl",
  "dd",
  "strong",
  ".site-header",
  ".brand",
  ".nav-links",
  ".mobile-menu",
  ".mobile-nav-links",
  ".menu-icon",
  ".hero",
  ".hero-shell",
  ".hero-copy",
  ".hero-panel",
  ".hero-lead",
  ".hero-actions",
  ".hero-mascot",
  ".motion-ring",
  ".ring-two",
  ".mascot-badge",
  ".eyebrow",
  ".button",
  ".primary",
  ".secondary",
];

const criticalKeyframes = new Set(["mascotFlex", "ringPulse"]);

const selectorIsCritical = (selector = "") => {
  const normalized = selector.trim();
  if (!normalized) return false;
  return criticalSelectorHints.some((hint) => {
    if (hint === "*" || hint === "html" || hint === "body" || hint === "a" || hint === "img") {
      return normalized === hint || normalized.startsWith(`${hint}{`);
    }
    return normalized.includes(hint);
  });
};

const ruleIsCritical = (rule) => {
  if (!rule.selector) return false;
  return rule.selectors?.some(selectorIsCritical) || selectorIsCritical(rule.selector);
};

const root = postcss.parse(await fs.readFile(cssPath, "utf8"), { from: cssPath });
const criticalRoot = postcss.root();

root.each((node) => {
  if (node.type === "rule" && ruleIsCritical(node)) {
    criticalRoot.append(node.clone());
    return;
  }

  if (node.type === "atrule" && node.name === "media") {
    const media = node.clone();
    media.removeAll();
    node.each((child) => {
      if (child.type === "rule" && ruleIsCritical(child)) {
        media.append(child.clone());
      }
    });
    if (media.nodes?.length) criticalRoot.append(media);
    return;
  }

  if (node.type === "atrule" && node.name === "keyframes" && criticalKeyframes.has(node.params)) {
    criticalRoot.append(node.clone());
  }
});

const result = await postcss().process(criticalRoot, { from: undefined });
const minified = result.css
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();

await fs.writeFile(criticalPath, `${minified}\n`);

console.log(`Extracted critical CSS to ${path.relative(rootDir, criticalPath)}.`);
