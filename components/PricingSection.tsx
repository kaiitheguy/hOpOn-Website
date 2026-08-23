import React from 'react';
import {
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  MapPin,
  Sparkles,
  UsersRound,
} from 'lucide-react';

export type PricingPlanId = 'starter' | 'growth' | 'multi-location';

export interface PricingPlan {
  id: PricingPlanId;
  name: 'Starter' | 'Growth' | 'Multi-location';
  description: string;
  regularPrice: number;
  foundingPrice: number;
  limits: {
    campaigns: number;
    creators: number;
    locations: number;
  };
  featured?: boolean;
}

export interface PricingSectionProps {
  /** Called when a visitor selects a plan. Checkout is owned by the parent flow. */
  onSelectPlan: (planId: PricingPlanId) => void;
  /** The plan currently being handled by the parent checkout flow. */
  loadingPlanId?: PricingPlanId | string | null;
  /** An error from the parent checkout flow, shown without making this component perform network work. */
  errorMessage?: string | null;
  className?: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Run one end-to-end campaign from brief and local creator matching through applications, scheduling, draft review, tracked visits, and creator-level attribution. Build a first repeatable channel with clear campaign handoffs and measurable learning.',
    regularPrice: 99,
    foundingPrice: 79,
    limits: { campaigns: 1, creators: 5, locations: 1 },
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Run multiple monthly campaigns with repeatable creator applications, coordination, scheduling, approvals, and result tracking. Compare creator, offer, and content performance across campaigns to learn which operating patterns are worth repeating.',
    regularPrice: 249,
    foundingPrice: 199,
    limits: { campaigns: 3, creators: 15, locations: 1 },
    featured: true,
  },
  {
    id: 'multi-location',
    name: 'Multi-location',
    description: 'Run the same end-to-end workflow across up to 3 locations, from brief and creator coordination to content review and tracked visits. See consolidated location and creator views for visits, redemptions, and performance to coordinate what each neighborhood needs.',
    regularPrice: 499,
    foundingPrice: 399,
    limits: { campaigns: 8, creators: 40, locations: 3 },
  },
];

const trialIncludes = ['1 published campaign', 'Up to 2 creators', '$0 platform fee today'];

const sharedCapabilities = [
  'AI-assisted campaign planning',
  'Local creator matching & applications',
  'Creator scheduling & coordination',
  'Draft-content review & deliverable tracking',
  'Trackable offers, verified visits & redemptions',
  'Creator-level attribution & ROI insights',
];

function formatPrice(price: number) {
  return `$${price}`;
}

function PlanLimit({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-6 text-black/72">
      <Icon className="mt-1 h-4 w-4 shrink-0 text-hopon-red" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  loadingPlanId = null,
  errorMessage = null,
  className = '',
}) => {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className={`relative overflow-hidden bg-[#F7F2E8] px-5 py-20 md:px-12 md:py-28 lg:px-16 ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Platform subscription</p>
          <h2 id="pricing-title" className="mt-4 font-display text-4xl font-bold leading-[0.98] text-hopon-black md:text-6xl">
            Pick the pace that fits your growth.
          </h2>
          <p className="mt-5 text-base leading-7 text-black/68 md:text-lg md:leading-8">
            Every plan starts with the same 30-day trial, then gives your team a clear campaign and creator operating rhythm.
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-black/48">
            Founding rate: first 20 hOpOn merchants across all plans. Once those spots are filled, new customers see the standard rate.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[28px] border border-hopon-red/20 bg-white p-5 shadow-[0_18px_55px_rgba(255,42,42,0.08)] md:p-7">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-hopon-red/20 bg-[#FFF5F5] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-hopon-red">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                30-day free trial on every plan
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold text-hopon-black md:text-3xl">Start with room to learn.</h3>
              <p className="mt-2 text-sm leading-6 text-black/64">
                Your trial always includes the same starting allowance. A payment method is required to begin; cancel before renewal and you will not be charged.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-[#F7F2E8] px-4 py-3 text-sm text-black/68 md:max-w-[245px]">
              <CreditCard className="h-5 w-5 shrink-0 text-hopon-black" aria-hidden="true" />
              <span>Payment method required. <strong className="font-semibold text-hopon-black">$0 platform fee today.</strong></span>
            </div>
          </div>
          <ul className="mt-6 grid gap-3 border-t border-black/10 pt-5 sm:grid-cols-3">
            {trialIncludes.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium text-hopon-black">
                <Check className="h-4 w-4 shrink-0 text-[#2F7D5B]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-black/48">
            Trial usage is for your first 30 days and does not roll over.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-[28px] border border-black/10 bg-white/65 p-5 md:p-7">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-hopon-red">Included on every plan</p>
            <h3 className="mt-3 font-display text-2xl font-bold leading-tight text-hopon-black md:text-3xl">
              Every plan includes the full end-to-end campaign workflow.
            </h3>
            <p className="mt-3 text-sm leading-6 text-black/64 md:text-base">
              From the first brief to measured outcomes, the core campaign tools stay the same as your plan scales.
            </p>
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sharedCapabilities.map((capability) => (
              <li key={capability} className="flex items-start gap-2.5 rounded-2xl border border-black/10 bg-[#FAF7F1] px-3.5 py-3 text-sm leading-5 text-black/72">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2F7D5B]" aria-hidden="true" />
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </div>

        {errorMessage ? (
          <div role="alert" className="mx-auto mt-5 max-w-4xl rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-8 grid items-stretch gap-4 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => {
            const isLoading = loadingPlanId === plan.id;
            return (
              <article
                key={plan.id}
                className={`relative flex min-h-[620px] flex-col rounded-[30px] border p-5 transition-transform md:p-6 ${
                  plan.featured
                    ? 'border-hopon-red bg-white shadow-[0_24px_75px_rgba(255,42,42,0.16)] lg:-translate-y-2'
                    : 'border-black/10 bg-white/80 shadow-[0_16px_52px_rgba(0,0,0,0.07)]'
                }`}
              >
                {plan.featured ? (
                  <div className="absolute -top-3 left-5 rounded-full bg-hopon-red px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                    Featured · Most popular
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${plan.featured ? 'bg-hopon-red text-white' : 'bg-[#F7F2E8] text-hopon-black'}`}>
                    {plan.id === 'multi-location' ? (
                      <Building2 className="h-5 w-5" aria-hidden="true" />
                    ) : plan.id === 'growth' ? (
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    )}
                  </div>
                  <span className="rounded-full border border-black/10 bg-[#FAF7F1] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-black/50">
                    Founding rate
                  </span>
                </div>

                <h3 className="mt-7 font-display text-3xl font-bold leading-tight text-hopon-black">{plan.name}</h3>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-black/64">{plan.description}</p>

                <div className="mt-5 rounded-2xl bg-[#F7F2E8] p-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-sm text-black/45 line-through">Standard {formatPrice(plan.regularPrice)} / month</span>
                    <span className="font-display text-4xl font-bold leading-none text-hopon-black">{formatPrice(plan.foundingPrice)}</span>
                    <span className="text-sm text-black/55">/ month Founding rate</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-black/60">
                    Lock in this Founding rate while your subscription remains active.
                  </p>
                </div>

                <div className="mt-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">After your trial</p>
                  <ul className="mt-3 space-y-2.5">
                    <PlanLimit icon={Check}>{plan.limits.campaigns} {plan.limits.campaigns === 1 ? 'published campaign' : 'published campaigns'}</PlanLimit>
                    <PlanLimit icon={UsersRound}>Up to {plan.limits.creators} creators</PlanLimit>
                    <PlanLimit icon={MapPin}>{plan.limits.locations} {plan.limits.locations === 1 ? 'location' : 'locations'}</PlanLimit>
                  </ul>
                </div>

                <div className="mt-auto pt-7">
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.id)}
                    disabled={isLoading}
                    aria-busy={isLoading}
                    className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-sm font-bold uppercase tracking-wide transition-colors disabled:cursor-wait disabled:opacity-60 ${
                      plan.featured
                        ? 'bg-hopon-black text-white hover:bg-hopon-red'
                        : 'border border-black/15 bg-white text-hopon-black hover:border-hopon-black hover:bg-[#F7F2E8]'
                    }`}
                  >
                    {isLoading ? 'Starting…' : 'Start Free Trial'}
                    {!isLoading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                  </button>
                  <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wide text-black/42">Cancel before renewal</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-black/10 bg-white/70 px-5 py-4 text-center text-sm leading-6 text-black/65">
          <strong className="font-display font-bold text-hopon-black">Keep campaign costs separate.</strong>{' '}
          Creator compensation, comp meals, customer incentives, and paid content rights are separate from the hOpOn platform subscription.
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
