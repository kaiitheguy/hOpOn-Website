import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { BrandHeader } from '../components/BrandHeader';

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
          navigate('/pending', { replace: true });
          return;
        }

        setStatus('error');
        setErrorMessage('无法完成验证，请重试或重新点击邮件中的链接。');
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        const msg = err instanceof Error ? err.message : '验证失败';
        setErrorMessage(msg);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white">
        <BrandHeader />
        <main className="pt-24 pb-16 px-4 md:px-8 flex justify-center">
          <div className="max-w-md w-full bg-white border-2 border-black p-8 text-center">
            <p className="font-display font-bold text-hopon-black">处理中…</p>
            <p className="text-sm text-black/60 mt-1">Processing…</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main className="pt-24 pb-16 px-4 md:px-8 flex justify-center">
        <div className="max-w-md w-full bg-white border-2 border-black p-8">
          <p className="font-display font-bold text-hopon-black mb-2">验证失败</p>
          <p className="text-sm text-black/60 mb-2">Verification failed</p>
          <p className="text-sm text-black/80 mb-6">{errorMessage}</p>
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            className="w-full h-14 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors"
          >
            返回登录
          </button>
        </div>
      </main>
    </div>
  );
};
