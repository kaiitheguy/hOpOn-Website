import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, FilePlus2, Globe2, Lightbulb, Megaphone, RefreshCw, Search, Sparkles } from 'lucide-react';
import {
  createCampaignDraft,
  getCurrentUserId,
  publishGeneratedPage,
} from '../../lib/merchant/api';
import type { Campaign, CampaignDraft, DiscoverCreator, GeneratedPage, GrowthSnapshot, Restaurant, SeoOpportunity } from '../../lib/merchant/types';
import { loadMerchantGrowthData, requestGrowthReport } from '../../lib/merchant/growthApi';
import { buildGrowthPlatformScores, clampScore, latestGrowthSummary, restaurantMarket, restaurantTheme, SOCIAL_PLATFORMS } from '../../lib/merchant/growthScoring';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';
import { PlatformScorePanel } from '../../components/merchant/PlatformScorePanel';
import { CampaignDraftCard } from '../../components/merchant/CampaignDraftCard';
import { GeneratedPagePanel } from '../../components/merchant/GeneratedPagePanel';

export const MerchantGrowth: React.FC = () => {
  const { isZh, t } = useMerchantLocale();
  const [profile, setProfile] = useState<Restaurant | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [creators, setCreators] = useState<DiscoverCreator[]>([]);
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>([]);
  const [drafts, setDrafts] = useState<CampaignDraft[]>([]);
  const [pages, setPages] = useState<GeneratedPage[]>([]);
  const [opportunities, setOpportunities] = useState<SeoOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const [ideaText, setIdeaText] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<CampaignDraft[]>([]);

  const loadData = React.useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await loadMerchantGrowthData(userId);
      setProfile(data.profile);
      setCampaigns(data.campaigns);
      setCreators(data.creators);
      setSnapshots(data.snapshots);
      setDrafts(data.drafts);
      setPages(data.pages);
      setOpportunities(data.opportunities);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const scores = useMemo(
    () => buildGrowthPlatformScores({ profile, campaigns, creators, drafts, pages, opportunities }),
    [profile, campaigns, creators, drafts, pages, opportunities]
  );
  const latestSnapshot = snapshots[0];
  const overall = latestSnapshot
    ? clampScore(((latestSnapshot.discovery_score ?? 0) + (latestSnapshot.geo_score ?? 0) + (latestSnapshot.review_score ?? 0) + (latestSnapshot.creator_score ?? 0)) / 4)
    : clampScore(scores.reduce((total, item) => total + item.score, 0) / Math.max(1, scores.length));

  const handleGenerateReport = async () => {
    const restaurantId = profile?.id;
    if (!restaurantId) return;
    setBusy('report');
    const ok = await requestGrowthReport(restaurantId);
    setToast({ msg: ok ? (isZh ? '增长报告已生成' : 'Growth report generated') : (isZh ? '生成失败，已保留本地分析' : 'Could not generate report; local analysis remains'), error: !ok });
    await loadData();
    setBusy(null);
  };

  const handleGenerateIdeas = () => {
    const theme = ideaText.trim() || restaurantTheme(profile);
    const market = restaurantMarket(profile);
    const nextIdeas: CampaignDraft[] = SOCIAL_PLATFORMS.map((platform, idx) => ({
      id: `local-${platform}-${Date.now()}-${idx}`,
      restaurant_id: profile?.id ?? '',
      source: 'web_local',
      title: isZh ? `${market}${theme}探店内容合作` : `${market} ${theme} creator push`,
      goal: isZh ? `让本地用户注意到 ${theme} 新亮点。` : `Drive local discovery for ${theme}.`,
      overview: isZh
        ? `邀请适合 ${platform} 的本地创作者围绕菜品、氛围和到店路线产出内容。`
        : `Invite local ${platform} creators to cover dishes, atmosphere, and visit intent.`,
      target_audience: isZh ? `${market} 本地食客` : `Local diners in ${market}`,
      creator_brief: {
        platform,
        requirements: [theme, market, 'authentic visit', 'clear CTA'],
      },
      suggested_budget_min: idx === 0 ? 0 : 50,
      suggested_budget_max: idx === 0 ? 150 : 300,
      status: 'draft',
      created_at: new Date().toISOString(),
    }));
    setGeneratedIdeas(nextIdeas);
  };

  const handleSaveDraft = async (draft: CampaignDraft) => {
    if (!profile?.id) return;
    setBusy(draft.id);
    const saved = await createCampaignDraft({
      restaurant_id: profile.id,
      title: draft.title,
      goal: draft.goal ?? undefined,
      overview: draft.overview ?? undefined,
      target_audience: draft.target_audience ?? undefined,
      creator_brief: draft.creator_brief ?? undefined,
      suggested_budget_min: draft.suggested_budget_min ?? undefined,
      suggested_budget_max: draft.suggested_budget_max ?? undefined,
    });
    setToast({ msg: saved ? (isZh ? '已保存到活动草稿' : 'Saved to campaign drafts') : (isZh ? '保存失败' : 'Save failed'), error: !saved });
    await loadData();
    setBusy(null);
  };

  const handlePublishPage = async (pageId: string) => {
    setBusy(pageId);
    const published = await publishGeneratedPage(pageId);
    setToast({ msg: published ? (isZh ? '页面已发布' : 'Page published') : (isZh ? '发布失败' : 'Publish failed'), error: !published });
    await loadData();
    setBusy(null);
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><p className="font-display font-bold">{t.loading}</p></div>;
  }

  return (
    <div className="py-8 space-y-8">
      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded border-2 px-4 py-2 font-mono text-sm ${toast.error ? 'bg-red-50 border-red-500 text-red-700' : 'bg-hopon-black border-black text-white'}`}>
          {toast.msg}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
        <div className="border-2 border-black bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-hopon-red">{isZh ? '增长主页' : 'Growth Home'}</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-hopon-black">
                {profile?.name || (isZh ? '商家增长工作台' : 'Merchant growth desk')}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70">
                {latestGrowthSummary(latestSnapshot, isZh, profile)}
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateReport}
              disabled={busy === 'report'}
              className="inline-flex h-11 shrink-0 items-center gap-2 border-2 border-black bg-hopon-black px-4 font-mono text-xs uppercase text-white hover:bg-hopon-red disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {busy === 'report' ? '...' : isZh ? '生成报告' : 'Generate'}
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[
              [isZh ? '整体分' : 'Overall', overall, BarChart3],
              [isZh ? '活动' : 'Campaigns', campaigns.length, Megaphone],
              [isZh ? '草稿' : 'Drafts', drafts.length, FilePlus2],
              [isZh ? '页面' : 'Pages', pages.length, Globe2],
            ].map(([label, value, Icon]) => (
              <div key={String(label)} className="border border-black/20 bg-hopon-grey p-4">
                <Icon className="h-5 w-5 text-hopon-red" />
                <p className="mt-3 font-display text-2xl font-bold">{String(value)}</p>
                <p className="font-mono text-xs uppercase text-black/60">{String(label)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-black bg-white p-6">
          <Sparkles className="h-6 w-6 text-hopon-red" />
          <h2 className="mt-4 font-display text-xl font-bold text-hopon-black">{isZh ? '下一步建议' : 'Next best actions'}</h2>
          <div className="mt-4 space-y-3">
            {scores.slice().sort((a, b) => a.score - b.score).slice(0, 3).map((score) => (
              <div key={score.platform} className="rounded-2xl border border-black/10 bg-[#FAFAF7] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display font-bold">{score.platform}</p>
                  <span className="font-mono text-xs text-black/45">{score.score}/100</span>
                </div>
                <p className="mt-2 text-sm text-black/65">{score.action}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PlatformScorePanel scores={scores} title={isZh ? '平台表现' : 'Platform readiness'} />

        <div className="border-2 border-black bg-white p-6">
          <h2 className="font-display text-xl font-bold">{isZh ? '生成活动想法' : 'Generate campaign ideas'}</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={ideaText}
              onChange={(event) => setIdeaText(event.target.value)}
              placeholder={isZh ? '例如：新品、季节菜单、周末活动' : 'New dish, seasonal menu, weekend event'}
              className="h-11 min-w-0 flex-1 border-2 border-black px-3 font-mono text-sm"
            />
            <button
              type="button"
              onClick={handleGenerateIdeas}
              className="inline-flex h-11 items-center gap-2 border-2 border-black bg-hopon-black px-4 font-mono text-xs uppercase text-white hover:bg-hopon-red"
            >
              <Lightbulb className="h-4 w-4" />
              {isZh ? '生成' : 'Generate'}
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {(generatedIdeas.length ? generatedIdeas : drafts.slice(0, 3)).map((draft) => (
              <CampaignDraftCard
                key={draft.id}
                draft={draft}
                isZh={isZh}
                busy={busy === draft.id}
                onSave={draft.id.startsWith('local-') ? handleSaveDraft : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border-2 border-black bg-white p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold"><Search className="h-5 w-5 text-hopon-red" />{isZh ? '本地发现机会' : 'Local discovery opportunities'}</h2>
          <div className="mt-5 space-y-3">
            {opportunities.length === 0 ? (
              <p className="text-sm text-black/55">{isZh ? '暂无 SEO 机会，生成增长报告后会出现在这里。' : 'No SEO opportunities yet. Generate a report to populate this section.'}</p>
            ) : opportunities.map((item) => (
              <div key={item.id} className="border border-black/20 p-4">
                <p className="font-display font-bold">{item.title}</p>
                <p className="mt-1 text-sm text-black/65">{item.recommendation || item.reason || item.description}</p>
                {item.keyword && <p className="mt-2 font-mono text-xs uppercase text-hopon-red">{item.keyword}</p>}
              </div>
            ))}
          </div>
        </div>
        <GeneratedPagePanel pages={pages} isZh={isZh} busyId={busy} onPublish={handlePublishPage} />
      </section>
    </div>
  );
};
