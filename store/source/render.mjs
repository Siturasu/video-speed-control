// Renders store/screenshots/*.png from screenshot.html.
// Usage: CHROME=/path/to/chrome node render.mjs  (needs puppeteer-core installed)
import puppeteer from 'puppeteer-core';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'screenshots');
const browser = await puppeteer.launch({executablePath: process.env.CHROME, headless: true});
const page = await browser.newPage();
await page.setViewport({width: 1280, height: 800, deviceScaleFactor: 1});
for (const lang of ['en', 'ko']) {
  for (let n = 1; n <= 5; n += 1) {
    await page.goto(`file://${here}/screenshot.html?n=${n}&lang=${lang}`);
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode().catch(() => {}))));
    await page.screenshot({path: path.join(out, `${lang}-${n}.png`)});
  }
}
await browser.close();
