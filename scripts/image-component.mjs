import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const manifestPath = path.join(rootDir, "assets", "optimized", "images.json");
const imageAltText = {
  "assets/mukimuki-main.png": "MUKIMUKIキャラクター - 100万円トレード記録ブログのロゴ",
  "assets/mukimuki-performance.png": "実績グラフアイコン",
  "assets/mukimuki-research.png": "銘柄検討アイコン",
  "assets/mukimuki-editor.png": "投資ロジックアイコン",
  "assets/mukimuki-diary.png": "雑談・日記アイコン",
};
const genericAltText = new Set(["", "MUKIMUKI", "メインキャラクターMUKIMUKI", "画像", "アイコン"]);

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

export function altForImage(src, alt = "") {
  const key = normalizeAssetPath(src);
  const currentAlt = String(alt || "").trim();
  if (imageAltText[key] && genericAltText.has(currentAlt)) return imageAltText[key];
  return currentAlt || imageAltText[key] || "";
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
  const normalizedAlt = altForImage(key, alt);
  const imgAttrs = [
    `src="/${key}"`,
    `alt="${escapeHtml(normalizedAlt)}"`,
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
      .filter((variant) => [480, 800, 1200].includes(variant.width))
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
