import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, Loader2, ReceiptText, Sparkles } from 'lucide-react';
import { BrandHeader } from '../components/BrandHeader';
import {
  fallbackRedeemCampaigns,
  isSupabaseConfigured,
  listActiveHoponRedeemCampaigns,
  trackHoponOfferRedeem,
  type HoponRedeemCampaign,
  type HoponRedeemCreator,
} from '../lib/supabaseClient';

type RedeemStep = 'campaign' | 'creator' | 'offer';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ProgressDots({ step }: { step: RedeemStep }) {
  const activeIndex = step === 'campaign' ? 0 : step === 'creator' ? 1 : 2;
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`h-2 flex-1 rounded-full ${index <= activeIndex ? 'bg-hopon-red' : 'bg-black/10'}`}
        />
      ))}
    </div>
  );
}

function CampaignCard({
  campaign,
  selected,
  onClick,
}: {
  campaign: HoponRedeemCampaign;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border p-4 text-left transition-colors ${
        selected ? 'border-hopon-red bg-[#FFF5F5]' : 'border-black/10 bg-white hover:border-black'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold leading-tight text-hopon-black">{campaign.title}</h2>
          <p className="mt-1 text-sm text-black/60">{campaign.merchantName}</p>
        </div>
        <span className="shrink-0 bg-hopon-grey px-2 py-1 font-mono text-[11px] uppercase text-black/60">
          5% off
        </span>
      </div>
    </button>
  );
}

function CreatorCard({
  creator,
  selected,
  onClick,
}: {
  creator: HoponRedeemCreator;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border p-4 text-left transition-colors ${
        selected ? 'border-hopon-red bg-[#FFF5F5]' : 'border-black/10 bg-white hover:border-black'
      }`}
    >
      {creator.avatarUrl ? (
        <img src={creator.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-hopon-red font-display font-bold text-white">
          {initials(creator.name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg font-bold leading-tight text-hopon-black">{creator.name}</div>
        <div className="mt-1 font-mono text-[11px] uppercase text-black/50">@{creator.handle} · {creator.platform}</div>
        <div className="mt-1 text-sm text-black/60">{creator.label}</div>
      </div>
    </button>
  );
}

export const Verify: React.FC = () => {
  const [campaigns, setCampaigns] = useState<HoponRedeemCampaign[]>(fallbackRedeemCampaigns);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [step, setStep] = useState<RedeemStep>('campaign');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [redeemReady, setRedeemReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCampaigns() {
      setLoading(true);
      const configured = isSupabaseConfigured();
      const liveCampaigns = await listActiveHoponRedeemCampaigns();
      if (!mounted) return;
      if (liveCampaigns.length > 0) {
        setCampaigns(liveCampaigns);
        setUsingDemo(false);
      } else if (!configured) {
        setCampaigns(fallbackRedeemCampaigns);
        setUsingDemo(true);
      } else {
        setCampaigns([]);
        setUsingDemo(false);
      }
      setLoading(false);
    }
    void loadCampaigns();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId]
  );

  const selectedCreator = useMemo(
    () => selectedCampaign?.creators.find((creator) => creator.id === selectedCreatorId) || null,
    [selectedCampaign, selectedCreatorId]
  );

  const chooseCampaign = (campaign: HoponRedeemCampaign) => {
    setSelectedCampaignId(campaign.id);
    setSelectedCreatorId('');
    setRedeemReady(false);
    setStep('creator');
  };

  const chooseCreator = (creator: HoponRedeemCreator) => {
    setSelectedCreatorId(creator.id);
    setRedeemReady(false);
    setStep('offer');
  };

  const showToStaff = () => {
    if (!selectedCampaign || !selectedCreator) return;
    setRedeemReady(true);
    if (!usingDemo && isSupabaseConfigured()) {
      trackHoponOfferRedeem({
        campaignId: selectedCampaign.id,
        campaignTitle: selectedCampaign.title,
        merchantName: selectedCampaign.merchantName,
        creatorId: selectedCreator.id,
        creatorHandle: selectedCreator.handle,
        offerType: selectedCampaign.offerType,
        offerValue: selectedCampaign.offerValue,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8]">
      <BrandHeader />

      <main className="mx-auto max-w-2xl px-4 pb-10 pt-28 md:px-6">
        <div className="mb-5">
          <p className="font-mono text-xs uppercase text-black/50">In-store offer</p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-hopon-black">
            Claim your Hopon offer
          </h1>
          <p className="mt-3 text-base leading-7 text-black/60">
            Pick the offer you came for, choose who brought you here, then show staff your reward.
          </p>
        </div>

        <div className="border border-black bg-white p-4 shadow-[8px_8px_0_0_#050505] md:p-5">
          <ProgressDots step={step} />

          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 animate-spin text-hopon-red" />
              <p className="mt-4 font-display text-xl font-bold text-hopon-black">Finding today&apos;s Hopon offers</p>
            </div>
          ) : null}

          {!loading && step === 'campaign' ? (
            <section className="pt-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-hopon-red" />
                <h2 className="font-display text-2xl font-bold text-hopon-black">Which offer are you here for?</h2>
              </div>
              {campaigns.length > 0 ? (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      selected={campaign.id === selectedCampaignId}
                      onClick={() => chooseCampaign(campaign)}
                    />
                  ))}
                </div>
              ) : (
                <div className="border border-black/10 bg-hopon-grey p-5">
                  <p className="font-display text-xl font-bold text-hopon-black">No open public offers right now.</p>
                  <p className="mt-2 text-sm leading-6 text-black/60">
                    Please ask staff if there is another Hopon campaign available today.
                  </p>
                </div>
              )}
              {usingDemo ? (
                <p className="mt-4 text-xs leading-5 text-black/50">
                  Demo offers are showing because live campaigns are unavailable or not configured.
                </p>
              ) : null}
            </section>
          ) : null}

          {!loading && step === 'creator' && selectedCampaign ? (
            <section className="pt-6">
              <button
                type="button"
                onClick={() => setStep('campaign')}
                className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase text-black/60"
              >
                <ChevronLeft className="h-4 w-4" />
                Change offer
              </button>
              <div className="mb-4">
                <p className="font-mono text-xs uppercase text-hopon-red">{selectedCampaign.title}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-hopon-black">Who brought you here?</h2>
              </div>
              <div className="space-y-3">
                {selectedCampaign.creators.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    selected={creator.id === selectedCreatorId}
                    onClick={() => chooseCreator(creator)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {!loading && step === 'offer' && selectedCampaign && selectedCreator ? (
            <section className="pt-6">
              <button
                type="button"
                onClick={() => setStep('creator')}
                className="mb-4 inline-flex items-center gap-1 font-mono text-xs uppercase text-black/60"
              >
                <ChevronLeft className="h-4 w-4" />
                Change creator
              </button>

              {!redeemReady ? (
                <div className="border border-[#2F7D5B] bg-[#EAF4EF] p-5 text-[#2F7D5B]">
                  <CheckCircle2 className="h-9 w-9" />
                  <h2 className="mt-4 font-display text-3xl font-bold leading-tight">You unlocked 5% off today.</h2>
                  <p className="mt-3 text-sm leading-6">
                    Tap below when you are ready to show this offer to staff.
                  </p>
                  <button
                    type="button"
                    onClick={showToStaff}
                    className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 bg-hopon-black px-5 py-4 font-display text-sm font-bold uppercase text-white"
                  >
                    Show to Staff
                    <ReceiptText className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border border-black bg-white p-5">
                  <p className="font-mono text-xs uppercase text-black/50">Hopon Offer</p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-hopon-black">Ready to redeem</h2>
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                      <span className="text-black/50">Campaign</span>
                      <span className="text-right font-semibold text-hopon-black">{selectedCampaign.title}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                      <span className="text-black/50">Creator</span>
                      <span className="text-right font-semibold text-hopon-black">@{selectedCreator.handle}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-black/10 pb-3">
                      <span className="text-black/50">Reward</span>
                      <span className="text-right font-semibold text-hopon-black">5% off</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-black/50">Status</span>
                      <span className="text-right font-semibold text-[#2F7D5B]">Ready to redeem</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
};
