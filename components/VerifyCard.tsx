import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Locale } from '../i18n';
import { getT, getErrorMessage } from '../i18n';
import type { ValidateOrRedeemPayload } from '../lib/supabaseClient';
import { isSupabaseConfigured, validateCode } from '../lib/supabaseClient';

type Status = 'idle' | 'loading' | 'success' | 'failed';

type VerifyCardProps = {
  locale: Locale;
};

export const VerifyCard: React.FC<VerifyCardProps> = ({ locale }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ValidateOrRedeemPayload | null>(null);
  const [errorReason, setErrorReason] = useState<string>('UNKNOWN');

  const t = getT(locale);

  const runRedeem = async () => {
    const input = code.trim();
    if (!input) return;
    setStatus('loading');
    setResult(null);
    setErrorReason('UNKNOWN');

    try {
      // 暂时仅校验、不测 session
      const validateResult = await validateCode(input);
      if (validateResult.ok) {
        setResult(validateResult.data);
        setStatus('success');
      } else {
        setErrorReason(validateResult.ok === false ? validateResult.reason : 'invalid_code');
        setStatus('failed');
      }
    } catch (err) {
      console.error('[VerifyCard] unexpected error', err);
      setErrorReason('invalid_code');
      setStatus('failed');
    }
  };

  const tryAgain = () => {
    setStatus('idle');
    setCode('');
    setResult(null);
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
          {result && (
            <div className="border-t border-black/20 pt-4 space-y-2 text-sm">
              {(result.title || result.description) && (
                <>
                  {result.title && (
                    <p className="font-display font-bold text-hopon-black">
                      {result.title}
                    </p>
                  )}
                  {result.description && (
                    <p className="text-black/80">{result.description}</p>
                  )}
                </>
              )}
              {result.benefits?.length > 0 && (
                <ul className="list-disc pl-6 space-y-1 text-black/80">
                  {result.benefits.map((b, i) => {
                    if (!b || typeof b !== 'object') return null;
                    const text = b.title ?? b.description ?? (b.type === '自定义效果' ? '' : b.type);
                    if (!text) return null;
                    return <li key={i}>{text}</li>;
                  })}
                </ul>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={tryAgain}
            className="text-sm font-mono uppercase tracking-wider text-hopon-black underline underline-offset-4 hover:text-hopon-red"
          >
            {t.redeemMore}
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
            {getErrorMessage(locale, errorReason)}
          </p>
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
