#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const splashScreens = [
  { name: "apple-splash-2048-2732", width: 2048, height: 2732 },
  { name: "apple-splash-1668-2388", width: 1668, height: 2388 },
  { name: "apple-splash-1536-2048", width: 1536, height: 2048 },
  { name: "apple-splash-1290-2796", width: 1290, height: 2796 },
  { name: "apple-splash-1179-2556", width: 1179, height: 2556 },
  { name: "apple-splash-1170-2532", width: 1170, height: 2532 },
  { name: "apple-splash-1125-2436", width: 1125, height: 2436 },
  { name: "apple-splash-750-1334", width: 750, height: 1334 },
];

const splashDir = path.join(__dirname, "../public/splash");
const svgPath = path.join(__dirname, "../public/icons/icon.svg");

if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

const hasMagick = (() => {
  try {
    execSync("which magick", { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync("which convert", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
})();

if (!hasMagick) {
  console.log("ImageMagick not found. Skipping splash screen generation.");
  console.log("Install: brew install imagemagick");
  process.exit(0);
}

console.log("Generating iOS splash screens...\n");

splashScreens.forEach(({ name, width, height }) => {
  const outputPath = path.join(splashDir, `${name}.png`);
  const iconSize = Math.min(width, height) * 0.3;

  try {
    execSync(
      `convert -size ${width}x${height} xc:"#0f172a" ` +
        `-gravity center ` +
        `\\( "${svgPath}" -background none -resize ${iconSize}x${iconSize} \\) ` +
        `-composite "${outputPath}"`,
      { stdio: "inherit" }
    );
    console.log(`Generated: ${name}.png`);
  } catch (error) {
    console.error(`Failed to generate ${name}.png:`, error.message);
  }
});

console.log("\nDone!");
