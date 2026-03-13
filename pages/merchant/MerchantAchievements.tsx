import React, { useEffect, useState, useMemo } from 'react';
import { Briefcase, Users, FileText, CheckCircle, Rocket, Trophy, Flame, Award, Lock } from 'lucide-react';
import { getCurrentUserId } from '../../lib/merchant/api';
import {
  getCampaignsForRestaurant,
  listApplicantsForRestaurant,
  listDeliverablesForRestaurant,
} from '../../lib/merchant/api';
import type { Application, Deliverable } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

type KPICard = { label: string; value: number; icon: React.ElementType };
type Badge = { id: string; name: string; description: string; unlocked: boolean; icon: React.ElementType };

export const MerchantAchievements: React.FC = () => {
  const { t } = useMerchantLocale();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<unknown[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

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
      ])
        .then(([c, a, d]) => {
          setCampaigns(c);
          setApplications(a);
          setDeliverables(d);
        })
        .finally(() => setLoading(false));
    });
  }, []);

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
    ];
  }, [campaigns, applications, deliverables, t]);

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
          <p className="text-sm text-black/50">{t.trendEmpty}</p>
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
