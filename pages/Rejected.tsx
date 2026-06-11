import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { supabase } from '../lib/supabaseClient';

export const Rejected: React.FC = () => {
  useEffect(() => {
    document.title = '审核未通过 | hOpOn';
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/merchant/login';
  };

  return (
    <div className="min-h-screen bg-white">
      <BrandHeader />
      <main className="pt-24 pb-16 px-4 md:px-8 flex justify-center">
        <div className="max-w-md w-full bg-white border-2 border-black p-8 text-center">
          <p className="font-display font-bold text-xl text-hopon-black mb-2">申请暂未通过</p>
          <p className="text-sm text-black/60 mb-4">Application not approved</p>
          <p className="text-sm text-black/80 mb-8">
            你的商家申请暂时未通过审核。如需更新资料，请联系我们或使用其他账号重新申请。
          </p>
          <div className="space-y-4">
            <Link
              to="/"
              className="flex h-14 w-full items-center justify-center border-2 border-black bg-hopon-black text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-hopon-red"
            >
              返回主站
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="h-14 w-full border-2 border-black bg-white text-sm font-bold uppercase tracking-wider text-hopon-black transition-colors hover:bg-hopon-grey"
            >
              退出登录
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
