import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getMerchantSessionState } from '../../lib/merchant/api';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

export const MerchantLogin: React.FC = () => {
  const { isZh } = useMerchantLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/merchant';

  const copy = {
    title: isZh ? '商家登录' : 'Merchant Login',
    subtitle: isZh ? '商家登录' : 'Merchant sign in',
    email: isZh ? '邮箱' : 'Email',
    emailPlaceholder: 'you@example.com',
    password: isZh ? '密码' : 'Password',
    login: isZh ? '登录' : 'Login',
    loggingIn: isZh ? '登录中…' : 'Logging in…',
    loginSuccess: isZh ? '登录成功' : 'Login successful',
    loginFailed: isZh ? '登录失败' : 'Login failed',
    noAccount: isZh ? '没有账号？' : "Don't have an account? ",
    signup: isZh ? '注册' : 'Sign up',
    forgotPassword: isZh ? '忘记密码？' : 'Forgot password?',
    resetSent: isZh ? '重置密码邮件已发送，请检查邮箱' : 'Password reset email sent. Check your inbox.',
    resetFailed: isZh ? '发送失败' : 'Could not send reset email',
    backToHome: isZh ? '返回主站' : 'Back to home',
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
      navigate('/merchant/profile', { replace: true });
      return;
    }
    if (state.reason === 'not_merchant' || !state.userId) {
      setMessage({ type: 'error', text: isZh ? '该账号不是商家账号' : 'This is not a merchant account' });
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
    <div className="min-h-screen bg-hopon-grey flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black p-8">
        <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-2">
          {copy.title}
        </h1>
        <p className="text-sm text-black/60 mb-6">{copy.subtitle}</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">
              {copy.email}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              placeholder={copy.emailPlaceholder}
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3 mb-1">
              <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-black/70">
                {copy.password}
              </label>
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
              className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
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
            className="w-full h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors disabled:opacity-50"
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
    </div>
  );
};
