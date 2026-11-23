// Builds the site, serves the build, and prints it to PDF with headless Chromium.
// The page layout for the PDF comes from the @media print rules in src/styles/main.css.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { build, preview } from 'vite';
import { chromium } from 'playwright';

const OUT_FILE = path.resolve('output', 'marius-viennot-portfolio.pdf');

await build({ logLevel: 'warn' });

const server = await preview({ logLevel: 'warn', preview: { open: false } });
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await page.pdf({
    path: OUT_FILE,
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log(`PDF written to ${path.relative(process.cwd(), OUT_FILE)}`);
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
