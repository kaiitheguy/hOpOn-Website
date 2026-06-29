import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
  BrandBackground,
  BrandStatusCard,
  FieldLabel,
  brandInputClass,
  brandPrimaryButtonClass,
} from '../components/BrandChrome';

const MIN_LENGTH = 8;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'form' | 'submitting' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_LENGTH} characters.`);
      setStatus('error');
      return;
    }
    if (password !== confirm) {
      setErrorMessage('Passwords do not match.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setErrorMessage('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMessage(error.message);
      setStatus('error');
      return;
    }
    await supabase.auth.signOut();
    setStatus('success');
  };

  if (hasSession === null) {
    return (
      <BrandBackground>
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <BrandStatusCard title="Loading…" subtitle="Password reset" />
        </main>
      </BrandBackground>
    );
  }

  if (!hasSession) {
    return (
      <BrandBackground>
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <BrandStatusCard title="Link expired" subtitle="Password reset">
            <p className="text-sm leading-6 text-black/65">Please request another password reset email from the login page.</p>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className={`${brandPrimaryButtonClass} mt-8 w-full`}
            >
              Back to homepage
            </button>
          </BrandStatusCard>
        </main>
      </BrandBackground>
    );
  }

  if (status === 'success') {
    return (
      <BrandBackground>
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <BrandStatusCard title="Password updated" subtitle="You can sign in with your new password.">
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className={`${brandPrimaryButtonClass} w-full`}
            >
              Continue
            </button>
          </BrandStatusCard>
        </main>
      </BrandBackground>
    );
  }

  return (
    <BrandBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <BrandStatusCard title="Set new password" subtitle="Choose a secure password for your hOpOn account.">

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <FieldLabel htmlFor="password">New password, min {MIN_LENGTH} characters</FieldLabel>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={brandInputClass}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={status === 'submitting'}
              />
            </div>
            <div>
              <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={brandInputClass}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={status === 'submitting'}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className={`${brandPrimaryButtonClass} w-full`}
            >
              {status === 'submitting' ? 'Submitting…' : 'Confirm'}
            </button>
          </form>
        </BrandStatusCard>
      </main>
    </BrandBackground>
  );
};
