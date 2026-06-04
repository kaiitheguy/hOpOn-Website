import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Footer } from './Footer';
import { NavBar } from './NavBar';
import { OutboundCTA } from './OutboundCTA';
import type { GeoMerchant } from '../lib/geoMockData';
import { getMerchantPageBySlug } from '../lib/supabaseClient';

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
          404 / merchant
        </p>
        <h1 className="font-display text-5xl font-bold uppercase leading-none tracking-tighter md:text-7xl">
          Merchant not found.
        </h1>
        <Link
          to="/discover/best-asian-dessert-nyc"
          className="mt-8 inline-flex min-h-12 items-center border-2 border-black bg-hopon-black px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-hopon-red"
        >
          Browse discovery
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
          Loading merchant...
        </p>
      </div>
    </main>
  </div>
);

const getLocalMockMerchant = async (slug: string): Promise<GeoMerchant | null> => {
  if (!import.meta.env.DEV) return null;
  const { getGeoMerchant } = await import('../lib/geoMockData');
  return getGeoMerchant(slug);
};

export const GeoMerchantPage: React.FC = () => {
  const { slug } = useParams();
  const [merchant, setMerchant] = useState<GeoMerchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadMerchant = async () => {
      setLoading(true);

      if (!slug) {
        if (active) {
          setMerchant(null);
          setLoading(false);
        }
        return;
      }

      const liveMerchant = await getMerchantPageBySlug(slug);
      const fallbackMerchant = liveMerchant ? null : await getLocalMockMerchant(slug);

      if (active) {
        setMerchant(liveMerchant ?? fallbackMerchant);
        setLoading(false);
      }
    };

    loadMerchant();

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!merchant) {
      document.title = 'Merchant Not Found | hOpOn';
      setMetaDescription('The requested hOpOn merchant page could not be found.');
      return;
    }
    document.title = merchant.seoTitle;
    setMetaDescription(merchant.seoDescription);
  }, [merchant]);

  if (loading) return <LoadingState />;
  if (!merchant) return <NotFoundState />;

  return (
    <div className="min-h-screen bg-white text-hopon-black">
      <NavBar />
      <main>
        <header className="relative min-h-[82vh] overflow-hidden border-b border-black px-4 pb-12 pt-32 md:px-8 md:pb-16">
          <div className="absolute inset-0 z-0 opacity-[0.16] mix-blend-multiply">
            <img
              src={merchant.heroImage}
              alt=""
              className="h-full w-full object-cover grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/70 to-white" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[calc(82vh-8rem)] max-w-[1920px] flex-col justify-end border-t border-black pt-8">
            <div className="mb-12 flex items-start justify-between gap-8">
              <p className="font-mono text-xs font-medium uppercase tracking-widest text-black/60">
                {merchant.eyebrow}
              </p>
              <p className="hidden text-right font-mono text-xs font-medium uppercase tracking-widest text-black/60 md:block">
                {merchant.neighborhood}
                <br />
                {merchant.city}
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
              <div>
                <p className="mb-4 font-mono text-xs uppercase tracking-widest text-hopon-red">
                  {merchant.category} / {merchant.priceRange}
                </p>
                <h1 className="font-display text-6xl font-bold uppercase leading-[0.85] tracking-tighter md:text-8xl lg:text-9xl">
                  {merchant.name}
                </h1>
              </div>
              <div className="lg:text-right">
                <h2 className="mb-6 font-display text-3xl font-bold uppercase leading-none tracking-tight md:text-5xl">
                  {merchant.headline}
                </h2>
                <p className="font-mono text-sm leading-relaxed tracking-wide text-black/75">
                  {merchant.summary}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid border-b border-black md:grid-cols-3">
          <div className="border-b border-black p-8 md:border-b-0 md:border-r md:p-12">
            <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight">
              Highlights
            </h2>
            <ul className="space-y-4 font-mono text-sm leading-relaxed text-black/75">
              {merchant.highlights.map((highlight) => (
                <li key={highlight} className="border-l-2 border-hopon-red pl-4">
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-b border-black bg-hopon-grey p-8 md:border-b-0 md:border-r md:p-12">
            <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight">
              Signature items
            </h2>
            <div className="flex flex-wrap gap-3">
              {merchant.signatureItems.map((item) => (
                <span
                  key={item}
                  className="border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="p-8 md:p-12">
            <h2 className="mb-6 font-display text-2xl font-bold uppercase tracking-tight">
              Best for
            </h2>
            <div className="space-y-3">
              {merchant.bestFor.map((item) => (
                <p key={item} className="font-display text-xl font-bold uppercase leading-tight">
                  {item}
                </p>
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
              {merchant.faqs.map((faq) => (
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
              Plan the next dessert stop.
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              {merchant.ctas.map((cta) => (
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
