export interface GeoFAQ {
  question: string;
  answer: string;
}

export interface GeoCTA {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

export interface GeoMerchant {
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  address: string;
  priceRange: string;
  heroImage: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  headline: string;
  summary: string;
  highlights: string[];
  signatureItems: string[];
  bestFor: string[];
  faqs: GeoFAQ[];
  ctas: GeoCTA[];
}

export interface GeoDiscoveryPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  headline: string;
  intro: string;
  heroImage: string;
  city: string;
  category: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  merchantSlugs: string[];
  faqs: GeoFAQ[];
  ctas: GeoCTA[];
}

export const geoMerchants: Record<string, GeoMerchant> = {
  'ando-patisserie': {
    slug: 'ando-patisserie',
    name: 'ANDO Patisserie',
    category: 'Asian dessert shop',
    neighborhood: 'New York',
    city: 'NYC',
    address: 'New York, NY',
    priceRange: '$$',
    heroImage:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1800&auto=format&fit=crop',
    seoTitle: 'ANDO Patisserie NYC | Asian Dessert Discovery | hOpOn',
    seoDescription:
      'Discover ANDO Patisserie, a NYC dessert stop for Asian-inspired pastries, black sesame flavors, and creator-friendly food moments.',
    eyebrow: 'Merchant guide / NYC dessert',
    headline: 'ANDO Patisserie brings Asian dessert energy to NYC.',
    summary:
      'ANDO Patisserie is a mock GEO profile for hOpOn discovery pages, built around visually strong pastries, Asian-inspired flavors, and dessert runs that work for friends, dates, and creator visits.',
    highlights: [
      'Asian-inspired dessert menu with photo-ready pastries',
      'Strong fit for black sesame, matcha, cream, and fruit flavor searches',
      'Built for quick discovery from local guides and creator recommendations',
    ],
    signatureItems: [
      'Black sesame dessert',
      'Asian patisserie box',
      'Seasonal fruit pastry',
      'Cream-forward dessert cup',
    ],
    bestFor: ['Asian dessert in NYC', 'Black sesame dessert', 'Creator dessert stop'],
    faqs: [
      {
        question: 'What is ANDO Patisserie known for?',
        answer:
          'In this mock profile, ANDO Patisserie is positioned around Asian-inspired pastries, black sesame desserts, and highly shareable dessert formats.',
      },
      {
        question: 'Is ANDO Patisserie a good fit for discovery pages?',
        answer:
          'Yes. The merchant maps naturally to searches like best Asian dessert NYC and best black sesame dessert NYC.',
      },
      {
        question: 'Is this connected to Supabase?',
        answer:
          'No. This page currently reads from local mock data only, so the GEO structure can be reviewed before database work begins.',
      },
    ],
    ctas: [
      {
        label: 'Visit ANDO',
        href: 'https://www.google.com/search?q=ANDO+Patisserie+NYC',
        variant: 'primary',
      },
      {
        label: 'Explore Asian Dessert',
        href: '/discover/best-asian-dessert-nyc',
        variant: 'secondary',
      },
    ],
  },
};

export const geoDiscoveryPages: Record<string, GeoDiscoveryPage> = {
  'best-asian-dessert-nyc': {
    slug: 'best-asian-dessert-nyc',
    title: 'Best Asian Dessert NYC',
    seoTitle: 'Best Asian Dessert in NYC | hOpOn Discovery',
    seoDescription:
      'A local hOpOn discovery guide for Asian dessert in NYC, featuring ANDO Patisserie and flavor-led dessert ideas.',
    eyebrow: 'Discovery guide / NYC',
    headline: 'Best Asian dessert in NYC for flavor-first dessert runs.',
    intro:
      'Asian dessert in NYC is broad: patisserie, black sesame, matcha, fruit, cream, tea, and hybrid formats. This mock discovery page starts with ANDO Patisserie as the first local merchant profile.',
    heroImage:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1800&auto=format&fit=crop',
    city: 'NYC',
    category: 'Asian dessert',
    sections: [
      {
        heading: 'What makes a strong Asian dessert stop?',
        body:
          'The best stops have clear flavor identity, dessert formats that travel well, and enough visual texture to make a recommendation feel specific.',
      },
      {
        heading: 'Why ANDO Patisserie fits this guide',
        body:
          'ANDO Patisserie gives the guide a concrete anchor for pastries, black sesame searches, and creator-friendly dessert discovery.',
      },
    ],
    merchantSlugs: ['ando-patisserie'],
    faqs: [
      {
        question: 'What counts as Asian dessert in NYC?',
        answer:
          'This guide includes Asian-inspired pastry, black sesame desserts, matcha desserts, fruit-forward sweets, and cream-based dessert formats.',
      },
      {
        question: 'Which merchant is featured first?',
        answer:
          'ANDO Patisserie is the first mock merchant included in this local discovery page.',
      },
      {
        question: 'Will this page use live merchant data later?',
        answer:
          'Yes. The current version uses local mock data only, leaving room to connect Supabase after the page structure is approved.',
      },
    ],
    ctas: [
      {
        label: 'View ANDO Patisserie',
        href: '/merchant/ando-patisserie',
        variant: 'primary',
      },
      {
        label: 'Find Black Sesame',
        href: '/discover/best-black-sesame-dessert-nyc',
        variant: 'secondary',
      },
    ],
  },
  'best-black-sesame-dessert-nyc': {
    slug: 'best-black-sesame-dessert-nyc',
    title: 'Best Black Sesame Dessert NYC',
    seoTitle: 'Best Black Sesame Dessert in NYC | hOpOn Discovery',
    seoDescription:
      'A hOpOn discovery guide for black sesame dessert in NYC, starting with ANDO Patisserie as a mock local merchant.',
    eyebrow: 'Discovery guide / black sesame',
    headline: 'Best black sesame dessert in NYC for deep, nutty flavor.',
    intro:
      'Black sesame dessert has a distinct profile: roasted, nutty, lightly bitter, and rich without being too sweet. This mock GEO page frames ANDO Patisserie as a discovery result for that intent.',
    heroImage:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1800&auto=format&fit=crop',
    city: 'NYC',
    category: 'Black sesame dessert',
    sections: [
      {
        heading: 'What to look for',
        body:
          'A strong black sesame dessert should balance roasted depth with cream, pastry, fruit, or tea notes so the flavor stays layered.',
      },
      {
        heading: 'Why this query matters',
        body:
          'Specific flavor pages can capture high-intent local discovery searches and route visitors toward a merchant profile with a clear reason to visit.',
      },
    ],
    merchantSlugs: ['ando-patisserie'],
    faqs: [
      {
        question: 'Is black sesame dessert sweet?',
        answer:
          'It is usually mildly sweet with a roasted, nutty flavor that can taste more balanced than classic sugar-forward desserts.',
      },
      {
        question: 'Where should this page send visitors?',
        answer:
          'For now, it sends visitors to the local mock merchant page for ANDO Patisserie.',
      },
      {
        question: 'Is this production merchant data?',
        answer:
          'No. It is local mock data intended to validate the GEO discovery page system before a Supabase connection is added.',
      },
    ],
    ctas: [
      {
        label: 'View ANDO Patisserie',
        href: '/merchant/ando-patisserie',
        variant: 'primary',
      },
      {
        label: 'Explore Asian Dessert',
        href: '/discover/best-asian-dessert-nyc',
        variant: 'secondary',
      },
    ],
  },
};

export const getGeoMerchant = (slug: string | undefined) =>
  slug ? geoMerchants[slug] ?? null : null;

export const getGeoDiscoveryPage = (slug: string | undefined) =>
  slug ? geoDiscoveryPages[slug] ?? null : null;
