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
assets/img/           Responsive JPEG + WebP variants, SVG favicon
assets/icons/         Process-step and play icons exported from Figma
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

The hero shows the poster frame from Figma. The play control is rendered
`hidden` and `assets/js/main.js` only reveals it once a source is configured,
so the page never ships a control that does nothing. To enable it:

```html
<figure class="media" data-video-src="assets/video/overview.mp4">
```

## Design decisions worth knowing

- The Figma navigation contains a grey placeholder rectangle (`107:6`) that
  overlaps the logo and links in the canvas render. It was treated as a
  placeholder and omitted; the nav implements the design's intent — logo left,
  links and CTA right.
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
