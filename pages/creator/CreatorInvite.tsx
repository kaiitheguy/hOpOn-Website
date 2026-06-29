import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Instagram, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

type InvitePreview = {
  campaign?: {
    title?: string | null;
    description?: string | null;
    offer?: string | null;
    location?: string | null;
    platforms?: string[];
    startDate?: string | null;
    endDate?: string | null;
    merchant?: {
      name?: string | null;
      category?: string | null;
      city?: string | null;
    };
  };
  creatorFit?: {
    platform?: string | null;
    handle?: string | null;
    reasons?: string[];
  };
  compensationNote?: string | null;
};

export const CreatorInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const deepLink = token ? `hamono:///creator-invite?token=${encodeURIComponent(token)}` : 'hamono:///';
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadPreview = async () => {
      if (!token) return;
      setLoadingPreview(true);
      const { data, error } = await supabase.functions.invoke('resolve-creator-invite', {
        body: { action: 'resolve', token },
      });
      if (!cancelled) {
        if (!error && data?.ok) setPreview(data as InvitePreview);
        setLoadingPreview(false);
      }
    };
    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const merchantName = preview?.campaign?.merchant?.name ?? 'a local hOpOn merchant';
  const campaignTitle = preview?.campaign?.title ?? 'a hOpOn creator campaign';
  const campaignDescription = preview?.campaign?.description;
  const offer = preview?.campaign?.offer;
  const fitReasons = preview?.creatorFit?.reasons ?? [];

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-hopon-black">
      <style>{`
        .creator-invite-bg {
          background:
            radial-gradient(circle at 16% 10%, rgba(255,42,42,0.14), transparent 28rem),
            radial-gradient(circle at 84% 6%, rgba(13,148,136,0.10), transparent 24rem),
            linear-gradient(180deg, #fbf6ec 0%, #f7f2e8 56%, #f2e5d6 100%);
        }
      `}</style>
      <main className="creator-invite-bg flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-[34px] border border-black/10 bg-white/82 p-6 shadow-[0_28px_90px_rgba(20,14,8,0.10)] backdrop-blur md:p-10">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                  <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
                  <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.85" />
                  <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.85" />
                </svg>
              </div>
              <div>
                <div className="font-display text-2xl font-bold tracking-tight">hOpOn</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-black/45">creator invite</div>
              </div>
            </Link>
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-emerald-800 sm:inline-flex">
              Campaign invite
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#FAFAF7] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-black/50">
                <Instagram className="h-4 w-4 text-hopon-red" />
                Local business collaboration
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
                You were invited to {campaignTitle}.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-black/65">
                {preview
                  ? `${merchantName} is inviting creators through hOpOn. Review the campaign, add your social handle or profile link, and apply in the app.`
                  : 'hOpOn connects creators with local restaurants, cafes, dessert shops, and other neighborhood businesses. Campaigns can be free experiences, product exchanges, or paid collaborations, depending on the merchant brief.'}
              </p>
              {loadingPreview && <p className="mt-4 font-mono text-xs uppercase tracking-wider text-black/35">Loading invite details...</p>}
              {preview && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Merchant</div>
                    <div className="mt-1 font-display text-lg font-bold">{merchantName}</div>
                    <div className="mt-1 text-sm text-black/55">{[preview.campaign?.merchant?.category, preview.campaign?.merchant?.city].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Offer / budget</div>
                    <div className="mt-1 text-sm leading-6 text-black/65">{offer || 'Campaign-specific collaboration details will be shown in the app.'}</div>
                  </div>
                  {campaignDescription && (
                    <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Brief</div>
                      <div className="mt-1 text-sm leading-6 text-black/65">{campaignDescription}</div>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href={deepLink}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-hopon-black px-5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-hopon-red"
                >
                  Open hOpOn app
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:contact@thehoponapp.com?subject=hOpOn creator invite&body=Invite token: ${encodeURIComponent(token ?? '')}`}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/15 bg-white px-5 font-mono text-xs uppercase tracking-wider text-black/65 transition hover:border-black/35"
                >
                  Contact hOpOn
                </a>
              </div>
              {token && (
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-black/35">
                  Invite token: {token.slice(0, 8)}...
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-5 md:p-6">
              <div className="mb-5 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <h2 className="font-display text-2xl font-bold tracking-tight">What happens next</h2>
              </div>
              <div className="space-y-4">
                {[
                  'Review the campaign brief before accepting.',
                  'Add or confirm your Instagram/TikTok handle or profile link in the app.',
                  'Post only after you understand the deliverables, timing, and compensation model.',
                  'hOpOn tracks campaign performance through approved submission links and redemptions.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <p className="text-sm leading-6 text-black/65">{item}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                {preview?.compensationNote || "Creator compensation is separate from hOpOn's platform subscription and is always controlled by the campaign brief."}
              </p>
              {fitReasons.length > 0 && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="font-display text-sm font-bold text-emerald-950">Why you may be a fit</div>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-emerald-900">
                    {fitReasons.slice(0, 4).map((reason) => <li key={reason}>• {reason}</li>)}
                  </ul>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
