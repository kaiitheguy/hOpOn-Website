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
  title: string;
  description?: string | null;
  images?: string[] | null;
  platforms?: string[] | null;
  status: CampaignStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
  merchant?: CampaignMerchant | null;
  [key: string]: unknown;
}

export interface Application {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: ApplicationStatus;
  campaignStatus?: CampaignStatus;
  verified_at?: string | null;
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
  status: DraftPostStatus;
  link?: string | null;
  submitted_at?: string | null;
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
