# Design system

The rules this site is built from, extracted from the live pages. Live
specimens with both themes: [`styleguide.html`](styleguide.html) (internal,
not linked from the site). Blog posts get all of this from `css/post.css`;
the older pages (`index.html`, `project.html`, `writing.html`) carry the same
values inline.

## Principles

- **Two faces, two jobs.** Geist for everything the reader reads; Geist Mono
  for everything they scan — dates, section labels, chips, captions, chart
  text, code. Prose never sets in mono; mono is never body-sized.
- **One accent, interactive-only.** The blue means "you can act here": links,
  hovers, the blockquote rule. It never colors headings, body text, or
  decoration.
- **Hairlines do the structure.** 1px `--line` rules separate everything;
  raised surfaces get 8–12px radius and no shadows.
- **Motion is feedback.** Hover states and one entry fade. Nothing animates on
  scroll except the reveal fade-in; `prefers-reduced-motion` disables all of it.
- **Both themes, always.** Every color is a custom property with a light and a
  dark value, toggled by `data-theme` on `<html>`, stored as `lb-theme`.

## Tokens

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#f7f6f3` | `#0c0c0e` | page |
| `--card` | `#ffffff` | `#161619` | raised surface (pre blocks, charts) |
| `--card2` | `#eceae4` | `#1c1c20` | sunken surface (media placeholders) |
| `--fg` | `#191917` | `#ededee` | primary text |
| `--muted` | `#54534d` | `#8c8c92` | secondary text, summaries |
| `--faint` | `#73716a` | `#56565c` | metadata, labels, captions |
| `--line` | `rgba(20,20,18,.14)` | `rgba(255,255,255,.12)` | hairlines, borders |
| `--accent` | `#2b5fd9` | `#7099ff` | interactive |
| `--accent-soft` | `rgba(43,95,217,.08)` | `rgba(112,153,255,.13)` | hover wash, inline-code bg |

Chart-only tokens (in `css/post.css`): `--chart-surface` (= `--card`),
`--chart-grid`, `--chart-axis`, `--series-1`, `--series-2`.

## Type scale

| Style | Spec | Where |
|---|---|---|
| Display | clamp(40px, 6.5vw, 62px) · Geist 500 · −0.025em · lh 1.0 | index h1 |
| Page title | clamp(30–34px, 5vw, 44–52px) · Geist 500 · −0.025em | subpage h1 |
| Item title | 21px · Geist 500 · −0.01em | rows, prose h2 |
| Compact title | 16.5px · Geist 500 | compact rows, experience |
| Intro | 18px · lh 1.5–1.62 | hero, page decks |
| Body | 16.5px · lh 1.62 | `.prose` |
| Summary | 14.5px · muted · lh 1.55 · max 520px | row descriptions |
| Mono meta | 12–12.5px mono | dates, years, links |
| Section label | 11.5px mono · uppercase · +0.14em · faint | section rules |
| Chip | 11px mono · 1px border · radius 5px | tech tags |

Column: 760px max on the index, 720px on subpages, side padding 24px.

## Components

- **Section label row** — mono label + 1px flex hairline + optional count or
  "All ↗" link on the right. Opens every section.
- **Card row** — grid `[32px number] [content] [↗]`, 24px vertical padding,
  1px top hairline. Hover: accent text, `--accent-soft` background, 4px slide
  right, arrow nudges. Compact variant drops the number column.
- **Pill** — CTA. 1px accent border, radius 999, mono 13px, accent text.
  Hover: soft wash + 2px lift.
- **Chip** — tech tag. Mono 11px, 1px `--line` border, radius 5px, muted.
- **Buttons (`.btn`)** — 34px square, 1px border, radius 8, mono. Hover:
  border and text to `--fg`; active: scale 0.92. Used for ⌘K and theme toggle.
- **⌘K palette** — overlay + card panel; active item gets accent text on
  `--accent-soft`. Lives on the index only.
- **Prose** (`.prose` in `css/post.css`) — paragraphs, h2, lists, accent-rule
  blockquote, inline code on `--accent-soft`, pre on `--card`, 80px centered hr.
- **Code block** — `pre` on `--card`, syntax-highlighted with the oxocarbon
  token palette below (`.tok-*` spans, hand-annotated). A hover/focus **copy
  button** (top-right, `--card2` chip) copies the block and flashes "Copied ✓".
- **Figure** — chart or image + mono 11.5px faint caption ("Fig. N — …").

### Syntax tokens

Oxocarbon (IBM Carbon) hues — the one place accent-family color is allowed on
non-interactive text, scoped to `pre`. Comments stay gray (`--faint`); light
theme uses the darker Carbon 60/70 variants so every token clears contrast on
the white `--card`. Four tokens only; identifiers and operators stay `--fg`.

| Token | Role | Light | Dark |
|---|---|---|---|
| `.tok-com` | comment | `--faint` | `--faint` |
| `.tok-kw` | keyword | `#8a3ffc` | `#be95ff` |
| `.tok-fn` | call / builtin | `#0f62fe` | `#78a9ff` |
| `.tok-num` | number | `#007d79` | `#3ddbd9` |

## Charts

`js/charts.js` renders into a `<div class="chart">`; `css/post.css` styles it.
API:

```js
renderLineChart(el, { title, subtitle, xLabel, xUnit, x: [...],
                      series: [{ name, values: [...] }, ...] });
renderBarChart(el,  { title, subtitle, unit, items: [{ label, value }, ...] });
```

Specs the renderer enforces (keep them if it's ever edited):

- Lines 2px, round joins; end markers 8px with a 2px surface-color ring.
- Bars 22px (cap 24px), 4px rounded data-end, square baseline, grown from zero.
- Gridlines: solid 1px `--chart-grid`, recessive; baseline `--chart-axis`.
- Legend for two or more series; none for one (the title names it). Direct
  labels only at line ends and bar tips — never a number on every point.
- Chart text (axes, labels, values) wears text tokens, never a series color.
- Hover layer always: crosshair + tooltip on lines, per-bar tooltip on bars,
  hit targets larger than the marks. "View data as table" fallback always.
- One y-axis. Two measures of different scale = two charts.

### Series palette

Six categorical slots, validated 2026-07-17 with the dataviz palette validator
against the real chart surfaces (light `#ffffff`, dark `#161619`) on the
adjacent pairlist. Assign in order — `--series-1` first, never cycled.

| Slot | Hue | Light | Dark |
|---|---|---|---|
| `--series-1` | blue | `#2a78d6` | `#3987e5` |
| `--series-2` | green | `#008300` | `#2bb849` |
| `--series-3` | magenta | `#e87ba4` | `#d55181` |
| `--series-4` | yellow | `#eda100` | `#c98500` |
| `--series-5` | violet | `#4a3aa7` | `#9085e9` |
| `--series-6` | orange | `#eb6834` | `#d95926` |

The slot **order** is the color-vision-safety mechanism, not cosmetic: the two
warm hues (yellow, orange) are kept non-adjacent because they're the closest
pair. Don't reorder without re-running the validator.

**Two deliberate, documented exceptions:**

- *Dark green (`#2bb849`)* sits one step above the equal-weight lightness band
  (L 0.687 vs 0.67 ceiling) — a plain in-band green (`#008300`/`#27ae44`) read
  too dark on the dark surface. Legal here because green is only ever drawn as
  a directly-labeled line, so equal visual weight isn't load-bearing. Passes
  every other check (CVD, chroma, contrast, normal-vision).
- *Light magenta and yellow* fall below 3:1 contrast on white (the "relief
  rule"). Legal because every chart ships direct labels **and** a data-table
  fallback, so identity never rests on the low-contrast fill alone.

**Six is the cap.** A seventh series means extending and re-validating the
palette (`dataviz` skill validator) against both surfaces, not guessing a hex.
Past six, fold categories into "Other" or split into small multiples.

## Adding a blog post

1. Copy `posts/fitting-a-transformer-into-16mb.html` as the template — it
   links `../css/post.css` and `../js/charts.js` and carries the standard
   header (← Writing), meta row, title, deck, `.prose` article, footer.
2. List the post in `writing.html` (card row) and, if it should be featured,
   in the index Writing section; bump the section count.
3. Add a ⌘K entry for it in `index.html`.
4. Charts: real data only, or say so in the caption. Check both themes.
