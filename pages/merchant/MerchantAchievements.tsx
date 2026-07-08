import React, { useEffect, useState, useMemo } from 'react';
import { Briefcase, Users, FileText, CheckCircle, Rocket, Trophy, Flame, Award, Lock } from 'lucide-react';
import { getCurrentUserId } from '../../lib/merchant/api';
import {
  getCampaignsForRestaurant,
  getMerchantOfferRedemptionAttribution,
  listApplicantsForRestaurant,
  listDeliverablesForRestaurant,
} from '../../lib/merchant/api';
import type { Application, Deliverable, MerchantOfferRedemptionAttribution } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

type KPICard = { label: string; value: number; icon: React.ElementType };
type Badge = { id: string; name: string; description: string; unlocked: boolean; icon: React.ElementType };

export const MerchantAchievements: React.FC = () => {
  const { t, isZh } = useMerchantLocale();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<unknown[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [attribution, setAttribution] = useState<MerchantOfferRedemptionAttribution | null>(null);

  useEffect(() => {
    getCurrentUserId().then((userId) => {
      if (!userId) {
        setLoading(false);
        return;
      }
      Promise.all([
        getCampaignsForRestaurant(userId),
        listApplicantsForRestaurant(userId),
        listDeliverablesForRestaurant(userId),
        getMerchantOfferRedemptionAttribution(userId, 30),
      ])
        .then(([c, a, d, attr]) => {
          setCampaigns(c);
          setApplications(a);
          setDeliverables(d);
          setAttribution(attr);
        })
        .finally(() => setLoading(false));
    });
  }, []);

  const copy = isZh
    ? {
        dedupedRedemptions: '去重兑换',
        nearbyRedemptions: '附近兑换',
        attribution: '轻量归因',
        dedupeNote: '30 分钟窗口内同一匿名访客重复点击会被去重；附近兑换使用 200 米门店范围。',
        byCreator: '按创作者',
        byDate: '按日期',
        noAttribution: '暂无归因数据',
        raw: '原始',
        nearby: '附近',
        deduped: '去重',
      }
    : {
        dedupedRedemptions: 'Deduped Redemptions',
        nearbyRedemptions: 'Nearby Redemptions',
        attribution: 'Lightweight Attribution',
        dedupeNote: 'Repeated clicks from the same anonymous visitor are deduped within 30 minutes; nearby uses a 200m store radius.',
        byCreator: 'By Creator',
        byDate: 'By Date',
        noAttribution: 'No attribution yet',
        raw: 'raw',
        nearby: 'nearby',
        deduped: 'deduped',
      };

  const kpiCards = useMemo((): KPICard[] => {
    const campaignCount = campaigns.length;
    const uniqueCreators = new Set(
      applications.filter((a) => a.status === 'ACCEPTED').map((a) => a.creator_id)
    );
    const participantsCount = uniqueCreators.size;
    const submittedCount = deliverables.filter(
      (d) => d.status === 'SUBMITTED' || d.status === 'APPROVED' || d.status === 'REVISION_REQUESTED'
    ).length;
    const approvedCount = deliverables.filter((d) => d.status === 'APPROVED').length;

    return [
      { label: t.campaignsPublished, value: campaignCount, icon: Briefcase },
      { label: t.participants, value: participantsCount, icon: Users },
      { label: t.submitted, value: submittedCount, icon: FileText },
      { label: t.approved, value: approvedCount, icon: CheckCircle },
      { label: copy.dedupedRedemptions, value: attribution?.dedupedRedemptions ?? 0, icon: Flame },
      { label: copy.nearbyRedemptions, value: attribution?.nearbyRedemptions ?? 0, icon: Rocket },
    ];
  }, [campaigns, applications, deliverables, attribution, t, copy.dedupedRedemptions, copy.nearbyRedemptions]);

  const badges = useMemo((): Badge[] => {
    const campaignCount = campaigns.length;
    const uniqueCreators = new Set(
      applications.filter((a) => a.status === 'ACCEPTED').map((a) => a.creator_id)
    );
    const participantsCount = uniqueCreators.size;
    const approvedCount = deliverables.filter((d) => d.status === 'APPROVED').length;

    return [
      { id: 'first_campaign', name: t.firstCampaign, description: t.firstCampaignDesc, unlocked: campaignCount > 0, icon: Rocket },
      { id: 'first_acceptance', name: t.firstAcceptance, description: t.firstAcceptanceDesc, unlocked: participantsCount > 0, icon: Users },
      { id: 'first_deliverable', name: t.firstDeliverable, description: t.firstDeliverableDesc, unlocked: deliverables.length > 0, icon: FileText },
      { id: 'first_approval', name: t.firstApproval, description: t.firstApprovalDesc, unlocked: approvedCount > 0, icon: Trophy },
      { id: 'ten_campaigns', name: t.activeBrand, description: t.activeBrandDesc, unlocked: campaignCount >= 10, icon: Flame },
      { id: 'fifty_approvals', name: t.excellentBrand, description: t.excellentBrandDesc, unlocked: approvedCount >= 50, icon: Award },
    ];
  }, [campaigns, applications, deliverables, t]);

  const creatorRows = useMemo(() => (attribution?.byCreator ?? []).slice(0, 5), [attribution]);
  const dayRows = useMemo(() => (attribution?.byDay ?? []).slice(-7).reverse(), [attribution]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-8">
        {t.achievementsTitle}
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-10">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="border-2 border-black p-6 bg-white flex flex-col items-center"
            >
              <Icon className="w-6 h-6 text-hopon-red mb-2" />
              <p className="font-display font-bold text-2xl text-hopon-red">{kpi.value}</p>
              <p className="font-mono text-xs uppercase tracking-wider text-black/60 text-center">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      <section className="mb-10">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {t.trend}
        </h2>
        <div className="border-2 border-black p-6 bg-white">
          {dayRows.some((row) => row.dedupedRedemptions > 0) ? (
            <div className="space-y-2">
              {dayRows.map((row) => (
                <div key={row.date} className="flex items-center justify-between border-b border-black/10 pb-2 text-sm last:border-b-0 last:pb-0">
                  <span className="font-mono text-black/55">{row.date}</span>
                  <span className="font-semibold text-hopon-black">
                    {row.dedupedRedemptions} {copy.deduped} · {row.rawRedemptions} {copy.raw}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/50">{t.trendEmpty}</p>
          )}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {copy.attribution}
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="border-2 border-black bg-white p-6">
            <p className="font-display font-bold text-lg text-hopon-black">{copy.byCreator}</p>
            <p className="mt-1 text-xs leading-5 text-black/50">{copy.dedupeNote}</p>
            <div className="mt-4 space-y-3">
              {creatorRows.length === 0 ? (
                <p className="text-sm text-black/50">{copy.noAttribution}</p>
              ) : creatorRows.map((row) => (
                <div key={row.creatorId} className="flex items-center justify-between gap-3 border-b border-black/10 pb-3 last:border-b-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold text-hopon-black">@{row.creatorHandle || row.creatorName}</p>
                    <p className="text-xs text-black/45">{row.rawRedemptions} {copy.raw}</p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-hopon-black">
                    {row.dedupedRedemptions} {copy.deduped}<br />
                    <span className="text-xs text-black/50">{row.nearbyRedemptions} {copy.nearby}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="border-2 border-black bg-white p-6">
            <p className="font-display font-bold text-lg text-hopon-black">{copy.byDate}</p>
            <div className="mt-4 space-y-3">
              {dayRows.length === 0 ? (
                <p className="text-sm text-black/50">{copy.noAttribution}</p>
              ) : dayRows.map((row) => (
                <div key={row.date} className="flex items-center justify-between gap-3 border-b border-black/10 pb-3 last:border-b-0 last:pb-0">
                  <span className="font-mono text-xs uppercase text-black/55">{row.date}</span>
                  <span className="text-right text-sm font-semibold text-hopon-black">
                    {row.dedupedRedemptions} {copy.deduped} · {row.nearbyRedemptions} {copy.nearby}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {t.badges}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`border-2 p-6 bg-white flex flex-col items-center relative ${
                  badge.unlocked ? 'border-black' : 'border-black/20 opacity-70'
                }`}
              >
                {!badge.unlocked && (
                  <span className="absolute top-2 right-2 text-black/40">
                    <Lock className="w-4 h-4" />
                  </span>
                )}
                <Icon
                  className={`w-8 h-8 mb-2 ${badge.unlocked ? 'text-hopon-red' : 'text-black/30'}`}
                />
                <p
                  className={`font-display font-bold text-sm text-center ${
                    badge.unlocked ? 'text-hopon-black' : 'text-black/50'
                  }`}
                >
                  {badge.name}
                </p>
                <p className="font-mono text-xs text-black/50 text-center mt-1">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
