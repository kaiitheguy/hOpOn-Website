import React, { useEffect, useState } from 'react';
import { Footer } from '../components/Footer';
import { NavBar } from '../components/NavBar';
import { PricingSection, type PricingPlanId } from '../components/PricingSection';
import { startSubscriptionCheckout } from '../lib/subscriptions';

/** Standalone pricing surface so the homepage can stay focused on product proof. */
export const Pricing: React.FC = () => {
  const [loadingPlanId, setLoadingPlanId] = useState<PricingPlanId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Pricing | hOpOn';
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const handleSelectPlan = async (planId: PricingPlanId) => {
    if (loadingPlanId) return;

    setLoadingPlanId(planId);
    setErrorMessage(null);
    const result = await startSubscriptionCheckout(planId);
    if (result.ok) {
      window.location.assign(result.checkoutUrl);
      return;
    }

    setLoadingPlanId(null);
    if ('error' in result) setErrorMessage(result.error.message);
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <main className="pt-[74px] md:pt-[84px]">
        <PricingSection
          onSelectPlan={handleSelectPlan}
          loadingPlanId={loadingPlanId}
          errorMessage={errorMessage}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
