import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from './Footer';
import { NavBar } from './NavBar';
import { getPublishedGeneratedPages, type GeneratedPageSummary } from '../lib/supabaseClient';

const setMetaDescription = (description: string) => {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description;
};

const PageCard: React.FC<{ page: GeneratedPageSummary; large?: boolean }> = ({ page, large = false }) => (
  <Link
    to={page.href}
    className={`group block border-2 border-black bg-white p-6 transition-colors hover:bg-hopon-grey ${
      large ? 'md:p-10' : 'md:p-8'
    }`}
  >
    <div className="mb-6 flex items-center justify-between gap-4">
      <span className="font-mono text-xs uppercase tracking-widest text-hopon-red">
        {page.pageType}
      </span>
      {page.publishedAt && (
        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          Published
        </span>
      )}
    </div>
    <h3 className={`font-display font-bold uppercase leading-none tracking-tight ${large ? 'text-4xl md:text-6xl' : 'text-3xl'}`}>
      {page.title}
    </h3>
    {page.metaDescription && (
      <p className="mt-5 font-mono text-sm leading-relaxed text-black/70">
        {page.metaDescription}
      </p>
    )}
    <span className="mt-8 inline-block font-mono text-xs uppercase tracking-widest text-black group-hover:text-hopon-red">
      Open page →
    </span>
  </Link>
);

export const GeoDirectoryPage: React.FC = () => {
  const [pages, setPages] = useState<GeneratedPageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Discover | hOpOn';
    setMetaDescription('Browse published hOpOn discovery guides and merchant pages.');

    let active = true;
    getPublishedGeneratedPages().then((nextPages) => {
      if (active) {
        setPages(nextPages);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const discoveryPages = pages.filter((page) => page.pageType === 'discovery');
  const merchantPages = pages.filter((page) => page.pageType === 'merchant');
  const featuredPages = discoveryPages.length > 0 ? discoveryPages : merchantPages.slice(0, 1);
  const secondaryMerchants =
    discoveryPages.length > 0 ? merchantPages : merchantPages.filter((page) => page.slug !== featuredPages[0]?.slug);

  return (
    <div className="min-h-screen bg-white text-hopon-black">
      <NavBar />
      <main>
        <header className="border-b border-black px-4 pb-16 pt-36 md:px-8">
          <div className="mx-auto max-w-[1920px] border-t border-black pt-8">
            <div className="mb-20 flex items-start justify-between gap-8">
              <p className="font-mono text-xs uppercase tracking-widest text-black/60">
                Published GEO pages
              </p>
              <p className="hidden text-right font-mono text-xs uppercase tracking-widest text-black/60 md:block">
                Discovery
                <br />
                Merchant pages
              </p>
            </div>
            <h1 className="font-display text-6xl font-bold uppercase leading-[0.85] tracking-tighter md:text-8xl lg:text-9xl">
              Discover hOpOn
            </h1>
            <p className="mt-8 max-w-2xl font-mono text-sm leading-relaxed text-black/70">
              Browse live discovery guides and merchant pages generated from published hOpOn content.
            </p>
          </div>
        </header>

        {loading ? (
          <section className="px-6 py-20 md:px-12 lg:px-24">
            <p className="font-display text-2xl font-bold uppercase tracking-tight">Loading published pages...</p>
          </section>
        ) : pages.length === 0 ? (
          <section className="px-6 py-20 md:px-12 lg:px-24">
            <div className="mx-auto max-w-4xl border-2 border-black p-8 md:p-10">
              <p className="mb-4 font-mono text-xs uppercase tracking-widest text-black/50">
                No published pages
              </p>
              <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">
                Nothing is live yet.
              </h2>
              <p className="mt-6 font-mono text-sm leading-relaxed text-black/70">
                Publish merchant or discovery pages from the app, then they will appear here automatically.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section className="border-b border-black px-6 py-20 md:px-12 lg:px-24">
              <div className="mx-auto max-w-7xl">
                <div className="mb-10 flex flex-col gap-4 border-b border-black pb-8 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-black/50">
                      Start here
                    </p>
                    <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">
                      Featured pages.
                    </h2>
                  </div>
                  <p className="max-w-md font-mono text-sm leading-relaxed text-black/70">
                    Discovery pages appear first. If none are published yet, the newest merchant page becomes the entry point.
                  </p>
                </div>
                <div className="grid gap-6">
                  {featuredPages.map((page) => (
                    <PageCard key={page.href} page={page} large />
                  ))}
                </div>
              </div>
            </section>

            {secondaryMerchants.length > 0 && (
              <section className="border-b border-black px-6 py-20 md:px-12 lg:px-24">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-10 border-b border-black pb-8">
                    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-black/50">
                      Merchant pages
                    </p>
                    <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">
                      Places to open.
                    </h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {secondaryMerchants.map((page) => (
                      <PageCard key={page.href} page={page} />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};
