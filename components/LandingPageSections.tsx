import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

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

function EquationSurface({ eyebrow, title, copy, accent = false }: { eyebrow: string; title: string; copy: string; accent?: boolean }) {
  return (
    <div className={`rounded-[28px] border p-5 shadow-[0_16px_40px_rgba(0,0,0,0.10)] md:min-h-[180px] md:p-6 ${accent ? 'border-hopon-red/25 bg-[#FFF5F5]' : 'border-black/10 bg-white'}`}>
      <p className={`font-mono text-[9px] uppercase tracking-[0.16em] ${accent ? 'text-hopon-red' : 'text-black/45'}`}>{eyebrow}</p>
      <p className="mt-4 font-display text-2xl font-bold leading-tight text-hopon-black md:text-3xl">{title}</p>
      <p className="mt-3 max-w-xs text-sm leading-5 text-black/55">{copy}</p>
    </div>
  );
}

function EquationIntelligencePanel() {
  return (
    <div className="relative mt-8 overflow-hidden rounded-[32px] bg-hopon-black p-5 text-white shadow-[0_26px_90px_rgba(0,0,0,0.18)] md:mt-10 md:p-8">
      <div className="max-w-2xl">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">The compounding advantage</p>
        <h3 className="font-display text-3xl font-bold leading-tight md:text-5xl">The advantage compounds.</h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 md:text-base">Market signals can start a campaign. Merchant-specific outcome memory makes the next decision more informed.</p>
      </div>

      <div className="mt-7 rounded-[28px] border border-black/10 bg-[#F7F2E8] p-3 md:mt-8 md:p-6">
        <div className="hidden items-stretch gap-4 md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <EquationSurface eyebrow="Market intelligence" title="Trends, content, local context" copy="Find the opportunity worth testing now." />
          <div className="flex items-center justify-center px-1 font-display text-5xl font-normal text-hopon-red/60" aria-hidden="true">+</div>
          <EquationSurface eyebrow="Merchant outcome memory" title="Creator-linked redemptions + campaign history" copy="Keep the evidence tied to the decision." />
          <div className="flex items-center justify-center px-1 font-display text-5xl font-normal text-black/35" aria-hidden="true">=</div>
          <EquationSurface eyebrow="A better next decision" title="What to launch, who to choose, what to repeat" copy="Every test starts with more context." accent />
        </div>

        <div className="grid gap-2.5 md:hidden">
          <EquationSurface eyebrow="Market intelligence" title="Trends, content, local context" copy="Find the opportunity worth testing now." />
          <div className="flex items-center justify-center font-display text-4xl font-normal text-hopon-red/60" aria-hidden="true">+</div>
          <EquationSurface eyebrow="Merchant outcome memory" title="Creator-linked redemptions + campaign history" copy="Keep the evidence tied to the decision." />
          <div className="flex items-center justify-center font-display text-4xl font-normal text-black/35" aria-hidden="true">=</div>
          <EquationSurface eyebrow="A better next decision" title="What to launch, who to choose, what to repeat" copy="Every test starts with more context." accent />
        </div>
      </div>
    </div>
  );
}



type DashboardShellProps = {
  module: string;
  title: string;
  children: React.ReactNode;
};

function DashboardShell({ module, title, children }: DashboardShellProps) {
  return (
    <div className="overflow-hidden rounded-[30px] border border-black/10 bg-[#F7F2E8] shadow-[0_18px_55px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 bg-white/90 px-4 py-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-hopon-black text-[10px] font-bold text-white">h</span>
          <div className="min-w-0">
            <p className="hidden font-mono text-[9px] uppercase tracking-[0.15em] text-black/45 md:block">hOpOn Intelligence</p>
            <p className="font-display text-sm font-bold leading-4 text-hopon-black">{title}</p>
          </div>
        </div>
        <span className="hidden shrink-0 rounded-full border border-black/10 bg-[#F7F2E8] px-2.5 py-1 font-mono text-[8px] uppercase tracking-wide text-black/45 sm:inline-flex">{module}</span>
      </div>
      <div className="p-3 md:p-5">{children}</div>
    </div>
  );
}

function DashboardPanel({ children, className = '', accent = false }: { children: React.ReactNode; className?: string; accent?: boolean }) {
  return <div className={'rounded-2xl border p-4 md:p-5 ' + (accent ? 'border-hopon-red/20 bg-[#FFF5F5]' : 'border-black/10 bg-white') + ' ' + className}>{children}</div>;
}

function DashboardLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/45">{children}</p>;
}

function DashboardChip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return <span className={'rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide ' + (accent ? 'bg-[#FFF0F0] text-hopon-red' : 'bg-[#F7F2E8] text-black/55')}>{children}</span>;
}

function DemandBars() {
  const bars = [36, 47, 43, 59, 68, 78, 92];
  return (
    <div className="mt-5">
      <div className="flex h-44 items-end gap-2 border-b border-black/10 px-1 md:h-52">
        {bars.map((height, index) => (
          <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="w-full rounded-t-lg bg-hopon-red/75" style={{ height: height + 'px' }} />
            <span className="font-mono text-[8px] uppercase text-black/35">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase text-black/40">7-day local demand</p>
        <p className="font-display text-2xl font-bold text-[#2F7D5B]">+32%</p>
      </div>
    </div>
  );
}

function CampaignDashboard() {
  return (
    <DashboardShell module="Demand view" title="Campaign Intelligence">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <DashboardLabel>Atelier Matcha · East Village</DashboardLabel>
          <p className="mt-1 font-display text-lg font-bold text-hopon-black md:text-xl">What should we launch next?</p>
        </div>
        <span className="rounded-full bg-[#EAF4EF] px-2.5 py-1 font-mono text-[8px] uppercase text-[#2F7D5B]">Signal rising</span>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
        <DashboardPanel>
          <div className="flex items-start justify-between gap-3">
            <div><DashboardLabel>Local trend</DashboardLabel><p className="mt-1 font-display text-2xl font-bold text-hopon-black">Matcha desserts</p></div>
            <span className="rounded-full bg-[#EAF4EF] px-2.5 py-1 font-mono text-[8px] uppercase text-[#2F7D5B]">+32%</span>
          </div>
          <DemandBars />
        </DashboardPanel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <DashboardPanel>
            <DashboardLabel>Merchant context</DashboardLabel>
            <p className="mt-2 font-display text-xl font-bold text-hopon-black">Lunch gap</p>
            <div className="mt-3 flex flex-wrap gap-2"><DashboardChip accent>Tue–Thu</DashboardChip><DashboardChip>11a–2p</DashboardChip></div>
            <p className="mt-3 text-xs leading-5 text-black/55">A quiet service window worth testing.</p>
          </DashboardPanel>
          <DashboardPanel>
            <DashboardLabel>Campaign memory</DashboardLabel>
            <p className="mt-2 font-display text-xl font-bold text-hopon-black">Past lunch tests</p>
            <p className="mt-3 text-xs leading-5 text-black/55">Merchant context stays with the next decision.</p>
          </DashboardPanel>
        </div>
      </div>
      <DashboardPanel className="mt-3" accent>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-2.5"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-hopon-red" aria-hidden="true" /><div><DashboardLabel>AI recommendation</DashboardLabel><p className="mt-1 font-display text-xl font-bold text-hopon-black md:text-2xl">Weekday lunch set</p></div></div>
          <div className="flex flex-wrap gap-2"><DashboardChip accent>Momentum</DashboardChip><DashboardChip>Menu fit</DashboardChip><DashboardChip>Past outcomes</DashboardChip></div>
        </div>
      </DashboardPanel>
    </DashboardShell>
  );
}

type CreatorRowProps = {
  name: string;
  handle: string;
  audience: string;
  score: string;
  history: string;
  avatar: string;
  bars: number[];
  status: string;
};

function CreatorRow({ name, handle, audience, score, history, avatar, bars, status }: CreatorRowProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-3 md:p-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
        <img src={avatar} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight text-hopon-black">{name}</p>
          <p className="mt-1 truncate font-mono text-[8px] uppercase text-black/40">@{handle} · {audience}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-xl font-bold leading-none text-hopon-black md:text-2xl">{score}</p>
          <p className="mt-1 font-mono text-[8px] uppercase text-hopon-red">fit</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-black/10 pt-3">
        <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5">
          {bars.map((opacity, index) => <span key={index} className="h-2 min-w-0 rounded-full bg-hopon-red" style={{ opacity }} />)}
        </div>
        <span className="hidden shrink-0 rounded-full bg-[#F7F2E8] px-2 py-1 font-mono text-[8px] uppercase text-black/50 sm:inline-flex">{status}</span>
      </div>
      <div className="mt-2 hidden justify-between gap-2 font-mono text-[7px] uppercase tracking-wide text-black/35 sm:flex"><span className="truncate">Content · Local · Intent · Outcomes</span><span className="max-w-[45%] truncate text-right">{history}</span></div>
    </div>
  );
}

function CreatorDashboard() {
  return (
    <DashboardShell module="Match view" title="Creator Intelligence">
      <DashboardPanel className="mb-3" accent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><DashboardLabel>Campaign decision retained</DashboardLabel><p className="mt-1 font-display text-lg font-bold text-hopon-black">Weekday lunch set</p></div>
          <div className="flex flex-wrap gap-2"><DashboardChip accent>Lunch</DashboardChip><DashboardChip>East Village</DashboardChip></div>
        </div>
      </DashboardPanel>
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.6fr]">
        <DashboardPanel>
          <div className="flex items-center justify-between gap-3"><div><DashboardLabel>Ranked creator set</DashboardLabel><p className="mt-1 font-display text-xl font-bold text-hopon-black">Fit by campaign evidence</p></div><span className="hidden font-mono text-[8px] uppercase text-black/40 sm:inline">Followers not primary</span></div>
          <div className="mt-4 space-y-2.5">
            <CreatorRow name="Maya Chen" handle="mayabites" audience="East Village dessert" score="94" history="8 prior outcomes" avatar="/assets/creator-maya.png" bars={[0.92, 0.88, 0.9, 0.82]} status="Top fit" />
            <CreatorRow name="Iris Lin" handle="irisnotes" audience="NYC student dining" score="91" history="Outcome history" avatar="/assets/creator-iris.png" bars={[0.86, 0.9, 0.84, 0.7]} status="Shortlist" />
            <CreatorRow name="Noah Park" handle="noahvisits" audience="East Village food" score="87" history="New outcome signal" avatar="/assets/creator-noah.png" bars={[0.82, 0.8, 0.78, 0.38]} status="Consider" />
          </div>
        </DashboardPanel>
        <DashboardPanel>
          <DashboardLabel>Selection logic</DashboardLabel>
          <p className="mt-2 font-display text-xl font-bold leading-tight text-hopon-black">Why Maya + Iris</p>
          <div className="mt-4 space-y-3">
            {['Content fit', 'Local relevance', 'Campaign intent', 'Prior outcomes'].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3"><span className="text-xs text-black/60">{item}</span><span className="h-1.5 w-20 rounded-full bg-hopon-red/70" /></div>
            ))}
          </div>
          <p className="mt-5 border-t border-black/10 pt-4 text-xs leading-5 text-black/55">Fit signals work together; follower count alone does not decide the rank.</p>
        </DashboardPanel>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-hopon-black px-4 py-3 text-white">
        <div><DashboardLabel>MATCH OUTPUT</DashboardLabel><p className="mt-1 font-display text-lg font-bold">Maya + Iris shortlisted</p></div>
        <span className="rounded-full bg-white/10 px-3 py-1.5 font-mono text-[9px] uppercase text-white/70">Creator fit retained</span>
      </div>
    </DashboardShell>
  );
}

function RedemptionBars() {
  const bars = [22, 28, 25, 38, 34, 48, 58];
  return (
    <div className="mt-5">
      <div className="flex h-40 items-end gap-2 border-b border-black/10 px-1 md:h-44">
        {bars.map((height, index) => (
          <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2"><span className="w-full rounded-t-lg bg-hopon-red/75" style={{ height: height + 'px' }} /><span className="font-mono text-[8px] uppercase text-black/35">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span></div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between"><p className="font-mono text-[9px] uppercase text-black/40">7-day redemption trend</p><p className="font-mono text-[9px] uppercase text-black/40">Deduped</p></div>
    </div>
  );
}

function AttributionDashboard() {
  return (
    <DashboardShell module="Attribution view" title="Offline Intelligence">
      <DashboardPanel className="mb-3" accent>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><DashboardLabel>Campaign + creators retained</DashboardLabel><p className="mt-1 font-display text-lg font-bold text-hopon-black">Weekday lunch set · Maya + Iris</p></div>
          <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[8px] uppercase text-hopon-red">7-day view</span>
        </div>
      </DashboardPanel>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <DashboardPanel><DashboardLabel>Deduped redemptions</DashboardLabel><p className="mt-2 font-display text-4xl font-bold text-hopon-black">18</p><p className="mt-1 text-xs text-black/50">Creator-linked results</p></DashboardPanel>
        <DashboardPanel><DashboardLabel>Estimated GMV</DashboardLabel><p className="mt-2 font-display text-4xl font-bold text-hopon-black">$540</p><p className="mt-1 text-xs text-black/50">Attributed outcome estimate</p></DashboardPanel>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
        <DashboardPanel>
          <div className="flex items-center justify-between gap-3"><div><DashboardLabel>Redemption signal</DashboardLabel><p className="mt-1 font-display text-xl font-bold text-hopon-black">Activity by day</p></div><BarChart3 className="h-4 w-4 text-hopon-red" aria-hidden="true" /></div>
          <RedemptionBars />
        </DashboardPanel>
        <DashboardPanel>
          <DashboardLabel>By creator</DashboardLabel>
          <div className="mt-4 space-y-3">
            {[['Maya Chen', '9', 'w-full'], ['Iris Lin', '6', 'w-8/12'], ['Other', '3', 'w-4/12']].map(([name, value, width]) => (
              <div key={name}><div className="flex items-center justify-between gap-2"><span className="font-mono text-[9px] uppercase text-black/55">{name}</span><span className="font-display text-sm font-bold text-hopon-black">{value}</span></div><div className="mt-1 h-2 rounded-full bg-black/10"><div className={'h-full rounded-full bg-hopon-red ' + width} /></div></div>
            ))}
          </div>
          <p className="mt-5 border-t border-black/10 pt-4 font-mono text-[8px] uppercase text-black/40">Deduped redemptions</p>
        </DashboardPanel>
      </div>
      <DashboardPanel className="mt-3">
        <DashboardLabel>Creator-specific attribution path</DashboardLabel>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
          {['Creator-specific link', 'Offer redemption', 'Repeat scans filtered'].map((item, index) => (
            <React.Fragment key={item}><div className="flex-1 rounded-xl bg-[#F7F2E8] px-3 py-2.5 text-center font-mono text-[9px] uppercase text-black/55">{item}</div>{index < 2 && <span className="text-center font-display text-hopon-red/60 sm:px-1">→</span>}</React.Fragment>
          ))}
        </div>
      </DashboardPanel>
      <DashboardPanel className="mt-3" accent>
        <div className="flex items-start gap-2.5"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-hopon-red" aria-hidden="true" /><div><DashboardLabel>AI next action</DashboardLabel><p className="mt-1 font-display text-lg font-bold text-hopon-black">Keep Maya + Iris in the next lunch test.</p></div></div>
      </DashboardPanel>
    </DashboardShell>
  );
}

type IntelligenceSceneProps = {
  eyebrow: string;
  title: string;
  sentence: string;
  bullets: string[];
  children: React.ReactNode;
};

function IntelligenceScene({ eyebrow, title, sentence, bullets, children }: IntelligenceSceneProps) {
  return (
    <article className="grid gap-6 rounded-[36px] border border-black/10 bg-white p-4 shadow-[0_22px_70px_rgba(0,0,0,0.08)] md:p-7 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:items-center lg:p-8">
      <div className="order-1 px-1 py-2 md:px-3 lg:order-none lg:py-8">
        <p className="font-mono text-xs uppercase tracking-wide text-hopon-red">{eyebrow}</p>
        <h3 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-hopon-black md:text-5xl">{title}</h3>
        <p className="mt-5 text-lg leading-8 text-black/68 md:text-xl">{sentence}</p>
        <div className="mt-6 space-y-2.5 border-t border-black/10 pt-5 md:space-y-3">
          {bullets.map((bullet) => <div key={bullet} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-[#F7F2E8] px-3.5 py-2.5 text-[14px] font-semibold leading-5 text-black/65 md:px-4 md:py-3 md:text-[17px] md:leading-6"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-hopon-red/75" /><span>{bullet}</span></div>)}
        </div>
      </div>
      <div className="order-2 min-w-0">{children}</div>
    </article>
  );
}

export const InteractiveProductDemo: React.FC = () => {
  return (
    <section id="demo" className="bg-white px-5 py-8 md:px-12 md:py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-3xl md:mb-12">
          <p className="mb-3 font-mono text-xs uppercase text-black/50">hOpOn Intelligence</p>
          <h2 className="font-display text-[clamp(1rem,6vw,3.75rem)] font-bold leading-[0.98] tracking-[-0.03em] text-hopon-black md:text-6xl">
            <span className="block whitespace-nowrap">Intelligence before the post.</span>
            <span className="mt-1 block whitespace-nowrap text-hopon-red md:mt-2">Proof after it.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/65 md:text-base">See how a local signal becomes a campaign decision, a creator shortlist, and store-level proof.</p>
        </div>
        <div className="space-y-8 md:space-y-12">
          <IntelligenceScene eyebrow="Campaign Intelligence" title="Find the right campaign." sentence="Local demand, merchant timing, and campaign memory shape what to launch." bullets={['Local demand', 'Merchant timing', 'Campaign memory']}><CampaignDashboard /></IntelligenceScene>
          <IntelligenceScene eyebrow="Creator Intelligence" title="Match on evidence." sentence="Content, location, intent, and past outcomes rank the creators most likely to fit." bullets={['Content fit', 'Local relevance', 'Past outcomes']}><CreatorDashboard /></IntelligenceScene>
          <IntelligenceScene eyebrow="Offline Intelligence" title="Measure what reached the store." sentence="Creator-linked redemptions show what converted offline and what to repeat." bullets={['Source retained', 'Scans deduped', 'Results by creator']}><AttributionDashboard /></IntelligenceScene>
        </div>
        <EquationIntelligencePanel />
        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-wide text-black/35">Product screens use example data and visualizations.</p>
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

type ComparisonModelId = 'agency' | 'marketplace' | 'hopon';
type CapabilityTone = 'strong' | 'medium' | 'weak';

type CapabilityCell = {
  keyword: string;
  descriptor: string;
  tone: CapabilityTone;
};

type CapabilityRow = {
  label: string;
  agency: CapabilityCell;
  marketplace: CapabilityCell;
  hopon: CapabilityCell;
};

const capabilityRows: CapabilityRow[] = [
  {
    label: 'Demand intelligence',
    agency: { keyword: 'Project-based', descriptor: 'Research is rebuilt around each brief.', tone: 'medium' },
    marketplace: { keyword: 'Activity-based', descriptor: 'Data reflects creator profiles and campaign activity.', tone: 'medium' },
    hopon: { keyword: 'Context-aware', descriptor: 'Local momentum, merchant timing, and outcome history connect.', tone: 'strong' },
  },
  {
    label: 'Campaign planning',
    agency: { keyword: 'Strategist-led', descriptor: 'Quality depends on team expertise and time.', tone: 'medium' },
    marketplace: { keyword: 'Merchant-led', descriptor: 'The merchant arrives with the brief and offer.', tone: 'weak' },
    hopon: { keyword: 'Evidence-led', descriptor: 'Signals and merchant context shape what to test.', tone: 'strong' },
  },
  {
    label: 'Creator discovery',
    agency: { keyword: 'Relationship-limited', descriptor: 'Options depend on existing agency relationships.', tone: 'weak' },
    marketplace: { keyword: 'Broad directory', descriptor: 'Large supply, but fit still needs interpretation.', tone: 'medium' },
    hopon: { keyword: 'Fit-ranked network', descriptor: 'Creators surface against the campaign’s actual needs.', tone: 'strong' },
  },
  {
    label: 'Creator matching',
    agency: { keyword: 'Relationship-based', descriptor: 'Familiarity can outweigh campaign-specific fit.', tone: 'weak' },
    marketplace: { keyword: 'Profile-filtered', descriptor: 'Filters organize options but do not prove fit.', tone: 'medium' },
    hopon: { keyword: 'Matching intelligence', descriptor: 'Content, local relevance, intent, and outcomes work together.', tone: 'strong' },
  },
  {
    label: 'Offline attribution',
    agency: { keyword: 'Campaign-by-campaign', descriptor: 'Custom tracking must be assembled each time.', tone: 'weak' },
    marketplace: { keyword: 'Content-level', descriptor: 'Reporting centers on delivery and social metrics.', tone: 'weak' },
    hopon: { keyword: 'Creator-linked', descriptor: 'Source stays attached through redemption and revenue signals.', tone: 'strong' },
  },
  {
    label: 'Merchant learning',
    agency: { keyword: 'Report-held', descriptor: 'Learnings remain in reports and team knowledge.', tone: 'medium' },
    marketplace: { keyword: 'Campaign-isolated', descriptor: 'Results remain attached to individual campaigns.', tone: 'weak' },
    hopon: { keyword: 'Merchant-specific', descriptor: 'Store outcomes accumulate across campaigns.', tone: 'strong' },
  },
  {
    label: 'Next-campaign optimization',
    agency: { keyword: 'Consultant-interpreted', descriptor: 'A team translates past reports into next steps.', tone: 'medium' },
    marketplace: { keyword: 'Retrospective', descriptor: 'Results arrive after the campaign is complete.', tone: 'weak' },
    hopon: { keyword: 'Closed-loop', descriptor: 'Outcomes inform the next campaign and creator choice.', tone: 'strong' },
  },
];

const comparisonModels: Array<{ id: ComparisonModelId; name: string; description: string }> = [
  { id: 'agency', name: 'Agency', description: 'Managed execution' },
  { id: 'marketplace', name: 'Creator Marketplace', description: 'Access and coordination' },
  { id: 'hopon', name: 'hOpOn', description: 'Plan, match, measure' },
];

const modelSurface = (model: ComparisonModelId) => {
  if (model === 'hopon') return 'border-hopon-red/25 bg-[#FFF0F0]';
  if (model === 'marketplace') return 'bg-white/80';
  return 'bg-white';
};

const capabilityTone = (tone: CapabilityTone) => {
  if (tone === 'strong') return 'border-[#2F7D5B]/20 bg-[#EAF4EF] text-[#2F7D5B]';
  if (tone === 'medium') return 'border-[#E7C77E]/60 bg-[#FFF7E6] text-[#8A5A00]';
  return 'border-[#E7A1A1]/50 bg-[#FDECEC] text-[#A33A3A]';
};

export const WhyHopon: React.FC = () => {
  const renderCell = (cell: CapabilityCell) => {
    return (
      <div>
        <p>
          <span className={'inline-flex max-w-full break-words rounded-full border px-3 py-1.5 font-display text-[17px] font-bold leading-5 ' + capabilityTone(cell.tone)}>{cell.keyword}</span>
        </p>
        <p className="mt-2 text-sm leading-5 text-black/60 md:text-[15px] md:leading-6">{cell.descriptor}</p>
      </div>
    );
  };

  return (
    <AnimatedSection id="why" className="bg-hopon-black text-white">
      <div>
        <p className="mb-4 font-mono text-xs uppercase text-white/50">Why hOpOn</p>
        <h2 className="max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">Built to learn from every campaign.</h2>
        <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 md:text-lg">Compare how each model plans, matches, measures, and improves.</p>
      </div>

      <div className="mt-8 hidden overflow-hidden rounded-[32px] border border-black/10 bg-[#F7F2E8] text-hopon-black shadow-[0_24px_80px_rgba(0,0,0,0.2)] md:block">
        <div className="grid grid-cols-[minmax(170px,1.05fr)_repeat(3,minmax(0,1fr))] border-b border-black/10">
          <div className="flex items-end px-5 py-6 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45 md:px-6">Capability</div>
          {comparisonModels.map((model) => (
            <div key={model.id} className={'border-l px-5 py-6 md:px-6 ' + modelSurface(model.id)}>
              <p className="font-display text-xl font-bold leading-tight md:text-2xl">{model.name}</p>
              <p className="mt-1 text-sm text-black/50">{model.description}</p>
              {model.id === 'hopon' && <span className="mt-3 inline-flex rounded-full border border-hopon-red/20 bg-white px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide text-hopon-red">Closed loop</span>}
            </div>
          ))}
        </div>
        {capabilityRows.map((row, rowIndex) => (
          <div key={row.label} className={'grid grid-cols-[minmax(170px,1.05fr)_repeat(3,minmax(0,1fr))] ' + (rowIndex < capabilityRows.length - 1 ? 'border-b border-black/10' : '')}>
            <div className="flex items-start px-5 py-6 font-display text-base font-semibold leading-6 text-black/75 md:px-6 md:py-7 md:text-lg">{row.label}</div>
            {comparisonModels.map((model) => {
              const cell = row[model.id];
              return <div key={model.id} className={'border-l px-5 py-6 md:px-6 md:py-7 ' + modelSurface(model.id)}>{renderCell(cell)}</div>;
            })}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-3 md:hidden">
        {capabilityRows.map((row) => (
          <article key={row.label} className="rounded-[26px] border border-black/10 bg-[#F7F2E8] p-4 text-hopon-black shadow-[0_14px_40px_rgba(0,0,0,0.16)]">
            <h3 className="font-display text-lg font-bold leading-6">{row.label}</h3>
            <div className="mt-3 space-y-2">
              {comparisonModels.map((model) => (
                <div key={model.id} className={'min-w-0 rounded-2xl border p-3 ' + modelSurface(model.id)}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-black/45">{model.name}</p>
                  <p className="mt-1">
                    <span className={'inline-flex max-w-full break-words rounded-full border px-2.5 py-1 font-display text-base font-bold leading-5 ' + capabilityTone(row[model.id].tone)}>{row[model.id].keyword}</span>
                  </p>
                  <p className="mt-1 text-sm leading-5 text-black/60">{row[model.id].descriptor}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
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
              to="/pricing"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-hopon-black px-6 py-4 font-display text-sm font-bold uppercase text-white transition-colors hover:bg-hopon-red"
            >
              Explore Plans
              <MousePointerClick className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
