import React, { useEffect } from 'react';
import { ArrowRight, BarChart3, Handshake, Layers3, Network, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { NavBar } from '../components/NavBar';

const partnerAudiences = [
  {
    icon: Store,
    title: 'Booking and reservation platforms',
    copy: 'Explore ways to connect local demand, creator-led discovery, and the moments when a visit actually happens.',
  },
  {
    icon: Network,
    title: 'Restaurant associations and DMOs',
    copy: 'Discuss neighborhood or destination programs that help local businesses and creators work from a shared brief.',
  },
  {
    icon: Handshake,
    title: 'Agencies and creator networks',
    copy: 'Coordinate creator operations, campaign handoffs, and outcome reviews around the teams you already support.',
  },
  {
    icon: Layers3,
    title: 'Local-commerce and loyalty ecosystems',
    copy: 'Look at how offers, visits, and campaign learning could support a stronger local growth loop.',
  },
];

const collaborationModes = [
  {
    icon: UsersIcon,
    title: 'Creator operations',
    copy: 'Coordinate briefs, matching, scheduling, and deliverables around your existing audience or service.',
  },
  {
    icon: Handshake,
    title: 'Co-campaigns',
    copy: 'Design a local activation with shared goals, offer details, and clear handoffs between teams.',
  },
  {
    icon: MapSignalsIcon,
    title: 'Verified visit attribution',
    copy: 'Explore how offer and visit signals could make campaign outcomes easier to review together.',
  },
  {
    icon: BarChart3,
    title: 'Data-informed planning',
    copy: 'Use campaign learnings to decide which neighborhoods, audiences, or operating patterns deserve attention next.',
  },
];

function UsersIcon({ className = '' }: { className?: string }) {
  return <Network className={className} aria-hidden="true" />;
}

function MapSignalsIcon({ className = '' }: { className?: string }) {
  return <BarChart3 className={className} aria-hidden="true" />;
}

export const Partners: React.FC = () => {
  useEffect(() => {
    document.title = 'For Partners | hOpOn';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-hopon-black">
      <NavBar />
      <main className="pt-[74px] md:pt-[84px]">
        <section className="overflow-hidden bg-[#F7F2E8] px-5 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24 lg:px-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">For partners</p>
              <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[0.95] md:text-7xl">
                Build a measurable local growth loop together.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-black/68 md:text-xl md:leading-8">
                hOpOn works with organizations that already convene local businesses, creators, visitors, or commerce workflows. Let&apos;s explore a useful collaboration around creator operations and offline attribution.
              </p>
              <div className="mt-8">
                <Link
                  to="/contact"
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-hopon-black px-6 py-4 font-display text-sm font-bold uppercase text-white transition-colors hover:bg-hopon-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
                >
                  Discuss a Partnership
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">A conversation starter</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">Bring the right pieces together.</h2>
                </div>
                <Handshake className="h-7 w-7 text-hopon-red" aria-hidden="true" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {['Local businesses', 'Creators', 'Verified activity'].map((item) => (
                  <div key={item} className="rounded-2xl border border-black/10 bg-[#F7F2E8] p-4 text-center">
                    <p className="font-display text-sm font-bold">{item}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-black/58">
                We can start with the workflow, audience, and outcome that matter to your organization.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="partner-audiences-title" className="bg-white px-5 py-20 md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Who we can explore with</p>
              <h2 id="partner-audiences-title" className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
                Useful conversations start with the ecosystem around the visit.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {partnerAudiences.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="rounded-3xl border border-black/10 bg-[#F7F2E8] p-5 md:p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold leading-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/62">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="collaboration-modes-title" className="bg-[#F7F2E8] px-5 py-20 md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Ways to collaborate</p>
              <h2 id="collaboration-modes-title" className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
                Start with the operating problem. Shape the right collaboration.
              </h2>
              <p className="mt-5 text-base leading-7 text-black/68 md:text-lg md:leading-8">
                We begin with the operating problem, then define the right collaboration model together.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {collaborationModes.map(({ icon: Icon, title, copy }) => (
                <article key={title} className="rounded-3xl border border-black/10 bg-white p-5 md:p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F2E8]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold leading-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/62">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-hopon-black px-5 py-20 text-white md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Let&apos;s compare notes</p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">Have a local growth workflow in mind?</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 md:text-lg md:leading-8">
                Tell us who you serve, what you are trying to improve, and where creator operations or verified visit attribution might fit.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-display text-sm font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2 focus-visible:ring-offset-hopon-black"
            >
              Discuss a Partnership
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Partners;
