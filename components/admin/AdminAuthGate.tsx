import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAdminSessionState } from '../../lib/admin/api';
import type { AdminSessionState } from '../../lib/admin/types';

export const AdminAuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AdminSessionState | null>(null);
  const location = useLocation();

  useEffect(() => {
    getAdminSessionState().then(setState);
  }, []);

  if (state == null) {
    return (
      <div className="min-h-screen bg-[#F7F2E8] flex items-center justify-center text-hopon-black">
        <div className="rounded-3xl border border-black/10 bg-white px-6 py-5 shadow-sm">
          <p className="font-display font-bold">Loading admin workspace...</p>
        </div>
      </div>
    );
  }

  if (!state.userId || state.reason === 'not_admin' || state.reason === 'unknown') {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (state.reason === 'pending') {
    return <Navigate to="/pending" replace />;
  }

  if (state.reason === 'rejected') {
    return <Navigate to="/rejected" replace />;
  }

  return <>{children}</>;
};
