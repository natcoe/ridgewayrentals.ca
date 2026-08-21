/**
 * Batch image optimizer for web use — generates multiple sizes per photo,
 * preserving subfolder structure (e.g. raw-images/projects/photo.jpg ->
 * optimized-images/card/projects/photo.webp).
 *
 * Naming convention it looks for:
 *   - Inside a "hero/" folder, or named "*-hero.jpg"  -> hero size (2400px)
 *   - Inside a "gallery/" folder                       -> gallery size (1100px)
 *   - Named "*-card.jpg"                                -> card size (700px)
 *
 * If a photo can't be read (corrupted, unsupported format), it's skipped
 * and logged — it won't crash the rest of the batch.
 *
 * Usage:
 *   node optimize-images.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const INPUT_DIR = "./raw-images";
const OUTPUT_BASE_DIR = "./optimized-images";

const SIZE_PROFILES = [
  { name: "card", width: 700, quality: 78 },
  { name: "gallery", width: 1100, quality: 78 },
  { name: "hero", width: 2400, quality: 72 },
];

const VALID_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".tiff", ".heic"];

function getAllImageFiles(dir, baseDir = dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(getAllImageFiles(fullPath, baseDir));
    } else if (VALID_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      results.push(path.relative(baseDir, fullPath));
    }
  }

  return results;
}

function detectProfile(relativeFile) {
  const lower = relativeFile.toLowerCase();

  if (lower.startsWith("hero" + path.sep) || lower.includes("-hero.")) {
    return SIZE_PROFILES.find((p) => p.name === "hero");
  }
  if (lower.includes(path.sep + "gallery" + path.sep)) {
    return SIZE_PROFILES.find((p) => p.name === "gallery");
  }
  if (lower.includes("-card.")) {
    return SIZE_PROFILES.find((p) => p.name === "card");
  }
  return SIZE_PROFILES.find((p) => p.name === "card");
}

async function optimizeImages() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Input folder "${INPUT_DIR}" doesn't exist. Create it and add your photos.`);
    return;
  }

  const relativeFiles = getAllImageFiles(INPUT_DIR);

  if (relativeFiles.length === 0) {
    console.log(`No images found in "${INPUT_DIR}" (checked subfolders too).`);
    return;
  }

  console.log(`Found ${relativeFiles.length} image(s). Detecting purpose and optimizing...\n`);

  const failedFiles = [];

  for (const relativeFile of relativeFiles) {
    try {
      const inputPath = path.join(INPUT_DIR, relativeFile);
      const parsedPath = path.parse(relativeFile);
      const originalSize = fs.statSync(inputPath).size;
      const metadata = await sharp(inputPath).metadata();
      const profile = detectProfile(relativeFile);

      console.log(`${relativeFile} (${metadata.width}x${metadata.height}, ${(originalSize / 1024).toFixed(0)}KB) -> [${profile.name}]`);

      const targetWidth = metadata.width && metadata.width < profile.width
        ? metadata.width
        : profile.width;

      if (targetWidth !== profile.width) {
        console.log(`  source (${metadata.width}px) smaller than target (${profile.width}px) — compressing at native width instead`);
      }

      const outputRelativeDir = parsedPath.dir
        .split(path.sep)
        .filter((segment) => segment.toLowerCase() !== profile.name)
        .join(path.sep);

      const outputDir = path.join(OUTPUT_BASE_DIR, profile.name, outputRelativeDir);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, `${parsedPath.name}.webp`);

      await sharp(inputPath)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: profile.quality })
        .toFile(outputPath);

      const optimizedSize = fs.statSync(outputPath).size;
      console.log(`  -> ${(optimizedSize / 1024).toFixed(0)}KB (width ${targetWidth}px)\n`);
    } catch (err) {
      console.log(`  FAILED to process ${relativeFile}: ${err.message}\n`);
      failedFiles.push(relativeFile);
    }
  }

  console.log("Done.");

  if (failedFiles.length > 0) {
    console.log(`\n${failedFiles.length} file(s) failed and were skipped:`);
    failedFiles.forEach((f) => console.log(`  - ${f}`));
    console.log("\nThese are likely corrupted or unsupported files — check them individually.");
  }
}

optimizeImages();