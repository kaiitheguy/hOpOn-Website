import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Locale } from '../i18n';
import { getT, getErrorMessage } from '../i18n';
import type { CouponTemplate } from '../lib/supabaseClient';
import {
  isSupabaseConfigured,
  redeemCode,
  getCouponTemplate,
  verifyCodeOnly,
} from '../lib/supabaseClient';

type Status = 'idle' | 'loading' | 'success' | 'failed';

type VerifyCardProps = {
  locale: Locale;
};

export const VerifyCard: React.FC<VerifyCardProps> = ({ locale }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [benefit, setBenefit] = useState<CouponTemplate | null>(null);
  const [errorCode, setErrorCode] = useState<string>('UNKNOWN');
  const [rawMessage, setRawMessage] = useState<string | undefined>(undefined);
  const [rpcAvailable, setRpcAvailable] = useState<boolean | null>(null);

  const t = getT(locale);

  const runRedeem = async () => {
    const input = code.trim();
    if (!input) return;
    setStatus('loading');
    setBenefit(null);
    setErrorCode('UNKNOWN');
    setRawMessage(undefined);

    try {
      let result: Awaited<ReturnType<typeof redeemCode>>;
      try {
        result = await redeemCode(input);
        if (rpcAvailable === null) setRpcAvailable(true);
      } catch (err) {
        console.error('[VerifyCard] redeemCode threw', err);
        if (rpcAvailable === null) setRpcAvailable(false);
        const fallback = await verifyCodeOnly(input);
        if (fallback.ok) {
          if (fallback.template) setBenefit(fallback.template);
          else setBenefit({ title: fallback.templateCodeName, description: null, terms: null });
          setStatus('success');
          return;
        }
        setErrorCode(fallback.errorCode);
        setRawMessage(undefined);
        setStatus('failed');
        return;
      }

      if (result.ok) {
        const template = await getCouponTemplate(result.templateCodeName);
        setBenefit(template ?? { title: result.templateCodeName, description: null, terms: null });
        setStatus('success');
      } else if (result.errorCode === 'NOT_AUTHENTICATED') {
        // 不要求登录：用仅验证流程展示该码对应的券信息（不写入 user_coupons）
        const fallback = await verifyCodeOnly(input);
        if (fallback.ok) {
          if (fallback.template) setBenefit(fallback.template);
          else setBenefit({ title: fallback.templateCodeName, description: null, terms: null });
          setStatus('success');
        } else {
          setErrorCode(fallback.errorCode);
          setRawMessage(undefined);
          setStatus('failed');
        }
      } else {
        setErrorCode(result.errorCode);
        setRawMessage(result.rawMessage);
        setStatus('failed');
      }
    } catch (err) {
      console.error('[VerifyCard] unexpected error', err);
      setErrorCode('UNKNOWN');
      setRawMessage(err instanceof Error ? err.message : String(err));
      setStatus('failed');
    }
  };

  const tryAgain = () => {
    setStatus('idle');
    setCode('');
    setBenefit(null);
    setRawMessage(undefined);
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="bg-white border border-black p-6 md:p-8 max-w-lg">
      {!configured && (
        <p className="text-sm text-black/60 mb-4">{t.notConfigured}</p>
      )}
      {status === 'idle' || status === 'loading' ? (
        <div className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runRedeem()}
            placeholder={t.placeholder}
            className="w-full font-mono text-sm uppercase tracking-wider border border-black px-4 py-3 bg-white placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-hopon-red"
            disabled={status === 'loading' || !configured}
            autoFocus
          />
          <button
            type="button"
            onClick={runRedeem}
            disabled={status === 'loading' || !code.trim() || !configured}
            className="w-full bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider px-6 py-3 border border-black hover:bg-hopon-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? '…' : t.redeemButton}
          </button>
        </div>
      ) : status === 'success' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5 shrink-0" strokeWidth={2.5} />
            <span className="font-display font-bold uppercase tracking-wider">
              {t.successTitle}
            </span>
          </div>
          {benefit && (
            <div className="border-t border-black/20 pt-4 space-y-2 text-sm">
              {benefit.title && (
                <p className="font-display font-bold text-hopon-black">
                  {benefit.title}
                </p>
              )}
              {benefit.description && (
                <p className="text-black/80">{benefit.description}</p>
              )}
              {benefit.terms && (
                <p className="text-black/60 text-xs">{benefit.terms}</p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={tryAgain}
            className="text-sm font-mono uppercase tracking-wider text-hopon-black underline underline-offset-4 hover:text-hopon-red"
          >
            {t.redeemButton}
          </button>
        </div>
      ) : (
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
          <div className="text-xs font-mono text-black/60 bg-black/5 p-3 border border-black/10 break-all">
            <span className="block font-display font-bold normal-case mb-1">Debug:</span>
            <span className="block">errorCode: {errorCode}</span>
            {rawMessage && <span className="block mt-1">detail: {rawMessage}</span>}
          </div>
          <button
            type="button"
            onClick={tryAgain}
            className="w-full bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider px-6 py-3 border border-black hover:bg-hopon-red transition-colors"
          >
            {t.tryAgain}
          </button>
        </div>
      )}
    </div>
  );
};
