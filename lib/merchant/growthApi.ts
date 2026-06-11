import {
  generateGrowthReport,
  getCampaignsForRestaurant,
  getRestaurantProfile,
  listCampaignDrafts,
  listDiscoverCreators,
  listGeneratedPagesForRestaurant,
  listGrowthSnapshots,
  listSeoOpportunities,
} from './api';
import type { Campaign, CampaignDraft, DiscoverCreator, GeneratedPage, GrowthSnapshot, Restaurant, SeoOpportunity } from './types';

export type MerchantGrowthData = {
  profile: Restaurant | null;
  campaigns: Campaign[];
  creators: DiscoverCreator[];
  snapshots: GrowthSnapshot[];
  drafts: CampaignDraft[];
  pages: GeneratedPage[];
  opportunities: SeoOpportunity[];
};

export async function loadMerchantGrowthData(userId: string): Promise<MerchantGrowthData> {
  const restaurant = await getRestaurantProfile(userId);
  const restaurantId = restaurant?.id ?? userId;
  const [campaigns, creators, snapshots, drafts, pages, opportunities] = await Promise.all([
    getCampaignsForRestaurant(restaurantId),
    listDiscoverCreators({ cityKey: restaurant?.cityKey || undefined }),
    listGrowthSnapshots(restaurantId),
    listCampaignDrafts(restaurantId),
    listGeneratedPagesForRestaurant(restaurantId),
    listSeoOpportunities(restaurantId),
  ]);
  return { profile: restaurant, campaigns, creators, snapshots, drafts, pages, opportunities };
}

export async function requestGrowthReport(restaurantId: string): Promise<boolean> {
  return generateGrowthReport(restaurantId);
}
