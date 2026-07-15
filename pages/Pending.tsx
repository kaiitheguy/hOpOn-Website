import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandBackground, BrandStatusCard, brandPrimaryButtonClass, brandSecondaryButtonClass } from '../components/BrandChrome';

const APP_LOGIN_DEEP_LINK = 'hamono:///login';
const APP_STORE_URL = 'https://apps.apple.com/us/app/hopon-%E4%B8%B2%E5%BA%97/id6757418054';

export const Pending: React.FC = () => {
  const [searchParams] = useSearchParams();
  const needsEmailVerification = searchParams.get('verify') === 'email';
  const isCreator = searchParams.get('role') === 'creator';
  const needsCreatorSetup = isCreator && searchParams.get('setup') === 'required';

  const title = needsEmailVerification
    ? 'Check your email'
    : needsCreatorSetup
      ? 'Creator email confirmed'
      : isCreator
        ? 'Creator application under review'
        : 'Merchant application under review';
  const subtitle = needsEmailVerification
    ? 'Confirm email to finish signup'
    : needsCreatorSetup
      ? 'Continue your creator setup in the hOpOn app'
      : 'Email confirmed';
  const description = needsEmailVerification
    ? isCreator
      ? 'We created your creator account. Open the confirmation link we sent you, then return to the hOpOn app to finish your creator profile.'
      : 'We created your account. Open the confirmation link we sent you, then hOpOn will finish your merchant profile and send it to review.'
    : needsCreatorSetup
      ? 'Your email is verified. Return to the hOpOn app, sign in with this email, and complete your creator profile before submitting it for review.'
      : isCreator
        ? 'Your creator application has been submitted. hOpOn will review it and notify you after approval.'
        : 'Your merchant application has been submitted. hOpOn will review it and notify you by email after approval.';

  useEffect(() => {
    document.title = isCreator ? 'Creator Signup | hOpOn' : 'Merchant Signup | hOpOn';
  }, [isCreator]);

  const openAppLogin = () => {
    window.location.href = APP_LOGIN_DEEP_LINK;
    window.setTimeout(() => {
      if (!document.hidden) window.location.href = APP_STORE_URL;
    }, 1400);
  };

  return (
    <BrandBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <BrandStatusCard
          title={title}
          subtitle={subtitle}
        >
          <p className="text-sm leading-6 text-black/65">
            {description}
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={openAppLogin}
              className={`${brandPrimaryButtonClass} w-full`}
            >
              {isCreator ? 'Open Creator login' : 'Open Merchant login'}
            </button>
            <Link
              to="/"
              className={`${brandSecondaryButtonClass} w-full`}
            >
              Back to homepage
            </Link>
          </div>
        </BrandStatusCard>
      </main>
    </BrandBackground>
  );
};
