import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const manifestPath = path.join(rootDir, "assets", "optimized", "images.json");

function readManifest() {
  if (!fs.existsSync(manifestPath)) return {};
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function normalizeAssetPath(src) {
  return src.replace(/^\/+/, "").replace(/^\.\/+/, "");
}

export function renderPicture({
  src,
  alt = "",
  className = "",
  sizes = "(max-width: 720px) 92vw, 320px",
  loading = "lazy",
  fetchpriority = "",
  decoding = "async",
  extraImgAttributes = "",
} = {}) {
  const manifest = readManifest();
  const key = normalizeAssetPath(src);
  const image = manifest[key];
  const imgAttrs = [
    `src="/${key}"`,
    `alt="${escapeHtml(alt)}"`,
    image?.width ? `width="${image.width}"` : "",
    image?.height ? `height="${image.height}"` : "",
    loading ? `loading="${loading}"` : "",
    decoding ? `decoding="${decoding}"` : "",
    fetchpriority ? `fetchpriority="${fetchpriority}"` : "",
    className ? `class="${escapeHtml(className)}"` : "",
    "data-cwv-fallback",
    extraImgAttributes,
  ].filter(Boolean).join(" ");

  if (!image) {
    return `<img ${imgAttrs}>`;
  }

  const source = (format) => {
    const variants = image.variants
      .filter((variant) => variant.format === format)
      .map((variant) => `${variant.src} ${variant.width}w`)
      .join(", ");
    return variants
      ? `  <source type="image/${format}" srcset="${variants}" sizes="${escapeHtml(sizes)}">`
      : "";
  };

  return [
    '<picture data-cwv-picture>',
    source("avif"),
    source("webp"),
    `  <img ${imgAttrs}>`,
    "</picture>",
  ].filter(Boolean).join("\n");
}
