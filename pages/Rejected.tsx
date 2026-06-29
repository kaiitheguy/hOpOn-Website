import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { BrandBackground, BrandStatusCard, brandPrimaryButtonClass, brandSecondaryButtonClass } from '../components/BrandChrome';

export const Rejected: React.FC = () => {
  useEffect(() => {
    document.title = 'Application Not Approved | hOpOn';
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/merchant/login';
  };

  return (
    <BrandBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <BrandStatusCard title="Application not approved" subtitle="Merchant review">
          <p className="text-sm leading-6 text-black/65">
            Your merchant application was not approved. Contact hOpOn if you need to update your business information or submit a new application.
          </p>
          <div className="mt-8 space-y-3">
            <Link
              to="/"
              className={`${brandPrimaryButtonClass} w-full`}
            >
              Back to homepage
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={`${brandSecondaryButtonClass} w-full`}
            >
              Sign out
            </button>
          </div>
        </BrandStatusCard>
      </main>
    </BrandBackground>
  );
};
