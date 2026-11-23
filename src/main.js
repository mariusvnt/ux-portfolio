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

// Compact labels: on phones, a left-column label with data-icon is shown
// as that icon. Its text is wrapped in .row__meta-long, which the CSS
// hides on phones (still read by screen readers); the icon is hidden on
// wider screens and in the PDF. Minimal line icons on a 16-unit grid,
// drawn with a thinner line than the arrows.
const ICONS = {
  mail: '<path d="M1 3h14v10H1zM1 3l7 6 7-6" />',
  calendar: '<path d="M1.5 3.5h13v11h-13zM1.5 7h13M5 1.5v3M11 1.5v3" />',
  // A gear: eight square teeth around a hub.
  tools:
    '<path d="M13.14 6.72L14.91 6.9 14.91 9.1 13.14 9.28A5.3 5.3 0 0 1 12.54 10.73L13.66 12.11 12.11 13.66 10.73 12.54A5.3 5.3 0 0 1 9.28 13.14L9.1 14.91 6.9 14.91 6.72 13.14A5.3 5.3 0 0 1 5.27 12.54L3.89 13.66 2.34 12.11 3.46 10.73A5.3 5.3 0 0 1 2.86 9.28L1.09 9.1 1.09 6.9 2.86 6.72A5.3 5.3 0 0 1 3.46 5.27L2.34 3.89 3.89 2.34 5.27 3.46A5.3 5.3 0 0 1 6.72 2.86L6.9 1.09 9.1 1.09 9.28 2.86A5.3 5.3 0 0 1 10.73 3.46L12.11 2.34 13.66 3.89 12.54 5.27A5.3 5.3 0 0 1 13.14 6.72z" /><circle cx="8" cy="8" r="2" />',
  // A chain link: two half circles facing each other, joined by a line.
  link: '<path d="M5 4.5A3.5 3.5 0 0 0 5 11.5M11 4.5a3.5 3.5 0 0 1 0 7M5 8h6" />',
  person: '<circle cx="8" cy="5" r="3" /><path d="M2.5 14.5a5.5 5.5 0 0 1 11 0" />',
};

for (const label of document.querySelectorAll('.row__meta[data-icon]')) {
  const long = document.createElement('span');
  long.className = 'row__meta-long';
  long.append(...label.childNodes);
  label.append(long);
  label.insertAdjacentHTML(
    'beforeend',
    `<svg class="row__meta-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">${ICONS[label.dataset.icon]}</svg>`,
  );
}
