# UX Portfolio — Marius Viennot

One-page portfolio: a cover, then three projects (em·ji·ve, the Guisarde Drive add-on, ACE).
The same page is published as a static website and printed to PDF.

## Commands

| Command           | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `npm install`     | Install dependencies                                                 |
| `npm run dev`     | Start the dev server on http://localhost:5300 (live reload, opens the browser) |
| `npm run build`   | Build the static site into `dist/`                                   |
| `npm run preview` | Serve the built site locally                                         |
| `npm run pdf`     | Build the site and print it to `output/marius-viennot-portfolio.pdf` |

First time only, install the browser used to print the PDF:

```sh
npx playwright install chromium
```

## Structure

```text
index.html              The whole portfolio (cover + 3 project sections)
src/main.js             Entry script
src/styles/tokens.css   Every design decision: colours, type roles, spacing, layout, print overrides
src/styles/fonts.css    @font-face for Syne Bold and DINish (same fonts as the CV)
src/styles/main.css     Components; may only reference tokens and type role classes
src/assets/fonts/       Self-hosted woff2 fonts
public/                 Static files copied as-is (images, video)
scripts/pdf.mjs         Builds, serves and prints the site with headless Chromium
```

## Design rule

No design value is written locally. Colours (`--white`, `--off-white`, `--off-black`, `--black`),
type (`--main-title`, `--secondary-title`, `--text-body`), spacing and layout all come from
`src/styles/tokens.css`. To change the design, change a token; to need a new value, add a token first.

## Fonts

[Syne](https://gitlab.com/bonjour-monde/fonderie/syne-typeface) and [DINish](https://github.com/playbeing/dinish)
are licensed under the SIL Open Font License 1.1. Their license files sit next to the fonts in
`src/assets/fonts/` (`OFL-Syne.txt`, `OFL-DINish.txt`). `syne-bold.woff2` is a static Bold instance
of the Syne variable font; the DINish files are converted to woff2 unchanged.

## Website-only elements

Elements with the `screen-only` class (the fixed site header with the "MV" monogram, the
"PDF version" link and the blurred fade beneath it) appear on the website only and are hidden in the PDF.
`npm run pdf` copies the PDF into `public/` and `dist/` so the "PDF version" link works.

## Placeholders

Text marked with the `todo` class is placeholder content and is outlined in orange on screen and in the PDF.

To check the print layout while developing, open the dev server in Chrome and use
DevTools → Rendering → Emulate CSS media type → `print`, or simply run `npm run pdf`.
