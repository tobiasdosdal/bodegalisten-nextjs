#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "../public/icons");
const svgPath = path.join(iconsDir, "icon.svg");

if (!fs.existsSync(svgPath)) {
  console.error("Source SVG not found:", svgPath);
  process.exit(1);
}

const hasSvgConvert = (() => {
  try {
    execSync("which convert", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

if (!hasSvgConvert) {
  console.log("ImageMagick not found. Creating placeholder PNGs...");
  console.log("Install ImageMagick to generate proper icons: brew install imagemagick");
  console.log("");

  sizes.forEach((size) => {
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    fs.copyFileSync(svgPath, pngPath.replace(".png", ".svg"));
    console.log(`Created placeholder: icon-${size}x${size}.svg`);
  });

  console.log("\nNote: Modern browsers support SVG icons in manifest.");
  console.log("For full compatibility, run this script after installing ImageMagick.");
  process.exit(0);
}

console.log("Generating PWA icons from SVG...\n");

sizes.forEach((size) => {
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  execSync(
    `convert -background none -resize ${size}x${size} "${svgPath}" "${outputPath}"`,
    { stdio: "inherit" }
  );
  console.log(`Generated: icon-${size}x${size}.png`);
});

const maskablePath = path.join(iconsDir, "maskable-icon-512x512.png");
execSync(
  `convert -background "#0f172a" -gravity center -resize 400x400 -extent 512x512 "${svgPath}" "${maskablePath}"`,
  { stdio: "inherit" }
);
console.log("Generated: maskable-icon-512x512.png");

console.log("\nDone! All PWA icons generated.");
