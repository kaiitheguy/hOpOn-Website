import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUserId } from '../../lib/merchant/api';

/**
 * Wraps merchant routes: redirects to /merchant/login if not logged in.
 * Uses getCurrentUserId() (Supabase session); no session → login.
 */
export const MerchantAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null | 'loading'>('loading');
  const location = useLocation();

  useEffect(() => {
    getCurrentUserId().then((id) => setUserId(id));
  }, []);

  if (userId === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hopon-grey">
        <p className="font-display font-bold text-hopon-black">加载中…</p>
      </div>
    );
  }

  if (userId == null) {
    return <Navigate to="/merchant/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
