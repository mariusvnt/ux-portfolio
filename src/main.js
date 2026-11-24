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
// The same arrow pointing left, for going back a step.
const ARROW_BACK = svg('M12 6H1M5.5 1.5 1 6l4.5 4.5');
// The same arrow turned to point down, its shaft in the middle of the box.
const ARROW_DOWN = svg('M6 0v11M1.5 6.5 6 11l4.5-4.5');
const here = location.origin + location.pathname;

for (const link of document.querySelectorAll('a[href]:not([data-no-arrow])')) {
  const target = new URL(link.href);
  const leaves = target.origin + target.pathname !== here;
  link.insertAdjacentHTML('beforeend', leaves ? ARROW_OUT : ARROW_IN);
}

// Down arrows in the left column of the cover's project index, in front
// of each project name (the links themselves have no arrow).
for (const el of document.querySelectorAll('[data-arrow="down"]')) {
  el.insertAdjacentHTML('beforeend', ARROW_DOWN);
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
  // A page with a folded corner and two lines of text.
  document: '<path d="M3 1.5h6.5l3.5 3.5v9.5H3zM9.5 1.5V5H13M5.5 8.5h5M5.5 11.5h5" />',
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

// The titles that shrink into the header (see .title-dock in main.css):
// the cover title into the "MV" monogram, each project's title into a
// label docked under it.
//
// Each title gets a copy in a sticky dock, placed so that the copy
// scrolls with the page exactly over its title, and sticks once its
// middle reaches its place in the header. The browser moves it, in step
// with the scroll; what is set here, on each scroll frame, is only what
// may trail the scroll by a frame without showing:
// - the copy's size. It starts shrinking when its middle is
//   --logo-morph-distance above its place, or where the title stands at
//   the top of the page if that is higher (the page never opens on a
//   half-shrunk title). Progress runs from 0
//   (the title) to 1 (the copy in place), easing in and out, and back on
//   the way up. The copy shrinks around its middle, which so rises in
//   step with the scroll;
// - the cover title's folds ("arius", the space, "iennot"), closing in
//   step with the shrinking, each narrowing from the right and erasing
//   its letters behind a soft edge rather than a hard cut;
// - which of the title and its copy shows: the copy, laid exactly over
//   the title, from the start of the way;
// - where a wrapped title's words go: the copy is a single line, its
//   words starting where the title's lines put them and sliding into
//   that line as the copy shrinks;
// - a docked project title being pushed up, out of its place, by the
//   next one arriving under the monogram: kept a gap above it, fading
//   out as it goes, gone once the next one is in place.
// With reduced motion, there is no shrinking: the copy, already at its
// docked size, appears once the title has scrolled away under the
// header.
const main = document.querySelector('main');
const coverTitle = document.getElementById('cover-title');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
// Cubic ease-in-out: slow at both ends, from 0 to 1.
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2);
const clamp01 = (value) => Math.min(Math.max(value, 0), 1);

if (main && coverTitle) {
  // A dock and its copy, before <main>: a child of the body, sticky over
  // the whole page.
  const makeDock = (title, href, label, monogram) => {
    const dock = document.createElement('div');
    dock.className = `title-dock screen-only${monogram ? ' title-dock--monogram' : ''}`;
    const copy = document.createElement('a');
    copy.className = 'title-dock__copy main-title';
    copy.href = href;
    copy.dataset.noArrow = '';
    copy.setAttribute('aria-label', label);
    const span = (className, text) => {
      const element = document.createElement('span');
      element.className = className;
      element.textContent = text;
      return element;
    };
    // Word by word, so a wrapped title's words can be placed. In the
    // monogram, each word's first letter stays; the rest, and the
    // spaces, fold.
    const words = [];
    const folds = [];
    const fold = (text) => {
      const element = span('title-dock__fold', text);
      folds.push(element);
      return element;
    };
    title.textContent.trim().split(/\s+/).forEach((text, i) => {
      if (i) copy.append(monogram ? fold(' ') : span('title-dock__space', ' '));
      const word = span('title-dock__word', monogram ? '' : text);
      if (monogram) word.append(span('', text[0]), fold(text.slice(1)));
      words.push(word);
      copy.append(word);
    });
    dock.append(copy);
    main.before(dock);
    return { title, dock, copy, words, folds, monogram };
  };

  const docks = [
    makeDock(coverTitle, '#cover', `${coverTitle.textContent}, back to top`, true),
    ...[...document.querySelectorAll('.project')].flatMap((project) => {
      const title = project.querySelector('.main-title');
      if (!title || !project.id) return [];
      return [makeDock(title, `#${project.id}`, `${title.textContent}, back to the top of the project`, false)];
    }),
  ];

  // Reads a length token, or a font token's size, in pixels.
  const probe = (style, read) => {
    const element = document.createElement('div');
    element.style.cssText = `position:absolute;visibility:hidden;${style}`;
    document.body.append(element);
    const px = read(element);
    element.remove();
    return px;
  };
  const lengthPx = (name) => probe(`height:var(${name})`, (element) => element.offsetHeight);
  const fontPx = (name) => probe(`font:var(${name})`, (element) => parseFloat(getComputedStyle(element).fontSize));

  // Each word's box in an element's text, as its lines place it.
  const wordBoxes = (element) => {
    const boxes = [];
    const range = document.createRange();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      for (const match of walker.currentNode.data.matchAll(/\S+/g)) {
        range.setStart(walker.currentNode, match.index);
        range.setEnd(walker.currentNode, match.index + match[0].length);
        boxes.push(range.getBoundingClientRect());
      }
    }
    return boxes;
  };

  let m;

  // Places and sizes, all constant while scrolling: the titles' in the
  // page, their copies' places in the (fixed) header.
  const measure = () => {
    const headerHeight = lengthPx('--header-height');
    const gap = lengthPx('--header-project-gap');
    const logoSize = fontPx('--logo');
    const labelSize = fontPx('--header-project');
    // Where the docks stand unstuck: at the top of <main>.
    const origin = main.getBoundingClientRect().top + scrollY;
    m = {
      headerHeight,
      distance: lengthPx('--logo-morph-distance'),
      // A docked project title goes up by its height and the gap.
      out: labelSize + gap,
      items: docks.map(({ title, dock, copy, words, folds, monogram }) => {
        // The copy as laid out, unshrunk, its words in one line.
        copy.style.transform = '';
        for (const word of words) word.style.transform = '';
        for (const fold of folds) fold.style.width = 'auto';
        const box = title.getBoundingClientRect();
        const size = parseFloat(getComputedStyle(title).fontSize);
        const top = box.top + scrollY;
        // The middle of the copy, docked: the monogram centred in the
        // header, a project title under it.
        const place = monogram ? headerHeight / 2 : headerHeight / 2 + logoSize / 2 + gap + labelSize / 2;
        copy.style.top = `${top - origin}px`;
        copy.style.left = `${box.left + scrollX}px`;
        dock.style.top = `${place - size / 2 - (top - origin)}px`;
        const widths = folds.map((fold) => fold.getBoundingClientRect().width);
        // Where the title's lines put each word, against the copy's single
        // line, both from the first word.
        const placed = wordBoxes(title);
        const laid = words.map((word) => word.getBoundingClientRect());
        const shifts = words.map((_, k) =>
          placed.length === words.length
            ? {
                x: placed[k].left - placed[0].left - (laid[k].left - laid[0].left),
                y: placed[k].top - placed[0].top - (laid[k].top - laid[0].top),
              }
            : { x: 0, y: 0 },
        );
        return {
          size,
          place,
          widths,
          shifts,
          // From the title's size to the docked one.
          ratio: (monogram ? logoSize : labelSize) / size,
          // The copy's middle with the page unscrolled.
          middle: top + size / 2,
        };
      }),
    };
  };

  // Where a title's copy stands for the title's current place.
  const state = (item, box) => {
    const middle = box.top + item.size / 2;
    if (reducedMotion.matches) {
      const p = Number(middle <= item.place && box.bottom <= m.headerHeight);
      return { morph: false, middle, p, e: 1, scale: item.ratio };
    }
    const start = Math.max(item.place + 1, Math.min(item.place + m.distance, item.middle));
    const p = clamp01((start - middle) / (start - item.place));
    const e = easeInOut(p);
    return { morph: true, middle, p, e, scale: 1 + (item.ratio - 1) * e };
  };

  const update = () => {
    // Every read before any write.
    const boxes = docks.map(({ title }) => title.getBoundingClientRect());
    const states = m.items.map((item, i) => state(item, boxes[i]));

    docks.forEach(({ title, copy, words, folds, monogram }, i) => {
      const item = m.items[i];
      const now = states[i];
      // Pushed up by the next project's title, over the last stretch of
      // its way in.
      const next = monogram ? undefined : states[i + 1];
      const pushed = !next || next.p === 0 ? 0 : next.morph ? clamp01((item.place + m.out - next.middle) / m.out) : 1;
      copy.style.transform = `translateY(${-pushed * m.out}px) scale(${now.scale})`;
      copy.style.opacity = pushed ? 1 - pushed : '';
      copy.style.visibility = now.p > 0 && pushed < 1 ? 'visible' : '';
      words.forEach((word, k) => {
        const { x, y } = item.shifts[k];
        const left = 1 - now.e;
        word.style.transform = (x || y) && left ? `translate(${x * left}px, ${y * left}px)` : '';
      });
      folds.forEach((fold, f) => {
        fold.style.width = now.e ? `${item.widths[f] * (1 - now.e)}px` : '';
        fold.style.setProperty('--fold-closed', `${item.widths[f] * now.e}px`);
      });
      if (now.morph && now.p > 0) title.style.setProperty('--title-fill', 'transparent');
      else title.style.removeProperty('--title-fill');
    });
  };

  let frame = 0;
  const schedule = () => {
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    }
  };
  const refresh = () => {
    measure();
    update();
  };

  refresh();
  document.fonts.ready.then(refresh);
  addEventListener('resize', refresh);
  // The titles move in the page whenever something above them changes
  // height (an image loading, the device toggle).
  new ResizeObserver(refresh).observe(main);
  reducedMotion.addEventListener('change', update);
  addEventListener('scroll', schedule, { passive: true });
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// A scroll bar for recordings (.scrubber), used beside the Result device
// and in the full-screen view. Recordings never play by themselves: the
// bar, like a scroll bar, moves through the one attached, back and
// forth, top to bottom from start to end; drag it or click along it, or
// use the keys (arrows by a tenth of a second, Page Up and Down by a
// second, Home and End to either end). Each recording keeps its place
// when another is attached and it comes back. While a seek is under
// way, the bar's latest place waits and is applied once the frame is
// shown, so dragging fast never queues up a backlog of frames. With no
// recording attached (a still screen), the bar hides.
const createScrubber = () => {
  const bar = document.createElement('div');
  bar.className = 'scrubber screen-only';
  bar.tabIndex = 0;
  bar.setAttribute('role', 'slider');
  bar.setAttribute('aria-orientation', 'vertical');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-label', 'Move through the recording');
  const thumb = document.createElement('div');
  thumb.className = 'scrubber__thumb';
  bar.append(thumb);

  // Where each recording stands, in seconds.
  const place = new WeakMap();
  let clip = null;
  let pending = null;
  let seeking = false;

  const render = () => {
    if (!clip) return;
    const duration = clip.duration || 0;
    const time = place.get(clip);
    bar.style.setProperty('--progress', duration ? time / duration : 0);
    bar.setAttribute('aria-valuemax', duration.toFixed(1));
    bar.setAttribute('aria-valuenow', time.toFixed(1));
    bar.setAttribute('aria-valuetext', `${time.toFixed(1)} of ${duration.toFixed(1)} seconds`);
  };

  const seek = () => {
    seeking = true;
    clip.currentTime = pending;
    pending = null;
  };

  const moveTo = (time) => {
    if (!clip || !clip.duration) return;
    place.set(clip, clamp(time, 0, clip.duration));
    render();
    pending = place.get(clip);
    if (!seeking) seek();
  };

  const onSeeked = (event) => {
    if (event.target !== clip) return;
    seeking = false;
    if (pending !== null) seek();
  };

  // The thumb's middle follows the pointer, from the moment it presses
  // anywhere on the bar until it lets go.
  bar.addEventListener('pointerdown', (event) => {
    if (!clip) return;
    bar.setPointerCapture(event.pointerId);
    const follow = (e) => {
      const box = bar.getBoundingClientRect();
      const reach = box.height - thumb.offsetHeight;
      const share = clamp((e.clientY - box.top - thumb.offsetHeight / 2) / reach, 0, 1);
      moveTo(share * clip.duration);
    };
    follow(event);
    bar.addEventListener('pointermove', follow);
    bar.addEventListener('lostpointercapture', () => bar.removeEventListener('pointermove', follow), { once: true });
  });

  bar.addEventListener('keydown', (event) => {
    if (!clip) return;
    const time = place.get(clip);
    const moves = {
      ArrowDown: time + 0.1,
      ArrowRight: time + 0.1,
      ArrowUp: time - 0.1,
      ArrowLeft: time - 0.1,
      PageDown: time + 1,
      PageUp: time - 1,
      Home: 0,
      End: clip.duration,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    // Kept from the full-screen view's own arrow keys.
    event.stopPropagation();
    moveTo(moves[event.key]);
  });

  return {
    element: bar,
    // video: the recording to move through, or null. start: where a
    // recording new to this bar stands at first, in seconds.
    attach(video, start = 0) {
      clip = video;
      pending = null;
      seeking = false;
      bar.hidden = !clip;
      if (clip && !place.has(clip)) {
        place.set(clip, start);
        clip.addEventListener('seeked', onSeeked);
        clip.addEventListener('loadedmetadata', () => {
          if (start) clip.currentTime = start;
          if (video === clip) render();
        }, { once: true });
      }
      render();
    },
    placeOf: (video) => place.get(video) ?? 0,
  };
};

// A progress bar like a story's (.stories): a thin segment per step,
// dark up to the one shown, white beyond. For the eye only: a title
// beside it always says where the visitor is.
const createStories = (count) => {
  const element = document.createElement('div');
  element.className = 'stories screen-only';
  element.setAttribute('aria-hidden', 'true');
  for (let s = 0; s < count; s++) element.append(document.createElement('span'));
  const segments = [...element.children];
  return {
    element,
    fill: (i) => segments.forEach((segment, s) => segment.classList.toggle('is-done', s <= i)),
  };
};

// The buying journey (.journey): the finished website in one device,
// its screens the steps of the journey, one shown at a time. Above, a
// story's progress bar; then Back, the step's title (data-title) and
// Next, both ways round; its description (data-caption); then the
// decisions and user feedback whose data-steps name its data-step (a
// list with none for the step hides with its title). Recordings get the
// scroll bar on the right of the device, and open at their beginning,
// which is also their poster.
for (const journey of document.querySelectorAll('.journey')) {
  const screens = [...journey.querySelectorAll('.device__screen > .screen__media')];
  const title = journey.querySelector('.journey__title');
  const caption = journey.querySelector('.journey__caption');
  const notes = [...journey.querySelectorAll('.decisions > li[data-steps]')];
  const prev = journey.querySelector('.journey__prev');
  const next = journey.querySelector('.journey__next');
  const scrubber = createScrubber();
  journey.querySelector('.journey__device').append(scrubber.element);
  const stories = createStories(screens.length);
  stories.element.classList.add('journey__progress');
  journey.querySelector('.journey__head').before(stories.element);
  let index = 0;

  for (const screen of screens) {
    // The poster also painted behind the video: printing doesn't paint a
    // video's frame, so this is what paper gets.
    if (screen.tagName === 'VIDEO') screen.style.backgroundImage = `url("${screen.poster}")`;
  }

  // from: the side the new title slides in from, 'right' after Next,
  // 'left' after Back; none otherwise.
  const show = (i, from) => {
    index = i;
    const screen = screens[i];
    for (const s of screens) s.hidden = s !== screen;
    scrubber.attach(screen.tagName === 'VIDEO' ? screen : null);
    title.textContent = screen.dataset.title ?? '';
    title.classList.remove('is-from-left', 'is-from-right');
    if (from) {
      void title.offsetWidth; // restart the slide if one is under way
      title.classList.add(`is-from-${from}`);
    }
    caption.textContent = screen.dataset.caption ?? '';
    caption.hidden = !caption.textContent;
    const step = screen.dataset.step;
    for (const note of notes) {
      const about = note.dataset.steps.split(' ');
      note.classList.toggle('is-current', about.includes('all') || about.includes(step));
    }
    stories.fill(i);
  };

  journey.classList.add('journey--live');
  prev.innerHTML = `${ARROW_BACK}Back`;
  next.innerHTML = `Next${ARROW_IN}`;
  prev.hidden = next.hidden = screens.length < 2;
  prev.addEventListener('click', () => show((index - 1 + screens.length) % screens.length, 'left'));
  next.addEventListener('click', () => show((index + 1) % screens.length, 'right'));
  show(0);

  // For the full-screen view (see below): which step is shown, a way to
  // show another, so the two stay in step, and where a step's recording
  // stands, so the view opens it there.
  journey.currentStep = () => index;
  journey.goToStep = (i) => show(i);
  journey.placeOfStep = (i) => scrubber.placeOf(screens[i]);
}

// Device switch: a hero that exists for phones and for desktops
// (em·ji·ve) shows the phone one first. The toggle above it, hidden
// until this script runs (it does nothing without it), swaps the two
// [data-device-panel] blocks of its project: off for the phone, on for
// the desktop. The words on either side set it too.
for (const deviceSwitch of document.querySelectorAll('.device-switch')) {
  const project = deviceSwitch.closest('.project');
  const toggle = deviceSwitch.querySelector('[role="switch"]');
  const labels = deviceSwitch.querySelectorAll('[data-device]');
  const panels = project.querySelectorAll('[data-device-panel]');
  const set = (device) => {
    toggle.setAttribute('aria-checked', String(device === 'desktop'));
    for (const label of labels) label.classList.toggle('is-current', label.dataset.device === device);
    for (const panel of panels) panel.hidden = panel.dataset.devicePanel !== device;
  };
  deviceSwitch.querySelector('.device-switch__control').hidden = false;
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-checked') === 'true' ? 'phone' : 'desktop'));
  for (const label of labels) label.addEventListener('click', () => set(label.dataset.device));
  set('phone');
}

// Full-screen view: a prototype board, or a screen of the Result
// device, opened by clicking it, over the whole window. At the top, a
// story's progress bar; a cross at the top right closes the view (Esc
// too); arrows at the bottom left and right, or the arrow keys, move to
// the previous or next one, both ways round. Recordings get the same
// scroll bar as on the page, on their right. It is the browser's modal
// dialog, so focus stays inside while it is open and goes back to what
// was clicked when it closes. Opened from the device, it moves through
// the journey's steps and the device follows.
const icon = (path) =>
  `<svg class="lightbox__icon" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="${path}" /></svg>`;

const lightbox = (() => {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.tabIndex = -1;
  // The label sits on the bottom line, centred between the arrows, so
  // the board or screen above gets all the height left.
  dialog.innerHTML = `
    <figure class="lightbox__figure">
      <div class="lightbox__progress"></div>
      <div class="lightbox__stage"></div>
      <div class="lightbox__bar">
        <button type="button" class="lightbox__prev" aria-label="Previous">${icon('M12 6H1M5.5 1.5 1 6l4.5 4.5')}</button>
        <figcaption class="lightbox__caption" aria-live="polite"></figcaption>
        <button type="button" class="lightbox__next" aria-label="Next">${icon('M0 6h11M6.5 1.5 11 6l-4.5 4.5')}</button>
      </div>
    </figure>
    <button type="button" class="lightbox__close" aria-label="Close">${icon('M1 1l10 10M11 1 1 11')}</button>`;
  document.body.append(dialog);
  const progress = dialog.querySelector('.lightbox__progress');
  const stage = dialog.querySelector('.lightbox__stage');
  const bar = dialog.querySelector('.lightbox__bar');
  const caption = dialog.querySelector('.lightbox__caption');
  const prev = dialog.querySelector('.lightbox__prev');
  const next = dialog.querySelector('.lightbox__next');
  const close = dialog.querySelector('.lightbox__close');
  const scrubber = createScrubber();

  // The board or screen's frame, kept for the view's life: only what it
  // shows changes, so a button inside it keeps its focus from one item
  // to the next. The scroll bar on its right shows for a recording.
  const screen = document.createElement('div');
  screen.className = 'lightbox__screen';
  let media = document.createElement('span');
  screen.append(media, scrubber.element);
  stage.append(screen);

  // Where the buttons go: on wider screens, beside the board or screen
  // (the arrows halfway down its sides, the cross at its top right);
  // on phones, the arrows on the bottom line with the label, the cross
  // in the window's corner. Moved only when the width crosses over.
  const wide = matchMedia('(width >= 48rem)');
  const placeButtons = () => {
    if (wide.matches) {
      if (prev.parentElement !== screen) screen.append(prev, next, close);
    } else if (prev.parentElement !== bar) {
      bar.prepend(prev);
      bar.append(next);
      dialog.append(close);
    }
  };
  placeButtons();
  wide.addEventListener('change', placeButtons);

  let stories = null;
  let items = [];
  let index = 0;
  let onMove = null;

  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    const shown = item.view();
    media.replaceWith(shown);
    media = shown;
    screen.dataset.kind = item.kind;
    scrubber.attach(media.tagName === 'VIDEO' ? media : null, item.start?.() ?? 0);
    caption.textContent = item.label;
    stories.fill(index);
    onMove?.(index);
  };

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    else if (event.key === 'ArrowRight') show(index + 1);
  });
  // Emptied on closing, so nothing lingers unseen.
  dialog.addEventListener('close', () => {
    const empty = document.createElement('span');
    media.replaceWith(empty);
    media = empty;
    scrubber.attach(null);
  });

  return {
    open(list, i, move = null) {
      items = list;
      onMove = move;
      stories = createStories(items.length);
      progress.replaceChildren(stories.element);
      prev.hidden = next.hidden = items.length < 2;
      show(i);
      if (!dialog.open) {
        dialog.showModal();
        // The view itself takes focus, not its first button: a tap then
        // shows no focus outline (Safari on iPhone draws one on the
        // button). Tab still reaches the buttons; Esc and the arrow keys
        // work at once.
        dialog.focus();
      }
    },
  };
})();

// A clickable layer over something to open, named for screen readers.
const opener = (label) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `${label}, full screen`);
  return button;
};

// Prototype boards: each board becomes the button that opens it, shown
// at full resolution (data-full) when there is one.
for (const prototype of document.querySelectorAll('.prototype')) {
  const figures = [...prototype.querySelectorAll(':scope > .screen')];
  const items = figures.map((figure) => {
    const media = figure.querySelector('.screen__media, .prototype__pointers');
    return {
      label: figure.querySelector('figcaption')?.textContent ?? '',
      kind: 'board',
      media,
      view: () => {
        const copy = media.cloneNode(true);
        if (copy.dataset?.full) copy.src = copy.dataset.full;
        copy.removeAttribute('loading');
        return copy;
      },
    };
  });
  items.forEach((item, i) => {
    const button = opener(item.label);
    button.className = 'prototype__open';
    item.media.replaceWith(button);
    button.append(item.media);
    button.addEventListener('click', () => lightbox.open(items, i));
  });
}

// Result devices: a layer over the device's screen opens the step shown;
// a recording opens where it stands on the page.
for (const journey of document.querySelectorAll('.journey')) {
  const screens = [...journey.querySelectorAll('.device__screen > .screen__media')];
  const desktop = journey.classList.contains('journey--laptop');
  const items = screens.map((screen, i) => ({
    label: screen.dataset.title ?? '',
    kind: desktop ? 'desktop' : 'phone',
    start: () => journey.placeOfStep(i),
    view: () => {
      const copy = screen.cloneNode(true);
      copy.hidden = false;
      copy.removeAttribute('loading');
      if (copy.tagName === 'VIDEO') copy.preload = 'auto';
      return copy;
    },
  }));
  const button = opener('Current screen');
  button.className = 'journey__zoom';
  journey.querySelector('.device').append(button);
  button.addEventListener('click', () =>
    lightbox.open(items, journey.currentStep(), (i) => journey.goToStep(i)),
  );
}
