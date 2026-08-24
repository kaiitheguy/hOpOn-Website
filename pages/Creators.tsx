import React, { useEffect } from 'react';
import { ArrowRight, CalendarDays, ClipboardCheck, FileText, Search, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppStoreBadge } from '../components/Hero';
import { Footer } from '../components/Footer';
import { NavBar } from '../components/NavBar';

const creatorSteps = [
  {
    number: '01',
    title: 'Find a relevant brief',
    copy: 'See local campaign opportunities when an active brief fits your profile, area, and content style.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Read the details',
    copy: 'Review the offer, timing, deliverables, visit expectations, and any campaign-specific terms before you decide.',
    icon: FileText,
  },
  {
    number: '03',
    title: 'Create and schedule',
    copy: 'Keep the campaign handoff clear, coordinate the schedule, and submit the agreed content through the workflow.',
    icon: CalendarDays,
  },
  {
    number: '04',
    title: 'Close the loop',
    copy: 'Track deliverable status and campaign activity so you know what is complete and what still needs attention.',
    icon: ClipboardCheck,
  },
];

export const Creators: React.FC = () => {
  useEffect(() => {
    document.title = 'For Creators | hOpOn';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-hopon-black">
      <NavBar />
      <main className="pt-[74px] md:pt-[84px]">
        <section className="overflow-hidden bg-[#F7F2E8] px-5 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24 lg:px-16">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">For creators</p>
              <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold leading-[0.95] md:text-7xl">
                Join hOpOn. Get matched with local campaigns.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-black/68 md:text-xl md:leading-8">
                hOpOn helps creators find relevant local campaign opportunities when active briefs fit their profile and area. Opportunity volume depends on local demand and active campaigns.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <AppStoreBadge />
                <Link
                  to="/contact"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-black bg-white px-5 py-3 font-display text-sm font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2"
                >
                  Talk to the team
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-5 max-w-xl text-xs leading-5 text-black/52">
                Campaign terms, timing, deliverables, and compensation vary by campaign. Review the brief before opting in.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-sm">
              <div className="rounded-[32px] border-[10px] border-hopon-black bg-hopon-black p-2 shadow-[0_24px_75px_rgba(0,0,0,0.2)]">
                <div className="rounded-[23px] bg-white p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-black/45">Creator workspace</p>
                      <h2 className="mt-1 font-display text-xl font-bold">Campaign brief</h2>
                    </div>
                    <Smartphone className="h-5 w-5 text-hopon-red" aria-hidden="true" />
                  </div>
                  <div className="mt-5 space-y-3">
                    {['Clear deliverables', 'Local timing', 'Offer details', 'Status handoff'].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-[#F7F2E8] p-3.5">
                        <div className="h-2 w-2 rounded-full bg-hopon-red" aria-hidden="true" />
                        <span className="font-display text-sm font-bold">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-6 text-black/58">One place to understand the brief before you make the commitment.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="creator-flow-title" className="bg-white px-5 py-20 md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">A clear campaign handoff</p>
              <h2 id="creator-flow-title" className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">
                Four steps from a relevant brief to a finished deliverable.
              </h2>
            </div>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {creatorSteps.map(({ number, title, copy, icon: Icon }) => (
                <li key={number} className="rounded-3xl border border-black/10 bg-[#F7F2E8] p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-black/40">{number}</span>
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-bold leading-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-black/62">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-hopon-black px-5 py-20 text-white md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/50">Join hOpOn</p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-6xl">Make your next local collaboration easier to run.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 md:text-lg md:leading-8">
                Download the app to create your creator profile and review opportunities as they become relevant to you.
              </p>
            </div>
            <AppStoreBadge className="bg-white !text-hopon-black hover:bg-hopon-red hover:!text-white" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Creators;
