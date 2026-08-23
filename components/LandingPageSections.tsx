import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquareText,
  Gift,
  MousePointerClick,
  ReceiptText,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

type DemoStepId = 'profile' | 'campaign' | 'creators' | 'review' | 'conversion' | 'roi';

type DemoStep = {
  id: DemoStepId;
  eyebrow: string;
  title: string;
  copy: string;
};

type GrowthCase = {
  icon: string;
  businessType: string;
  goal: string;
  campaign: string;
  description: string;
  result: string;
  resultLabel: string;
  status: string;
  kpis: { value: string; label: string }[];
  insight: string;
};

function AnimatedValue({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const node = ref.current;
    const normalized = value.replace(/,/g, '');
    const parsed = normalized.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if (!node || !parsed) {
      setDisplayValue(value);
      return;
    }

    const [, prefix, numericValue, suffix] = parsed;
    const target = Number(numericValue);
    const preserveThousands = value.includes(',');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!Number.isFinite(target) || reducedMotion) {
      setDisplayValue(value);
      return;
    }

    let frame = 0;
    let startedAt = 0;
    const format = (current: number) => {
      const rounded = Math.round(current);
      return `${prefix}${preserveThousands ? rounded.toLocaleString('en-US') : rounded}${suffix}`;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setDisplayValue(format(0));
        const tick = (timestamp: number) => {
          if (!startedAt) startedAt = timestamp;
          const progress = Math.min((timestamp - startedAt) / 760, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(format(target * eased));
          if (progress < 1) frame = window.requestAnimationFrame(tick);
        };
        frame = window.requestAnimationFrame(tick);
      },
      { threshold: 0.65 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{displayValue}</span>;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

const steps: DemoStep[] = [
  {
    id: 'profile',
    eyebrow: '01',
    title: 'Meet Your hOpOn Growth Agent',
    copy: 'Your Growth Agent learns about your business, customers, and goals to uncover new opportunities for growth.',
  },
  {
    id: 'campaign',
    eyebrow: '02',
    title: 'Campaigns That Keep Getting Smarter',
    copy: 'hOpOn plans campaigns, matches creators, reviews content, and continuously optimizes performance before every post goes live.',
  },
  {
    id: 'conversion',
    eyebrow: '03',
    title: 'Turn Creator Content Into Trackable Visits',
    copy: 'Customers redeem offers in seconds, creating a seamless bridge between online engagement and in-store growth.',
  },
  {
    id: 'roi',
    eyebrow: '04',
    title: 'Prove ROI with Offline Attribution',
    copy: 'An interactive attribution dashboard shows which creators, campaigns, and offers actually drive growth.',
  },
];

const creators = [
  { name: 'Maya Chen', handle: 'mayabites', audience: 'NYC dessert lovers', match: '94', avatar: '/assets/creator-maya.png' },
  { name: 'Iris Lin', handle: 'irisnotes', audience: 'Chinese student communities', match: '91', avatar: '/assets/creator-iris.png' },
  { name: 'Noah Park', handle: 'noahvisits', audience: 'East Village food crowd', match: '88', avatar: '/assets/creator-noah.png' },
];

const growthCases: GrowthCase[] = [
  {
    icon: '🍓',
    businessType: 'Dessert Shop',
    goal: 'Launch a Seasonal Product',
    campaign: 'Spring Matcha Collection',
    description:
      'Drive awareness for a limited-time menu item and understand which creators bring customers through the door.',
    result: '+38%',
    resultLabel: 'ROI',
    status: 'ROI Positive',
    kpis: [
      { value: '42', label: 'Store Visits' },
      { value: '27', label: 'Offer Redemptions' },
      { value: '+38%', label: 'ROI' },
    ],
    insight: 'Two local dessert creators generated over 70% of campaign visits.',
  },
  {
    icon: '🍽️',
    businessType: 'Bistro',
    goal: 'Fill More Lunch Tables',
    campaign: 'Weekday Lunch Menu Campaign',
    description:
      'Bring in more customers during lunch hours and identify which creator audiences are most likely to become repeat guests.',
    result: '+24%',
    resultLabel: 'Lunch Revenue',
    status: 'Campaign Complete',
    kpis: [
      { value: '31', label: 'New Customers' },
      { value: '22', label: 'Redemptions' },
      { value: '+24%', label: 'Lunch Revenue' },
    ],
    insight: 'Nearby workday creators drove the strongest repeat-guest signal for lunch service.',
  },
  {
    icon: '💆',
    businessType: 'Wellness Studio',
    goal: 'Generate More Bookings',
    campaign: 'Creator Experience Campaign',
    description:
      'Turn creator recommendations into appointments while tracking what drives actual client conversions.',
    result: '19',
    resultLabel: 'New Appointments',
    status: 'ROI Positive',
    kpis: [
      { value: '19', label: 'New Appointments' },
      { value: '14', label: 'First-Time Clients' },
      { value: '+22%', label: 'Monthly Growth' },
    ],
    insight: 'Creator posts with a direct booking CTA converted first-time clients fastest.',
  },
  {
    icon: '🍸',
    businessType: 'Cocktail Bar',
    goal: 'Fill an Event',
    campaign: 'Summer Guest Bartender Night',
    description:
      'Promote a special event through local creators and measure attendance driven by each campaign.',
    result: '58',
    resultLabel: 'Event Attendees',
    status: 'Campaign Complete',
    kpis: [
      { value: '58', label: 'Event Attendees' },
      { value: '36', label: 'Redemptions' },
      { value: '+41%', label: 'Event Revenue' },
    ],
    insight: 'One neighborhood nightlife creator accounted for 44% of tracked event redemptions.',
  },
];

function AnimatedSection({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.12, rootMargin: '0px 0px -70px 0px' });
  return (
    <section id={id} className={`relative overflow-hidden px-6 py-20 md:px-12 md:py-28 lg:px-16 ${className}`}>
      <div
        ref={ref}
        className={`mx-auto max-w-7xl transition-all duration-700 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {children}
      </div>
    </section>
  );
}

function useScrollStep(): [DemoStepId, React.MutableRefObject<Record<DemoStepId, HTMLElement | null>>] {
  const [active, setActive] = useState<DemoStepId>('profile');
  const refs = useRef<Record<DemoStepId, HTMLElement | null>>({
    profile: null,
    campaign: null,
    creators: null,
    review: null,
    conversion: null,
    roi: null,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.getAttribute('data-step') as DemoStepId | null;
        if (id) setActive(id);
      },
      { threshold: [0.45, 0.65, 0.85], rootMargin: '-30% 0px -42% 0px' }
    );

    Object.values(refs.current).forEach((node: HTMLElement | null) => {
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  return [active, refs];
}

function PhoneFrame({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div
      className={`relative mx-auto rounded-[40px] border-[8px] border-hopon-black bg-hopon-black shadow-[0_22px_70px_rgba(0,0,0,0.22)] md:rounded-[46px] md:border-[10px] ${
        compact ? 'w-[calc(100vw-40px)] max-w-[318px] sm:w-[318px]' : 'w-[286px] md:w-[304px]'
      }`}
    >
      <div className="absolute left-1/2 top-2 z-20 h-4 w-16 -translate-x-1/2 rounded-full bg-hopon-black md:h-6 md:w-24" />
      <div
        className={`overflow-hidden rounded-[30px] bg-[#F8F6F1] md:rounded-[34px] ${
          compact ? 'h-[560px] sm:h-[580px]' : 'h-[620px] md:h-[660px]'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ScreenHeader({ title, subtitle, compact = false }: { title: string; subtitle: string; compact?: boolean }) {
  return (
    <div className={`border-b border-black/10 bg-white px-4 ${compact ? 'pb-3 pt-7' : 'pb-3 pt-9'}`}>
      <div className={`${compact ? 'mb-2.5' : 'mb-3'} flex items-center justify-between text-[10px] text-black/40`}>
        <span className="font-mono">9:41</span>
        <span className="rounded-full bg-black/5 px-2 py-1 font-mono uppercase">hOpOn</span>
      </div>
      <p className={`font-mono uppercase text-black/50 ${compact ? 'text-[11px]' : 'text-[10px]'}`}>{subtitle}</p>
      <h3 className={`${compact ? 'text-[22px]' : 'text-2xl'} mt-1 font-display font-bold leading-[1.05] text-hopon-black`}>{title}</h3>
    </div>
  );
}

function AiLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-hopon-red/20 bg-[#FFF5F5] px-2.5 py-1 font-mono text-[10px] uppercase text-hopon-red">
      <Sparkles className="h-3 w-3" />
      {children}
    </div>
  );
}

function Metric({ label, value, tone = 'light' }: { label: string; value: string; tone?: 'light' | 'gold' | 'green' }) {
  const isLongValue = value.length > 7;
  const classes =
    tone === 'gold'
      ? 'bg-[#F5E7C8] text-[#6A4A11]'
      : tone === 'green'
        ? 'bg-[#EAF4EF] text-[#2F7D5B]'
        : 'bg-white text-hopon-black';
  return (
    <div className={`rounded-2xl border border-black/10 p-2.5 ${classes}`}>
      <div className={`font-display font-bold leading-tight ${isLongValue ? 'text-base' : 'text-xl'}`}>{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase opacity-70">{label}</div>
    </div>
  );
}

function ProfileScreen({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div className={`relative overflow-hidden ${compact ? 'h-40' : 'h-44'}`}>
        <img src="/assets/premium-asian-bakery-campaign.png" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute left-4 top-10">
          <AiLabel>Brand scan</AiLabel>
        </div>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <p className="font-mono text-[10px] uppercase text-white/70">Merchant Profile</p>
          <h3 className="mt-1 font-display text-3xl font-bold">Atelier Matcha</h3>
        </div>
      </div>
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className={`rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] text-hopon-black ${compact ? 'p-3' : 'p-3.5'}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-base font-bold">Growth positioning</p>
            <Sparkles className="h-4 w-4 text-hopon-red" />
          </div>
          <p className="mt-1.5 text-sm leading-5 text-black/65">Premium matcha desserts for weekend visits.</p>
        </div>
        <div className={`mt-3 grid gap-2 ${compact ? 'hidden' : ''}`}>
          {['East Village', 'Dessert audience', 'Slow weekdays'].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/90 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <Check className="h-4 w-4 text-[#2F7D5B]" />
              <span className="text-sm text-black/70">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CampaignScreen({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <ScreenHeader title="Spring Matcha Launch" subtitle="Campaign generated" compact={compact} />
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className={`rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] shadow-[0_12px_36px_rgba(255,42,42,0.10)] ${compact ? 'p-3' : 'p-3.5'}`}>
          <AiLabel>Campaign ready</AiLabel>
          <p className="mt-3 font-display text-lg font-bold text-hopon-black">Weekend dessert run</p>
          <p className="mt-1.5 text-sm leading-5 text-black/65">Turn the new roll into weekend visits.</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Metric label="Target" value="Dessert Fans" />
          <Metric label="Creators" value="8" tone="gold" />
        </div>
        <div className="mt-3 rounded-3xl bg-white p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-display text-base font-bold text-hopon-black">Creator brief</p>
            <span className="rounded-full bg-[#EAF4EF] px-2 py-1 font-mono text-[10px] uppercase text-[#2F7D5B]">Ready</span>
          </div>
          {['First bite', 'Pastry close-up', '5% in-store offer'].map((item) => (
            <div key={item} className="flex items-center gap-2 border-t border-black/10 py-1.5 text-sm text-black/70">
              <CheckCircle2 className="h-4 w-4 text-[#2F7D5B]" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CreatorsScreen({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <ScreenHeader title="Creator matches" subtitle="Chinese creators in NYC" compact={compact} />
      <div className={`space-y-2 ${compact ? 'p-3' : 'p-4'}`}>
        {creators.slice(0, 3).map((creator) => (
          <div key={creator.handle} className="flex items-center gap-3 rounded-3xl bg-white p-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
            <img src={creator.avatar} alt="" className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} shrink-0 rounded-full object-cover`} />
            <div className="min-w-0 flex-1">
              <div className="font-display text-base font-bold text-hopon-black">{creator.name}</div>
              <div className="font-mono text-[10px] uppercase text-black/50">@{creator.handle}</div>
              <div className="truncate text-xs text-black/60">{creator.audience}</div>
            </div>
            <div className="text-center">
              <div className="rounded-full bg-[#EAF4EF] px-2 py-1 font-mono text-xs font-bold text-[#2F7D5B]">{creator.match}</div>
              <div className="mt-1 font-mono text-[8px] uppercase text-black/40">Match</div>
            </div>
          </div>
        ))}
        <div className={`rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] p-3.5 text-hopon-black shadow-[0_12px_36px_rgba(255,42,42,0.10)] ${compact ? 'hidden' : ''}`}>
          <AiLabel>Audience insight</AiLabel>
          <p className="mt-2 font-display text-base font-bold">Reach customers other platforms miss.</p>
          <p className="mt-1 text-sm leading-5 text-black/65">Chinese creator networks in major U.S. cities.</p>
        </div>
      </div>
    </>
  );
}

function ReviewScreen({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <ScreenHeader title="Post review" subtitle="Draft revision" compact={compact} />
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className={`rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] shadow-[0_12px_36px_rgba(255,42,42,0.10)] ${compact ? 'p-3' : 'p-3.5'}`}>
          <div className="mb-3 flex items-center justify-between">
            <AiLabel>Review notes</AiLabel>
            <MessageSquareText className="h-5 w-5 text-hopon-red" />
          </div>
          <p className="font-display text-lg font-bold leading-tight text-hopon-black">Make the first bite the hook.</p>
          <p className="mt-1.5 text-sm leading-5 text-black/65">Suggested revision for stronger local response.</p>
        </div>

        <div className="mt-3 rounded-3xl bg-white p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
          <p className="font-display text-base font-bold text-hopon-black">Creator draft</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {['Cover', 'Caption', 'Offer'].map((item) => (
              <div key={item} className="rounded-2xl bg-[#F7F2E8] p-2 text-center">
                <CheckCircle2 className="mx-auto h-4 w-4 text-[#2F7D5B]" />
                <p className="mt-1 font-mono text-[9px] uppercase text-black/50">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`mt-3 space-y-2.5 ${compact ? 'hidden' : ''}`}>
          {[
            ['Maya Chen', 'Needs hook edit', 'Revise'],
            ['Iris Lin', 'Caption updated', 'Review'],
            ['Noah Park', 'Ready to post', 'Approve'],
          ].map(([name, status, action]) => (
            <div key={name} className="flex items-center justify-between rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <div>
                <p className="font-display text-sm font-bold text-hopon-black">{name}</p>
                <p className="font-mono text-[10px] uppercase text-black/45">{status}</p>
              </div>
              <p className="font-display text-sm font-bold text-[#2F7D5B]">{action}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function ConversionScreen({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <ScreenHeader title="Offline conversion" subtitle="Customer view" compact={compact} />
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className={`rounded-3xl border border-hopon-red bg-[#FFF5F5] shadow-[0_12px_36px_rgba(255,42,42,0.12)] ${compact ? 'p-3' : 'p-3.5'}`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase text-hopon-red">Selected campaign</p>
            <CheckCircle2 className="h-5 w-5 text-hopon-red" />
          </div>
          <p className={`${compact ? 'text-lg' : 'text-xl'} font-display font-bold leading-tight text-hopon-black`}>Spring Matcha Launch</p>
          <p className="mt-1 font-mono text-[10px] uppercase text-black/50">Atelier Matcha</p>
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-3xl bg-white p-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
          <img src="/assets/creator-maya.png" alt="" className="h-11 w-11 rounded-full object-cover" />
          <div className="flex-1">
            <div className="font-display text-sm font-bold text-hopon-black">Maya Chen</div>
            <div className="font-mono text-[10px] uppercase text-black/50">Local food creator</div>
          </div>
          <span className="rounded-full bg-[#EAF4EF] px-2 py-1 font-mono text-[10px] uppercase text-[#2F7D5B]">Seen</span>
        </div>
        <div className={`mt-4 rounded-3xl bg-[#EAF4EF] text-[#2F7D5B] shadow-[0_16px_44px_rgba(47,125,91,0.16)] ${compact ? 'p-3' : 'p-3.5'}`}>
          <div className="flex items-start justify-between">
            <Gift className="h-7 w-7" />
            <span className="rounded-full bg-white/80 px-2 py-1 font-mono text-[10px] uppercase">Ready</span>
          </div>
          <div className="mt-2 font-display text-3xl font-bold">5% off</div>
          <p className="mt-1 text-sm text-[#2F7D5B]/80">Unlocked for today&apos;s visit.</p>
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-center font-display text-sm font-bold uppercase text-[#2F7D5B]">
            Show to Staff
          </div>
        </div>
      </div>
    </>
  );
}

function RoiScreen({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <ScreenHeader title="ROI dashboard" subtitle="Campaign complete" compact={compact} />
      <div className={compact ? 'p-3' : 'p-4'}>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Visits" value="42" tone="green" />
          <Metric label="Revenue" value="$1,680" tone="gold" />
        </div>
        <div className="mt-3 rounded-3xl bg-white p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase text-black/50">Growth curve</p>
              <p className="font-display text-2xl font-bold text-hopon-black">+38%</p>
            </div>
            <AiLabel>Insight</AiLabel>
          </div>
          <svg viewBox="0 0 230 92" className="mt-1 h-20 w-full" aria-hidden="true">
            <path d="M10 78 C48 74, 58 68, 86 58 S132 42, 158 30 S194 18, 220 12" fill="none" stroke="#FF2A2A" strokeLinecap="round" strokeWidth="5" />
            <path d="M10 78 C48 74, 58 68, 86 58 S132 42, 158 30 S194 18, 220 12 L220 88 L10 88 Z" fill="#FF2A2A" opacity="0.08" />
          </svg>
        </div>
        <div className={`mt-3 rounded-3xl bg-white p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.06)] ${compact ? 'hidden' : ''}`}>
          <p className="font-display text-base font-bold text-hopon-black">Creator performance</p>
          <div className="mt-2 space-y-2">
            {[
              ['Maya Chen', '16 visits'],
              ['Iris Lin', '14 visits'],
              ['Noah Park', '12 visits'],
            ].map(([name, visits]) => (
              <div key={name} className="flex items-center justify-between gap-4">
                <span className="text-sm text-black/70">{name}</span>
                <span className="font-display text-sm font-bold text-hopon-black">{visits}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] p-3.5">
          <p className="font-mono text-[10px] uppercase text-hopon-red">Payment</p>
          <p className="mt-1 font-display text-lg font-bold text-hopon-black">Pay for results.</p>
        </div>
      </div>
    </>
  );
}

function PhoneScreen({ active, compact = false }: { active: DemoStepId; compact?: boolean }) {
  return (
    <>
      {active === 'profile' && <ProfileScreen compact={compact} />}
      {active === 'campaign' && <CampaignJourneyScreen compact={compact} />}
      {active === 'creators' && <CreatorsScreen compact={compact} />}
      {active === 'review' && <ReviewScreen compact={compact} />}
      {active === 'conversion' && <ConversionScreen compact={compact} />}
      {active === 'roi' && <RoiScreen compact={compact} />}
    </>
  );
}

function CampaignJourneyScreen({ compact = false }: { compact?: boolean }) {
  const phases: DemoStepId[] = ['campaign', 'creators', 'review'];
  const [phaseIndex, setPhaseIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const phase = phases[phaseIndex];

  useEffect(() => {
    setPhaseIndex(0);
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setPhaseIndex((current) => (current + 1) % phases.length);
    }, 3400);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <div className="relative h-full">
      <div key={phase} className="demo-phone-inner-swap">
        {phase === 'campaign' && <CampaignScreen compact={compact} />}
        {phase === 'creators' && <CreatorsScreen compact={compact} />}
        {phase === 'review' && <ReviewScreen compact={compact} />}
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-2.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.10)] backdrop-blur"
      >
        {phases.map((item, index) => (
          <span
            key={item}
            className={`h-1.5 rounded-full transition-all duration-300 ${index === phaseIndex ? 'w-5 bg-hopon-red' : 'w-1.5 bg-black/20'}`}
          />
        ))}
      </div>
    </div>
  );
}

function AnimatedPhoneScreen({ active, compact = false }: { active: DemoStepId; compact?: boolean }) {
  const previousIndex = useRef(steps.findIndex((step) => step.id === active));
  const currentIndex = steps.findIndex((step) => step.id === active);
  const direction = currentIndex >= previousIndex.current ? 'forward' : 'backward';

  useEffect(() => {
    previousIndex.current = currentIndex;
  }, [currentIndex]);

  return (
    <div key={active} className={`demo-phone-screen demo-phone-${direction}`}>
      <PhoneScreen active={active} compact={compact} />
    </div>
  );
}

function MobileDemoStepper() {
  const [active, setActive] = useState<DemoStepId>('profile');
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const activeIndex = steps.findIndex((step) => step.id === active);
  const step = steps[activeIndex];

  const moveStep = (direction: -1 | 1) => {
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), steps.length - 1);
    setActive(steps[nextIndex].id);
  };

  const finishSwipe = (x: number, y: number) => {
    if (!swipeStart.current) return;
    const deltaX = x - swipeStart.current.x;
    const deltaY = y - swipeStart.current.y;
    swipeStart.current = null;
    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    moveStep(deltaX < 0 ? 1 : -1);
  };

  return (
    <div
      className="select-none lg:hidden"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        swipeStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0];
        finishSwipe(touch.clientX, touch.clientY);
      }}
    >
      <div key={active} className="demo-mobile-step-card rounded-2xl border border-black/10 bg-[#F7F2E8] px-4 py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase text-hopon-red">{step.eyebrow}</p>
            <h3 className="mt-1 font-display text-lg font-bold leading-tight text-hopon-black">{step.title}</h3>
          </div>
          <p className="font-mono text-xs uppercase text-black/40">
            {activeIndex + 1}/{steps.length}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Previous demo step"
            disabled={activeIndex === 0}
            onClick={() => moveStep(-1)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-hopon-black transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 items-center justify-center gap-2" aria-label="Demo progress">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item.id}
                aria-label={`Show demo step ${index + 1}: ${item.title}`}
                aria-current={active === item.id ? 'step' : undefined}
                onClick={() => setActive(item.id)}
                className={`h-2.5 rounded-full transition-all duration-300 active:scale-90 ${
                  active === item.id
                    ? 'w-10 bg-hopon-red'
                    : index < activeIndex
                      ? 'w-6 bg-hopon-black/35'
                      : 'w-6 bg-hopon-black/15'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next demo step"
            disabled={activeIndex === steps.length - 1}
            onClick={() => moveStep(1)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-hopon-black transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center font-mono text-[9px] uppercase text-black/45">Swipe or tap a step</p>
      </div>

      <div className="mt-3 touch-pan-y">
        <PhoneFrame compact>
          <AnimatedPhoneScreen active={active} compact />
        </PhoneFrame>
      </div>
    </div>
  );
}

export const InteractiveProductDemo: React.FC = () => {
  const [active, refs] = useScrollStep();
  const [manualActive, setManualActive] = useState<DemoStepId | null>(null);
  const visible = manualActive || active;

  return (
    <section id="demo" className="bg-white px-5 py-8 md:px-12 md:py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 max-w-3xl md:mb-12">
          <p className="mb-3 font-mono text-xs uppercase text-black/50">Demo mechanism</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-hopon-black md:text-6xl">
            From Creator Content to Measurable Growth
          </h2>
        </div>

        <MobileDemoStepper />

        <div className="hidden gap-10 lg:grid lg:grid-cols-[0.88fr_1.12fr]">
          <div>
          <div className="space-y-10 lg:space-y-24">
            {steps.map((step) => (
              <button
                type="button"
                key={step.id}
                ref={(node) => {
                  refs.current[step.id] = node;
                }}
                data-step={step.id}
                aria-pressed={visible === step.id}
                className={`min-h-[300px] w-full rounded-3xl border p-6 text-left transition-all duration-500 ease-out active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-hopon-red/30 ${
                  visible === step.id
                    ? 'translate-y-[-4px] border-black bg-[#F7F2E8] shadow-[0_18px_60px_rgba(0,0,0,0.10)]'
                    : 'translate-y-0 border-black/10 bg-white shadow-none'
                }`}
                onMouseEnter={() => setManualActive(step.id)}
                onMouseLeave={() => setManualActive(null)}
                onFocus={() => setManualActive(step.id)}
                onBlur={() => setManualActive(null)}
                onClick={() => setManualActive(step.id)}
              >
                <p className="font-mono text-xs uppercase text-hopon-red">{step.eyebrow}</p>
                <h3 className="mt-4 font-display text-4xl font-bold leading-tight text-hopon-black">{step.title}</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-black/70">{step.copy}</p>
              </button>
            ))}
          </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <PhoneFrame>
              <AnimatedPhoneScreen active={visible} />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
};

export const GrowthProofSection: React.FC = () => {
  return (
    <AnimatedSection id="growth-proof" className="bg-[#F7F2E8]">
      <div className="mb-10 grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
        <div>
          <p className="mb-3 font-mono text-xs uppercase text-hopon-red">Proof snapshots</p>
          <h2 className="font-display text-4xl font-bold leading-tight text-hopon-black md:text-6xl">
            Real Businesses. Real Growth.
          </h2>
        </div>
        <p className="max-w-2xl text-base leading-7 text-black/70 md:justify-self-end md:text-lg">
          Different businesses have different goals. hOpOn helps connect creator marketing to measurable growth.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {growthCases.map((item) => (
          <article
            key={`${item.businessType}-${item.campaign}`}
            tabIndex={0}
            className="group relative flex min-h-[430px] flex-col overflow-hidden rounded-3xl border border-black/10 bg-white p-5 shadow-[0_18px_55px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-hopon-red/30 hover:shadow-[0_26px_76px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-hopon-red/40 md:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7F2E8] text-2xl">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-xl font-bold leading-tight text-hopon-black">{item.businessType}</p>
                  <p className="mt-1 text-sm font-medium leading-5 text-black/55">{item.goal}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full border border-[#2F7D5B]/20 bg-[#EAF4EF] px-3 py-1 font-mono text-[10px] uppercase text-[#2F7D5B]">
                {item.status}
              </span>
            </div>

            <div className="mt-6 border-y border-black/10 py-5">
              <p className="font-mono text-[10px] uppercase text-black/45">Campaign</p>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-hopon-black md:text-3xl">
                {item.campaign}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/62">{item.description}</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[0.72fr_1.28fr] md:items-end">
              <div>
                <p className="font-mono text-[10px] uppercase text-black/45">Measured result</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="font-display text-5xl font-bold leading-none text-hopon-black md:text-6xl">
                    <AnimatedValue value={item.result} />
                  </span>
                  <span className="pb-1 font-mono text-xs uppercase leading-4 text-hopon-red">{item.resultLabel}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 border border-black/10 bg-[#FAF7F1]">
                {item.kpis.map((kpi, index) => (
                  <div
                    key={`${item.businessType}-${kpi.label}`}
                    className={`min-w-0 p-3 ${index > 0 ? 'border-l border-black/10' : ''}`}
                  >
                    <p className="font-display text-xl font-bold leading-tight text-hopon-black"><AnimatedValue value={kpi.value} /></p>
                    <p className="mt-1 text-[11px] font-medium leading-4 text-black/55">{kpi.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex-1 rounded-2xl border border-hopon-red/15 bg-[#FFF5F5] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-hopon-red" />
                <p className="font-mono text-[10px] uppercase text-hopon-red">AI attribution insight</p>
              </div>
              <p className="text-sm leading-6 text-black/72">{item.insight}</p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-black/48">
              <div className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4 shrink-0 text-hopon-red" />
                <span className="font-mono text-[10px] uppercase">Measured by hOpOn Attribution</span>
              </div>
              <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-black/10 sm:block">
                <div className="h-full w-2/3 rounded-full bg-hopon-red transition-all duration-300 group-hover:w-full" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </AnimatedSection>
  );
};

export const WhyHopon: React.FC = () => {
  const points = [
    {
      icon: UsersRound,
      title: 'The First Attribution Layer for Creator Marketing',
      copy: 'Finally connect creator activity to real customer growth.',
    },
    {
      icon: Sparkles,
      title: 'A Team of AI Agents Behind Every Campaign',
      copy: 'From planning and creator matching to content optimization and attribution, hOpOn automates the work behind growth.',
    },
    {
      icon: MessageSquareText,
      title: 'Built Specifically for Local Businesses',
      copy: 'Designed around in-store visits and offline customer behavior.',
    },
    {
      icon: ReceiptText,
      title: 'Every Dollar Accounted For',
      copy: 'Know exactly what drove growth before investing another marketing dollar.',
    },
  ];

  return (
    <AnimatedSection id="why" className="bg-hopon-black text-white">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="mb-4 font-mono text-xs uppercase text-white/50">Why hOpOn</p>
          <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
            The Growth Platform Local Businesses Have Never Had
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {points.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="rounded-3xl border border-white/20 bg-white/10 p-5">
                <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-hopon-black">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">{point.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{point.copy}</p>
              </div>
            );
          })}
        </div>
      </div>
    </AnimatedSection>
  );
};

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7F2E8] px-6 py-20 md:px-12 md:py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_24px_80px_rgba(0,0,0,0.12)] md:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-4 font-mono text-xs uppercase text-black/50">Start growing</p>
            <h2 className="font-display text-4xl font-bold leading-tight text-hopon-black md:text-7xl">
              Ready to Measure Every Dollar of Growth?
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/70 md:text-lg">
              Launch creator campaigns, track in-store visits, and prove which offers, creators, and content drive real growth.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              to="/merchant/signup"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-hopon-black px-6 py-4 font-display text-sm font-bold uppercase text-white transition-colors hover:bg-hopon-red"
            >
              Start Growing
              <MousePointerClick className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
