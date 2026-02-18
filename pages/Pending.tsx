import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';

export const Pending: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '已激活 | hOpOn';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main className="pt-24 pb-16 px-4 md:px-8 flex justify-center">
        <div className="max-w-md w-full bg-white border-2 border-black p-8 text-center">
          <p className="font-display font-bold text-xl text-hopon-black mb-2">邮箱已确认 ✅</p>
          <p className="text-sm text-black/60 mb-4">Email confirmed</p>
          <p className="font-display font-bold text-hopon-black mb-2">你的申请已提交，正在审核中</p>
          <p className="text-sm text-black/60 mb-2">Your application has been submitted and is under review.</p>
          <p className="text-sm text-black/80 mb-8">我们会尽快审核，通过后会邮件通知。</p>

          <div className="space-y-4">
            <Link
              to="/"
              className="block w-full h-14 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors flex items-center justify-center"
            >
              回到首页
            </Link>
            <button
              type="button"
              onClick={() => navigate('/', { replace: true })}
              className="w-full h-14 border-2 border-black bg-white text-hopon-black font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-grey transition-colors"
            >
              去登录
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
