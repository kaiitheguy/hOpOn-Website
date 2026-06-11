import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getMerchantSessionState } from '../../lib/merchant/api';
import type { MerchantSessionState } from '../../lib/merchant/types';

/**
 * Wraps merchant routes: redirects to /merchant/login if not logged in.
 * Uses getCurrentUserId() (Supabase session); no session → login.
 */
export const MerchantAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<MerchantSessionState | null>(null);
  const location = useLocation();

  useEffect(() => {
    getMerchantSessionState().then(setState);
  }, []);

  if (state == null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hopon-grey">
        <p className="font-display font-bold text-hopon-black">加载中…</p>
      </div>
    );
  }

  if (!state.userId || state.reason === 'not_merchant') {
    return <Navigate to="/merchant/login" state={{ from: location.pathname }} replace />;
  }

  if (state.reason === 'pending' && location.pathname !== '/pending') {
    return <Navigate to="/pending" replace />;
  }

  if (state.reason === 'rejected' && location.pathname !== '/rejected') {
    return <Navigate to="/rejected" replace />;
  }

  if (state.reason === 'missing_profile' && location.pathname !== '/merchant/profile') {
    return <Navigate to="/merchant/profile" replace />;
  }

  return <>{children}</>;
};
