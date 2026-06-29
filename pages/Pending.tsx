import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandBackground, BrandStatusCard, brandPrimaryButtonClass, brandSecondaryButtonClass } from '../components/BrandChrome';

export const Pending: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Application Pending | hOpOn';
  }, []);

  return (
    <BrandBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <BrandStatusCard title="Application under review" subtitle="Email confirmed">
          <p className="text-sm leading-6 text-black/65">
            Your merchant application has been submitted. hOpOn will review it and notify you by email after approval.
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
              onClick={() => navigate('/merchant/login', { replace: true })}
              className={`${brandSecondaryButtonClass} w-full`}
            >
              Go to login
            </button>
          </div>
        </BrandStatusCard>
      </main>
    </BrandBackground>
  );
};
