# UX Portfolio — Marius Viennot

One-page portfolio: a cover, then three projects (em·ji·ve, the Guisarde Drive add-on, ACE).
The same page is published as a static website and printed to PDF.

## Commands

| Command           | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `npm install`     | Install dependencies                                                 |
| `npm run dev`     | Start the dev server with live reload                                |
| `npm run build`   | Build the static site into `dist/`                                   |
| `npm run preview` | Serve the built site locally                                         |
| `npm run pdf`     | Build the site and print it to `output/marius-viennot-portfolio.pdf` |

First time only, install the browser used to print the PDF:

```sh
npx playwright install chromium
```

## Structure

```
index.html              The whole portfolio (cover + 3 project sections)
src/main.js             Entry script
src/styles/main.css     Styles; the PDF layout lives in the @page / @media print rules
public/                 Static files copied as-is (images, video, fonts)
scripts/pdf.mjs         Builds, serves and prints the site with headless Chromium
```

Text marked with the `todo` class is placeholder content and is outlined in orange on screen and in the PDF.

To check the print layout while developing, open the dev server in Chrome and use
DevTools → Rendering → Emulate CSS media type → `print`, or simply run `npm run pdf`.
