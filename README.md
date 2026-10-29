# Business website template

One landing-page template for local service businesses (roofers, HVAC, trades),
in Bulgarian, mobile-first, built with Astro + Tailwind and deployed to GitHub Pages.
Every client is a single JSON file; the page is generated from it.

Live demo: https://shkenderov.github.io/businessWebsiteTemplate/ — a generic
"Вашата фирма" page with placeholder identity, so it shows the structure without
pretending to be anyone. Trade-specific copy packs (roofer, HVAC) live in
`src/clients/_examples/`; they are starting points, not deployed pages.

## Add a client in 10 minutes

```bash
npm install
npm run new-client -- yordan-pokrivi --from roofer   # or --from hvac
```

Edit `src/clients/yordan-pokrivi.json`:

| Field | What to put |
| --- | --- |
| `business.name`, `trade`, `phone` (+359…), `phoneDisplay` | from their Google Maps listing |
| `business.address`, `hours`, `areas`, `mapQuery` | listing + the neighbourhoods they actually serve |
| `business.rating`, `reviewCount` | from Google |
| `hero.headline`, `subline` | keep it about the customer's problem, not the company |
| `services[]` | 3–4 things they are paid for, one photo each |
| `reviews.items[]` | paste their real Google reviews, then set `"sample": false` |
| `theme.accent`, `theme.dark` | optional re-brand; everything restyles from these two colours |
| `seo.title` | service and city first: "Ремонт на покриви София — Покриви Иванов" |
| `seo.noindex` | `true` while it is a pitch/demo (Google ignores it); `false` once it is the client's real site |
| `seo.schemaType`, `openingHours`, `priceRange`, `sameAs` | structured data: business type (RoofingContractor, HVACBusiness, Plumber…), hours, price band, links to the Maps listing / Facebook |

Push to `main` and the site rebuilds. The client's page is at `/<slug>/`.

## Images

`hero.image` and `services[].image` accept either:

- an Unsplash URL (`https://images.unsplash.com/photo-…`) — hot-linked and resized
  automatically, which is Unsplash's intended use; or
- a file name, e.g. `roof.jpg`, placed in `public/images/`.

For a paying client, swap the stock photos for their own job photos; it converts far
better and removes the dependency on Unsplash.

Stock photos used by the demo and examples (Unsplash licence, free for commercial use):
Sergej (roof tiles), Zohair Mirza (roof repair), Sergio Martins (metal roofing),
Michael Jasmund (tile pattern), alpha innotec (heat pumps and AC units),
Everett Pachmann, Illia Horokhovsky (AC units).

## The request form

Static site, no backend. Two modes, chosen by `form.endpoint`:

- **Empty (default):** on a phone, submitting opens the SMS app with the request
  pre-filled to the business's number; on desktop the text is copied and the visitor is
  told to send it by Viber/SMS or call. Zero setup, works today.
- **Set to a URL:** the form POSTs there. Formspree, Web3Forms or your own endpoint all
  work; the owner then gets an email per request.

## Stack and structure

```
src/clients/*.json        one file per client (slug = file name)
src/clients/_examples/    roofer.json, hvac.json — copy packs for new-client (not deployed)
src/components/           Header, Hero, TrustStrip, Services, Process, Reviews,
                          RequestForm, Footer, StickyCallBar, LandingPage
src/layouts/Base.astro    <head>, SEO, LocalBusiness JSON-LD, per-client theme vars
src/lib/clients.ts        config types + helpers (image URLs, tel/viber links)
src/pages/index.astro     the client marked "default": true
src/pages/[client].astro  /<slug>/ for every client
src/styles/global.css     Tailwind v4 theme tokens, fonts (Unbounded + Golos Text)
.github/workflows/        build + deploy to GitHub Pages on push to main
```

Local: `npm run dev` → http://localhost:4321/businessWebsiteTemplate/

## SEO

What the page already does: keyword-first `<title>` and description, `lang="bg"`, one H1,
alt text on photos, canonical URL, Open Graph tags (Viber/Facebook previews),
schema.org structured data (business type, address, hours, service area, services,
rating), sitemap + robots.txt, and sub-second load because it is static.

What actually ranks a local trade is the Google Business Profile and its reviews; the
site supports it. Keep name, address and phone identical on the site and the Maps
listing, put the Maps listing URL in `seo.sameAs`, and link the site from the listing.

Demo pages are `noindex` and left out of the sitemap, so pitches never show up in
Google. Flip `seo.noindex` to `false` only on a client's real site, on their own domain.

## Deploy elsewhere

For a client's own domain, set `site` to the domain and `base` to `/` in
`astro.config.mjs`, then host `dist/` anywhere static (Netlify, Cloudflare Pages,
GitHub Pages with a custom domain).

## Positioning the hero photo

The hero photo is cropped to fill the screen, so set which part of it stays in view:

```json
"hero": {
  "imagePosition": "50% 40%",        // desktop: x y, like CSS object-position
  "imagePositionMobile": "60% 50%"   // phones show a narrow vertical slice, so tune separately
}
```

`0% 0%` is the top-left corner, `100% 100%` the bottom-right. Nudge in steps of 10%
and reload; on desktop the left two-thirds sit under the dark gradient, so put the
interesting part of the photo on the right.
