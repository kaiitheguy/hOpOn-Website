import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BrandBackground, BrandStatusCard, brandPrimaryButtonClass, brandSecondaryButtonClass } from '../components/BrandChrome';
import { CheckoutSuccess } from './CheckoutSuccess';
import { claimSubscriptionCheckout, createBillingPortal, clearSubscriptionCheckoutRequest, getSubscriptionCheckout, type SubscriptionCheckoutStatus } from '../lib/subscriptions';
import { supabase } from '../lib/supabaseClient';
import { getMerchantSessionState } from '../lib/merchant/api';

type CheckoutRouteState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | { phase: 'pending'; message: string }
  | {
      phase: 'success';
      data: SubscriptionCheckoutStatus;
      isAuthenticated: boolean;
      canManageBilling: boolean;
      needsAccountSetup: boolean;
      claimError: string | null;
    };

const missingSessionMessage = 'This checkout link is missing or expired. Please return to pricing.';
const CHECKOUT_STATUS_POLL_DELAYS = [2000, 3000, 5000, 5000];

function RouteStatus({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <BrandBackground>
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <BrandStatusCard title={title} subtitle={subtitle}>{children}</BrandStatusCard>
      </main>
    </BrandBackground>
  );
}

export const CheckoutSuccessRoute: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id')?.trim() ?? '';
  const [state, setState] = useState<CheckoutRouteState>({ phase: 'loading' });
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadCheckoutStatus() {
      if (!sessionId) {
        setState({ phase: 'error', message: missingSessionMessage });
        return;
      }

      setState({ phase: 'loading' });
      let result = await getSubscriptionCheckout(sessionId);
      let pollIndex = 0;
      while (!cancelled && !('error' in result) && !result.data.confirmed && pollIndex < CHECKOUT_STATUS_POLL_DELAYS.length) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, CHECKOUT_STATUS_POLL_DELAYS[pollIndex]));
        if (cancelled) return;
        pollIndex += 1;
        result = await getSubscriptionCheckout(sessionId);
      }
      if (cancelled) return;

      if ('error' in result) {
        setState({ phase: 'error', message: result.error.message });
        return;
      }

      if (!result.data.confirmed) {
        setState({
          phase: 'pending',
          message: 'We are still confirming your payment method. This page will not show a started trial until the server confirms it.',
        });
        return;
      }

      if (result.data.planId) clearSubscriptionCheckoutRequest(result.data.planId);

      const { data: sessionData } = await supabase.auth.getSession();
      if (cancelled) return;

      const session = sessionData.session;
      let canManageBilling = false;
      let needsAccountSetup = false;
      let claimError: string | null = null;
      if (session) {
        const claimResult = await claimSubscriptionCheckout(sessionId);
        if (cancelled) return;
        const claimSucceeded = 'claimed' in claimResult;
        if (!claimSucceeded) claimError = claimResult.error.message;
        const merchantState = await getMerchantSessionState();
        if (cancelled) return;
        const isMerchant = merchantState.userId === session.user.id && merchantState.reason !== 'not_merchant' && merchantState.reason !== 'no_session';
        canManageBilling = claimSucceeded && isMerchant && merchantState.reason !== 'missing_profile';
        needsAccountSetup = isMerchant && merchantState.reason === 'missing_profile';
      }

      setState({
        phase: 'success',
        data: result.data,
        isAuthenticated: Boolean(session),
        canManageBilling,
        needsAccountSetup,
        claimError,
      });
    }

    loadCheckoutStatus();
    return () => {
      cancelled = true;
    };
  }, [sessionId, retryNonce]);

  if (state.phase === 'loading') {
    return <RouteStatus title="Confirming checkout…" subtitle="Secure subscription setup" />;
  }

  if (state.phase === 'error') {
    return (
      <RouteStatus title="Checkout needs attention" subtitle="We could not confirm your trial">
        <p className="text-sm leading-6 text-black/65">{state.message}</p>
        <Link to="/pricing" className={`${brandPrimaryButtonClass} mt-8 w-full`}>Return to pricing</Link>
      </RouteStatus>
    );
  }

  if (state.phase === 'pending') {
    return (
      <RouteStatus title="Still confirming" subtitle="Your trial is not marked as started yet">
        <p className="text-sm leading-6 text-black/65">{state.message}</p>
        <button
          type="button"
          onClick={() => setRetryNonce((value) => value + 1)}
          className={`${brandPrimaryButtonClass} mt-8 w-full`}
        >
          Refresh status
        </button>
        <Link to="/pricing" className={`${brandSecondaryButtonClass} mt-3 w-full`}>Return to pricing</Link>
      </RouteStatus>
    );
  }

  const handleCreateAccount = state.isAuthenticated
    ? undefined
    : () => {
        window.location.assign(`/merchant/signup?checkout_session_id=${encodeURIComponent(sessionId)}`);
      };

  const handleFinishAccountSetup = state.needsAccountSetup
    ? () => {
        window.location.assign(`/merchant/signup?complete=1&checkout_session_id=${encodeURIComponent(sessionId)}`);
      }
    : undefined;

  const handleManageBilling = state.canManageBilling && !billingLoading
    ? async () => {
        setBillingLoading(true);
        setBillingError(null);
        const returnUrl = typeof window === 'undefined' ? '' : window.location.href;
        const result = await createBillingPortal(returnUrl);
        if ('portalUrl' in result) {
          window.location.assign(result.portalUrl);
          return;
        }
        setBillingLoading(false);
        setBillingError(result.error.message);
      }
    : undefined;

  return (
    <CheckoutSuccess
      status={state.data.status}
      errorMessage={billingError ?? state.claimError}
      planName={state.data.planName}
      trialEnd={state.data.trialEnd}
      founding={state.data.founding}
      onCreateAccount={state.needsAccountSetup ? undefined : handleCreateAccount}
      onFinishAccountSetup={handleFinishAccountSetup}
      onManageBilling={handleManageBilling}
    />
  );
};

export default CheckoutSuccessRoute;
