import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Gift,
  MousePointerClick,
  ReceiptText,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { AppStoreBadge } from './Hero';

type DemoStepId = 'profile' | 'campaign' | 'creators' | 'review' | 'conversion' | 'roi';

type DemoStep = {
  id: DemoStepId;
  eyebrow: string;
  title: string;
  copy: string;
};

const steps: DemoStep[] = [
  {
    id: 'profile',
    eyebrow: 'Step 1',
    title: 'Merchant profile',
    copy: 'Hopon learns the business, product, location, and goal.',
  },
  {
    id: 'campaign',
    eyebrow: 'Step 2',
    title: 'Generate campaign',
    copy: 'A campaign idea, offer, and creator brief are generated in seconds.',
  },
  {
    id: 'creators',
    eyebrow: 'Step 3',
    title: 'Creator matching',
    copy: 'The best local creators are ranked by audience fit.',
  },
  {
    id: 'review',
    eyebrow: 'Step 4',
    title: 'Draft revise & post review',
    copy: 'Creators send drafts, Hopon helps refine them, and the merchant approves the final post.',
  },
  {
    id: 'conversion',
    eyebrow: 'Step 5',
    title: 'Offline conversion',
    copy: 'Customers scan in store, choose what brought them in, and unlock the offer.',
  },
  {
    id: 'roi',
    eyebrow: 'Step 6',
    title: 'ROI dashboard',
    copy: 'Visits, revenue, and creator performance become clear.',
  },
];

const creators = [
  { name: 'Maya Chen', handle: 'mayabites', audience: 'NYC dessert lovers', match: '94', avatar: '/assets/creator-maya.png' },
  { name: 'Iris Lin', handle: 'irisnotes', audience: 'Chinese student communities', match: '91', avatar: '/assets/creator-iris.png' },
  { name: 'Noah Park', handle: 'noahvisits', audience: 'East Village food crowd', match: '88', avatar: '/assets/creator-noah.png' },
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

function useScrollStep(): [DemoStepId, React.MutableRefObject<Record<DemoStepId, HTMLDivElement | null>>] {
  const [active, setActive] = useState<DemoStepId>('profile');
  const refs = useRef<Record<DemoStepId, HTMLDivElement | null>>({
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
      { threshold: [0.35, 0.55, 0.75], rootMargin: '-18% 0px -38% 0px' }
    );

    Object.values(refs.current).forEach((node) => {
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  return [active, refs];
}

function PhoneFrame({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return (
    <div
      className={`relative mx-auto rounded-[46px] border-[10px] border-hopon-black bg-hopon-black shadow-[0_26px_90px_rgba(0,0,0,0.24)] ${
        compact ? 'w-[252px] sm:w-[270px]' : 'w-[286px] md:w-[304px]'
      }`}
    >
      <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-hopon-black md:h-6 md:w-24" />
      <div
        className={`overflow-hidden rounded-[34px] bg-[#F8F6F1] ${
          compact ? 'h-[548px] sm:h-[586px]' : 'h-[620px] md:h-[660px]'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ScreenHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-black/10 bg-white px-4 pb-3 pt-9">
      <div className="mb-3 flex items-center justify-between text-[10px] text-black/40">
        <span className="font-mono">9:41</span>
        <span className="rounded-full bg-black/5 px-2 py-1 font-mono uppercase">Hopon</span>
      </div>
      <p className="font-mono text-[10px] uppercase text-black/50">{subtitle}</p>
      <h3 className="mt-1 font-display text-2xl font-bold leading-[1.05] text-hopon-black">{title}</h3>
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

function ProfileScreen() {
  return (
    <>
      <div className="relative h-44 overflow-hidden">
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
      <div className="p-4">
        <div className="rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] p-3.5 text-hopon-black">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-base font-bold">AI positioning</p>
            <Sparkles className="h-4 w-4 text-hopon-red" />
          </div>
          <p className="mt-1.5 text-sm leading-5 text-black/65">Premium matcha desserts for weekend visits.</p>
        </div>
        <div className="mt-3 grid gap-2">
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

function CampaignScreen() {
  return (
    <>
      <ScreenHeader title="Spring Matcha Launch" subtitle="Campaign generated" />
      <div className="p-4">
        <div className="rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] p-3.5 shadow-[0_12px_36px_rgba(255,42,42,0.10)]">
          <AiLabel>AI generated</AiLabel>
          <p className="mt-3 font-display text-lg font-bold text-hopon-black">Weekend dessert run</p>
          <p className="mt-1.5 text-sm leading-5 text-black/65">Turn the new roll into weekend visits.</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
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

function CreatorsScreen() {
  return (
    <>
      <ScreenHeader title="Creator matches" subtitle="Chinese creators in NYC" />
      <div className="space-y-2.5 p-4">
        {creators.map((creator) => (
          <div key={creator.handle} className="flex items-center gap-3 rounded-3xl bg-white p-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
            <img src={creator.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
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
        <div className="rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] p-3.5 text-hopon-black shadow-[0_12px_36px_rgba(255,42,42,0.10)]">
          <AiLabel>Audience insight</AiLabel>
          <p className="mt-2 font-display text-base font-bold">Reach customers other platforms miss.</p>
          <p className="mt-1 text-sm leading-5 text-black/65">Chinese creator networks in major U.S. cities.</p>
        </div>
      </div>
    </>
  );
}

function ReviewScreen() {
  return (
    <>
      <ScreenHeader title="Post review" subtitle="Draft revision" />
      <div className="p-4">
        <div className="rounded-3xl border border-hopon-red/20 bg-[#FFF5F5] p-3.5 shadow-[0_12px_36px_rgba(255,42,42,0.10)]">
          <div className="mb-3 flex items-center justify-between">
            <AiLabel>AI notes</AiLabel>
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

        <div className="mt-3 space-y-2.5">
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

function ConversionScreen() {
  return (
    <>
      <ScreenHeader title="Offline conversion" subtitle="Customer view" />
      <div className="p-4">
        <div className="rounded-3xl border border-hopon-red bg-[#FFF5F5] p-3.5 shadow-[0_12px_36px_rgba(255,42,42,0.12)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase text-hopon-red">Selected campaign</p>
            <CheckCircle2 className="h-5 w-5 text-hopon-red" />
          </div>
          <p className="font-display text-xl font-bold leading-tight text-hopon-black">Spring Matcha Launch</p>
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
        <div className="mt-4 rounded-3xl bg-[#EAF4EF] p-3.5 text-[#2F7D5B] shadow-[0_16px_44px_rgba(47,125,91,0.16)]">
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

function RoiScreen() {
  return (
    <>
      <ScreenHeader title="ROI dashboard" subtitle="Campaign complete" />
      <div className="p-4">
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
        <div className="mt-3 rounded-3xl bg-white p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
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

function PhoneScreen({ active }: { active: DemoStepId }) {
  return (
    <div key={active} className="demo-phone-screen">
      {active === 'profile' && <ProfileScreen />}
      {active === 'campaign' && <CampaignScreen />}
      {active === 'creators' && <CreatorsScreen />}
      {active === 'review' && <ReviewScreen />}
      {active === 'conversion' && <ConversionScreen />}
      {active === 'roi' && <RoiScreen />}
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
      <div key={active} className="demo-mobile-step-card rounded-[28px] border border-black/10 bg-[#F7F2E8] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase text-hopon-red">{step.eyebrow}</p>
          <p className="font-mono text-xs uppercase text-black/40">
            {activeIndex + 1}/{steps.length}
          </p>
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold leading-tight text-hopon-black">{step.title}</h3>
        <p className="mt-3 text-sm leading-6 text-black/70">{step.copy}</p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase text-black/45">Swipe sideways</p>
          <div className="flex flex-1 justify-end gap-2" aria-label="Demo progress">
          {steps.map((item, index) => (
            <span
              key={item.id}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === item.id
                  ? 'w-8 bg-hopon-red'
                  : index < activeIndex
                    ? 'w-5 bg-hopon-black/35'
                    : 'w-5 bg-hopon-black/15'
              }`}
            />
          ))}
          </div>
        </div>
      </div>

      <div className="mt-4 touch-pan-y">
        <PhoneFrame compact>
          <PhoneScreen active={active} />
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
    <section id="demo" className="scroll-mt-24 bg-white px-5 py-10 md:px-12 md:py-28 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 max-w-3xl md:mb-12">
          <p className="mb-4 font-mono text-xs uppercase text-black/50">Interactive Product Demo</p>
          <h2 className="font-display text-3xl font-bold leading-tight text-hopon-black md:text-6xl">
            Walk through the app from campaign idea to ROI.
          </h2>
          <p className="mt-5 text-base leading-7 text-black/70 md:text-lg">
            See how Hopon moves a real merchant from an idea to creators, customer visits, and revenue.
          </p>
        </div>

        <MobileDemoStepper />

        <div className="hidden gap-10 lg:grid lg:grid-cols-[0.88fr_1.12fr]">
          <div className="space-y-8 lg:space-y-28">
            {steps.map((step) => (
              <div
                key={step.id}
                ref={(node) => {
                  refs.current[step.id] = node;
                }}
                data-step={step.id}
                className={`min-h-[280px] rounded-3xl border p-6 transition-all duration-300 ease-out ${
                  visible === step.id
                    ? 'translate-y-[-4px] border-black bg-[#F7F2E8] shadow-[0_18px_60px_rgba(0,0,0,0.10)]'
                    : 'translate-y-0 border-black/10 bg-white shadow-none'
                }`}
                onMouseEnter={() => setManualActive(step.id)}
                onMouseLeave={() => setManualActive(null)}
              >
                <p className="font-mono text-xs uppercase text-hopon-red">{step.eyebrow}</p>
                <h3 className="mt-4 font-display text-4xl font-bold leading-tight text-hopon-black">{step.title}</h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-black/70">{step.copy}</p>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <PhoneFrame>
              <PhoneScreen active={visible} />
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
};

export const WhyHopon: React.FC = () => {
  const points = [
    {
      icon: UsersRound,
      title: 'Reach the customers other platforms miss',
      copy: 'Hopon helps businesses connect with high-performing Chinese creators across major U.S. cities.',
    },
    {
      icon: Clock3,
      title: 'Save owner time',
      copy: 'The app handles campaign setup, creator coordination, draft revision, post review, and follow-up.',
    },
    {
      icon: ReceiptText,
      title: 'See what worked',
      copy: 'Merchants see visits, revenue, and creator performance in one mobile-first flow.',
    },
  ];

  return (
    <AnimatedSection id="why" className="bg-hopon-black text-white">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <p className="mb-4 font-mono text-xs uppercase text-white/50">Why Hopon</p>
          <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
            Built for local merchants who need customers, not dashboards.
          </h2>
        </div>
        <div className="grid gap-3">
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
            <p className="mb-4 font-mono text-xs uppercase text-black/50">Download Hopon</p>
            <h2 className="font-display text-4xl font-bold leading-tight text-hopon-black md:text-7xl">
              Let Hopon handle your local marketing.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/70 md:text-lg">
              Launch campaigns, bring in customers, and see what worked without hiring a marketing team.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              to="/merchant/signup"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-hopon-black px-6 py-4 font-display text-sm font-bold uppercase text-white transition-colors hover:bg-hopon-red"
            >
              Grow Now
              <MousePointerClick className="h-4 w-4" />
            </Link>
            <AppStoreBadge className="w-full" />
            <a
              href="#demo"
              className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg border border-black bg-white px-6 py-4 font-display text-sm font-bold uppercase text-hopon-black transition-colors hover:bg-hopon-grey"
            >
              View Demo
              <Gift className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
