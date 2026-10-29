# G-WORX Consulting — one-page site

Static, dependency-free site built from the Figma file **G-WORX 2026**,
frame `Desktop V1 - Rev 4` (node `107:2`).

```
index.html            The one-pager: all sections, metadata, JSON-LD
privacy.html          Privacy Policy
terms.html            Terms of Service
404.html              Not-found page (served via not_found_handling; noindex)
assets/css/styles.css Design tokens + all styling (mobile-first)
assets/js/main.js     Progressive enhancement only (mobile menu, video facade)
assets/img/           Logo lockup, portrait variants, OG image, favicons
assets/icons/         Process-step icons exported from Figma
_headers              Cache and security headers (read by Cloudflare)
wrangler.jsonc        Cloudflare Worker config (name + assets directory)
.assetsignore         Repo files to keep out of the published site
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

**GitHub is version control only. The live site is served by a Cloudflare
Worker** (service `gworxconsulting`), using Workers Static Assets — there is no
build step, Cloudflare just serves these files.

> Earlier revisions of this README described a Cloudflare **Pages** project.
> That was wrong: production is a **Worker**. Pages and Workers are configured
> in different places and the instructions do not transfer.

### Config

`wrangler.jsonc` declares the Worker name and the assets directory.
**`name` must match the existing Worker exactly** — with a different name,
`wrangler deploy` creates a second Worker instead of updating the live one.

Because the assets directory is the repo root, `.assetsignore` keeps repo-only
files (README, the Wrangler config, `.claude/`) from being published at
`/README.md` and friends. Never add `_headers` to `.assetsignore`: Cloudflare
reads it as config and never serves it, so ignoring it would silently drop the
cache and security headers.

`not_found_handling: "404-page"` serves `404.html` with a real 404 status
instead of falling back to `index.html`, which would be a soft 404.

### Deploying on push

Connect the Worker to this repo once: in the Cloudflare dashboard open the
Worker, then **Settings -> Builds -> Connect to Git**, pick
`armandogworxconsulting/gworx-consulting-sites` and branch `main`, leave the
build command empty, and set the deploy command to `npx wrangler deploy`.
After that, every push to `main` deploys.

### Deploying by hand

```bash
npx wrangler login     # one-time browser sign-in
npx wrangler deploy
```

### Verifying what is live

`_headers` is applied in production, so these are a quick smoke test:

```bash
curl -sI https://www.gworxconsulting.com/ | grep -i referrer-policy
curl -sI https://www.gworxconsulting.com/assets/img/gworx-logo.png | grep -i cache-control
```

HTML should return `max-age=0, must-revalidate`; images should return
`max-age=31536000, immutable`.

### Custom domain

The site's canonical URLs, Open Graph tags, JSON-LD, `robots.txt` and
`sitemap.xml` all assume `https://gworxconsulting.com/` — search and replace if
the real domain differs. Leave Cloudflare's **Rocket Loader** off; it defers
inline scripts and would break the `js` class the mobile menu depends on.

## Analytics

Google Tag Manager (container `GTM-PFH7GZPV`) loads on all four pages,
immediately after `<head>` as Google specifies. It costs roughly 178 KB and
about 120 ms of main-thread time.

**It sets cookies, so `privacy.html` names it, says what it collects and gives
opt-out routes.** Keep those in sync: if the container is removed, or if tags
inside it start collecting something else (remarketing, user IDs, form
contents), the policy has to change with it. Tags added inside GTM do not
appear in this repository, so the policy is the only record of what is running.

## Legal pages

`privacy.html` and `terms.html` describe only what this site actually does today:
a static page with no contact form, Google Tag Manager for measurement, booking
handled by Google Calendar, an embedded YouTube video, and the Inter typeface
loaded from Google Fonts. **Have them
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
- The header lockup reads "G-WORX Sites" while the page title, footer,
  Open Graph tags and structured data all say "G-WORX Consulting". **This is
  intentional and confirmed** — "Sites" is the lockup in the header only.
  Leave the rest as "G-WORX Consulting"; it matches the domain and the
  `ProfessionalService` entity in the JSON-LD.
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
