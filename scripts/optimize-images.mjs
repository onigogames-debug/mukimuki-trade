import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const assetDir = path.join(rootDir, "assets");
const outputDir = path.join(assetDir, "optimized");
const widths = [96, 192, 320, 480, 768, 1024];
const formats = [
  { name: "avif", options: { quality: 56, effort: 5 } },
  { name: "webp", options: { quality: 78, effort: 5 } },
];

await fs.mkdir(outputDir, { recursive: true });

const files = (await fs.readdir(assetDir))
  .filter((file) => file.endsWith(".png"))
  .filter((file) => file.startsWith("mukimuki-"));

const manifest = {};

for (const file of files) {
  const inputPath = path.join(assetDir, file);
  const baseName = path.basename(file, ".png");
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const originalWidth = metadata.width || 0;
  const originalHeight = metadata.height || 0;
  const targetWidths = [...new Set([...widths.filter((width) => width < originalWidth), originalWidth])];
  const variants = [];

  for (const width of targetWidths) {
    for (const format of formats) {
      const outputFile = `${baseName}-${width}.${format.name}`;
      const outputPath = path.join(outputDir, outputFile);
      await sharp(inputPath)
        .resize({ width, withoutEnlargement: true })
        [format.name](format.options)
        .toFile(outputPath);
      variants.push({
        format: format.name,
        width,
        src: `/assets/optimized/${outputFile}`,
      });
    }
  }

  manifest[`assets/${file}`] = {
    width: originalWidth,
    height: originalHeight,
    variants,
  };
}

await fs.writeFile(path.join(outputDir, "images.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Optimized ${files.length} PNG images into WebP/AVIF variants.`);
