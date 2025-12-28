#!/usr/bin/env node
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "../public/icons");

async function generateIcons() {
  console.log("Generating PWA icons with beer emoji...\n");

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Generate regular icons
  for (const size of sizes) {
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; }
            body {
              width: ${size}px;
              height: ${size}px;
              background: #0a5c36;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: ${Math.round(size * 0.19)}px;
              overflow: hidden;
            }
            .emoji {
              font-size: ${Math.round(size * 0.65)}px;
              line-height: 1;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="emoji">🍺</div>
        </body>
      </html>
    `);

    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    await page.screenshot({ path: outputPath, omitBackground: true });
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Generate maskable icon (512x512 with more padding)
  await page.setViewport({ width: 512, height: 512, deviceScaleFactor: 1 });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { margin: 0; padding: 0; }
          body {
            width: 512px;
            height: 512px;
            background: #0a5c36;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .emoji {
            font-size: 280px;
            line-height: 1;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="emoji">🍺</div>
      </body>
    </html>
  `);

  const maskablePath = path.join(iconsDir, "maskable-icon-512x512.png");
  await page.screenshot({ path: maskablePath });
  console.log("Generated: maskable-icon-512x512.png");

  await browser.close();
  console.log("\nDone! All PWA icons generated with beer emoji.");
}

generateIcons().catch(console.error);
