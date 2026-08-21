/**
 * 11ty global data file.
 *
 * Scans images/gallery/projects/*\/ and automatically builds
 * a { projectSlug: [filenames...] } object — no manual list maintenance.
 * Drop a new photo in a project's folder, rebuild, and it appears.
 *
 * Available in any template as: {{ galleries.cefa }}, {{ galleries.dogtopia }}, etc.
 */

const fs = require("fs");
const path = require("path");

const GALLERY_ROOTS = [
  path.join(__dirname, "..", "images", "projects"),
  path.join(__dirname, "..", "images", "gallery", "projects")
];

const VALID_EXTENSIONS = [".webp", ".jpg", ".jpeg", ".png"];

module.exports = function () {
  const galleries = {};

  for (const galleryRoot of GALLERY_ROOTS) {
    if (!fs.existsSync(galleryRoot)) {
      continue;
    }

    const projectSlugs = fs
      .readdirSync(galleryRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    for (const slug of projectSlugs) {
      const galleryDir = path.join(galleryRoot, slug);

      const files = fs
        .readdirSync(galleryDir, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .filter((file) => VALID_EXTENSIONS.includes(path.extname(file).toLowerCase()))
        .sort();

      galleries[slug] = [...new Set([...(galleries[slug] || []), ...files])].sort();
    }
  }

  return galleries;
};