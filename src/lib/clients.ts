/**
 * One JSON file per client in src/clients/. The file name is the URL slug:
 *   src/clients/demo-roofer.json  →  /demo-roofer/
 * The client marked "default": true is also served at the site root.
 */

export interface Client {
  slug: string;
  default?: boolean;
  theme?: {
    /** Action colour (call / request buttons). Hex. */
    accent?: string;
    /** Dark panel colour (hero, footer). Hex. */
    dark?: string;
  };
  business: {
    name: string;
    /** Short line under the name in the header, e.g. "Покривни услуги · София" */
    trade: string;
    owner?: string;
    phone: string;          // E.164, e.g. +359897858923 — used in tel: links
    phoneDisplay: string;   // e.g. 089 785 8923
    viber?: boolean;        // show a Viber button for the same number
    email?: string;
    address?: string;
    hours?: string;
    areas?: string[];       // neighbourhoods / towns served
    mapQuery?: string;      // what to search on Google Maps for the embed
    rating?: number;        // e.g. 5.0
    reviewCount?: number;   // e.g. 114
    /** Google Place ID (starts with "ChIJ…"). Enables the "all reviews" and
     *  "leave a review" links. Find it: https://developers.google.com/maps/documentation/places/web-service/place-id */
    googlePlaceId?: string;
    yearsExperience?: number;
    eik?: string;           // company id for the footer
  };
  seo: { title: string; description: string };
  hero: {
    headline: string;
    subline: string;
    image: string;          // https://... (hot-linked) or a file name in public/images/
    imageAlt: string;
    /** CSS object-position for the photo, e.g. "50% 40%" (x y). Controls which part
     *  of the photo stays in view when it is cropped. Defaults to centre. */
    imagePosition?: string;
    /** Same, for phones (portrait crop shows a narrow slice, so the focal point often differs). */
    imagePositionMobile?: string;
    ctaCall?: string;       // button label; defaults to "Позвънете"
    ctaRequest?: string;    // button label; defaults to "Заявете оглед"
  };
  trust: { title: string; text: string }[];
  services: { title: string; text: string; image: string; imageAlt: string }[];
  process: { title: string; text: string }[];
  reviews: {
    /** true while the reviews are placeholders → a small notice is shown */
    sample?: boolean;
    items: { name: string; text: string; when?: string }[];
  };
  form: {
    title?: string;
    intro?: string;
    /** Optional POST endpoint (Formspree, Web3Forms, your own). Without it, the
     *  form opens the phone's SMS app with the message pre-filled. */
    endpoint?: string;
    problemLabel?: string;   // label for the free-text field
    problemHint?: string;    // placeholder text
    areaLabel?: string;
  };
  footer?: {
    credit?: string;         // e.g. "Сайт: Стефан Шкендеров"
    creditUrl?: string;
  };
}

const files = import.meta.glob<{ default: Client }>('../clients/*.json', { eager: true });

export function loadClients(): Client[] {
  return Object.entries(files)
    .map(([path, mod]) => {
      const slug = path.split('/').pop()!.replace(/\.json$/, '');
      return { ...mod.default, slug };
    })
    .filter((c) => !c.slug.startsWith('_'));
}

export function defaultClient(): Client {
  const all = loadClients();
  return all.find((c) => c.default) ?? all[0];
}

/** Resolve an image reference from config into a URL the browser can load. */
export function imageUrl(ref: string, width = 1600): string {
  if (/^https?:\/\//.test(ref)) {
    // Unsplash CDN accepts sizing params; other hosts get the URL untouched.
    if (ref.includes('images.unsplash.com')) {
      const u = new URL(ref);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', '80');
      return u.toString();
    }
    return ref;
  }
  return `${import.meta.env.BASE_URL}images/${ref}`;
}

/** srcset for responsive images; only meaningful for Unsplash-hosted refs. */
export function imageSrcset(ref: string, widths = [640, 1024, 1600]): string | undefined {
  if (!ref.includes('images.unsplash.com')) return undefined;
  return widths.map((w) => `${imageUrl(ref, w)} ${w}w`).join(', ');
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function viberHref(phone: string): string {
  return `viber://chat?number=${encodeURIComponent(phone.replace(/[^\d+]/g, ''))}`;
}

/** Google's public pages for a place's reviews, keyed by Place ID. */
export function googleReviewsHref(placeId: string): string {
  return `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`;
}
export function googleWriteReviewHref(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
