import React, { useState } from 'react';
import { useLocale } from '../i18n';
import { getT } from '../i18n';
import { BrandHeader } from '../components/BrandHeader';
import { RedeemCard, type RedeemState } from '../components/RedeemCard';
import type { CouponTemplate } from '../lib/supabaseClient';
import {
  isSupabaseConfigured,
  redeemCode,
  getCouponTemplate,
  verifyCodeOnly,
  trackAnonymousRedemption,
} from '../lib/supabaseClient';

export const Verify: React.FC = () => {
  const [locale, setLocale, t] = useLocale('en');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<RedeemState>('idle');
  const [benefit, setBenefit] = useState<CouponTemplate | null>(null);
  const [errorCode, setErrorCode] = useState<string>('UNKNOWN');
  const [rawMessage, setRawMessage] = useState<string | undefined>(undefined);
  const [rpcAvailable, setRpcAvailable] = useState<boolean | null>(null);

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
        console.error('[Verify] redeemCode threw', err);
        if (rpcAvailable === null) setRpcAvailable(false);
        const fallback = await verifyCodeOnly(input);
        if (fallback.ok) {
          if (fallback.template) setBenefit(fallback.template);
          else setBenefit({ title: fallback.templateCodeName, description: null, terms: null });
          setStatus('success');
          trackAnonymousRedemption({
            code_text: input,
            template_code_name: fallback.templateCodeName,
            code_id: fallback.code_id,
          });
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
        const fallback = await verifyCodeOnly(input);
        if (fallback.ok) {
          if (fallback.template) setBenefit(fallback.template);
          else setBenefit({ title: fallback.templateCodeName, description: null, terms: null });
          setStatus('success');
          trackAnonymousRedemption({
            code_text: input,
            template_code_name: fallback.templateCodeName,
            code_id: fallback.code_id,
          });
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
      console.error('[Verify] unexpected error', err);
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

  const langSwitcher = (
    <div className="flex items-center gap-2 font-mono text-sm uppercase tracking-wider">
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={`px-2 py-1 border-2 ${
          locale === 'en'
            ? 'bg-hopon-black text-white border-black'
            : 'border-black/30 text-black/70 hover:border-black'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('zh')}
        className={`px-2 py-1 border-2 ${
          locale === 'zh'
            ? 'bg-hopon-black text-white border-black'
            : 'border-black/30 text-black/70 hover:border-black'
        }`}
      >
        中文
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <BrandHeader rightSlot={langSwitcher} />

      <main className="pt-24 pb-12">
        <div className="max-w-[960px] mx-auto px-6 py-12">
          <h1 className="font-display font-bold text-3xl md:text-4xl uppercase tracking-tighter text-hopon-black mb-8">
            {t.pageTitle}
          </h1>
          <div className="flex justify-center">
            <RedeemCard
              state={status}
              code={code}
              setCode={setCode}
              onRedeem={runRedeem}
              onReset={tryAgain}
              texts={t}
              coupon={benefit}
              errorCode={errorCode}
              configured={configured}
              locale={locale}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
