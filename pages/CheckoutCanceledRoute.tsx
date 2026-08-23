import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckoutCanceled } from './CheckoutCanceled';
import { clearSubscriptionCheckoutRequest, type SubscriptionPlanId } from '../lib/subscriptions';

const PLAN_IDS: readonly SubscriptionPlanId[] = ['starter', 'growth', 'multi-location'];

function isPlanId(value: string | null): value is SubscriptionPlanId {
  return value != null && PLAN_IDS.includes(value as SubscriptionPlanId);
}

export const CheckoutCanceledRoute: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const planId = searchParams.get('plan_id') ?? searchParams.get('planId');
    if (isPlanId(planId)) clearSubscriptionCheckoutRequest(planId);
  }, [searchParams]);

  return <CheckoutCanceled onReturn={() => navigate('/pricing')} />;
};

export default CheckoutCanceledRoute;
