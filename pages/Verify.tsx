import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, Loader2, ReceiptText, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import {
  fallbackRedeemCampaigns,
  getHoponRedeemCampaignByLink,
  getOrCreateVerifyAnonymousVisitor,
  isSupabaseConfigured,
  listActiveHoponRedeemCampaigns,
  trackHoponOfferRedeem,
  type HoponRedemptionLocation,
  type HoponRedeemCampaign,
  type HoponRedeemCreator,
} from '../lib/supabaseClient';
import { isSafeImageUrl } from '../lib/safeImageUrl';

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

function getBrowserRedemptionLocation(): Promise<HoponRedemptionLocation | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 60_000,
      }
    );
  });
}

function CampaignCard({
  campaign,
  selected,
  onClick,
}: {
  campaign: HoponRedeemCampaign;
  selected: boolean;
  onClick: () => void;
  key?: React.Key;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
        selected ? 'border-hopon-red bg-[#FFF5F5]' : 'border-black/10 bg-white hover:border-black/35'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold leading-tight text-hopon-black">{campaign.title}</h2>
          <p className="mt-1 text-sm text-black/60">{campaign.merchantName}</p>
        </div>
        <span className="shrink-0 rounded-full bg-hopon-grey px-2.5 py-1 font-mono text-[11px] uppercase text-black/60">
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
  key?: React.Key;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = !imageFailed && isSafeImageUrl(creator.avatarUrl) ? creator.avatarUrl : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
        selected ? 'border-hopon-red bg-[#FFF5F5]' : 'border-black/10 bg-white hover:border-black/35'
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-12 w-12 rounded-full object-cover"
          onError={() => setImageFailed(true)}
        />
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
  const [searchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState<HoponRedeemCampaign[]>(fallbackRedeemCampaigns);
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [step, setStep] = useState<RedeemStep>('campaign');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedCreatorId, setSelectedCreatorId] = useState('');
  const [redeemReady, setRedeemReady] = useState(false);
  const [initialSelectionApplied, setInitialSelectionApplied] = useState(false);

  const requestedCampaignId = searchParams.get('campaign') ?? searchParams.get('campaignId') ?? searchParams.get('c') ?? '';
  const requestedCreatorId = searchParams.get('creator') ?? searchParams.get('creatorId') ?? searchParams.get('cr') ?? '';
  const forceDemo = searchParams.get('demo') === '1' || searchParams.get('demo') === 'true';

  useEffect(() => {
    let mounted = true;
    async function loadCampaigns() {
      setLoading(true);
      if (forceDemo) {
        setCampaigns(fallbackRedeemCampaigns);
        setUsingDemo(true);
        setLoading(false);
        return;
      }
      const configured = isSupabaseConfigured();
      if (configured && requestedCampaignId) {
        const directCampaign = await getHoponRedeemCampaignByLink(requestedCampaignId, requestedCreatorId || undefined);
        if (!mounted) return;
        if (directCampaign) {
          setCampaigns([directCampaign]);
          setUsingDemo(false);
          setLoading(false);
          return;
        }
      }
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
  }, [forceDemo, requestedCampaignId, requestedCreatorId]);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) || null,
    [campaigns, selectedCampaignId]
  );

  const selectedCreator = useMemo(
    () => selectedCampaign?.creators.find((creator) => creator.id === selectedCreatorId) || null,
    [selectedCampaign, selectedCreatorId]
  );

  useEffect(() => {
    if (loading || initialSelectionApplied) return;
    if (!requestedCampaignId) {
      setInitialSelectionApplied(true);
      return;
    }

    const campaign = campaigns.find((item) => item.id === requestedCampaignId);
    if (!campaign) {
      setInitialSelectionApplied(true);
      return;
    }

    setSelectedCampaignId(campaign.id);
    if (requestedCreatorId) {
      const creator = campaign.creators.find((item) => item.id === requestedCreatorId);
      if (creator) {
        setSelectedCreatorId(creator.id);
        setStep('offer');
      } else {
        setStep('creator');
      }
    } else {
      setStep('creator');
    }
    setInitialSelectionApplied(true);
  }, [campaigns, initialSelectionApplied, loading, requestedCampaignId, requestedCreatorId]);

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
      void (async () => {
        const [anonymousVisitor, location] = await Promise.all([
          Promise.resolve(getOrCreateVerifyAnonymousVisitor()),
          getBrowserRedemptionLocation(),
        ]);
        trackHoponOfferRedeem({
          campaignId: selectedCampaign.id,
          campaignTitle: selectedCampaign.title,
          merchantName: selectedCampaign.merchantName,
          creatorId: selectedCreator.id,
          creatorHandle: selectedCreator.handle,
          offerType: selectedCampaign.offerType,
          offerValue: selectedCampaign.offerValue,
          anonymousVisitor,
          location,
          sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
          directLink: Boolean(requestedCampaignId),
        });
      })();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2E8]">
      <style>{`
        .verify-bg {
          background:
            radial-gradient(circle at 16% 10%, rgba(255,42,42,0.11), transparent 28rem),
            radial-gradient(circle at 86% 4%, rgba(13,148,136,0.09), transparent 24rem),
            linear-gradient(180deg, #fbf6ec 0%, #f7f2e8 56%, #f1e4d5 100%);
        }
      `}</style>
      <BrandHeader />

      <main className="verify-bg mx-auto min-h-screen max-w-none px-4 pb-10 pt-28 md:px-6">
        <div className="mx-auto max-w-2xl">
        <div className="mb-5">
          <p className="font-mono text-xs uppercase text-black/50">In-store offer</p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-hopon-black">
            Claim your Hopon offer
          </h1>
          <p className="mt-3 text-base leading-7 text-black/60">
            Pick the offer you came for, choose who brought you here, then show staff your reward.
          </p>
        </div>

        <div className="rounded-[30px] border border-black/10 bg-white/88 p-4 shadow-[0_24px_80px_rgba(20,14,8,0.08)] backdrop-blur md:p-5">
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
                <div className="rounded-2xl border border-black/10 bg-hopon-grey p-5">
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
                <div className="rounded-3xl border border-[#2F7D5B]/25 bg-[#EAF4EF] p-5 text-[#2F7D5B]">
                  <CheckCircle2 className="h-9 w-9" />
                  <h2 className="mt-4 font-display text-3xl font-bold leading-tight">You unlocked 5% off today.</h2>
                  <p className="mt-3 text-sm leading-6">
                    Tap below when you are ready to show this offer to staff.
                  </p>
                  <button
                    type="button"
                    onClick={showToStaff}
                    className="mt-5 flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-hopon-black px-5 py-4 font-display text-sm font-bold uppercase text-white transition hover:bg-hopon-red"
                  >
                    Show to Staff
                    <ReceiptText className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-black/10 bg-white p-5">
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
        </div>
      </main>
    </div>
  );
};
