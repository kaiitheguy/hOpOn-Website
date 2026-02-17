import React from 'react';
import { Check, X } from 'lucide-react';
import type { CouponTemplate } from '../lib/supabaseClient';
import { getErrorMessage } from '../i18n';
import type { Locale } from '../i18n';

export type RedeemState = 'idle' | 'loading' | 'success' | 'failed';

type RedeemCardTexts = {
  placeholder: string;
  redeemButton: string;
  redeemMore: string;
  successTitle: string;
  failedTitle: string;
  tryAgain: string;
  notConfigured: string;
};

const controlClass =
  'w-full h-14 border-2 border-black rounded-none font-display font-bold text-sm uppercase tracking-wider bg-white text-hopon-black';

export type RedeemCardProps = {
  state: RedeemState;
  code: string;
  setCode: (v: string) => void;
  onRedeem: () => void;
  onReset: () => void;
  texts: RedeemCardTexts;
  coupon: CouponTemplate | null;
  errorCode?: string;
  configured: boolean;
  locale: Locale;
};

export const RedeemCard: React.FC<RedeemCardProps> = ({
  state,
  code,
  setCode,
  onRedeem,
  onReset,
  texts: t,
  coupon,
  errorCode = 'UNKNOWN',
  configured,
  locale,
}) => {
  const isIdleOrLoading = state === 'idle' || state === 'loading';

  return (
    <div className="w-full max-w-[480px] bg-white border-2 border-black p-6 md:p-8">
      {!configured && (
        <p className="text-sm text-black/60 mb-4">{t.notConfigured}</p>
      )}
      {isIdleOrLoading && (
        <div className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRedeem()}
            placeholder={t.placeholder}
            className={`${controlClass} px-4 placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-hopon-red disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={state === 'loading' || !configured}
            autoFocus
          />
          <button
            type="button"
            onClick={onRedeem}
            disabled={state === 'loading' || !code.trim() || !configured}
            className={`${controlClass} bg-hopon-black text-white hover:bg-hopon-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {state === 'loading' ? '…' : t.redeemButton}
          </button>
        </div>
      )}
      {state === 'success' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span className="font-display font-bold uppercase tracking-wider">
              {t.successTitle}
            </span>
          </div>
          {coupon && (
            <div className="border-t border-black/20 pt-4 space-y-2 text-sm">
              {coupon.title && (
                <p className="font-display font-bold text-hopon-black">{coupon.title}</p>
              )}
              {coupon.description && (
                <p className="text-black/80">{coupon.description}</p>
              )}
              {coupon.terms && (
                <p className="text-black/60 text-xs">{coupon.terms}</p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-mono uppercase tracking-wider text-hopon-black underline underline-offset-4 hover:text-hopon-red"
          >
            {t.redeemMore}
          </button>
        </div>
      )}
      {state === 'failed' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-700">
            <X className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span className="font-display font-bold uppercase tracking-wider">
              {t.failedTitle}
            </span>
          </div>
          <p className="text-sm text-black/80">
            {getErrorMessage(locale, errorCode)}
          </p>
          <button
            type="button"
            onClick={onReset}
            className={`${controlClass} bg-hopon-black text-white hover:bg-hopon-red transition-colors`}
          >
            {t.tryAgain}
          </button>
        </div>
      )}
    </div>
  );
};
