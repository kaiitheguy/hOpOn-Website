import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Footer } from './Footer';
import { NavBar } from './NavBar';
import { OutboundCTA } from './OutboundCTA';
import type { GeoDiscoveryPage as GeoDiscoveryPageData, GeoMerchant } from '../lib/geoMockData';
import { getDiscoveryPageBySlug, getMerchantPageBySlug } from '../lib/supabaseClient';

const setMetaDescription = (description: string) => {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description;
};

const NotFoundState: React.FC = () => (
  <div className="min-h-screen bg-white">
    <NavBar />
    <main className="px-6 pb-24 pt-36 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl border-t-2 border-black pt-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-black/60">
          404 / discovery
        </p>
        <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-tighter md:text-7xl">
          Discovery page not found.
        </h1>
        <Link
          to="/discover/best-asian-dessert-nyc"
          className="mt-8 inline-flex min-h-12 items-center border-2 border-black bg-hopon-black px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-hopon-red"
        >
          View Asian dessert
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

const LoadingState: React.FC = () => (
  <div className="min-h-screen bg-white">
    <NavBar />
    <main className="px-6 pb-24 pt-36 md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl border-t-2 border-black pt-10">
        <p className="font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
          Loading discovery...
        </p>
      </div>
    </main>
  </div>
);

const getLocalMockDiscoveryPage = async (
  slug: string
): Promise<GeoDiscoveryPageData | null> => {
  if (!import.meta.env.DEV) return null;
  const { getGeoDiscoveryPage } = await import('../lib/geoMockData');
  return getGeoDiscoveryPage(slug);
};

const getLocalMockMerchant = async (slug: string): Promise<GeoMerchant | null> => {
  if (!import.meta.env.DEV) return null;
  const { getGeoMerchant } = await import('../lib/geoMockData');
  return getGeoMerchant(slug);
};

export const GeoDiscoveryPage: React.FC = () => {
  const { slug } = useParams();
  const [page, setPage] = useState<GeoDiscoveryPageData | null>(null);
  const [merchants, setMerchants] = useState<GeoMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDiscovery = async () => {
      setLoading(true);

      if (!slug) {
        if (active) {
          setPage(null);
          setMerchants([]);
          setLoading(false);
        }
        return;
      }

      const livePage = await getDiscoveryPageBySlug(slug);
      const fallbackPage = livePage ? null : await getLocalMockDiscoveryPage(slug);
      const nextPage = livePage ?? fallbackPage;

      const nextMerchants = nextPage
        ? await Promise.all(
            nextPage.merchantSlugs.map(async (merchantSlug) => {
              const liveMerchant = await getMerchantPageBySlug(merchantSlug);
              const fallbackMerchant = liveMerchant ? null : await getLocalMockMerchant(merchantSlug);
              return liveMerchant ?? fallbackMerchant;
            })
          )
        : [];

      if (active) {
        setPage(nextPage);
        setMerchants(nextMerchants.filter((merchant): merchant is GeoMerchant => Boolean(merchant)));
        setLoading(false);
      }
    };

    loadDiscovery();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!page) {
      document.title = 'Discovery Page Not Found | hOpOn';
      setMetaDescription('The requested hOpOn discovery page could not be found.');
      return;
    }
    document.title = page.seoTitle;
    setMetaDescription(page.seoDescription);
  }, [page]);

  if (loading) return <LoadingState />;
  if (!page) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-white text-hopon-black">
      <NavBar />
      <main>
        <header className="relative min-h-[78vh] overflow-hidden border-b border-black px-4 pb-12 pt-32 md:px-8">
          <div className="absolute inset-0 z-0 opacity-[0.14] mix-blend-multiply">
            <img
              src={page.heroImage}
              alt=""
              className="h-full w-full object-cover grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/75 to-white" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[calc(78vh-8rem)] max-w-[1920px] flex-col justify-end border-t border-black pt-8">
            <div className="mb-12 flex items-start justify-between gap-8">
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-black/60">
                {page.eyebrow}
              </p>
              <p className="hidden text-right font-mono text-xs font-medium uppercase tracking-widest text-black/60 md:block">
                {page.category}
                <br />
                {page.city}
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:items-end">
              <div>
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-hopon-red">
                  hOpOn discovery
                </p>
                <h1 className="font-display text-6xl font-bold uppercase leading-[0.85] tracking-tighter md:text-8xl lg:text-9xl">
                  {page.title}
                </h1>
              </div>
              <div className="lg:text-right">
                <h2 className="mb-6 font-display text-3xl font-bold uppercase leading-none tracking-tight md:text-5xl">
                  {page.headline}
                </h2>
                <p className="font-mono text-sm leading-relaxed tracking-wide text-black/75">
                  {page.intro}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid border-b border-black lg:grid-cols-[420px_1fr]">
          <div className="border-b border-black bg-hopon-grey p-8 lg:border-b-0 lg:border-r lg:p-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-black/50">
              Why this guide
            </p>
            <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
              Local intent needs a clear result.
            </h2>
          </div>
          <div className="grid md:grid-cols-2">
            {page.sections.map((section) => (
              <article key={section.heading} className="border-b border-black p-8 md:border-b-0 md:border-r md:p-12 last:border-r-0">
                <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight">
                  {section.heading}
                </h3>
                <p className="font-mono text-sm leading-relaxed text-black/75">{section.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-b border-black px-6 py-20 md:px-12 lg:px-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 border-b border-black pb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-3 font-mono text-xs uppercase tracking-widest text-black/50">
                  Featured merchants
                </p>
                <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">
                  Start here.
                </h2>
              </div>
              <p className="max-w-md font-mono text-sm leading-relaxed text-black/70">
                Featured merchants are loaded from published generated pages.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {merchants.map((merchant) => (
                <Link
                  key={merchant.slug}
                  to={`/merchant/${merchant.slug}`}
                  className="group grid overflow-hidden border-2 border-black bg-white transition-colors hover:bg-hopon-grey lg:grid-cols-[220px_1fr]"
                >
                  <div className="h-56 border-b border-black bg-hopon-grey lg:h-full lg:border-b-0 lg:border-r">
                    <img
                      src={merchant.heroImage}
                      alt=""
                      className="h-full w-full object-cover grayscale transition-all group-hover:grayscale-0"
                    />
                  </div>
                  <div className="p-6">
                    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-hopon-red">
                      {merchant.category} / {merchant.neighborhood}
                    </p>
                    <h3 className="mb-4 font-display text-3xl font-bold uppercase leading-none tracking-tight">
                      {merchant.name}
                    </h3>
                    <p className="mb-6 font-mono text-sm leading-relaxed text-black/70">
                      {merchant.summary}
                    </p>
                    <span className="font-mono text-xs uppercase tracking-widest text-black group-hover:text-hopon-red">
                      View merchant →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-black px-6 py-20 md:px-12 lg:px-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-black/50">
                FAQ
              </p>
              <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-5xl">
                Search questions, answered.
              </h2>
            </div>
            <div className="divide-y divide-black border-y border-black">
              {page.faqs.map((faq) => (
                <article key={faq.question} className="py-6">
                  <h3 className="mb-3 font-display text-xl font-bold uppercase tracking-tight">
                    {faq.question}
                  </h3>
                  <p className="font-mono text-sm leading-relaxed text-black/75">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-hopon-black px-6 py-16 text-white md:px-12 lg:px-24">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">
              Follow the flavor intent.
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              {page.ctas.map((cta) => (
                <OutboundCTA key={cta.href} href={cta.href} variant={cta.variant} className="border-white">
                  {cta.label}
                </OutboundCTA>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
