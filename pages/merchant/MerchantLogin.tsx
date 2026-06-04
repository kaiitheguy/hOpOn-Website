import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

export const MerchantLogin: React.FC = () => {
  const { isZh } = useMerchantLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
    backToHome: isZh ? '返回主站' : 'Back to home',
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
      navigate(from, { replace: true });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : copy.loginFailed });
    } finally {
      setLoading(false);
    }
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
            <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">
              {copy.password}
            </label>
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
