import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { altForImage, renderPicture } from "./image-component.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const criticalCss = await fs.readFile(path.join(rootDir, "critical.css"), "utf8");
const performanceData = JSON.parse(await fs.readFile(path.join(rootDir, "datasets", "performance-latest.json"), "utf8"));
const htmlFiles = await collectHtml(rootDir);
await fs.copyFile(path.join(rootDir, "styles.css"), path.join(rootDir, "assets", "main.css"));

function stylesheetBlock() {
  return [
    `<style data-critical-css>\n${criticalCss.trim()}\n  </style>`,
    '  <link rel="preload" as="style" href="/assets/main.css" onload="this.onload=null;this.rel=\'stylesheet\'">',
    '  <noscript><link rel="stylesheet" href="/assets/main.css"></noscript>',
  ].join("\n");
}

async function collectHtml(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtml(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function attrValue(tag, name) {
  const match = tag.match(new RegExp(`${name}=(["'])(.*?)\\1`, "i"));
  return match ? match[2] : "";
}

function sizesFor(src, tag, before) {
  if (before.endsWith('<a class="brand" href="/" aria-label="MUKIMUKI trade home">\n      ')) return "46px";
  if (src.includes("mukimuki-main") && before.includes('class="hero-mascot"')) return "(max-width: 720px) 68vw, 220px";
  if (before.includes('class="post-card"')) return "(max-width: 720px) 92vw, 280px";
  return "(max-width: 720px) 92vw, 360px";
}

function loadingFor(src, before) {
  if (before.endsWith('<a class="brand" href="/" aria-label="MUKIMUKI trade home">\n      ')) {
    return { loading: "eager", fetchpriority: "high" };
  }
  if (src.includes("mukimuki-main") && before.includes('class="hero-mascot"')) {
    return { loading: "eager", fetchpriority: "high" };
  }
  return { loading: "lazy", fetchpriority: "" };
}

function optimizeImages(content) {
  content = content.replace(/<picture\b[^>]*data-cwv-picture[^>]*>[\s\S]*?<img\b[^>]*\bsrc=(["'])(\/?assets\/mukimuki-[^"']+\.png)\1[^>]*>[\s\S]*?<\/picture>/g, (picture, _quote, src, offset) => {
    const imgTag = picture.match(/<img\b[^>]*>/i)?.[0] || "";
    const sourceTag = picture.match(/<source\b[^>]*\bsizes=(["'])(.*?)\1[^>]*>/i)?.[0] || "";
    const before = content.slice(Math.max(0, offset - 360), offset);
    const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;
    const { loading, fetchpriority } = loadingFor(normalizedSrc, before);
    return renderPicture({
      src: normalizedSrc,
      alt: altForImage(normalizedSrc, attrValue(imgTag, "alt")),
      className: attrValue(imgTag, "class"),
      sizes: attrValue(sourceTag, "sizes") || sizesFor(normalizedSrc, imgTag, before),
      loading: attrValue(imgTag, "loading") || loading,
      fetchpriority: attrValue(imgTag, "fetchpriority") || fetchpriority,
    });
  });

  return content.replace(/<img\b[^>]*\bsrc=(["'])(\/?assets\/mukimuki-[^"']+\.png)\1[^>]*>/g, (tag, _quote, src, offset) => {
    if (tag.includes("data-cwv-fallback")) return tag;
    const before = content.slice(Math.max(0, offset - 360), offset);
    if (before.lastIndexOf("<picture") > before.lastIndexOf("</picture>")) return tag;
    const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;
    const { loading, fetchpriority } = loadingFor(normalizedSrc, before);
    return renderPicture({
      src: normalizedSrc,
      alt: altForImage(normalizedSrc, attrValue(tag, "alt")),
      className: attrValue(tag, "class"),
      sizes: sizesFor(normalizedSrc, tag, before),
      loading,
      fetchpriority,
    });
  });
}

function applyHead(content) {
  if (content.includes("data-critical-css")) {
    return content.replace(/  <style data-critical-css>[\s\S]*?<\/style>\n(?:  <link rel="preload"[^>]+(?:\/styles\.css|\/assets\/main\.css)[^>]*>\n)?(?:  <link rel="stylesheet"[^>]+\/styles\.css[^>]*>\n)?  <noscript><link rel="stylesheet" href="(?:\/styles\.css|\/assets\/main\.css)"><\/noscript>/, `  ${stylesheetBlock()}`);
  }
  return content.replace(/  <link rel="stylesheet" href="\/?styles\.css">\n?/, `  ${stylesheetBlock()}\n`);
}

function inlinePerformanceData(content, filePath) {
  if (path.basename(filePath) !== "index.html" || path.dirname(filePath) !== rootDir) return content;
  const json = JSON.stringify(performanceData).replaceAll("</script", "<\\/script");
  const script = [
    '<script id="perf-data" type="application/json">',
    json,
    "</script>",
  ].join("");
  if (content.includes('id="perf-data"')) {
    return content.replace(/<!-- LCP優先:[\s\S]*?Service Workerは[\s\S]*?-->|<script id="perf-data" type="application\/json">[\s\S]*?<\/script>/g, (match) => (
      match.includes('id="perf-data"') ? script : ''
    ));
  }
  if (content.includes('id="performance-data"')) {
    return content.replace(/<script id="performance-data" type="application\/json">[\s\S]*?<\/script>/, script);
  }
  content = content.replace(/\n  <script>window\.__MUKIMUKI_PERFORMANCE__=[\s\S]*?;<\/script>/, "");
  return content.replace(/  <script src="script\.js[^"]*"[^>]*><\/script>/, `  ${script}\n  <script src="script.js?v=20260529-cwv" defer></script>`);
}

function registerServiceWorker(content) {
  if (content.includes("navigator.serviceWorker.register('/sw.js')")) return content;
  const script = [
    "  <script>",
    "    if ('serviceWorker' in navigator) {",
    "      window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));",
    "    }",
    "  </script>",
  ].join("\n");
  return content.replace("</body>", `${script}\n</body>`);
}

for (const filePath of htmlFiles) {
  let content = await fs.readFile(filePath, "utf8");
  content = applyHead(content);
  content = optimizeImages(content);
  content = inlinePerformanceData(content, filePath);
  content = registerServiceWorker(content);
  await fs.writeFile(filePath, content);
}

console.log(`Applied Core Web Vitals optimizations to ${htmlFiles.length} HTML files.`);
