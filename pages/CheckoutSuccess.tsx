import React from 'react';
import { Check, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandBackground } from '../components/BrandChrome';
import { BrandHeader } from '../components/BrandHeader';

export interface CheckoutSuccessProps {
  /** Checkout state supplied by the parent flow; this page never infers it from a network request. */
  status?: string | null;
  message?: string | null;
  planName?: string | null;
  trialEnd?: string | Date | null;
  /** Set only from the server-confirmed checkout status. */
  founding?: boolean | null;
  errorMessage?: string | null;
  onCreateAccount?: () => void;
  onFinishAccountSetup?: () => void;
  onManageBilling?: () => void;
}

function formatTrialEnd(trialEnd: string | Date | null | undefined) {
  if (!trialEnd) return null;
  const date = trialEnd instanceof Date ? trialEnd : new Date(trialEnd);
  if (Number.isNaN(date.getTime())) return String(trialEnd);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function statusCopy(status: string | null | undefined) {
  const normalized = status?.trim().toLowerCase();
  if (normalized === 'pending' || normalized === 'processing') return 'Payment setup processing';
  if (normalized === 'error' || normalized === 'failed') return 'Trial setup needs attention';
  if (['success', 'succeeded', 'complete', 'completed', 'trialing', 'active', 'paid', 'confirmed'].includes(normalized ?? '')) {
    return 'Trial started';
  }
  if (normalized) {
    return status;
  }
  return 'Trial started';
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  status = 'success',
  message,
  planName,
  trialEnd,
  founding = false,
  errorMessage,
  onCreateAccount,
  onFinishAccountSetup,
  onManageBilling,
}) => {
  const formattedTrialEnd = formatTrialEnd(trialEnd);
  const isAttentionState = ['error', 'failed'].includes(status?.trim().toLowerCase() ?? '');

  return (
    <BrandBackground>
      <BrandHeader />
      <main className="px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <section className="rounded-[30px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(20,14,8,0.08)] md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4EF] text-[#2F7D5B]">
              {isAttentionState ? <CreditCard className="h-7 w-7" aria-hidden="true" /> : <Check className="h-7 w-7" strokeWidth={3} aria-hidden="true" />}
            </div>
            <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-hopon-red">Checkout {statusCopy(status)}</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-bold leading-[0.98] tracking-tight text-hopon-black md:text-6xl">
              Your hOpOn trial is live.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-black/68 md:text-lg md:leading-8">
              {message || 'Your payment method is saved and your 30-day trial is ready.'}
            </p>
            {errorMessage ? (
              <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">
                {errorMessage}
              </p>
            ) : null}

            {planName ? (
              <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#F7F2E8] px-4 py-2 font-mono text-xs uppercase tracking-wider text-black/65">
                <Sparkles className="h-4 w-4 text-hopon-red" aria-hidden="true" />
                {planName} plan
              </div>
            ) : null}

            {founding ? (
              <div className="mt-4 rounded-2xl border border-hopon-red/20 bg-[#FFF5F5] px-4 py-3 text-sm leading-6 text-black/65">
                <strong className="font-display font-bold text-hopon-black">Founding Merchant rate locked in.</strong>{' '}
                This rate is reserved for the first 20 hOpOn merchants across all plans and stays on your subscription while it remains active.
              </div>
            ) : null}

            {formattedTrialEnd ? (
              <p className="mt-5 text-sm leading-6 text-black/58">
                Your trial ends <strong className="font-semibold text-hopon-black">{formattedTrialEnd}</strong>. Cancel before renewal to avoid a subscription charge.
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {onCreateAccount || onFinishAccountSetup ? (
                <button
                  type="button"
                  onClick={onCreateAccount ?? onFinishAccountSetup}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-hopon-black px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-hopon-red"
                >
                  {onFinishAccountSetup ? 'Finish account setup' : 'Create Account'}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
              {onManageBilling ? (
                <button
                  type="button"
                  onClick={onManageBilling}
                  className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-hopon-black transition-colors hover:border-hopon-black hover:bg-[#F7F2E8]"
                >
                  Manage Billing
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </section>

          <aside className="rounded-[30px] border border-black/10 bg-[#FAF7F1] p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-black/45">What happens next</p>
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF4EF] text-[#2F7D5B]"><Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></div>
                <div><h2 className="font-display text-lg font-bold text-hopon-black">Trial started</h2><p className="mt-1 text-sm leading-6 text-black/58">Your 30-day trial is active now.</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF4EF] text-[#2F7D5B]"><Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /></div>
                <div><h2 className="font-display text-lg font-bold text-hopon-black">Payment method saved</h2><p className="mt-1 text-sm leading-6 text-black/58">It stays on file for renewal unless you cancel first.</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5E7C8] text-[#6A4A11]"><Sparkles className="h-4 w-4" aria-hidden="true" /></div>
                <div><h2 className="font-display text-lg font-bold text-hopon-black">Full plan allowance starts after trial</h2><p className="mt-1 text-sm leading-6 text-black/58">Your trial includes 1 published campaign and up to 2 creators; the selected plan&apos;s full campaign, creator, and location allowance starts after trial.</p></div>
              </div>
            </div>
            <div className="mt-8 border-t border-black/10 pt-5">
              <Link to="/" className="font-mono text-xs uppercase tracking-wider text-black/60 underline decoration-black/25 underline-offset-4 hover:text-hopon-red">
                Back to hOpOn
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </BrandBackground>
  );
};

export default CheckoutSuccess;
