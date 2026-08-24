import React, { useEffect } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  ReceiptText,
  Sparkles,
  Tag,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { NavBar } from '../components/NavBar';

const mechanismSteps = [
  {
    label: 'Content',
    copy: 'A creator publishes approved campaign content for a local audience.',
    icon: Sparkles,
  },
  {
    label: 'Offer',
    copy: 'The content points people to a campaign offer with a clear next step.',
    icon: Tag,
  },
  {
    label: 'Verified Visit',
    copy: 'Eligible in-store activity is checked against the campaign offer flow.',
    icon: MapPin,
  },
  {
    label: 'Redemption / Revenue',
    copy: 'Review redemptions and revenue signals in the context of the campaign.',
    icon: CircleDollarSign,
  },
];

const workflowSteps = [
  ['01', 'Brief the growth goal', 'Describe the location, offer, audience, timing, and outcome you want to learn about.'],
  ['02', 'Match and coordinate creators', 'Use local creator discovery, applications, scheduling, and campaign handoffs in one workflow.'],
  ['03', 'Review the work before it goes live', 'Keep briefs, drafts, deliverables, and offer details clear for everyone involved.'],
  ['04', 'Learn from verified activity', 'Connect content and offers to visit, redemption, and revenue signals so the next campaign has context.'],
];

const capabilities = [
  { icon: UsersRound, title: 'Local creator operations', copy: 'Coordinate matching, applications, scheduling, and campaign communication around your business.' },
  { icon: ReceiptText, title: 'Offer and deliverable control', copy: 'Keep the brief, offer terms, drafts, approvals, and required deliverables connected.' },
  { icon: MapPin, title: 'Offline attribution', copy: 'Use verified visit and redemption signals to connect creator activity with what happens in the store.' },
  { icon: BarChart3, title: 'Campaign-level learning', copy: 'Review creator, offer, content, and location signals together before deciding what to repeat.' },
];

export const Merchants: React.FC = () => {
  useEffect(() => {
    document.title = 'For Merchants | hOpOn';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-hopon-black">
      <NavBar />
      <main className="pt-[74px] md:pt-[84px]">
        <section className="overflow-hidden bg-[#F7F2E8] px-5 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24 lg:px-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">For merchants</p>
              <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[0.95] md:text-7xl">
                Run creator campaigns that reach the store, not just the feed.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-black/68 md:text-xl md:leading-8">
                hOpOn coordinates end-to-end creator campaigns and connects content to trackable offers, verified in-store visits, redemptions, and revenue signals.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/pricing"
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-hopon-black px-6 py-4 font-display text-sm font-bold uppercase text-white transition-colors hover:bg-hopon-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
                >
                  View Pricing
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg border border-black bg-white px-6 py-4 font-display text-sm font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
                >
                  Book a Demo
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/45">Campaign operating view</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">From brief to proof.</h2>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-hopon-black text-white">
                  <BarChart3 className="h-5 w-5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {['Growth goal captured', 'Offer and brief connected', 'Visit verification configured', 'Outcome review ready'].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#FAF7F1] p-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2F7D5B]" aria-hidden="true" />
                    <span className="font-display text-sm font-bold">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-black/58">
                A campaign view designed to keep the handoff from creator content to offline learning visible.
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="merchant-mechanism-title"
          className="border-b border-black/10 bg-white px-5 py-20 md:px-12 md:py-28 lg:px-16"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Offline attribution, made legible</p>
              <h2 id="merchant-mechanism-title" className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
                Follow the path from content to an in-store outcome.
              </h2>
              <p className="mt-5 text-base leading-7 text-black/68 md:text-lg md:leading-8">
                The useful question is not only who posted. It is what happened after someone saw the content and acted on the offer.
              </p>
            </div>

            <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {mechanismSteps.map(({ label, copy, icon: Icon }, index) => (
                <li key={label} className="relative rounded-3xl border border-black/10 bg-[#F7F2E8] p-5 md:p-6">
                  {index < mechanismSteps.length - 1 ? (
                    <ArrowRight className="pointer-events-none absolute -right-3 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-hopon-red lg:block" aria-hidden="true" />
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-hopon-black">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">0{index + 1}</span>
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-bold leading-tight">{label}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/62">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="merchant-workflow-title" className="bg-[#F7F2E8] px-5 py-20 md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">The workflow</p>
                <h2 id="merchant-workflow-title" className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
                  One operating rhythm for every campaign.
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-black/68 md:text-lg md:leading-8">
                  Keep strategy, creator coordination, content review, and offline learning in the same campaign context.
                </p>
              </div>

              <ol className="grid gap-3">
                {workflowSteps.map(([number, title, copy]) => (
                  <li key={number} className="grid gap-4 rounded-3xl border border-black/10 bg-white p-5 md:grid-cols-[70px_0.78fr_1.22fr] md:items-start md:p-6">
                    <span className="font-mono text-sm font-bold text-hopon-red">{number}</span>
                    <h3 className="font-display text-xl font-bold leading-tight">{title}</h3>
                    <p className="text-sm leading-6 text-black/62">{copy}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-16 border-t border-black/10 pt-10">
              <div className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Built for local operators</p>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl">The details that make growth repeatable.</h2>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {capabilities.map(({ icon: Icon, title, copy }) => (
                  <article key={title} className="rounded-3xl border border-black/10 bg-white p-5 md:p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7F2E8]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-6 font-display text-2xl font-bold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/62">{copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-hopon-black px-5 py-20 text-white md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Ready when you are</p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">Make your next campaign easier to learn from.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 md:text-lg md:leading-8">
                See how the hOpOn workflow fits your location, audience, and growth goals.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
              <Link
                to="/pricing"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 font-display text-sm font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-red hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2 focus-visible:ring-offset-hopon-black"
              >
                View Pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-[52px] items-center justify-center rounded-lg border border-white/50 px-5 py-3 font-display text-sm font-bold uppercase text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2 focus-visible:ring-offset-hopon-black"
              >
                Book a Demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Merchants;
