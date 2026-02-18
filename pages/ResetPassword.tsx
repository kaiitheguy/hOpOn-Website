import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { BrandHeader } from '../components/BrandHeader';

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
      setErrorMessage(`密码至少 ${MIN_LENGTH} 位`);
      setStatus('error');
      return;
    }
    if (password !== confirm) {
      setErrorMessage('两次输入的密码不一致');
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
      <div className="min-h-screen bg-white">
        <BrandHeader />
        <main className="pt-24 pb-16 px-4 md:px-8 flex justify-center">
          <div className="max-w-md w-full bg-white border-2 border-black p-8 text-center">
            <p className="font-display font-bold text-hopon-black">加载中…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-white">
        <BrandHeader />
        <main className="pt-24 pb-16 px-4 md:px-8 flex justify-center">
          <div className="max-w-md w-full bg-white border-2 border-black p-8">
            <p className="font-display font-bold text-hopon-black mb-2">链接已失效</p>
            <p className="text-sm text-black/60 mb-2">Link expired</p>
            <p className="text-sm text-black/80 mb-6">请重新在登录页申请「忘记密码」并点击邮件中的链接。</p>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="w-full h-14 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors"
            >
              返回首页
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-white">
        <BrandHeader />
        <main className="pt-24 pb-16 px-4 md:px-8 flex justify-center">
          <div className="max-w-md w-full bg-white border-2 border-black p-8">
            <p className="font-display font-bold text-green-700 mb-2">密码已更新</p>
            <p className="text-sm text-black/60 mb-6">Password updated. You can sign in with your new password.</p>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="w-full h-14 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors"
            >
              去登录
            </button>
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
          <h1 className="font-display font-bold text-xl uppercase tracking-tight text-hopon-black mb-2">设置新密码</h1>
          <p className="text-sm text-black/60 mb-6">Set new password</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">
                新密码（至少 {MIN_LENGTH} 位）
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={status === 'submitting'}
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">
                再次输入
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-14 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
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
              className="w-full h-14 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? '提交中…' : '确认'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
