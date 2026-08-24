import React from 'react';
import { ArrowRight, Building2, Handshake, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const audiences = [
  {
    key: 'merchants',
    title: 'For Merchants',
    copy: 'Plan creator campaigns, coordinate the work, and connect content to verified in-store visits, redemptions, and revenue signals.',
    href: '/merchants',
    cta: 'Explore for Merchants',
    icon: Building2,
    primary: true,
  },
  {
    key: 'creators',
    title: 'For Creators',
    copy: 'Find relevant local campaign opportunities, follow clear briefs, and deliver content on a schedule that works for the campaign.',
    href: '/creators',
    cta: 'Join as a Creator',
    icon: UsersRound,
    primary: false,
  },
  {
    key: 'partners',
    title: 'For Partners',
    copy: 'Explore co-campaigns and attribution workflows with platforms, associations, agencies, and local commerce ecosystems.',
    href: '/partners',
    cta: 'Explore Partnerships',
    icon: Handshake,
    primary: false,
  },
];

export const AudienceSection: React.FC = () => {
  return (
    <section
      id="audiences"
      aria-labelledby="audiences-title"
      className="scroll-mt-28 border-t border-black/10 bg-white px-6 py-20 md:px-12 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Who it&apos;s for</p>
          <h2 id="audiences-title" className="font-display text-4xl font-bold leading-tight text-hopon-black md:text-6xl">
            One growth platform. Three ways in.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-black/68 md:text-lg md:leading-8">
            hOpOn brings the people and workflows around local growth into one place, with a clear role for every participant.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {audiences.map(({ key, title, copy, href, cta, icon: Icon, primary }) => (
            <article
              key={key}
              className={`group flex min-h-[250px] flex-col justify-between rounded-[28px] border p-6 transition-transform duration-300 hover:-translate-y-1 md:p-8 ${
                primary
                  ? 'border-hopon-black bg-hopon-black text-white shadow-[0_24px_70px_rgba(0,0,0,0.16)] lg:col-span-2'
                  : 'border-black/10 bg-[#F7F2E8] text-hopon-black hover:border-hopon-red/35'
              }`}
            >
              <div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${primary ? 'bg-white text-hopon-black' : 'bg-white text-hopon-black'}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className={`mt-7 font-display text-3xl font-bold leading-tight ${primary ? 'text-white' : 'text-hopon-black'}`}>
                  {title}
                </h3>
                <p className={`mt-3 max-w-2xl text-sm leading-6 md:text-base ${primary ? 'text-white/72' : 'text-black/65'}`}>
                  {copy}
                </p>
              </div>
              <Link
                to={href}
                className={`mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-lg border px-4 py-3 font-display text-sm font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hopon-red focus-visible:ring-offset-2 ${
                  primary
                    ? 'border-white bg-white text-hopon-black hover:bg-hopon-red hover:text-white'
                    : 'border-black bg-white text-hopon-black hover:bg-hopon-black hover:text-white'
                }`}
              >
                {cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
