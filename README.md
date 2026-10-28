# G-WORX Consulting — one-page site

Static, dependency-free site built from the Figma file **G-WORX 2026**,
frame `Desktop V1 - Rev 4` (node `107:2`).

```
index.html            The one-pager: all sections, metadata, JSON-LD
privacy.html          Privacy Policy
terms.html            Terms of Service
404.html              Not-found page (Pages serves it automatically; noindex)
assets/css/styles.css Design tokens + all styling (mobile-first)
assets/js/main.js     Progressive enhancement only (mobile menu, video facade)
assets/img/           Logo lockup, portrait variants, OG image, SVG favicon
assets/icons/         Process-step icons exported from Figma
_headers              Cache and security headers for Cloudflare Pages
robots.txt            Allows crawling, points at the sitemap
sitemap.xml           All three URLs
```

## Running it

Any static server works — there is no build step:

```bash
python3 -m http.server 4317
```

## Conversion action

All seven **Free Consultation** buttons point at the Google Calendar booking page:

```
https://calendar.app.google/PJpfv5bPjw1J3eek8
```

They open in a new tab (`rel="noopener"`), and each carries a screen-reader-only
note saying so. The same URL appears in the home page's JSON-LD as a
`ReserveAction`. To change it, search and replace that URL across `index.html`.

## Deployment

**GitHub is version control only. The live site is hosted on Cloudflare Pages**,
which builds nothing — it serves these files as they are.

### Connecting the repo (one time)

In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**,
authorise GitHub, pick `armandogworxconsulting/gworx-consulting-sites`, then:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `/` |

Every push to `main` deploys automatically; pushes to other branches get a
preview URL.

### Serve-time configuration

`_headers` sets cache and security headers. Compression (gzip/Brotli) is
automatic on Pages and needs no configuration. There is no `.htaccess` — that
was Apache-only and has been removed.

Cache policy in `_headers` is deliberate: images and icons are cached for a
year, but **CSS and JS revalidate hourly** because their filenames are not
content-hashed. Caching them for a year would strand visitors on a stale
stylesheet after a deploy. Add content hashes to those filenames before raising
it.

### Custom domain

Add it under the Pages project → **Custom domains**. The site's canonical URLs,
Open Graph tags, JSON-LD, `robots.txt` and `sitemap.xml` all assume
`https://gworxconsulting.com/` — search and replace if the real domain differs.
Leave Cloudflare's **Auto Minify** and **Rocket Loader** off; Rocket Loader
defers inline scripts and would break the `js` class that the mobile menu
depends on.

## Legal pages

`privacy.html` and `terms.html` describe only what this site actually does today:
a static page, no cookies, no analytics, no contact form, with booking handled by
Google Calendar and the Inter typeface loaded from Google Fonts. **Have them
reviewed by counsel before launch**, and update them before adding anything that
changes the facts — analytics, a contact form, a chat widget, retargeting pixels
or any cookie-setting script.

Both carry a "Last updated 28 October 2026" date; bump it whenever you edit them.

## Hero video

The hero embeds YouTube video `DfGLLdW6ksg` via `youtube-nocookie.com`.

**`loading="lazy"` was deliberately removed from the iframe.** With it, the
player never requested anything on a 375px viewport even though the frame was
fully in view, leaving a blank box where the hero should be — and lazy-loading
an above-the-fold element is against the usual guidance anyway.

The cost is real: the embed pulls about **1 MB** from YouTube on every page
view, and it is the largest thing on the page by an order of magnitude.
Measured Lighthouse performance across three runs is 97–100 with LCP 1.3–2.1s,
so it still clears the Core Web Vitals targets — but if that budget ever
matters, the fix is a click-to-load facade: show the poster image, swap in the
iframe on click. That keeps the page near-weightless until someone actually
wants the video.

Because the video is embedded, `privacy.html` now names YouTube as a third
party. Keep those in sync if the embed is ever removed.

## Design decisions worth knowing

- The header matches the lockup in the Figma file: the G-WORX arrow wordmark,
  "Sites", and the links Services / About / FAQs on the `#303f50` slate bar.
  `#process` and `#contact` no longer have a nav link — that matches the
  design, and both are still reachable by scrolling and from the footer.
- **`assets/img/gworx-logo.png` was extracted from a raster screenshot inside
  the Figma file**, which is the only form of the logo in there. It was alpha
  matted off its slate background and recoloured to the design-system gold
  `#e8a824` (the screenshot rendered it lighter). It is sized for its 99x30
  display box and will not scale up well. **Replace it with the real logo —
  ideally an SVG — when one is available**; it is a one-line swap in each of
  the four pages.
- The header reads "G-WORX Sites" while the page title, footer and structured
  data say "G-WORX Consulting". That is how the Figma file has it, but confirm
  it is the intended sub-brand rather than an inconsistency.
- Accent gold `#e8a824` fails WCAG contrast as *text* on light surfaces
  (2.1:1). Gold is kept for fills, borders and icons; accent **text** on light
  backgrounds uses `--accent-ink: #8f6200` (5.4:1) and accent **borders** use
  `--accent-line: #b8830a` (3.4:1). On dark surfaces the original gold is used
  unchanged (7.8:1). Secondary text was darkened from `#757575` to `#6b6b6b`,
  which the muted `#f5f5f5` sections need to clear 4.5:1.
- An `Inter Fallback` `@font-face` with `size-adjust` / `ascent-override` keeps
  text from reflowing when the webfont swaps in (privacy page CLS 0.045 → 0.001).
- CSS is shipped unminified for maintainability.

## Validation

Checked on 28 October 2026 against a local server:

| Check | Result |
| --- | --- |
| W3C HTML validator | 0 messages on all three pages |
| schema.org validator | 0 errors |
| Lighthouse (all three pages) | 100 performance / 100 a11y / 100 best practices / 100 SEO |
| Core Web Vitals (lab) | LCP 1.4s · CLS 0.001–0.002 · TBT 0ms |
| Links | 22 internal targets and both external links return 200 |
| Widths | 320 / 375 / 768 / 1200 / 1440 — no page overflow, no console errors |

Lighthouse still flags gzip and cache-TTL, which the local Python server does not
set; `.htaccess` handles both in production.
