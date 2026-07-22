/**
 * Merchant (restaurant) types — aligned with Blanc app data contracts.
 * Used by merchant web; shared types for Campaign, Application, Deliverable, etc.
 */

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type DeliverableStatus = 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
export type DraftPostStatus = 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
export type CampaignStatus = 'OPEN' | 'CLOSED';

export interface Restaurant {
  id: string;
  name: string;
  location?: string | null;
  contact?: string | null;
  avatar_url?: string | null;
  avatar?: string | null; // same as avatar_url, DB column avatar
  gallery?: string[] | null;
  images?: string[] | null; // same as gallery, DB column images
  is_official?: boolean;
  description?: string | null;
  category?: string | null;
  cityDisplay?: string | null;
  cityKey?: string | null;
  areaKey?: string | null;
  contactType?: 'wechat' | 'phone' | null;
  contactValue?: string | null;
  contactWeChat?: string | null;
  instagramHandle?: string | null;
  xhsHandle?: string | null;
  xhsUrl?: string | null;
  douyinHandle?: string | null;
  tiktokHandle?: string | null;
  notes?: string | null;
  cuisineTags?: string[] | null;
  [key: string]: unknown;
}

export type MerchantAccountStatus = 'approved' | 'active' | 'pending' | 'rejected' | 'unknown' | string;

export interface MerchantSessionState {
  userId: string | null;
  email?: string | null;
  role?: string | null;
  status?: MerchantAccountStatus | null;
  hasRestaurantProfile: boolean;
  restaurant?: Restaurant | null;
  reason?: 'no_session' | 'not_merchant' | 'pending' | 'rejected' | 'missing_profile' | 'ready' | 'unknown';
}

export interface CampaignMerchant {
  id?: string;
  restaurant_id?: string;
  is_official?: boolean;
  restaurant?: Restaurant | null;
  [key: string]: unknown;
}

export interface Campaign {
  id: string;
  restaurant_id: string;
  restaurantId?: string;
  title: string;
  description?: string | null;
  images?: string[] | null;
  platforms?: string[] | null;
  status: CampaignStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
  type?: string | null;
  budget?: string | null;
  location?: string | null;
  formattedAddress?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  mapboxId?: string | null;
  requirements?: string[] | null;
  merchant?: CampaignMerchant | null;
  [key: string]: unknown;
}

export interface CampaignSourcingCandidate {
  id: string;
  platform: string;
  handle?: string | null;
  profileUrl?: string | null;
  displayName?: string | null;
  followers?: number | null;
  score?: number | null;
  fitReasons: string[];
  merchantStatus?: string | null;
  outreachStatus?: string | null;
}

export interface CampaignSourcingRequest {
  id: string;
  campaignId: string;
  status: string;
  searchBrief?: string | null;
  generatedTags: string[];
  platforms: string[];
  neededCreatorCount: number;
  lastRunAt?: string | null;
  candidates: CampaignSourcingCandidate[];
}

export interface Application {
  id: string;
  campaign_id: string;
  campaignId?: string;
  creator_id: string;
  creatorId?: string;
  status: ApplicationStatus;
  campaignStatus?: CampaignStatus;
  verified_at?: string | null;
  verifiedAt?: string | null;
  applied_at?: string | null;
  appliedAt?: string | null;
  verification_code?: string | null;
  verificationCode?: string | null;
  redemptionSlug?: string | null;
  scheduleStatus?: 'not_started' | 'pending' | 'confirmed' | 'expired' | string | null;
  scheduleDeadline?: string | null;
  confirmedVisitTime?: string | null;
  scheduleConfirmedAt?: string | null;
  approvedAt?: string | null;
  campaign?: Campaign | null;
  creator?: Creator | null;
  deliverable?: Deliverable | null;
  draft_post?: DraftPost | null;
  /** Denormalized from campaign join (Audit §2.2 / Blanc listApplicantsForRestaurant) */
  campaignTitle?: string | null;
  creatorName?: string | null;
  creatorHandle?: string | null;
  creatorFollowers?: number | null;
  creatorTags?: string[] | null;
  [key: string]: unknown;
}

/** Audit §2.2: Deliverable — xhsUrl, notes, images, feedback (Blanc types) */
export interface Deliverable {
  id: string;
  application_id: string;
  status: DeliverableStatus;
  link?: string | null;
  submitted_at?: string | null;
  xhsUrl?: string | null;
  notes?: string | null;
  images?: string[] | null;
  feedback?: string | null;
  [key: string]: unknown;
}

/** Audit §2.2: DraftPost — draftText, draftImages, feedback (Blanc types) */
export interface DraftPost {
  id: string;
  application_id: string;
  applicationId?: string;
  creatorId?: string | null;
  restaurantId?: string | null;
  status: DraftPostStatus;
  link?: string | null;
  submitted_at?: string | null;
  submittedAt?: string | null;
  draftTitle?: string | null;
  draftContent?: string | null;
  draftText?: string | null;
  draftImages?: string[] | null;
  feedback?: string | null;
  [key: string]: unknown;
}

/** Audit §2.2: Creator — socialAccounts, name, handle, xhsUrl, tiktok (Blanc getCreatorProfile) */
export interface CreatorSocialAccount {
  id: string;
  creatorId: string;
  platform: string;
  handle?: string | null;
  profileUrl?: string | null;
  followers?: number | null;
  isPublic?: boolean;
  verifiedStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Creator {
  id: string;
  display_name?: string | null;
  name?: string | null;
  handle?: string | null;
  avatar_url?: string | null;
  avatar?: string | null;
  platforms?: string[] | null;
  followers_count?: number | null;
  followers?: number | null;
  city?: string | null;
  cityDisplay?: string | null;
  tags?: string[] | null;
  languages?: string[] | null;
  bio?: string | null;
  socialAccounts?: CreatorSocialAccount[] | null;
  xhsUrl?: string | null;
  tiktokHandle?: string | null;
  tiktokUrl?: string | null;
  followerRange?: string | null;
  avgLikesRange?: string | null;
  rateRange?: string | null;
  country?: string | null;
  cityKey?: string | null;
  areaKey?: string | null;
  birthDate?: string | null;
  isOver21?: boolean | null;
  pointsBalance?: number | null;
  creatorLevel?: string | null;
  invitedByCreatorId?: string | null;
  leaderCreatorId?: string | null;
  referralCode?: string | null;
  maxFollowersPublicApproved?: number | null;
  platformsPublicApproved?: string[] | null;
  [key: string]: unknown;
}

export interface DiscoverCreator extends Creator {
  platform?: string;
  followers?: number;
}

/** Audit §2.1 + §9: platform, followers, city. Align with Blanc DiscoverCreatorsFilters. */
export interface DiscoverCreatorsFilters {
  platforms?: string[];
  followersMin?: number;
  followersMax?: number;
  cityKey?: string;
  areaKey?: string | null;
}

/** Audit §2.2: LocationOption for hunt/profile. */
export interface LocationOption {
  cityKey: string;
  cityName: string;
  areaKey: string | null;
  areaName: string | null;
  aliases?: string[];
}

export interface StructuredAddress {
  formatted_address: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number;
  longitude: number;
  mapbox_id: string;
}

export interface ResolvedLocation {
  key?: string;
  label: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title?: string | null;
  body?: string | null;
  read_at?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export type NotificationType =
  | 'nudge'
  | 'invite_to_campaign'
  | 'application_accepted'
  | 'application_rejected'
  | 'deliverable_approved'
  | 'deliverable_revision_requested'
  | string;

export interface GrowthSnapshot {
  id: string;
  restaurant_id: string;
  discovery_score?: number | null;
  geo_score?: number | null;
  review_score?: number | null;
  delivery_score?: number | null;
  creator_score?: number | null;
  summary?: string | null;
  insights?: Record<string, unknown> | null;
  snapshot_at?: string | null;
  created_at?: string | null;
}

export interface OfferAttributionCreatorRow {
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  rawRedemptions: number;
  dedupedRedemptions: number;
  nearbyRedemptions: number;
}

export interface OfferAttributionDayRow {
  date: string;
  rawRedemptions: number;
  dedupedRedemptions: number;
  nearbyRedemptions: number;
}

export interface MerchantOfferRedemptionAttribution {
  ok: boolean;
  rawRedemptions: number;
  dedupedRedemptions: number;
  nearbyRedemptions: number;
  locationCapturedRedemptions: number;
  windowDays: number;
  dedupeMinutes: number;
  nearbyRadiusMeters: number;
  byCreator: OfferAttributionCreatorRow[];
  byDay: OfferAttributionDayRow[];
}

export interface CampaignDraft {
  id: string;
  restaurant_id: string;
  source?: string | null;
  title: string;
  goal?: string | null;
  overview?: string | null;
  target_audience?: string | null;
  creator_brief?: Record<string, unknown> | null;
  suggested_budget_min?: number | null;
  suggested_budget_max?: number | null;
  status?: 'draft' | 'archived' | 'published' | string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GeneratedPage {
  id: string;
  restaurant_id?: string | null;
  page_type: 'merchant' | 'discovery' | string;
  slug: string;
  title: string;
  meta_description?: string | null;
  content?: Record<string, unknown> | null;
  status: 'draft' | 'published' | 'archived' | string;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SeoOpportunity {
  id: string;
  restaurant_id: string;
  opportunity_type?: string | null;
  keyword?: string | null;
  title: string;
  reason?: string | null;
  estimated_impact?: string | null;
  description?: string | null;
  recommendation?: string | null;
  impact?: string | null;
  status?: 'pending' | 'completed' | 'dismissed' | string;
  created_at?: string | null;
}

export type VisitSlot = { start: string; end?: string };

export interface ApplicationMessage {
  id: string;
  applicationId: string;
  senderId: string;
  senderRole: 'creator' | 'restaurant' | 'merchant' | 'system' | string;
  messageType: 'text' | 'system' | 'schedule_proposal' | string;
  body: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ApplicationScheduleProposal {
  id: string;
  applicationId: string;
  proposedBy: string;
  proposedByRole: 'creator' | 'restaurant' | 'merchant' | string;
  slots: VisitSlot[];
  status: 'pending' | 'superseded' | 'confirmed' | 'declined' | string;
  selectedSlot?: VisitSlot | null;
  confirmedBy?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
}

export interface ApplicationChatContext {
  role: 'creator' | 'restaurant';
  application: Application;
  messages: ApplicationMessage[];
  pendingProposal: ApplicationScheduleProposal | null;
}

export interface DraftPostAgentResult {
  id?: string;
  draftPostId?: string | null;
  applicationId: string;
  campaignId: string;
  creatorId: string;
  restaurantId: string;
  platform: string;
  languageFluencyScore: number;
  overallScore: number;
  subScores: Record<string, number>;
  feedback: {
    missingKeywords: string[];
    phrasesToStrengthen: string[];
    campaignGoalMatch: string;
    isGeneric: boolean;
    platformOptimization: string;
    suggestedCta: string;
    localDiscoveryPhrases: string[];
  };
  suggestedTitle: string;
  suggestedContent: string;
  hashtags: string[];
  recommendedKeywords: string[];
  rewriteOptions: {
    fullRewrite: string;
    titleOnly: string;
    contentOnly: string;
    keywordsOnly: string[];
  };
  reasoning: string;
  analyzedAt: string;
  originalTitle: string;
  originalContent: string;
}
