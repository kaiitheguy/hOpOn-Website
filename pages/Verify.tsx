import React, { useState } from 'react';
import { useLocale } from '../i18n';
import { getT } from '../i18n';
import { BrandHeader } from '../components/BrandHeader';
import { RedeemCard, type RedeemState } from '../components/RedeemCard';
import type { ValidateOrRedeemPayload } from '../lib/supabaseClient';
import { isSupabaseConfigured, validateCode } from '../lib/supabaseClient';

export const Verify: React.FC = () => {
  const [locale, setLocale, t] = useLocale('en');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<RedeemState>('idle');
  const [benefit, setBenefit] = useState<ValidateOrRedeemPayload | null>(null);
  const [errorReason, setErrorReason] = useState<string>('UNKNOWN');

  const runRedeem = async () => {
    const input = code.trim();
    if (!input) return;
    setStatus('loading');
    setBenefit(null);
    setErrorReason('UNKNOWN');

    try {
      // 暂时仅校验、不测 session，只调 validate_code
      const validateResult = await validateCode(input);
      if (validateResult.ok) {
        setBenefit(validateResult.data);
        setStatus('success');
      } else {
        setErrorReason(validateResult.ok === false ? validateResult.reason : 'invalid_code');
        setStatus('failed');
      }
    } catch (err) {
      console.error('[Verify] unexpected error', err);
      setErrorReason('invalid_code');
      setStatus('failed');
    }
  };

  const tryAgain = () => {
    setStatus('idle');
    setCode('');
    setBenefit(null);
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
              result={benefit}
              errorReason={errorReason}
              configured={configured}
              locale={locale}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
