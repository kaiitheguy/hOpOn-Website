import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getMerchantSessionState } from '../../lib/merchant/api';
import {
  BrandAuthLayout,
  FieldLabel,
  brandInputClass,
  brandPrimaryButtonClass,
} from '../../components/BrandChrome';

export const MerchantLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/merchant';

  const copy = {
    title: 'Merchant Login',
    subtitle: 'Merchant sign in',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    login: 'Login',
    loggingIn: 'Logging in…',
    loginSuccess: 'Login successful',
    loginFailed: 'Login failed',
    noAccount: "Don't have an account? ",
    signup: 'Sign up',
    forgotPassword: 'Forgot password?',
    resetSent: 'Password reset email sent. Check your inbox.',
    resetFailed: 'Could not send reset email',
    backToHome: 'Back to home',
  };

  const routeAfterAuth = async () => {
    const state = await getMerchantSessionState();
    if (state.reason === 'pending') {
      navigate('/pending', { replace: true });
      return;
    }
    if (state.reason === 'rejected') {
      navigate('/rejected', { replace: true });
      return;
    }
    if (state.reason === 'missing_profile') {
      navigate('/merchant/signup?complete=1', { replace: true });
      return;
    }
    if (state.reason === 'not_merchant' || !state.userId) {
      setMessage({ type: 'error', text: 'This is not a merchant account' });
      return;
    }
    navigate(from, { replace: true });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: 'error', text: error.message });
        return;
      }
      setMessage({ type: 'success', text: copy.loginSuccess });
      await routeAfterAuth();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.loginFailed });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim() || resetLoading) return;
    setMessage(null);
    setResetLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setResetLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message || copy.resetFailed });
      return;
    }
    setMessage({ type: 'success', text: copy.resetSent });
  };

  return (
    <BrandAuthLayout
      eyebrow="Merchant growth workspace"
      title={copy.title}
      description="Sign in to manage growth, campaigns, creator review, sourcing candidates, and attribution."
      badges={['Campaigns', 'Creator review', 'Attribution']}
    >
      <div>
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-black/45">{copy.subtitle}</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <FieldLabel htmlFor="email">
              {copy.email}
            </FieldLabel>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={brandInputClass}
              placeholder={copy.emailPlaceholder}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <FieldLabel htmlFor="password">
                {copy.password}
              </FieldLabel>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={!email.trim() || resetLoading}
                className="font-mono text-[11px] uppercase text-hopon-red hover:underline disabled:text-black/30"
              >
                {resetLoading ? '…' : copy.forgotPassword}
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={brandInputClass}
              required
            />
          </div>
          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-hopon-red' : 'text-green-700'}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`${brandPrimaryButtonClass} w-full`}
          >
            {loading ? copy.loggingIn : copy.login}
          </button>
        </form>
        <p className="mt-6 text-sm text-black/60 text-center">
          {copy.noAccount}{' '}
          <Link to="/merchant/signup" className="text-hopon-red hover:underline font-mono uppercase">{copy.signup}</Link>
        </p>
        <p className="mt-2 text-sm text-black/50 text-center">
          <Link to="/" className="hover:underline">{copy.backToHome}</Link>
        </p>
      </div>
    </BrandAuthLayout>
  );
};
