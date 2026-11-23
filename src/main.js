import './styles/fonts.css';
import './styles/tokens.css';
import './styles/main.css';

// Every link gets an arrow after its text:
// - a link that leaves the portfolio (another site, an email address,
//   the PDF) gets a diagonal arrow pointing to the top-right corner;
// - a link to somewhere else on the portfolio gets a horizontal arrow
//   pointing right.
// Both share the same box, stroke and proportions (the head's arms are
// about 0.57 times the shaft). Add data-no-arrow to a link to opt out.
const svg = (path) =>
  `<svg class="arrow" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="${path}" /></svg>`;
const ARROW_OUT = svg('M1 11 11 1M3 1h8v8');
const ARROW_IN = svg('M0 6h11M6.5 1.5 11 6l-4.5 4.5');
const here = location.origin + location.pathname;

for (const link of document.querySelectorAll('a[href]:not([data-no-arrow])')) {
  const target = new URL(link.href);
  const leaves = target.origin + target.pathname !== here;
  link.insertAdjacentHTML('beforeend', leaves ? ARROW_OUT : ARROW_IN);
}
