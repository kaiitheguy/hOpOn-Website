import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getAdminSessionState } from '../../lib/admin/api';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  const routeAfterAuth = async () => {
    const state = await getAdminSessionState();
    if (state.reason === 'ready') {
      navigate(from, { replace: true });
      return;
    }
    if (state.reason === 'pending') {
      navigate('/pending', { replace: true });
      return;
    }
    if (state.reason === 'rejected') {
      navigate('/rejected', { replace: true });
      return;
    }
    setMessage({ type: 'error', text: 'This account is not an approved hOpOn admin.' });
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setMessage({ type: 'error', text: error.message });
        return;
      }
      await routeAfterAuth();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim() || resetLoading) return;
    setResetLoading(true);
    setMessage(null);
    const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setResetLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({ type: 'success', text: 'Password reset email sent.' });
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-hopon-black">
      <style>{`
        .admin-login-bg {
          background:
            radial-gradient(circle at 18% 14%, rgba(255, 42, 42, 0.14), transparent 28rem),
            radial-gradient(circle at 80% 8%, rgba(15, 118, 110, 0.10), transparent 24rem),
            linear-gradient(180deg, #fbf6ec 0%, #f7f2e8 58%, #f1e6d8 100%);
        }
      `}</style>
      <div className="admin-login-bg flex min-h-screen items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-black/10 bg-white/80 p-8 shadow-[0_24px_80px_rgba(20,14,8,0.08)] backdrop-blur md:p-10">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                  <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
                  <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.85" />
                  <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.85" />
                </svg>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-black/45">hOpOn control room</p>
                <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Admin Login</h1>
              </div>
            </div>
            <p className="max-w-xl text-lg leading-8 text-black/65">
              Review users, manage Campaign Sourcing, run Growth OS Discovery, and prepare human-approved creator outreach.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {['No auto outreach', 'Growth OS bridge', 'Campaign operations'].map((item) => (
                <div key={item} className="rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-3 font-mono text-xs uppercase tracking-wider text-black/60">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(20,14,8,0.08)] md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-black/50">approved admins only</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/60">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-hopon-red/10"
                  placeholder="admin@hopon.app"
                  required
                />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label htmlFor="admin-password" className="block font-mono text-xs uppercase tracking-wider text-black/60">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={!email.trim() || resetLoading}
                    className="font-mono text-[11px] uppercase tracking-wider text-hopon-red disabled:text-black/30"
                  >
                    {resetLoading ? 'Sending...' : 'Reset'}
                  </button>
                </div>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm focus:border-black/40 focus:outline-none focus:ring-4 focus:ring-hopon-red/10"
                  required
                />
              </div>
              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    message.type === 'error'
                      ? 'border-red-200 bg-red-50 text-red-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {message.text}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-hopon-black px-5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-hopon-red disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Enter Admin'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-6 flex items-center justify-between text-sm text-black/45">
              <Link to="/" className="hover:text-black">Back to homepage</Link>
              <Link to="/merchant/login" className="hover:text-black">Merchant login</Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
