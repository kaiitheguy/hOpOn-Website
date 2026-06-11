import React from 'react';
import { ArrowRight, CheckCircle2, Download, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const APP_STORE_URL = 'https://apps.apple.com/us/app/hopon-%E4%B8%B2%E5%BA%97/id6757418054';

const outcomeCards = [
  {
    merchant: 'Sweet Atelier NYC',
    campaign: 'Spring Matcha Collection',
    visits: '34',
    revenue: '$1,420',
  },
  {
    merchant: 'Jade Tea House',
    campaign: 'Summer Drinks Launch',
    visits: '58',
    revenue: '$2,110',
  },
  {
    merchant: 'Mori Bakehouse',
    campaign: 'Weekend Pastry Drop',
    visits: '46',
    revenue: '$1,760',
  },
];

function AppStoreBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex min-h-[54px] items-center justify-center gap-3 rounded-lg bg-hopon-black px-5 py-3 text-white transition-colors hover:bg-hopon-red ${className}`}
    >
      <Download className="h-5 w-5" />
      <span className="text-left">
        <span className="block font-mono text-[10px] uppercase leading-none text-white/70">Download on the</span>
        <span className="block font-display text-lg font-bold leading-tight">App Store</span>
      </span>
    </a>
  );
}

function HeroPhone() {
  return (
    <div className="hero-phone-shell relative mx-auto w-[236px] rounded-[44px] border-[10px] border-hopon-black bg-hopon-black shadow-[0_24px_80px_rgba(0,0,0,0.22)] md:w-[276px] lg:w-[292px] xl:w-[306px]">
      <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-hopon-black" />
      <div className="overflow-hidden rounded-[32px] bg-white">
        <div className="hero-phone-media relative h-[270px] overflow-hidden md:h-[330px] lg:h-[390px]">
          <img
            src="/assets/premium-asian-bakery-campaign.png"
            alt="Premium matcha pastry campaign demo"
            className="hero-phone-image h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="font-mono text-[10px] uppercase text-white/70">Atelier Matcha</p>
            <h3 className="mt-1 font-display text-2xl font-bold leading-tight">Strawberry Matcha Roll</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between lg:mb-4">
            <div>
              <p className="font-mono text-[10px] uppercase text-black/50">Campaign status</p>
              <p className="font-display text-lg font-bold text-[#2F7D5B]">Complete</p>
            </div>
            <CheckCircle2 className="h-7 w-7 text-[#2F7D5B]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-hopon-grey p-3">
              <div className="font-display text-2xl font-bold text-hopon-black">42</div>
              <div className="font-mono text-[10px] uppercase text-black/50">Visits</div>
            </div>
            <div className="rounded-2xl bg-[#F5E7C8] p-3 text-[#6A4A11]">
              <div className="font-display text-2xl font-bold">$1,680</div>
              <div className="font-mono text-[10px] uppercase">Revenue</div>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-black/10 p-3 lg:mt-4">
            <p className="font-display text-sm font-bold text-hopon-black">Top creator</p>
            <p className="mt-1 text-xs text-black/60">Chinese dessert creator · 16 visits</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutcomeCard({ card, className = '' }: { card: (typeof outcomeCards)[number]; className?: string; key?: React.Key }) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.08)] ${className}`}>
      <p className="font-mono text-[10px] uppercase text-black/50">{card.merchant}</p>
      <h2 className="mt-1 min-h-[44px] font-display text-base font-bold leading-tight text-hopon-black">{card.campaign}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div>
          <div className="font-display text-xl font-bold text-hopon-black">{card.visits}</div>
          <div className="font-mono text-[10px] uppercase text-black/50">Visits</div>
        </div>
        <div>
          <div className="font-display text-xl font-bold text-[#6A4A11]">{card.revenue}</div>
          <div className="font-mono text-[10px] uppercase text-black/50">Revenue</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#2F7D5B]">
        <CheckCircle2 className="h-4 w-4" />
        Campaign Complete
      </div>
    </div>
  );
}

function OutcomeCards({ compact = false }: { compact?: boolean }) {
  if (!compact) {
    return (
      <>
        <OutcomeCard card={outcomeCards[0]} className="hero-float-card absolute left-0 top-16 z-10 w-48 xl:left-5 xl:w-56" />
        <OutcomeCard card={outcomeCards[1]} className="hero-float-card hero-float-delay absolute bottom-20 right-0 z-10 w-48 xl:right-6 xl:w-56" />
        <OutcomeCard card={outcomeCards[2]} className="hero-float-card hero-float-delay-2 absolute bottom-4 left-8 z-10 w-44 xl:left-12 xl:w-52" />
      </>
    );
  }

  return (
    <div className="mt-5 grid gap-3">
      {outcomeCards.map((card) => (
        <OutcomeCard key={card.merchant} card={card} />
      ))}
    </div>
  );
}

function RoiGrowthCard() {
  const points = [
    [14, 118],
    [54, 110],
    [94, 95],
    [134, 84],
    [174, 58],
    [214, 34],
  ];
  const line = points.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="hero-roi-card pointer-events-none absolute right-0 top-10 hidden w-60 rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.16)] lg:block xl:right-2 xl:w-64">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase text-black/50">ROI Growth</p>
          <p className="mt-1 font-display text-3xl font-bold text-hopon-black">+38%</p>
        </div>
        <div className="rounded-full bg-[#EAF4EF] px-3 py-1 font-mono text-[10px] font-bold uppercase text-[#2F7D5B]">
          Live
        </div>
      </div>
      <svg viewBox="0 0 228 140" className="mt-5 h-36 w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="roiFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FF2A2A" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#FF2A2A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[30, 64, 98, 132].map((y) => (
          <line key={y} x1="8" x2="220" y1={y} y2={y} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        ))}
        <polygon points={`14,132 ${line} 214,132`} fill="url(#roiFill)" />
        <polyline points={line} fill="none" stroke="#FF2A2A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
        {points.map(([x, y], index) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={index === points.length - 1 ? 7 : 4} fill="#FF2A2A" stroke="white" strokeWidth="3" />
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-hopon-grey p-3">
          <p className="font-display text-xl font-bold text-hopon-black">42</p>
          <p className="font-mono text-[10px] uppercase text-black/50">Visits</p>
        </div>
        <div className="rounded-2xl bg-[#F5E7C8] p-3 text-[#6A4A11]">
          <p className="font-display text-xl font-bold">$1.7k</p>
          <p className="font-mono text-[10px] uppercase">Revenue</p>
        </div>
      </div>
    </div>
  );
}

function MiniRoiCard() {
  return (
    <div className="absolute -right-1 top-8 z-30 w-36 rounded-2xl border border-black/10 bg-white p-3 shadow-[0_16px_44px_rgba(0,0,0,0.14)]">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase text-black/50">ROI</p>
        <span className="rounded-full bg-[#EAF4EF] px-1.5 py-0.5 font-mono text-[8px] uppercase text-[#2F7D5B]">Live</span>
      </div>
      <p className="mt-1 font-display text-2xl font-bold text-hopon-black">+38%</p>
      <svg viewBox="0 0 130 52" className="mt-1 h-12 w-full" aria-hidden="true">
        <path d="M6 42 C28 40, 34 34, 50 30 S78 20, 92 14 S112 9, 124 6" fill="none" stroke="#FF2A2A" strokeLinecap="round" strokeWidth="4" />
        <path d="M6 42 C28 40, 34 34, 50 30 S78 20, 92 14 S112 9, 124 6 L124 50 L6 50 Z" fill="#FF2A2A" opacity="0.1" />
      </svg>
    </div>
  );
}

function MobileHeroVisual() {
  return (
    <div className="relative mx-auto mt-7 min-h-[590px] max-w-[360px]">
      <div className="absolute inset-x-0 top-0 z-20">
        <HeroPhone />
      </div>
      <MiniRoiCard />
      <OutcomeCard
        card={outcomeCards[0]}
        className="absolute -left-1 bottom-20 z-30 w-40 !p-3 shadow-[0_16px_44px_rgba(0,0,0,0.14)]"
      />
      <OutcomeCard
        card={outcomeCards[1]}
        className="absolute right-0 bottom-0 z-10 w-40 !p-3 opacity-95 shadow-[0_16px_44px_rgba(0,0,0,0.10)]"
      />
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="hero-visual-group relative mx-auto flex min-h-[640px] max-w-[680px] items-center justify-center xl:min-h-[680px]">
      <div className="hero-phone-hit relative z-20">
        <HeroPhone />
      </div>
      <RoiGrowthCard />
      <OutcomeCards />
    </div>
  );
}

export const Hero: React.FC = () => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <header id="top" className="relative overflow-hidden bg-[#F7F2E8] px-6 pb-16 pt-32 md:px-12 lg:px-16">
      <div ref={ref} className="mx-auto grid min-h-[82vh] max-w-7xl items-center gap-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div className={`fade-up-enter ${isVisible ? 'fade-up-active' : ''}`}>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 font-mono text-xs uppercase text-black/60">
            <TrendingUp className="h-4 w-4 text-hopon-red" />
            AI growth platform for local businesses
          </p>
          <h1 className="font-display text-4xl font-bold leading-[0.98] text-hopon-black md:text-7xl lg:text-8xl">
            More Customers. Less Marketing.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-black/70 md:text-xl md:leading-8">
            Get discovered by local creators, reach customers other platforms miss, and track what actually drives growth.
          </p>
          <div className="mt-6 lg:hidden">
            <MobileHeroVisual />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row md:mt-9">
            <Link
              to="/merchant/signup"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-hopon-black px-6 py-4 font-display text-sm font-bold uppercase text-white transition-colors hover:bg-hopon-red"
            >
              Start Growing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <AppStoreBadge />
          </div>
          <p className="mt-4 font-mono text-xs uppercase text-black/50">No marketing team required.</p>
        </div>

        <div className={`relative hidden fade-up-enter lg:block ${isVisible ? 'fade-up-active stagger-2' : ''}`}>
          <HeroVisual />
        </div>
      </div>
    </header>
  );
};

export { APP_STORE_URL, AppStoreBadge };
