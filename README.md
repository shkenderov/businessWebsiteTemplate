# Business website template

One landing-page template for local service businesses (roofers, HVAC, trades),
in Bulgarian, mobile-first, built with Astro + Tailwind and deployed to GitHub Pages.
Every client is a single JSON file; the page is generated from it.

Showcase: https://shkenderov.github.io/businessWebsiteTemplate/ — six kinds of
business, each in two looks. The businesses are fictional and the pages are `noindex`.

Two looks, set per client with `"style"`:

- **`calm`** (default) — paper, zinc and graphite; the hero photo is a fixed layer
  the page scrolls over; quiet reveal-on-scroll.
- **`bold`** — near-black with a slow animated colour field behind everything,
  plus a scene chosen per business with `"ambient"`: `trails` (night-road
  light trails — garages, tyres), `stripes` (a barber pole, slowed down),
  `waves` (flowing strands — salons), `circuit` (traces with signal pulses —
  phone and computer repair), `rain` (roofers, with the odd flash), `airflow`
  (cool and warm currents — HVAC), or `aurora` (colour field only). All are
  small canvas scenes: ~30 fps, fewer elements on phones, paused when the tab
  is hidden, a single static frame under reduced-motion. Frosted-glass cards,
  glowing accent, floating hero photo, services ticker, counters that count up.
  Both looks derive from the same two theme colours.

Starting packs in `src/clients/_examples/`:

| Pack | Sections | Prices module | Booking |
| --- | --- | --- | --- |
| `roofer` | trades layout | calculator (m² × roof type × condition + extras) | request a visit |
| `hvac` | trades layout | calculator (room → BTU class → price range) | request a quote |
| `barber`, `salon` | prices, gallery, team, reviews, booking | price list with durations | request a time slot |
| `phone-repair` | lookup, trust, services, reviews | brand → model → repair → price | ask for a price |
| `auto` | trust, services, prices, booking, reviews | price list by job | book tyre change / service |

## Add a client in 10 minutes

```bash
npm install
npm run new-client -- yordan-pokrivi --from roofer   # or hvac, barber, salon, phone-repair, auto
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

## Sections and modules

`sections` in the client JSON sets the page order; leave it out for the trades layout.
Available: `hero`, `trust`, `services`, `prices`, `process`, `gallery`, `team`,
`reviews`, `booking`, `contact`. A section renders only when its data is present.

**Prices** (`prices.mode`):
- `list` — groups of `{ name, price, duration?, note? }`. Salons, auto, anything with a menu.
- `lookup` — cascading selects down `lookup.tree` to a price. Phone repair: brand → model → repair.
- `calculator` — `kind: "rate"` (rate per unit from a select × quantity × factors + checkbox extras)
  or `kind: "tiers"` (quantity × factors → tier → price range). Roofs, HVAC, cleaning, moving.

**Booking** (`booking.mode`):
- `external` — `url` to the app the business already uses (Fresha, Booksy, Cal.com…), with
  `embed: true` to show it inline as well. Prefer this when they have one.
- `request` — built-in form: service, preferred day, time window, note. Reaches the owner's
  phone by SMS (or `endpoint`). They confirm by calling back.

**Gallery** and **team** take photo lists; the first gallery image is shown larger.

The hero's second button follows the page: it goes to booking if present, else to the
request form, else to prices. Override with `hero.ctaRequestHref`.

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
Everett Pachmann, Illia Horokhovsky (AC units); Agustin Fernandez, Peter Vimalis,
delfina pan, Nate Johnston, Andrea Donato, Allef Vinicius, Nathon Oski, Barney Goodman,
Jason Leung, Element5 Digital, T (barbers and salons); Fotografia Lui Vlad, Jilbert Ebrahimi,
Pierre Bamin, Katelyn G (phones); Mehmet Talha Onuk, Tim Mossholder, Erik Mclean,
Kate Ibragimova (auto).

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
src/clients/_examples/    roofer, hvac, barber, salon, phone-repair, auto — packs for new-client
src/components/           Header, Hero (calm), HeroBold, Ambient (bold background), TrustStrip,
                          Services, Prices, Process, Gallery, Team, Reviews, Booking, Contact,
                          Footer, StickyCallBar, LandingPage
src/scripts/leadForm.ts   shared submit logic for every request/booking form
src/scripts/motion.ts     reveal-on-scroll + counters (both looks)
src/scripts/ambient.ts    the bold background: colour field + per-business scenes
src/pages/index.astro     the showcase index
src/layouts/Base.astro    <head>, SEO, LocalBusiness JSON-LD, per-client theme vars
src/lib/clients.ts        config types + helpers (image URLs, tel/viber links)
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
