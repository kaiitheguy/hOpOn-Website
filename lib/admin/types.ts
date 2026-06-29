export type AdminAccountStatus = 'approved' | 'active' | 'pending' | 'rejected' | 'unknown' | string;

export interface AdminSessionState {
  userId: string | null;
  email?: string | null;
  role?: string | null;
  status?: AdminAccountStatus | null;
  reason?: 'no_session' | 'not_admin' | 'pending' | 'rejected' | 'ready' | 'unknown';
}

export interface AdminAppUser {
  id: string;
  email?: string | null;
  role: string;
  status?: string | null;
  createdAt?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

export interface AdminRestaurant {
  id: string;
  name: string;
  location?: string | null;
  category?: string | null;
  cityDisplay?: string | null;
  cuisineTags?: string[] | null;
  avatar?: string | null;
  isOfficial?: boolean | null;
}

export interface AdminCampaign {
  id: string;
  restaurantId: string;
  title: string;
  description?: string | null;
  status: string;
  type?: string | null;
  budget?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  platforms?: string[] | null;
  createdAt?: string | null;
  restaurant?: AdminRestaurant | null;
}

export type SourcingRequestStatus =
  | 'draft'
  | 'ready'
  | 'running'
  | 'reviewing'
  | 'merchant_review'
  | 'outreach'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface CampaignSourcingRequest {
  id: string;
  campaignId: string;
  restaurantId: string;
  requestedBy?: string | null;
  source: string;
  status: SourcingRequestStatus;
  searchBrief: string;
  generatedTags: string[];
  filters: Record<string, unknown>;
  platforms: string[];
  neededCreatorCount: number;
  notes?: string | null;
  lastRunAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  campaign?: AdminCampaign | null;
  candidateCount?: number;
}

export type SourcingCandidateAdminStatus = 'new' | 'shortlisted' | 'approved_for_merchant' | 'rejected';
export type SourcingCandidateMerchantStatus = 'hidden' | 'visible' | 'liked' | 'passed';
export type SourcingCandidateOutreachStatus =
  | 'not_started'
  | 'drafted'
  | 'contacted'
  | 'replied'
  | 'interested'
  | 'registered'
  | 'declined';

export type SourcingInviteStatus = 'drafted' | 'sent' | 'opened' | 'accepted' | 'expired' | 'revoked' | string;

export interface CampaignSourcingInvite {
  candidateId: string;
  dmDraft?: string | null;
  inviteUrl?: string | null;
  status?: SourcingInviteStatus | null;
}

export interface CampaignSourcingCandidate {
  id: string;
  sourcingRequestId: string;
  campaignId: string;
  restaurantId: string;
  growthOsLeadId?: string | null;
  platform: 'instagram' | 'tiktok' | string;
  handle?: string | null;
  profileUrl?: string | null;
  displayName?: string | null;
  followers?: number | null;
  score?: number | null;
  fitReasons: string[];
  concerns: string[];
  adminStatus: SourcingCandidateAdminStatus;
  merchantStatus: SourcingCandidateMerchantStatus;
  outreachStatus: SourcingCandidateOutreachStatus;
  dmDraft?: string | null;
  inviteUrl?: string | null;
  inviteStatus?: SourcingInviteStatus | null;
  merchantVisible: boolean;
  convertedCreatorUserId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface GrowthOsLead {
  id: string;
  displayName: string;
  instagramUsername?: string | null;
  instagramUrl?: string | null;
  tiktokUsername?: string | null;
  tiktokUrl?: string | null;
  city?: string | null;
  primaryCategory?: string | null;
  secondaryCategories?: string[] | null;
  platforms?: string[] | null;
  followers?: number | null;
  estimatedEngagementRate?: number | null;
  bio?: string | null;
  creatorSummary?: string | null;
  recentPostsSummary?: string | null;
  overallScore?: number | null;
  restaurantFitScore?: number | null;
  foodExchangeProbability?: number | null;
  status?: string | null;
  createdAt?: string | null;
}

export interface AdminDashboardData {
  setupMissing: boolean;
  pendingUsers: AdminAppUser[];
  recentUsers: AdminAppUser[];
  campaigns: AdminCampaign[];
  sourcingRequests: CampaignSourcingRequest[];
  growthLeads: GrowthOsLead[];
  counts: {
    pendingUsers: number;
    openCampaigns: number;
    activeSourcingRequests: number;
    growthLeads: number;
  };
}

export interface DiscoveryFilters {
  city: string;
  categories: string[];
  platforms: string[];
  minFollowers?: number;
  maxFollowers?: number;
}

export interface GrowthDiscoveryRunInput extends DiscoveryFilters {
  dryRun?: boolean;
}

export interface GrowthDiscoveryRunResult {
  discoveredCount: number;
  insertedCount: number;
  updatedCount: number;
  rejectedCount: number;
  errorCount: number;
  diagnostics: string[];
  raw: unknown;
}

export interface SourcingDetail {
  setupMissing: boolean;
  request: CampaignSourcingRequest | null;
  candidates: CampaignSourcingCandidate[];
}

export interface SourcingCreateDraft {
  campaignId: string;
  neededCreatorCount?: number;
  notes?: string;
}
