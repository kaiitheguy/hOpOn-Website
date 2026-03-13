import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

export const MerchantLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/merchant';

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
      setMessage({ type: 'success', text: '登录成功' });
      navigate(from, { replace: true });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '登录失败' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hopon-grey flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black p-8">
        <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-2">
          商家登录
        </h1>
        <p className="text-sm text-black/60 mb-6">Merchant sign in</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">
              密码
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
            {loading ? '登录中…' : '登录'}
          </button>
        </form>
        <p className="mt-6 text-sm text-black/60 text-center">
          没有账号？{' '}
          <Link to="/merchant/signup" className="text-hopon-red hover:underline font-mono uppercase">注册</Link>
        </p>
        <p className="mt-2 text-sm text-black/50 text-center">
          <Link to="/" className="hover:underline">返回主站</Link>
        </p>
      </div>
    </div>
  );
};
