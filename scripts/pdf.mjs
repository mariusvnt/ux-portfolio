// Builds the site, serves the build, and prints it to PDF with headless Chromium.
// The page layout for the PDF comes from the @media print rules in src/styles/main.css.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { build, preview } from 'vite';
import { chromium } from 'playwright';

const OUT_FILE = path.resolve('output', 'marius-viennot-uxdesign-portfolio.pdf');

await build({ logLevel: 'warn' });

const server = await preview({ logLevel: 'warn', preview: { open: false } });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Chromium uses the page title as the PDF's Title, which browsers show
  // on the PDF's tab: use the file name so the tab reads the same.
  await page.evaluate((title) => (document.title = title), path.basename(OUT_FILE));

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await page.pdf({
    path: OUT_FILE,
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log(`PDF written to ${path.relative(process.cwd(), OUT_FILE)}`);

  // The site's "PDF version" link points to /marius-viennot-uxdesign-portfolio.pdf:
  // public/ serves it in dev and in future builds, dist/ completes this build.
  for (const dir of ['public', 'dist']) {
    await copyFile(OUT_FILE, path.resolve(dir, path.basename(OUT_FILE)));
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
