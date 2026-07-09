import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { getMerchantSessionState } from '../lib/merchant/api';
import {
  SignupProfileError,
  completeMerchantSignupProfile,
  readMerchantSignupProfile,
} from '../lib/merchant/signupProfile';
import { BrandBackground, BrandStatusCard, brandPrimaryButtonClass } from '../components/BrandChrome';

function parseHashParams(hash: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!hash || hash.charAt(0) === '#') hash = hash.slice(1);
  hash.split('&').forEach((pair) => {
    const [k, v] = pair.split('=').map(decodeURIComponent);
    if (k && v) out[k] = v;
  });
  return out;
}

function getSearchParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const search = window.location.search;
      const hash = window.location.hash || '';
      const hashParams = parseHashParams(hash);
      const typeFromHash = hashParams['type'] || '';
      const typeFromSearch = getSearchParam('type');
      const type = typeFromHash || typeFromSearch || '';
      const code = getSearchParam('code');

      try {
        let { data: { session } } = await supabase.auth.getSession();

        if (!session && code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          const next = await supabase.auth.getSession();
          session = next.data.session;
        }

        if (cancelled) return;

        if (session) {
          if (type === 'recovery') {
            navigate('/reset-password', { replace: true });
            return;
          }
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          const merchantSignupProfile = readMerchantSignupProfile(user?.user_metadata);
          if (user && merchantSignupProfile) {
            await completeMerchantSignupProfile({
              userId: user.id,
              email: user.email ?? '',
              profile: merchantSignupProfile,
            });
          }
          const merchantState = await getMerchantSessionState();
          if (merchantState.reason === 'ready') {
            navigate('/merchant', { replace: true });
            return;
          }
          if (merchantState.reason === 'rejected') {
            navigate('/rejected', { replace: true });
            return;
          }
          navigate('/pending', { replace: true });
          return;
        }

        setStatus('error');
        setErrorMessage('Could not complete verification. Please retry or open the email link again.');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        const msg = err instanceof SignupProfileError
          ? err.message
          : err instanceof Error ? err.message : 'Verification failed';
        setErrorMessage(msg);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [navigate]);

  if (status === 'loading') {
    return (
      <BrandBackground>
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <BrandStatusCard title="Processing…" subtitle="Finishing account verification." />
        </main>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <BrandStatusCard title="Verification failed" subtitle="We could not complete this sign-in link.">
          <p className="text-sm leading-6 text-black/65">{errorMessage}</p>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className={`${brandPrimaryButtonClass} mt-8 w-full`}
          >
            Back to login
          </button>
        </BrandStatusCard>
      </main>
    </BrandBackground>
  );
};
