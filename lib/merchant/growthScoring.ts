import type { Campaign, CampaignDraft, DiscoverCreator, GeneratedPage, GrowthSnapshot, Restaurant, SeoOpportunity } from './types';

export type PlatformScore = {
  platform: string;
  score: number;
  action: string;
  reason: string;
};

export const SOCIAL_PLATFORMS = ['Xiaohongshu', 'TikTok', 'Instagram'];
export const GEO_PLATFORMS = ['Google', 'Yelp'];

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function countPresent(values: unknown[]): number {
  return values.filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value != null && String(value).trim().length > 0;
  }).length;
}

export function restaurantTheme(profile: Restaurant | null): string {
  return profile?.cuisineTags?.[0] || profile?.category || 'local food';
}

export function restaurantMarket(profile: Restaurant | null): string {
  return profile?.location || profile?.cityDisplay || 'your neighborhood';
}

export function profileCompleteness(profile: Restaurant | null): number {
  if (!profile) return 0;
  const fields = [
    profile.name,
    profile.description,
    profile.location,
    profile.category,
    profile.cuisineTags,
    profile.images,
    profile.instagramHandle || profile.xhsHandle || profile.tiktokHandle,
    profile.contactValue || profile.contact,
  ];
  return clampScore((countPresent(fields) / fields.length) * 100);
}

export function buildGrowthPlatformScores(params: {
  profile: Restaurant | null;
  campaigns: Campaign[];
  creators: DiscoverCreator[];
  drafts: CampaignDraft[];
  pages: GeneratedPage[];
  opportunities: SeoOpportunity[];
}): PlatformScore[] {
  const { profile, campaigns, creators, drafts, pages, opportunities } = params;
  const completeness = profileCompleteness(profile);
  const campaignBoost = Math.min(30, campaigns.length * 8 + drafts.length * 10);
  const pageBoost = Math.min(25, pages.filter((p) => p.status === 'published').length * 12 + pages.length * 4);
  const opportunityBoost = Math.min(20, opportunities.length * 6);
  const creatorSupply = Math.min(35, creators.length * 2);
  const imageBoost = profile?.images?.length ? 12 : 0;

  return [
    ...SOCIAL_PLATFORMS.map((platform) => ({
      platform,
      score: clampScore(28 + completeness * 0.25 + campaignBoost + creatorSupply + imageBoost),
      action: `Create a ${platform} creator brief`,
      reason: `${campaigns.length + drafts.length} campaigns or drafts, ${creators.length} matched creators`,
    })),
    ...GEO_PLATFORMS.map((platform) => ({
      platform,
      score: clampScore(32 + completeness * 0.35 + pageBoost + opportunityBoost),
      action: `Publish ${platform === 'Google' ? 'local discovery' : 'review'} page`,
      reason: `${pages.length} generated pages, ${opportunities.length} SEO opportunities`,
    })),
  ];
}

export function latestGrowthSummary(snapshot: GrowthSnapshot | undefined, isZh: boolean, profile: Restaurant | null): string {
  if (snapshot?.summary) return snapshot.summary;
  const theme = restaurantTheme(profile);
  const market = restaurantMarket(profile);
  return isZh
    ? `当前增长重点：把 ${market} 的 ${theme} 特色转成可发布的创作者活动和本地发现页面。`
    : `Current growth focus: turn ${theme} in ${market} into creator campaigns and local discovery pages.`;
}
