import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { BrandBackground } from '../components/BrandChrome';
import { BrandHeader } from '../components/BrandHeader';

export interface CheckoutCanceledProps {
  onReturn?: () => void;
}

export const CheckoutCanceled: React.FC<CheckoutCanceledProps> = ({ onReturn }) => {
  return (
    <BrandBackground>
      <BrandHeader />
      <main className="flex min-h-screen items-center justify-center px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
        <section className="w-full max-w-xl rounded-[30px] border border-black/10 bg-white p-6 text-center shadow-[0_24px_80px_rgba(20,14,8,0.08)] md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F2E8] text-hopon-black">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-black/45">Checkout canceled</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[0.98] tracking-tight text-hopon-black md:text-5xl">No changes were made.</h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-black/68">
            You were not charged and your trial was not started. Your payment method remains unchanged.
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/55">
            You can review the plans again whenever you are ready.
          </p>
          {onReturn ? (
            <button
              type="button"
              onClick={onReturn}
              className="mx-auto mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-hopon-black px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-hopon-red sm:w-auto sm:min-w-[230px]"
            >
              Return to Pricing
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </section>
      </main>
    </BrandBackground>
  );
};

export default CheckoutCanceled;
