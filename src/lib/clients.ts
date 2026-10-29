/**
 * One JSON file per client in src/clients/. The file name is the URL slug:
 *   src/clients/yordan-pokrivi.json  →  /yordan-pokrivi/
 * The client marked "default": true is also served at the site root.
 * Files in src/clients/_examples/ are starting points for `npm run new-client`
 * and are never deployed.
 */

/** Page sections, in the order they should appear. Any can be left out. */
export type SectionId =
  | 'hero'
  | 'trust'
  | 'services'
  | 'prices'
  | 'process'
  | 'gallery'
  | 'team'
  | 'reviews'
  | 'booking'
  | 'contact';

/** The layout a trades business gets when `sections` is not set. */
export const DEFAULT_SECTIONS: SectionId[] = ['hero', 'trust', 'services', 'process', 'reviews', 'contact'];

export interface PriceItem {
  name: string;
  price: string;        // free text the owner writes: "25 €", "от 180 €", "по договаряне"
  duration?: string;    // "30 мин" — salons
  note?: string;
}

export interface CalculatorInput {
  id: string;
  label: string;
  /** "number": a quantity (m², pieces). "select": one of `options`. "checkbox": an extra. */
  type: 'number' | 'select' | 'checkbox';
  min?: number;
  max?: number;
  step?: number;
  default?: number | string | boolean;
  unit?: string;        // shown after a number input, e.g. "кв. м"
  /** select: each option carries a factor (multiplier) and/or a rate range per unit;
   *  checkbox: `add` is a fixed amount added when ticked. */
  options?: { label: string; value: string; factor?: number; rate?: [number, number] }[];
  add?: [number, number];
}

export interface Client {
  slug: string;
  default?: boolean;
  /** Section order. Defaults to DEFAULT_SECTIONS. */
  sections?: SectionId[];
  /** "calm" (default): paper and graphite, quiet motion.
   *  "bold": dark, animated colour field, glass surfaces, glow. */
  style?: 'calm' | 'bold';
  /** bold only: the animated scene behind the page. Default "aurora" (colour field only).
   *  trails (night road), stripes (barber pole), waves (strands), circuit (traces & pulses),
   *  rain, airflow (warm/cool currents). */
  ambient?: 'aurora' | 'trails' | 'stripes' | 'waves' | 'circuit' | 'rain' | 'airflow';
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
    instagram?: string;     // full URL
    facebook?: string;      // full URL
    yearsExperience?: number;
    eik?: string;           // company id for the footer
  };
  seo: {
    /** Put the service and city first: "Ремонт на покриви София — Покриви Иванов" */
    title: string;
    description: string;
    /** true for demos and pitches: tells Google not to index the page. */
    noindex?: boolean;
    /** schema.org business type, e.g. "RoofingContractor", "HVACBusiness", "HairSalon",
     *  "BarberShop", "AutoRepair", "MobilePhoneStore". Default "LocalBusiness". */
    schemaType?: string;
    /** schema.org openingHoursSpecification shorthand, e.g. ["Mo-Sa 08:00-19:00"] */
    openingHours?: string[];
    /** e.g. "€€" */
    priceRange?: string;
    /** Links that prove it is the same business: Google Maps listing, Facebook page… */
    sameAs?: string[];
    /** Geo of the business address, if known, for the structured data. */
    geo?: { lat: number; lng: number };
  };
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
    ctaRequest?: string;    // second button label; defaults to "Заявете оглед"
    /** Where the second button goes. Defaults to #zapazi when there is a booking section, else #zayavka. */
    ctaRequestHref?: string;
  };
  trust?: { title: string; text: string }[];
  servicesTitle?: string;   // default "С какво можем да помогнем"
  /** Footnote under the services; "" hides it. Default: the "не откривате вашия случай?" line. */
  servicesNote?: string;
  services?: { title: string; text: string; image: string; imageAlt: string }[];
  process?: { title: string; text: string }[];
  /** Price list, model/repair lookup, or estimate calculator. */
  prices?: {
    title?: string;
    intro?: string;
    /** "list": groups of items. "lookup": cascading selects down a tree to a price.
     *  "calculator": inputs → estimated range. */
    mode: 'list' | 'lookup' | 'calculator';
    /** Small print shown under the prices, e.g. "Цените са ориентировъчни…" */
    note?: string;
    /** Button under the prices; defaults to the hero's second CTA. */
    cta?: string;
    ctaHref?: string;
    // list
    groups?: { title?: string; items: PriceItem[] }[];
    // lookup
    lookup?: {
      labels: string[];                           // one label per select level, e.g. ["Марка", "Модел", "Ремонт"]
      tree: Record<string, any>;                  // nested objects; leaves are price strings
      placeholder?: string;                       // text before anything is chosen
    };
    // calculator
    calculator?: {
      /** "rate": price = Σ(rate × quantity × factors) + extras.
       *  "tiers": effective quantity = quantity × factors → first tier whose `upTo` ≥ it. */
      kind: 'rate' | 'tiers';
      quantityInput: string;                      // id of the number input that is the quantity
      inputs: CalculatorInput[];
      tiers?: { upTo: number; label: string; price: [number, number] }[];
      currency?: string;                          // default "€"
      resultLabel?: string;                       // default "Ориентировъчна цена"
      resultHint?: string;                        // one line under the result
    };
  };
  gallery?: {
    title?: string;
    intro?: string;
    images: { src: string; alt: string }[];
  };
  team?: {
    title?: string;
    intro?: string;
    members: { name: string; role: string; image?: string; note?: string }[];
  };
  reviews?: {
    /** true while the reviews are placeholders → a small notice is shown */
    sample?: boolean;
    items: { name: string; text: string; when?: string }[];
  };
  /** Appointment booking: a link/embed to the app the business already uses,
   *  or a built-in "request a time" form that reaches the owner's phone. */
  booking?: {
    title?: string;
    intro?: string;
    /** external: link/embed the app they already use. request: built-in form → owner's phone.
     *  schedule: live booking with real availability through Cal.com (free), with a
     *  service + staff picker on the page. */
    mode: 'external' | 'request' | 'schedule';
    schedule?: {
      /** Cal.com usernames, one per barber/stylist. A single entry hides the picker. */
      staff: { name: string; username: string; note?: string }[];
      /** Each service is a Cal.com event type; `slug` is its URL slug (same on every staff account). */
      services: { name: string; slug: string; duration: number; price?: string }[];
      /** demo: no real calendars yet — show a realistic slot grid that does not book. */
      demo?: boolean;
      /** demo only: opening hours used to generate slots */
      demoHours?: { open: string; close: string; closedDays: number[] };
      theme?: 'auto' | 'light' | 'dark';
    };
    // external
    url?: string;
    embed?: boolean;             // true: show the booking page in an iframe as well as the button
    buttonLabel?: string;
    // request
    services?: string[];         // what can be booked
    timeWindows?: string[];      // e.g. ["Сутрин (9–12)", "Следобед (13–18)"]
    noteLabel?: string;
    noteHint?: string;
    endpoint?: string;           // POST target; without it the request goes by SMS
  };
  form: {
    /** false hides the request form in the contact section (e.g. when booking covers it). */
    enabled?: boolean;
    title?: string;
    intro?: string;
    /** Optional POST endpoint (Formspree, Web3Forms, your own). Without it, the
     *  form opens the phone's SMS app with the message pre-filled. */
    endpoint?: string;
    problemLabel?: string;   // label for the free-text field
    problemHint?: string;    // placeholder text
    areaLabel?: string;
    submitLabel?: string;
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

export function defaultClient(): Client | undefined {
  const all = loadClients();
  return all.find((c) => c.default);
}

export function sectionsOf(client: Client): SectionId[] {
  return client.sections?.length ? client.sections : DEFAULT_SECTIONS;
}

/** The anchor the "second" call to action points at. */
export function requestHref(client: Client): string {
  if (client.hero.ctaRequestHref) return client.hero.ctaRequestHref;
  const s = sectionsOf(client);
  if (s.includes('booking')) return '#zapazi';
  if (client.form?.enabled !== false && s.includes('contact')) return '#zayavka';
  if (s.includes('prices')) return '#ceni';
  return '#kontakt';
}

export function requestLabel(client: Client): string {
  return client.hero.ctaRequest ?? (sectionsOf(client).includes('booking') ? 'Запазете час' : 'Заявете оглед');
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

/** WCAG relative luminance of a hex colour. */
export function luminance(hex: string): number {
  const m = hex.replace('#', '');
  const n = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(parseInt(n.slice(0, 2), 16)) + 0.7152 * f(parseInt(n.slice(2, 4), 16)) + 0.0722 * f(parseInt(n.slice(4, 6), 16));
}
/** Contrast ratio between two hex colours. */
export function contrast(a: string, b: string): number {
  const l1 = luminance(a), l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
/** Text colour for things painted in the accent: white when it passes AA on the accent, otherwise near-black. */
export function onAccent(accent: string): string {
  return contrast('#ffffff', accent) >= 4.5 ? '#ffffff' : '#10131a';
}

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
