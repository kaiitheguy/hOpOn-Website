/**
 * Merchant API layer — Supabase-backed (or stubbed until backend is ready).
 * Matches audit store functions: getRestaurantProfile, getCampaignsForRestaurant, etc.
 */

import { supabase } from '../supabaseClient';
import type {
  Restaurant,
  MerchantSessionState,
  Campaign,
  CampaignSourcingRequest,
  CampaignSourcingCandidate,
  Application,
  Deliverable,
  DraftPost,
  Creator,
  CreatorSocialAccount,
  DiscoverCreator,
  DiscoverCreatorsFilters,
  Notification,
  LocationOption,
  GrowthSnapshot,
  CampaignDraft,
  GeneratedPage,
  SeoOpportunity,
  MerchantOfferRedemptionAttribution,
  OfferAttributionDayRow,
  ApplicationChatContext,
  ApplicationMessage,
  ApplicationScheduleProposal,
  VisitSlot,
  DraftPostAgentResult,
  StructuredAddress,
} from './types';

const USER_ID_MAP: Record<string, string> = {
  c_001: '00000000-0000-0000-0000-000000000001',
  c_002: '00000000-0000-0000-0000-000000000002',
  c_003: '00000000-0000-0000-0000-000000000003',
  c_004: '00000000-0000-0000-0000-000000000004',
  c_005: '00000000-0000-0000-0000-000000000005',
  c_006: '00000000-0000-0000-0000-000000000006',
  c_007: '00000000-0000-0000-0000-000000000007',
  c_008: '00000000-0000-0000-0000-000000000008',
  r_001: '00000000-0000-0000-0000-000000000101',
  r_002: '00000000-0000-0000-0000-000000000102',
  r_003: '00000000-0000-0000-0000-000000000103',
  r_004: '00000000-0000-0000-0000-000000000104',
  r_005: '00000000-0000-0000-0000-000000000105',
  r_006: '00000000-0000-0000-0000-000000000106',
};

const DEFAULT_REDEMPTION_DEDUPE_MINUTES = 30;

function buildEmptyRedemptionTrend(days: number): OfferAttributionDayRow[] {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  const rows: OfferAttributionDayRow[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    rows.push({
      date: d.toISOString().slice(0, 10),
      rawRedemptions: 0,
      dedupedRedemptions: 0,
      nearbyRedemptions: 0,
    });
  }
  return rows;
}

function emptyRedemptionAttribution(days = 30): MerchantOfferRedemptionAttribution {
  return {
    ok: false,
    rawRedemptions: 0,
    dedupedRedemptions: 0,
    nearbyRedemptions: 0,
    locationCapturedRedemptions: 0,
    windowDays: days,
    dedupeMinutes: DEFAULT_REDEMPTION_DEDUPE_MINUTES,
    nearbyRadiusMeters: 200,
    byCreator: [],
    byDay: buildEmptyRedemptionTrend(days),
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeRedemptionAttribution(raw: unknown, days: number): MerchantOfferRedemptionAttribution {
  const row = asRecord(raw);
  if (row.ok !== true) return emptyRedemptionAttribution(days);

  const byCreator = Array.isArray(row.byCreator)
    ? row.byCreator.map((item) => {
        const creator = asRecord(item);
        return {
          creatorId: asString(creator.creatorId),
          creatorName: asString(creator.creatorName, 'Creator'),
          creatorHandle: asString(creator.creatorHandle, 'creator'),
          rawRedemptions: asNumber(creator.rawRedemptions),
          dedupedRedemptions: asNumber(creator.dedupedRedemptions),
          nearbyRedemptions: asNumber(creator.nearbyRedemptions),
        };
      }).filter((item) => item.creatorId)
    : [];

  const byDay = Array.isArray(row.byDay)
    ? row.byDay.map((item) => {
        const day = asRecord(item);
        return {
          date: asString(day.date),
          rawRedemptions: asNumber(day.rawRedemptions),
          dedupedRedemptions: asNumber(day.dedupedRedemptions),
          nearbyRedemptions: asNumber(day.nearbyRedemptions),
        };
      }).filter((item) => item.date)
    : buildEmptyRedemptionTrend(days);

  return {
    ok: true,
    rawRedemptions: asNumber(row.rawRedemptions),
    dedupedRedemptions: asNumber(row.dedupedRedemptions),
    nearbyRedemptions: asNumber(row.nearbyRedemptions),
    locationCapturedRedemptions: asNumber(row.locationCapturedRedemptions),
    windowDays: asNumber(row.windowDays) || days,
    dedupeMinutes: asNumber(row.dedupeMinutes) || DEFAULT_REDEMPTION_DEDUPE_MINUTES,
    nearbyRadiusMeters: asNumber(row.nearbyRadiusMeters) || 200,
    byCreator,
    byDay,
  };
}

function isMissingAttributionRpcError(error: unknown): boolean {
  const row = asRecord(error);
  const message = `${row.message ?? ''} ${row.details ?? ''}`.toLowerCase();
  return row.code === '42883' || row.code === 'PGRST202' || message.includes('get_merchant_offer_redemption_attribution');
}

function getSupabaseUserId(id: string): string {
  return USER_ID_MAP[id] || id;
}

/** Current user id from Supabase auth; null if not logged in. */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getMerchantSessionState(): Promise<MerchantSessionState> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user) {
    return { userId: null, hasRestaurantProfile: false, reason: 'no_session' };
  }

  const [{ data: appUser, error: appUserError }, restaurant] = await Promise.all([
    supabase
      .from('app_users')
      .select('id, email, role, status')
      .eq('id', user.id)
      .maybeSingle(),
    getRestaurantProfile(user.id),
  ]);

  if (appUserError) {
    console.error('[getMerchantSessionState] app_users', appUserError);
  }

  const role = (appUser as { role?: string } | null)?.role ?? null;
  const status = (appUser as { status?: string } | null)?.status ?? (restaurant ? 'approved' : 'unknown');
  const email = (appUser as { email?: string } | null)?.email ?? user.email ?? null;

  if (role && role !== 'restaurant') {
    return { userId: user.id, email, role, status, hasRestaurantProfile: !!restaurant, restaurant, reason: 'not_merchant' };
  }
  if (status === 'rejected') {
    return { userId: user.id, email, role, status, hasRestaurantProfile: !!restaurant, restaurant, reason: 'rejected' };
  }
  if (status === 'pending') {
    return { userId: user.id, email, role, status, hasRestaurantProfile: !!restaurant, restaurant, reason: 'pending' };
  }
  if (!restaurant) {
    return { userId: user.id, email, role, status, hasRestaurantProfile: false, restaurant: null, reason: 'missing_profile' };
  }
  return { userId: user.id, email, role: role ?? 'restaurant', status, hasRestaurantProfile: true, restaurant, reason: 'ready' };
}

// ——— Restaurant (table: restaurant_profiles; id = app_users.id) ———
export async function getRestaurantProfile(id: string): Promise<Restaurant | null> {
  const uuidId = getSupabaseUserId(id);
  const { data, error } = await supabase
    .from('restaurant_profiles')
    .select('*')
    .eq('id', uuidId)
    .maybeSingle();
  if (error) {
    console.error('[getRestaurantProfile]', error);
    return null;
  }
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return mapRowToRestaurant(row);
}

function mapRowToRestaurant(row: Record<string, unknown>): Restaurant {
  return {
    id: (row.id as string) ?? '',
    name: (row.name as string) ?? '',
    location: (row.location as string) ?? null,
    contact: (row.contact_value as string) ?? (row.contact_wechat as string) ?? null,
    avatar_url: (row.avatar as string) ?? null,
    avatar: (row.avatar as string) ?? null,
    gallery: (row.images as string[] | null) ?? null,
    images: (row.images as string[] | null) ?? null,
    is_official: (row.is_official as boolean) ?? false,
    description: (row.description as string) ?? null,
    category: (row.category as string) ?? null,
    cityDisplay: (row.city_display as string) ?? null,
    cityKey: (row.city_key as string) ?? null,
    areaKey: (row.area_key as string) ?? null,
    contactType: (row.contact_type as 'wechat' | 'phone') ?? null,
    contactValue: (row.contact_value as string) ?? null,
    contactWeChat: (row.contact_wechat as string) ?? null,
    instagramHandle: (row.instagram_handle as string) ?? null,
    xhsHandle: (row.xhs_handle as string) ?? null,
    xhsUrl: (row.xhs_url as string) ?? null,
    douyinHandle: (row.douyin_handle as string) ?? null,
    tiktokHandle: (row.tiktok_handle as string) ?? null,
    notes: (row.notes as string) ?? null,
    cuisineTags: (row.cuisine_tags as string[] | null) ?? null,
    ...row,
  } as Restaurant;
}

/** Updates use snake_case column names (restaurant_profiles). */
export async function updateRestaurantProfile(
  id: string,
  updates: Partial<{
    name: string;
    location: string;
    contact: string;
    avatar_url: string;
    gallery: string[];
    description: string;
    category: string;
    cityDisplay: string;
    cityKey: string;
    areaKey: string;
    contactType: 'wechat' | 'phone';
    contactValue: string;
    contactWeChat: string;
    instagramHandle: string;
    xhsHandle: string;
    xhsUrl: string;
    douyinHandle: string;
    tiktokHandle: string;
    notes: string;
    cuisineTags: string[];
  }>
): Promise<Restaurant | null> {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.contact !== undefined) payload.contact_value = updates.contact;
  if (updates.contactValue !== undefined) payload.contact_value = updates.contactValue;
  if (updates.avatar_url !== undefined) payload.avatar = updates.avatar_url;
  if (updates.gallery !== undefined) payload.images = updates.gallery;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.cityDisplay !== undefined) payload.city_display = updates.cityDisplay;
  if (updates.cityKey !== undefined) payload.city_key = updates.cityKey;
  if (updates.areaKey !== undefined) payload.area_key = updates.areaKey;
  if (updates.contactType !== undefined) payload.contact_type = updates.contactType;
  if (updates.contactWeChat !== undefined) payload.contact_wechat = updates.contactWeChat;
  if (updates.instagramHandle !== undefined) payload.instagram_handle = updates.instagramHandle;
  if (updates.xhsHandle !== undefined) payload.xhs_handle = updates.xhsHandle;
  if (updates.xhsUrl !== undefined) payload.xhs_url = updates.xhsUrl;
  if (updates.douyinHandle !== undefined) payload.douyin_handle = updates.douyinHandle;
  if (updates.tiktokHandle !== undefined) payload.tiktok_handle = updates.tiktokHandle;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.cuisineTags !== undefined) payload.cuisine_tags = updates.cuisineTags;
  const { data, error } = await supabase
    .from('restaurant_profiles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[updateRestaurantProfile]', error);
    return null;
  }
  if (!data) return null;
  return mapRowToRestaurant(data as Record<string, unknown>);
}

export async function uploadImageFileToSupabase(
  file: File,
  bucket: 'avatars' | 'restaurants' | 'campaigns' | string,
  ownerId: string
): Promise<string | null> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    console.error('[uploadImageFileToSupabase]', error);
    return null;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl || null;
}

function mapRowToCampaign(row: Record<string, unknown>): Campaign {
  const restaurantProfile = (row.restaurant_profiles ?? row.merchant) as
    | { id?: string; name?: string; avatar?: string | null; is_official?: boolean }
    | { id?: string; name?: string; avatar?: string | null; is_official?: boolean }[]
    | null
    | undefined;
  const merchant = Array.isArray(restaurantProfile) ? restaurantProfile[0] : restaurantProfile;
  const r = {
    ...row,
    restaurantId: row.restaurant_id,
    restaurantName: merchant?.name ?? '',
    restaurantImage: merchant?.avatar ?? null,
    merchant: merchant ? { id: row.restaurant_id, name: merchant.name ?? '', is_official: merchant.is_official ?? false } : null,
    requirements: (row.requirements as string[] | null) ?? [],
    formattedAddress: row.formatted_address,
    streetAddress: row.street_address,
    zipCode: row.zip_code,
    mapboxId: row.mapbox_id,
    startDate: row.start_date,
    endDate: row.end_date,
    images: (row.images as string[] | null) ?? [],
    platforms: (row.platforms as string[] | null) ?? [],
    isInternalTest: row.is_internal_test === true,
  } as Record<string, unknown>;
  if (r.start_date != null && r.starts_at == null) r.starts_at = r.start_date;
  if (r.end_date != null && r.ends_at == null) r.ends_at = r.end_date;
  if (r.restaurant_id != null && r.restaurantId == null) r.restaurantId = r.restaurant_id;
  return r as Campaign;
}

// ——— Campaigns (merchant join: restaurant_profiles for is_official) ———
export async function getCampaignsForRestaurant(restaurantId: string): Promise<Campaign[]> {
  const uuidId = getSupabaseUserId(restaurantId);
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      restaurant_profiles!campaigns_restaurant_id_fkey (
        id,
        name,
        avatar,
        is_official
      )
    `)
    .eq('restaurant_id', uuidId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[getCampaignsForRestaurant]', error);
    return [];
  }
  return (data ?? []).map((row: Record<string, unknown>) => mapRowToCampaign(row));
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      restaurant_profiles!campaigns_restaurant_id_fkey (
        id,
        name,
        avatar,
        is_official
      )
    `)
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[getCampaignById]', error);
    return null;
  }
  if (!data) return null;
  return mapRowToCampaign(data as Record<string, unknown>);
}

function mapSourcingCandidate(row: Record<string, unknown>): CampaignSourcingCandidate {
  const fitReasons = Array.isArray(row.fit_reasons) ? (row.fit_reasons as unknown[]).map(String).filter(Boolean) : [];
  return {
    id: row.id as string,
    platform: String(row.platform ?? 'instagram'),
    handle: (row.handle as string | null) ?? null,
    profileUrl: (row.profile_url as string | null) ?? null,
    displayName: (row.display_name as string | null) ?? null,
    followers: (row.followers as number | null) ?? null,
    score: (row.score as number | null) ?? null,
    fitReasons,
    merchantStatus: (row.merchant_status as string | null) ?? null,
    outreachStatus: (row.outreach_status as string | null) ?? null,
  };
}

function mapSourcingRequest(row: Record<string, unknown>): CampaignSourcingRequest {
  const candidates = Array.isArray(row.campaign_sourcing_candidates)
    ? (row.campaign_sourcing_candidates as Record<string, unknown>[]).map(mapSourcingCandidate)
    : [];
  return {
    id: row.id as string,
    campaignId: row.campaign_id as string,
    status: String(row.status ?? 'reviewing'),
    searchBrief: (row.search_brief as string | null) ?? null,
    generatedTags: Array.isArray(row.generated_tags) ? (row.generated_tags as unknown[]).map(String).filter(Boolean) : [],
    platforms: Array.isArray(row.platforms) ? (row.platforms as unknown[]).map(String).filter(Boolean) : [],
    neededCreatorCount: Number(row.needed_creator_count ?? 0),
    lastRunAt: (row.last_run_at as string | null) ?? null,
    candidates,
  };
}

export async function listCampaignSourcingRequests(campaignId: string): Promise<CampaignSourcingRequest[]> {
  const { data, error } = await supabase
    .from('campaign_sourcing_requests')
    .select(
      'id,campaign_id,status,search_brief,generated_tags,platforms,needed_creator_count,last_run_at,campaign_sourcing_candidates!inner(id,platform,handle,profile_url,display_name,followers,score,fit_reasons,merchant_status,merchant_visible)'
    )
    .eq('campaign_id', campaignId)
    .eq('campaign_sourcing_candidates.merchant_visible', true)
    .order('updated_at', { ascending: false });
  if (error) {
    if (!isMissingRelationError(error)) console.error('[listCampaignSourcingRequests]', error);
    return [];
  }
  return (data ?? [])
    .map((row: Record<string, unknown>) => {
      const request = mapSourcingRequest(row);
      request.candidates = request.candidates.filter((candidate) => Boolean(candidate.id) && candidate.merchantStatus !== 'hidden');
      return request;
    })
    .filter((request) => request.candidates.length > 0 || ['running', 'reviewing', 'merchant_review', 'outreach'].includes(request.status));
}

export async function getMerchantOfferRedemptionAttribution(
  restaurantId: string,
  days = 30
): Promise<MerchantOfferRedemptionAttribution> {
  const uuidId = getSupabaseUserId(restaurantId);
  const { data, error } = await supabase.rpc('get_merchant_offer_redemption_attribution', {
    p_restaurant_id: uuidId,
    p_days: days,
    p_dedupe_minutes: DEFAULT_REDEMPTION_DEDUPE_MINUTES,
  });

  if (error) {
    if (!isMissingAttributionRpcError(error)) {
      console.error('[getMerchantOfferRedemptionAttribution]', error);
    }
    return emptyRedemptionAttribution(days);
  }

  return normalizeRedemptionAttribution(data, days);
}

/** Audit §2.1 + §9: createCampaign — match Blanc payload (type, budget, start_date, end_date, location, requirements). */
export async function createCampaign(payload: {
  restaurant_id: string;
  title: string;
  description?: string;
  images?: string[];
  platforms?: string[];
  status?: string;
  type?: string;
  budget?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  formattedAddress?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  mapboxId?: string;
  requirements?: string[];
  is_official?: boolean;
}): Promise<Campaign | null> {
  const restaurantId = getSupabaseUserId(payload.restaurant_id);
  const allowedPlatforms = ['xhs', 'douyin', 'instagram', 'tiktok'] as const;
  const platformMap: Record<string, string> = { '小红书': 'xhs', '抖音': 'douyin', 'Instagram': 'instagram', 'instagram': 'instagram', 'TikTok': 'tiktok', 'tiktok': 'tiktok' };
  const raw = payload.platforms ?? [];
  const platforms = [...new Set(raw.map((p: string) => platformMap[p] ?? p).filter((v: string) => allowedPlatforms.includes(v as typeof allowedPlatforms[number])))];

  const { data: merchantData } = await supabase
    .from('app_users')
    .select('is_test_account')
    .eq('id', restaurantId)
    .maybeSingle();
  const isTestAccount = (merchantData as { is_test_account?: boolean } | null)?.is_test_account === true;

  const today = new Date().toISOString().slice(0, 10);
  const row: Record<string, unknown> = {
    restaurant_id: restaurantId,
    title: payload.title,
    description: payload.description ?? '',
    images: payload.images ?? [],
    platforms,
    status: payload.status ?? 'OPEN',
    type: payload.type ?? 'FREE_TASTING',
    budget: payload.budget ?? '$0',
    start_date: payload.start_date ?? today,
    end_date: payload.end_date ?? today,
    location: payload.location ?? '',
    formatted_address: payload.formattedAddress ?? payload.location ?? '',
    street_address: payload.streetAddress ?? null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    zip_code: payload.zipCode ?? null,
    country: payload.country ?? null,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    mapbox_id: payload.mapboxId ?? null,
    requirements: payload.requirements ?? [],
    is_internal_test: isTestAccount,
  };

  let { data, error } = await supabase
    .from('campaigns')
    .insert(row)
    .select()
    .single();

  if (error && (error.code === '42703' || error.message?.includes('is_internal_test'))) {
    const { is_internal_test: _omit, ...withoutInternalTest } = row;
    ({ data, error } = await supabase
      .from('campaigns')
      .insert(withoutInternalTest)
      .select()
      .single());
  }

  if (error) {
    console.error('[createCampaign]', error);
    return null;
  }
  return mapRowToCampaign(data as Record<string, unknown>);
}

export async function updateCampaign(
  id: string,
  updates: Partial<Pick<Campaign, 'title' | 'description' | 'images' | 'platforms' | 'status' | 'starts_at' | 'ends_at'>>
): Promise<Campaign | null> {
  const payload: Record<string, unknown> = { ...updates };
  if (updates.starts_at !== undefined) { payload.start_date = updates.starts_at; delete payload.starts_at; }
  if (updates.ends_at !== undefined) { payload.end_date = updates.ends_at; delete payload.ends_at; }
  const { data, error } = await supabase
    .from('campaigns')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('[updateCampaign]', error);
    return null;
  }
  return mapRowToCampaign(data as Record<string, unknown>);
}

// ——— Applications / Deliverables / Drafts (Audit §2.1 + §9) ———
/** Audit: same shape as Blanc — campaignTitle, creatorName, creatorFollowers, creatorTags from joins. */
export async function listApplicantsForRestaurant(restaurantId: string): Promise<Application[]> {
  const uuidId = getSupabaseUserId(restaurantId);
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('restaurant_id', uuidId);
  if (campError || !campaigns?.length) return [];
  const campaignIds = campaigns.map((c: { id: string }) => c.id);

  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      campaigns!applications_campaign_id_fkey (
        title,
        status,
        restaurant_id,
        restaurant_profiles!campaigns_restaurant_id_fkey (
          name
        )
      ),
      creator_profiles!applications_creator_id_fkey (
        name,
        handle,
        followers,
        tags
      )
    `)
    .in('campaign_id', campaignIds)
    .order('applied_at', { ascending: false });
  if (error) {
    console.error('[listApplicantsForRestaurant]', error);
    return [];
  }
  return (data ?? []).map((row: Record<string, unknown>) => {
    const camp = row.campaigns as { title?: string; status?: string; restaurant_id?: string; restaurant_profiles?: { name?: string } } | null;
    const creator = row.creator_profiles as { name?: string; handle?: string; followers?: number; tags?: string[] } | null;
    return {
      id: row.id,
      campaign_id: row.campaign_id,
      campaignId: row.campaign_id,
      creator_id: row.creator_id,
      creatorId: row.creator_id,
      status: row.status,
      applied_at: row.applied_at,
      appliedAt: row.applied_at,
      approvedAt: row.approved_at,
      verification_code: row.verification_code,
      verificationCode: row.verification_code,
      verified_at: row.verified_at != null ? (typeof row.verified_at === 'string' ? row.verified_at : String((row.verified_at as { toISOString?: () => string })?.toISOString?.() ?? row.verified_at)) : undefined,
      verifiedAt: row.verified_at != null ? String(row.verified_at) : undefined,
      scheduleDeadline: row.schedule_deadline != null ? String(row.schedule_deadline) : null,
      scheduleStatus: row.schedule_status != null ? String(row.schedule_status) : null,
      confirmedVisitTime: row.confirmed_visit_time != null ? String(row.confirmed_visit_time) : null,
      scheduleConfirmedAt: row.schedule_confirmed_at != null ? String(row.schedule_confirmed_at) : null,
      restaurantId: camp?.restaurant_id ?? null,
      restaurantName: camp?.restaurant_profiles?.name ?? null,
      campaignStatus: camp?.status,
      campaignTitle: camp?.title ?? null,
      creatorName: creator?.name ?? null,
      creatorHandle: creator?.handle ?? null,
      creatorFollowers: creator?.followers ?? null,
      creatorTags: creator?.tags ?? null,
    } as Application;
  });
}

/** Audit §2.2: xhsUrl, notes, images, feedback (Blanc listDeliverablesForRestaurant). */
export async function listDeliverablesForRestaurant(restaurantId: string): Promise<Deliverable[]> {
  const uuidId = getSupabaseUserId(restaurantId);
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('restaurant_id', uuidId);
  if (campError || !campaigns?.length) return [];
  const campaignIds = campaigns.map((c: { id: string }) => c.id);
  const { data: apps } = await supabase
    .from('applications')
    .select('id')
    .in('campaign_id', campaignIds);
  if (!apps?.length) return [];
  const applicationIds = apps.map((a: { id: string }) => a.id);

  const { data, error } = await supabase
    .from('deliverables')
    .select(`
      *,
      applications!deliverables_application_id_fkey (
        campaigns!applications_campaign_id_fkey (
          title,
          restaurant_profiles!campaigns_restaurant_id_fkey (
            name
          )
        ),
        creator_profiles!applications_creator_id_fkey (
          name
        )
      )
    `)
    .eq('restaurant_id', uuidId)
    .in('application_id', applicationIds)
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('[listDeliverablesForRestaurant]', error);
    return [];
  }
  return (data ?? []).map((d: Record<string, unknown>) => {
    const app = d.applications as {
      campaigns?: { title?: string; restaurant_profiles?: { name?: string } };
      creator_profiles?: { name?: string };
    } | null;
    return {
      id: d.id,
      application_id: d.application_id,
      applicationId: d.application_id,
      creatorId: d.creator_id,
      restaurantId: d.restaurant_id,
      status: d.status,
      submitted_at: d.submitted_at,
      submittedAt: d.submitted_at,
      xhsUrl: d.xhs_url ?? d.link ?? null,
      notes: d.notes ?? null,
      images: (d.images as string[] | null) ?? [],
      feedback: d.feedback ?? null,
      reviewedAt: d.reviewed_at,
      campaignTitle: app?.campaigns?.title,
      restaurantName: app?.campaigns?.restaurant_profiles?.name,
      creatorName: app?.creator_profiles?.name,
    };
  }) as Deliverable[];
}

/** Audit §2.2: draftText, draftImages, feedback (Blanc listDraftPostsForRestaurant). */
export async function listDraftPostsForRestaurant(restaurantId: string): Promise<DraftPost[]> {
  const uuidId = getSupabaseUserId(restaurantId);
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('restaurant_id', uuidId);
  if (campError || !campaigns?.length) return [];
  const campaignIds = campaigns.map((c: { id: string }) => c.id);
  const { data: apps } = await supabase
    .from('applications')
    .select('id')
    .eq('status', 'ACCEPTED')
    .in('campaign_id', campaignIds);
  if (!apps?.length) return [];
  const applicationIds = apps.map((a: { id: string }) => a.id);

  const { data, error } = await supabase
    .from('draft_posts')
    .select('*')
    .eq('restaurant_id', uuidId)
    .in('application_id', applicationIds)
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('[listDraftPostsForRestaurant]', error);
    return [];
  }
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id,
    application_id: d.application_id,
    applicationId: d.application_id,
    creatorId: (d.creator_id as string) ?? null,
    restaurantId: (d.restaurant_id as string) ?? uuidId,
    status: d.status,
    submitted_at: d.submitted_at,
    submittedAt: d.submitted_at,
    draftTitle: (d.draft_title as string) ?? '',
    draftContent: (d.draft_content as string) ?? '',
    draftText: ((d.draft_title || d.draft_content) ? `${d.draft_title ?? ''}${d.draft_title && d.draft_content ? '\n\n' : ''}${d.draft_content ?? ''}` : (d.draft_text ?? '')) as string,
    draftImages: (d.draft_images as string[] | null) ?? [],
    feedback: d.feedback ?? null,
  })) as DraftPost[];
}

export async function reviewApplication(
  applicationId: string,
  status: 'ACCEPTED' | 'REJECTED'
): Promise<boolean> {
  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId);
  if (error) {
    console.error('[reviewApplication]', error);
    return false;
  }
  return true;
}

export async function reviewDraftPost(
  draftPostId: string,
  action: 'APPROVED' | 'REVISION_REQUESTED',
  feedback?: string
): Promise<boolean> {
  const payload: { status: string; feedback?: string } = { status: action };
  if (action === 'REVISION_REQUESTED' && feedback != null) payload.feedback = feedback;
  const { error } = await supabase
    .from('draft_posts')
    .update(payload)
    .eq('id', draftPostId);
  if (error) {
    console.error('[reviewDraftPost]', error);
    return false;
  }
  return true;
}

export async function reviewDeliverable(
  deliverableId: string,
  action: 'APPROVED' | 'REVISION_REQUESTED',
  feedback?: string
): Promise<boolean> {
  const payload: { status: string; feedback?: string } = { status: action };
  if (action === 'REVISION_REQUESTED' && feedback != null) payload.feedback = feedback;
  const { error } = await supabase
    .from('deliverables')
    .update(payload)
    .eq('id', deliverableId);
  if (error) {
    console.error('[reviewDeliverable]', error);
    return false;
  }
  return true;
}

/** Match Blanc: query applications by verification_code (no RPC). Returns application id and ok. */
export async function verifyCreatorPresence(verificationCode: string): Promise<{ ok: boolean; applicationId?: string }> {
  const code = verificationCode?.trim();
  if (!code) return { ok: false };
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('verification_code', code)
    .eq('status', 'ACCEPTED')
    .maybeSingle();
  if (error) {
    console.error('[verifyCreatorPresence]', error);
    return { ok: false };
  }
  return { ok: !!data, applicationId: data?.id };
}

export async function confirmCreatorVerification(applicationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('applications')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', applicationId);
  if (error) {
    console.error('[confirmCreatorVerification]', error);
    return false;
  }
  return true;
}

// ——— Discover (Hunt) ———
// Audit §2.1 + §9: listDiscoverCreators(filters). Filters: platform, followers, city (§1).
// Match app: approved app_users + creator_social_summary public/approved social accounts.
export async function listDiscoverCreators(filters?: DiscoverCreatorsFilters): Promise<DiscoverCreator[]> {
  const { data: approvedCreators, error: usersError } = await supabase
    .from('app_users')
    .select('id')
    .eq('role', 'creator')
    .eq('status', 'approved');

  if (usersError) {
    console.error('[listDiscoverCreators] app_users', usersError);
    return [];
  }

  const approvedIds = (approvedCreators ?? []).map((row: { id: string }) => row.id);
  if (approvedIds.length === 0) return [];

  const { data: summaryData, error: summaryError } = await supabase
    .from('creator_social_summary')
    .select('creator_id, platforms_public_approved, max_followers_public_approved')
    .in('creator_id', approvedIds);

  const summaryByCreator = new Map<string, { platforms: string[]; maxFollowers: number }>();
  if (summaryError) {
    if (!isMissingRelationError(summaryError)) console.error('[listDiscoverCreators] creator_social_summary', summaryError);
    const { data: accountData, error: accountError } = await supabase
      .from('creator_social_accounts')
      .select('creator_id, platform, followers')
      .in('creator_id', approvedIds)
      .eq('is_public', true)
      .eq('verified_status', 'approved');
    if (!accountError) {
      (accountData ?? []).forEach((row: Record<string, unknown>) => {
        const creatorId = row.creator_id as string;
        const prev = summaryByCreator.get(creatorId) ?? { platforms: [], maxFollowers: 0 };
        const platform = String(row.platform ?? '');
        if (platform && !prev.platforms.includes(platform)) prev.platforms.push(platform);
        prev.maxFollowers = Math.max(prev.maxFollowers, Number(row.followers ?? 0));
        summaryByCreator.set(creatorId, prev);
      });
    } else if (!isMissingRelationError(accountError)) {
      console.error('[listDiscoverCreators] creator_social_accounts', accountError);
    }
  } else {
    (summaryData ?? []).forEach((row: Record<string, unknown>) => {
      summaryByCreator.set(row.creator_id as string, {
        platforms: ((row.platforms_public_approved as string[] | null) ?? []).filter(Boolean),
        maxFollowers: Number(row.max_followers_public_approved ?? 0),
      });
    });
  }

  let query = supabase
    .from('creator_profiles')
    .select('*')
    .in('id', approvedIds)
    .order('followers', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);

  if (filters?.cityKey) {
    query = query.eq('city_key', filters.cityKey);
    if (filters.areaKey != null && filters.areaKey !== '') {
      query = query.eq('area_key', filters.areaKey);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error('[listDiscoverCreators]', error);
    return [];
  }

  let list = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    display_name: row.display_name ?? row.name,
    name: row.display_name ?? row.name,
    avatar_url: row.avatar_url ?? row.avatar,
    platforms: row.platforms ?? (row.platform ? [row.platform] : []),
    followers_count: row.followers_count ?? row.followers,
    followers: row.followers_count ?? row.followers,
    city: row.city ?? row.city_display,
    city_display: row.city_display ?? row.city,
    cityDisplay: row.city_display ?? row.city,
    city_key: row.city_key,
    cityKey: row.city_key,
    area_key: row.area_key,
    areaKey: row.area_key,
    maxFollowersPublicApproved: summaryByCreator.get(row.id as string)?.maxFollowers ?? row.followers ?? 0,
    platformsPublicApproved: summaryByCreator.get(row.id as string)?.platforms ?? [],
    ...row,
  })) as DiscoverCreator[];

  const platforms = filters?.platforms;
  const minF = filters?.followersMin;
  const maxF = filters?.followersMax;
  if (platforms?.length) {
    list = list.filter((c) => {
      const p = (c.platformsPublicApproved as string[] | undefined) ?? (c.platforms as string[] | undefined) ?? [];
      return platforms.some((f) => p.some((x) => String(x).toLowerCase() === String(f).toLowerCase()));
    });
  }
  if (minF != null && !Number.isNaN(minF)) {
    const v = (c: DiscoverCreator) => Number(c.maxFollowersPublicApproved ?? (c as { followers_count?: number }).followers_count ?? (c as { followers?: number }).followers ?? 0);
    list = list.filter((c) => v(c) >= minF);
  }
  if (maxF != null && !Number.isNaN(maxF)) {
    const v = (c: DiscoverCreator) => Number(c.maxFollowersPublicApproved ?? (c as { followers_count?: number }).followers_count ?? (c as { followers?: number }).followers ?? 0);
    list = list.filter((c) => v(c) <= maxF);
  }
  if (filters?.cityKey && (filters.areaKey == null || filters.areaKey === '')) {
    list = list.filter((c) => {
      const area = (c as { area_key?: string | null; areaKey?: string | null }).area_key ?? c.areaKey;
      return area == null || area === '';
    });
  }
  return list;
}

/** Audit §2.1 + §9: getCreatorProfile — name, handle, socialAccounts (Blanc: getCreatorSocialAccounts + legacy xhs/tiktok). */
export async function getCreatorProfile(id: string): Promise<Creator | null> {
  const { data, error } = await supabase.from('creator_profiles').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.error('[getCreatorProfile]', error);
    return null;
  }
  if (!data) return null;
  const row = data as Record<string, unknown>;
  let socialAccounts: CreatorSocialAccount[] = [];
  const { data: accountRows, error: accountError } = await supabase
    .from('creator_social_accounts')
    .select('*')
    .eq('creator_id', id)
    .eq('is_public', true)
    .eq('verified_status', 'approved');
  if (!accountError) {
    socialAccounts = (accountRows ?? []).map((account: Record<string, unknown>) => ({
      id: account.id as string,
      creatorId: account.creator_id as string,
      platform: account.platform as string,
      handle: (account.handle as string) ?? null,
      profileUrl: (account.profile_url as string) ?? null,
      followers: (account.followers as number) ?? null,
      isPublic: account.is_public as boolean,
      verifiedStatus: account.verified_status as string,
      createdAt: (account.created_at as string) ?? '',
      updatedAt: (account.updated_at as string) ?? '',
    }));
  } else if (!isMissingRelationError(accountError)) {
    console.error('[getCreatorProfile] creator_social_accounts', accountError);
  }
  if (row.xhs_url || row.xhs_handle) {
    socialAccounts.push({
      id: `legacy-xhs-${row.id}`,
      creatorId: row.id as string,
      platform: 'xhs',
      profileUrl: (row.xhs_url as string) ?? null,
      handle: (row.xhs_handle as string) ?? null,
      followers: 0,
      isPublic: true,
      verifiedStatus: 'approved',
      createdAt: '',
      updatedAt: '',
    });
  }
  if (row.tiktok_handle || row.tiktok_url) {
    socialAccounts.push({
      id: `legacy-tiktok-${row.id}`,
      creatorId: row.id as string,
      platform: 'tiktok',
      handle: (row.tiktok_handle as string) ?? null,
      profileUrl: (row.tiktok_url as string) ?? null,
      followers: 0,
      isPublic: true,
      verifiedStatus: 'approved',
      createdAt: '',
      updatedAt: '',
    });
  }
  return {
    id: row.id as string,
    name: (row.name ?? row.display_name) as string | null,
    display_name: (row.display_name ?? row.name) as string | null,
    handle: (row.handle as string) ?? null,
    avatar_url: (row.avatar_url ?? row.avatar) as string | null,
    avatar: (row.avatar ?? row.avatar_url) as string | null,
    platforms: (row.platforms ?? (row.platform ? [row.platform] : null)) as string[] | null,
    followers_count: (row.followers_count ?? row.followers) as number | null,
    followers: (row.followers_count ?? row.followers) as number | null,
    city: (row.city ?? row.city_display) as string | null,
    cityDisplay: (row.city_display ?? row.city) as string | null,
    tags: (row.tags as string[] | null) ?? null,
    languages: (row.languages as string[] | null) ?? null,
    bio: (row.bio as string) ?? null,
    xhsUrl: (row.xhs_url as string) ?? null,
    tiktokHandle: (row.tiktok_handle as string) ?? null,
    tiktokUrl: (row.tiktok_url as string) ?? null,
    socialAccounts: socialAccounts.length ? socialAccounts : null,
    ...row,
  } as Creator;
}

/** Match Blanc: no RPC; query applications count and approved deliverables count. */
export async function getCreatorAchievementStats(creatorId: string): Promise<{ collaborators: number; deliverables: number } | null> {
  const { count: appCount, error: appsError } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', creatorId);
  if (appsError) {
    console.error('[getCreatorAchievementStats] applications', appsError);
    return null;
  }
  const { count: delivCount, error: delivError } = await supabase
    .from('deliverables')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', creatorId)
    .eq('status', 'APPROVED');
  if (delivError) {
    console.error('[getCreatorAchievementStats] deliverables', delivError);
    return null;
  }
  return { collaborators: appCount ?? 0, deliverables: delivCount ?? 0 };
}

// ——— Notifications ———
// Table uses recipient_user_id (and optionally sender_user_id), not user_id.
export async function sendNotification(payload: {
  user_id?: string;
  recipient_user_id?: string;
  sender_user_id?: string;
  type: string;
  title?: string;
  body?: string;
  [key: string]: unknown;
}): Promise<boolean> {
  const recipient = payload.recipient_user_id ?? payload.user_id;
  if (!recipient) {
    console.error('[sendNotification] missing recipient_user_id / user_id');
    return false;
  }
  const row: Record<string, unknown> = {
    recipient_user_id: recipient,
    type: payload.type,
    title: payload.title ?? null,
    body: payload.body ?? null,
  };
  if (payload.sender_user_id != null) row.sender_user_id = payload.sender_user_id;
  if (payload.data != null) row.data = payload.data;
  const { error } = await supabase.from('notifications').insert(row);
  if (error) {
    console.error('[sendNotification]', error);
    return false;
  }
  return true;
}

export async function fetchNotifications(
  userId: string,
  opts?: { limit?: number; unreadOnly?: boolean }
): Promise<Notification[]> {
  let q = supabase
    .from('notifications')
    .select('*')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(opts?.limit ?? 50);
  if (opts?.unreadOnly) {
    q = q.is('read_at', null);
  }
  const { data, error } = await q;
  if (error) {
    console.error('[fetchNotifications]', error);
    return [];
  }
  return (data ?? []) as Notification[];
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
  if (error) {
    console.error('[markNotificationRead]', error);
    return false;
  }
  return true;
}

// ——— Locations (Audit §2.1 + §9: getLocations, resolveCityKeyFromInput) ———
export async function getLocations(): Promise<LocationOption[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('city_key, city_name, area_key, area_name, aliases')
    .order('city_key', { ascending: true })
    .order('area_key', { ascending: true, nullsFirst: false });
  if (error) {
    console.error('[getLocations]', error);
    return [];
  }
  return (data ?? []).map((row: Record<string, unknown>) => ({
    cityKey: (row.city_key as string) ?? '',
    cityName: (row.city_name as string) ?? '',
    areaKey: row.area_key === '' || row.area_key == null ? null : (row.area_key as string),
    areaName: row.area_name === '' || row.area_name == null ? null : (row.area_name as string),
    aliases: (row.aliases as string[] | undefined) ?? [],
  }));
}

export async function resolveLocationFromInput(input: string | undefined | null): Promise<{ city_key: string; area_key: string | null; city_display?: string } | null> {
  if (!input?.trim()) return null;
  const locations = await getLocations();
  const normalized = String(input).trim().toLowerCase();
  const match = locations.find((loc) =>
    (loc.aliases ?? []).some((a) => String(a).toLowerCase() === normalized) ||
    loc.cityName?.toLowerCase() === normalized
  );
  if (!match) return null;
  return {
    city_key: match.cityKey,
    area_key: match.areaKey ?? null,
    city_display: match.areaName ? `${match.cityName} · ${match.areaName}` : match.cityName,
  };
}

/** Audit §2.1: Alias for resolveLocationFromInput (city_key / area_key style). */
export const resolveCityKeyFromInput = resolveLocationFromInput;

function isMissingRelationError(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | null;
  return e?.code === 'PGRST205' || e?.code === '42P01' || String(e?.message ?? '').includes('Could not find');
}

function mapProposal(row: Record<string, unknown>): ApplicationScheduleProposal {
  return {
    id: row.id as string,
    applicationId: row.application_id as string,
    proposedBy: row.proposed_by as string,
    proposedByRole: row.proposed_by_role as string,
    slots: Array.isArray(row.slots) ? (row.slots as VisitSlot[]) : [],
    status: row.status as string,
    selectedSlot: (row.selected_slot as VisitSlot | null) ?? null,
    confirmedBy: (row.confirmed_by as string | null) ?? null,
    createdAt: row.created_at as string,
    confirmedAt: (row.confirmed_at as string | null) ?? null,
  };
}

function mapMessage(row: Record<string, unknown>): ApplicationMessage {
  return {
    id: row.id as string,
    applicationId: row.application_id as string,
    senderId: row.sender_id as string,
    senderRole: row.sender_role as string,
    messageType: row.message_type as string,
    body: (row.body as string) ?? '',
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  };
}

async function getApplicationAccessRow(
  applicationId: string
): Promise<{ row: Record<string, unknown>; role: 'creator' | 'restaurant' } | null> {
  const uid = await getCurrentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      campaigns!applications_campaign_id_fkey (
        title,
        status,
        restaurant_id,
        restaurant_profiles!campaigns_restaurant_id_fkey ( name )
      ),
      creator:creator_profiles(name, handle, followers, tags)
    `)
    .eq('id', applicationId)
    .maybeSingle();
  if (error || !data) {
    console.error('[getApplicationAccessRow]', error);
    return null;
  }
  const row = data as Record<string, unknown>;
  if (row.creator_id === uid) return { row, role: 'creator' };
  const campaign = row.campaigns as { restaurant_id?: string; title?: string; status?: string; restaurant_profiles?: { name?: string } } | null;
  if (campaign?.restaurant_id === uid) return { row, role: 'restaurant' };
  return null;
}

function mapApplicationFromAccessRow(row: Record<string, unknown>): Application {
  const campaign = row.campaigns as { title?: string; status?: string; restaurant_id?: string; restaurant_profiles?: { name?: string } } | null;
  const creator = row.creator as { name?: string; handle?: string; followers?: number; tags?: string[] } | null;
  return {
    id: row.id as string,
    campaign_id: row.campaign_id as string,
    campaignId: row.campaign_id as string,
    creator_id: row.creator_id as string,
    creatorId: row.creator_id as string,
    status: row.status as Application['status'],
    applied_at: (row.applied_at as string) ?? null,
    appliedAt: (row.applied_at as string) ?? null,
    approvedAt: (row.approved_at as string) ?? null,
    verification_code: (row.verification_code as string) ?? null,
    verificationCode: (row.verification_code as string) ?? null,
    verified_at: (row.verified_at as string) ?? null,
    verifiedAt: (row.verified_at as string) ?? null,
    scheduleDeadline: (row.schedule_deadline as string) ?? null,
    scheduleStatus: (row.schedule_status as string) ?? null,
    confirmedVisitTime: (row.confirmed_visit_time as string) ?? null,
    scheduleConfirmedAt: (row.schedule_confirmed_at as string) ?? null,
    campaignStatus: campaign?.status as Application['campaignStatus'],
    campaignTitle: campaign?.title ?? null,
    restaurantId: campaign?.restaurant_id ?? null,
    restaurantName: campaign?.restaurant_profiles?.name ?? null,
    creatorName: creator?.name ?? null,
    creatorHandle: creator?.handle ?? null,
    creatorFollowers: creator?.followers ?? null,
    creatorTags: creator?.tags ?? null,
  } as Application;
}

export async function listGrowthSnapshots(restaurantId: string): Promise<GrowthSnapshot[]> {
  const { data, error } = await supabase
    .from('growth_snapshots')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    if (!isMissingRelationError(error)) console.error('[listGrowthSnapshots]', error);
    return [];
  }
  return (data ?? []) as GrowthSnapshot[];
}

export async function listCampaignDrafts(restaurantId: string): Promise<CampaignDraft[]> {
  const { data, error } = await supabase
    .from('campaign_drafts')
    .select('*')
    .eq('restaurant_id', getSupabaseUserId(restaurantId))
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    if (!isMissingRelationError(error)) console.error('[listCampaignDrafts]', error);
    return [];
  }
  return (data ?? []) as CampaignDraft[];
}

export async function getCampaignDraftById(draftId: string, restaurantId: string): Promise<CampaignDraft | null> {
  const { data, error } = await supabase
    .from('campaign_drafts')
    .select('*')
    .eq('id', draftId)
    .eq('restaurant_id', getSupabaseUserId(restaurantId))
    .maybeSingle();
  if (error) {
    if (!isMissingRelationError(error)) console.error('[getCampaignDraftById]', error);
    return null;
  }
  return (data ?? null) as CampaignDraft | null;
}

export async function createCampaignDraft(payload: {
  restaurant_id: string;
  source?: string;
  title: string;
  goal?: string;
  overview?: string;
  target_audience?: string;
  creator_brief?: Record<string, unknown>;
  suggested_budget_min?: number;
  suggested_budget_max?: number;
}): Promise<CampaignDraft | null> {
  const { data, error } = await supabase
    .from('campaign_drafts')
    .insert({
      restaurant_id: getSupabaseUserId(payload.restaurant_id),
      source: payload.source ?? 'web_growth_agent',
      title: payload.title,
      goal: payload.goal ?? null,
      overview: payload.overview ?? null,
      target_audience: payload.target_audience ?? null,
      creator_brief: payload.creator_brief ?? {},
      suggested_budget_min: payload.suggested_budget_min ?? 0,
      suggested_budget_max: payload.suggested_budget_max ?? 0,
      status: 'draft',
    })
    .select()
    .single();
  if (error) {
    console.error('[createCampaignDraft]', error);
    return null;
  }
  return data as CampaignDraft;
}

export async function updateCampaignDraft(
  draftId: string,
  restaurantId: string,
  updates: Partial<{
    title: string;
    goal: string | null;
    overview: string | null;
    target_audience: string | null;
    creator_brief: Record<string, unknown>;
    suggested_budget_min: number | null;
    suggested_budget_max: number | null;
    status: string;
  }>
): Promise<CampaignDraft | null> {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.goal !== undefined) payload.goal = updates.goal;
  if (updates.overview !== undefined) payload.overview = updates.overview;
  if (updates.target_audience !== undefined) payload.target_audience = updates.target_audience;
  if (updates.creator_brief !== undefined) payload.creator_brief = updates.creator_brief;
  if (updates.suggested_budget_min !== undefined) payload.suggested_budget_min = updates.suggested_budget_min;
  if (updates.suggested_budget_max !== undefined) payload.suggested_budget_max = updates.suggested_budget_max;
  if (updates.status !== undefined) payload.status = updates.status;
  const { data, error } = await supabase
    .from('campaign_drafts')
    .update(payload)
    .eq('id', draftId)
    .eq('restaurant_id', getSupabaseUserId(restaurantId))
    .select()
    .single();
  if (error) {
    if (!isMissingRelationError(error)) console.error('[updateCampaignDraft]', error);
    return null;
  }
  return data as CampaignDraft;
}

export async function listGeneratedPagesForRestaurant(restaurantId: string): Promise<GeneratedPage[]> {
  const { data, error } = await supabase
    .from('generated_pages')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) {
    if (!isMissingRelationError(error)) console.error('[listGeneratedPagesForRestaurant]', error);
    return [];
  }
  return (data ?? []) as GeneratedPage[];
}

export async function publishGeneratedPage(pageId: string): Promise<GeneratedPage | null> {
  const { data, error } = await supabase
    .from('generated_pages')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', pageId)
    .select()
    .single();
  if (error) {
    console.error('[publishGeneratedPage]', error);
    return null;
  }
  return data as GeneratedPage;
}

export async function listSeoOpportunities(restaurantId: string): Promise<SeoOpportunity[]> {
  const { data, error } = await supabase
    .from('seo_opportunities')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    if (!isMissingRelationError(error)) console.error('[listSeoOpportunities]', error);
    return [];
  }
  return (data ?? []) as SeoOpportunity[];
}

export async function generateGrowthReport(restaurantId: string): Promise<boolean> {
  const { error } = await supabase.functions.invoke('generate-growth-report', {
    body: { restaurantId, restaurant_id: restaurantId },
  });
  if (error) {
    console.error('[generateGrowthReport]', error);
    return false;
  }
  return true;
}

export async function getDraftPostForApplication(applicationId: string): Promise<DraftPost | null> {
  const { data, error } = await supabase
    .from('draft_posts')
    .select('*')
    .eq('application_id', applicationId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error('[getDraftPostForApplication]', error);
    return null;
  }
  if (!data) return null;
  const d = data as Record<string, unknown>;
  const title = (d.draft_title as string) ?? '';
  const content = (d.draft_content as string) ?? '';
  return {
    id: d.id as string,
    application_id: d.application_id as string,
    applicationId: d.application_id as string,
    creatorId: (d.creator_id as string) ?? null,
    restaurantId: (d.restaurant_id as string) ?? null,
    status: d.status as DraftPost['status'],
    submitted_at: (d.submitted_at as string) ?? null,
    submittedAt: (d.submitted_at as string) ?? null,
    draftTitle: title,
    draftContent: content,
    draftText: title || content ? `${title}${title && content ? '\n\n' : ''}${content}` : ((d.draft_text as string) ?? ''),
    draftImages: (d.draft_images as string[] | null) ?? [],
    feedback: (d.feedback as string) ?? null,
  };
}

export async function loadApplicationChatContext(applicationId: string): Promise<ApplicationChatContext | null> {
  const access = await getApplicationAccessRow(applicationId);
  if (!access) return null;
  const app = mapApplicationFromAccessRow(access.row);
  const [messages, proposals] = await Promise.all([
    listApplicationMessages(applicationId),
    supabase
      .from('application_schedule_proposals')
      .select('*')
      .eq('application_id', applicationId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1),
  ]);
  let pendingProposal: ApplicationScheduleProposal | null = null;
  if (!proposals.error && proposals.data?.[0]) {
    pendingProposal = mapProposal(proposals.data[0] as Record<string, unknown>);
  }
  return { role: access.role, application: app, messages, pendingProposal };
}

export async function listApplicationMessages(applicationId: string): Promise<ApplicationMessage[]> {
  const { data, error } = await supabase
    .from('application_messages')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true });
  if (error) {
    if (!isMissingRelationError(error)) console.error('[listApplicationMessages]', error);
    return [];
  }
  return (data ?? []).map((row) => mapMessage(row as Record<string, unknown>));
}

export async function sendApplicationChatMessage(
  applicationId: string,
  body: string,
  messageType: 'text' | 'system' | 'schedule_proposal' = 'text',
  metadata: Record<string, unknown> = {}
): Promise<ApplicationMessage | null> {
  const uid = await getCurrentUserId();
  if (!uid) return null;
  const access = await getApplicationAccessRow(applicationId);
  if (!access) return null;
  const senderRole = messageType === 'system' ? 'system' : access.role;
  const { data, error } = await supabase
    .from('application_messages')
    .insert({
      application_id: applicationId,
      sender_id: uid,
      sender_role: senderRole,
      message_type: messageType,
      body,
      metadata,
    })
    .select()
    .single();
  if (error || !data) {
    console.error('[sendApplicationChatMessage]', error);
    return null;
  }
  if (messageType === 'text') {
    const app = mapApplicationFromAccessRow(access.row);
    await sendNotification({
      recipient_user_id: app.creator_id,
      sender_user_id: uid,
      type: 'application_message',
      title: 'New message from merchant',
      body,
      data: { application_id: applicationId, campaign_id: app.campaign_id, campaign_title: app.campaignTitle },
    });
  }
  return mapMessage(data as Record<string, unknown>);
}

async function supersedePendingProposals(applicationId: string): Promise<void> {
  await supabase
    .from('application_schedule_proposals')
    .update({ status: 'superseded' })
    .eq('application_id', applicationId)
    .eq('status', 'pending');
}

export async function createVisitScheduleProposal(
  applicationId: string,
  slots: VisitSlot[]
): Promise<{ ok: boolean; proposal?: ApplicationScheduleProposal; error?: string }> {
  const uid = await getCurrentUserId();
  if (!uid) return { ok: false, error: 'auth' };
  const access = await getApplicationAccessRow(applicationId);
  if (!access) return { ok: false, error: 'forbidden' };
  const slim = slots.slice(0, 3).filter((slot) => slot.start);
  if (!slim.length) return { ok: false, error: 'slots' };
  await supersedePendingProposals(applicationId);
  const { data, error } = await supabase
    .from('application_schedule_proposals')
    .insert({
      application_id: applicationId,
      proposed_by: uid,
      proposed_by_role: access.role,
      slots: slim,
      status: 'pending',
    })
    .select()
    .single();
  if (error || !data) {
    console.error('[createVisitScheduleProposal]', error);
    return { ok: false, error: error?.message ?? 'db' };
  }
  await supabase.from('applications').update({ schedule_status: 'pending' }).eq('id', applicationId);
  await sendApplicationChatMessage(
    applicationId,
    `[Suggested times] ${slim.map((slot) => new Date(slot.start).toLocaleString()).join(' · ')}`,
    'schedule_proposal',
    { proposal_id: data.id, slots: slim }
  );
  return { ok: true, proposal: mapProposal(data as Record<string, unknown>) };
}

export async function confirmVisitScheduleProposal(proposalId: string, slot: VisitSlot): Promise<boolean> {
  const uid = await getCurrentUserId();
  if (!uid) return false;
  const { data: proposal, error } = await supabase
    .from('application_schedule_proposals')
    .select('*')
    .eq('id', proposalId)
    .maybeSingle();
  if (error || !proposal || proposal.status !== 'pending') return false;
  const now = new Date().toISOString();
  const { error: updateProposalError } = await supabase
    .from('application_schedule_proposals')
    .update({ status: 'confirmed', selected_slot: slot, confirmed_by: uid, confirmed_at: now })
    .eq('id', proposalId);
  if (updateProposalError) return false;
  const { error: updateAppError } = await supabase
    .from('applications')
    .update({ schedule_status: 'confirmed', confirmed_visit_time: slot.start, schedule_confirmed_at: now })
    .eq('id', proposal.application_id);
  if (updateAppError) return false;
  await sendApplicationChatMessage(
    proposal.application_id,
    `Visit time confirmed: ${new Date(slot.start).toLocaleString()}`,
    'system',
    { proposal_id: proposalId, slot }
  );
  return true;
}

export async function reopenApplicationScheduling(applicationId: string): Promise<boolean> {
  const access = await getApplicationAccessRow(applicationId);
  if (!access || access.role !== 'restaurant') return false;
  const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('applications')
    .update({
      schedule_status: 'not_started',
      schedule_deadline: deadline,
      confirmed_visit_time: null,
      schedule_confirmed_at: null,
    })
    .eq('id', applicationId);
  if (error) return false;
  await sendApplicationChatMessage(
    applicationId,
    '[Scheduling reopened] Please agree on a new visit time within 3 days.',
    'system',
    {}
  );
  return true;
}

function localDraftPostAnalysis(params: {
  applicationId: string;
  draft: DraftPost;
  campaign: Campaign | null;
  restaurant: Restaurant | null;
  creator: Creator | null;
}): DraftPostAgentResult {
  const text = `${params.draft.draftTitle ?? ''} ${params.draft.draftContent ?? params.draft.draftText ?? ''}`.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const hasLocal = [params.restaurant?.name, params.restaurant?.location, params.restaurant?.category]
    .filter(Boolean)
    .some((signal) => text.toLowerCase().includes(String(signal).toLowerCase()));
  const hasCta = /visit|try|book|order|check out|到店|预约|收藏|打卡/i.test(text);
  const imageCount = params.draft.draftImages?.length ?? 0;
  const overallScore = Math.max(30, Math.min(92, 38 + Math.min(words, 120) * 0.25 + imageCount * 8 + (hasLocal ? 18 : 0) + (hasCta ? 12 : 0)));
  const title = params.draft.draftTitle || `${params.restaurant?.name ?? 'This spot'} is worth a visit`;
  const content = params.draft.draftContent || params.draft.draftText || '';
  const recommendedKeywords = [
    params.restaurant?.name,
    params.restaurant?.location,
    params.restaurant?.category,
    ...(params.restaurant?.cuisineTags ?? []),
  ].filter(Boolean).slice(0, 6) as string[];
  return {
    applicationId: params.applicationId,
    draftPostId: params.draft.id,
    campaignId: String(params.campaign?.id ?? params.draft.application_id),
    creatorId: String(params.draft.creatorId ?? params.creator?.id ?? ''),
    restaurantId: String(params.restaurant?.id ?? params.draft.restaurantId ?? ''),
    platform: String(params.campaign?.platforms?.[0] ?? 'Xiaohongshu'),
    languageFluencyScore: Math.round(Math.min(90, 50 + words * 0.3)),
    overallScore: Math.round(overallScore),
    subScores: {
      keywordCoverage: recommendedKeywords.length ? 68 : 45,
      platformFit: imageCount > 0 ? 72 : 48,
      campaignMessageClarity: words > 35 ? 76 : 52,
      merchantRelevance: hasLocal ? 82 : 46,
      ctaClarity: hasCta ? 80 : 42,
      visualContentAlignment: imageCount >= 2 ? 82 : imageCount === 1 ? 62 : 30,
    },
    feedback: {
      missingKeywords: recommendedKeywords.filter((kw) => !text.toLowerCase().includes(String(kw).toLowerCase())),
      phrasesToStrengthen: hasLocal ? [] : ['Mention the neighborhood, dish, or restaurant name more explicitly.'],
      campaignGoalMatch: params.campaign?.description
        ? `Partially aligned with campaign goal: ${String(params.campaign.description).slice(0, 100)}`
        : 'Campaign goal match is based on available profile signals.',
      isGeneric: !hasLocal,
      platformOptimization: imageCount >= 2 ? 'Image quantity is ready for a carousel-style post.' : 'Add at least two clear food or atmosphere photos.',
      suggestedCta: hasCta ? 'CTA is present.' : 'Add a save/book/visit CTA at the end.',
      localDiscoveryPhrases: [`${params.restaurant?.location ?? 'local area'} food`, `${params.restaurant?.category ?? 'restaurant'} near me`],
    },
    suggestedTitle: title,
    suggestedContent: content,
    hashtags: recommendedKeywords.map((kw) => `#${String(kw).replace(/\s+/g, '')}`).slice(0, 5),
    recommendedKeywords,
    rewriteOptions: {
      titleOnly: title,
      contentOnly: content,
      fullRewrite: `${title}\n\n${content}\n\n${hasCta ? '' : 'Save this for your next visit.'}`.trim(),
      keywordsOnly: recommendedKeywords,
    },
    reasoning: 'Local web analysis based on post length, local signals, CTA clarity, campaign context, and image count.',
    analyzedAt: new Date().toISOString(),
    originalTitle: params.draft.draftTitle ?? '',
    originalContent: params.draft.draftContent ?? params.draft.draftText ?? '',
  };
}

function mapDraftPostAgentRow(row: Record<string, unknown>): DraftPostAgentResult {
  return {
    id: row.id as string,
    draftPostId: (row.draft_post_id as string | null) ?? null,
    applicationId: row.application_id as string,
    campaignId: row.campaign_id as string,
    creatorId: row.creator_id as string,
    restaurantId: row.restaurant_id as string,
    platform: (row.platform as string) ?? '',
    languageFluencyScore: Number(row.language_fluency_score ?? 0),
    overallScore: Number(row.overall_score ?? 0),
    subScores: (row.sub_scores as Record<string, number>) ?? {},
    feedback: (row.feedback as DraftPostAgentResult['feedback']) ?? {
      missingKeywords: [],
      phrasesToStrengthen: [],
      campaignGoalMatch: '',
      isGeneric: false,
      platformOptimization: '',
      suggestedCta: '',
      localDiscoveryPhrases: [],
    },
    suggestedTitle: (row.suggested_title as string) ?? '',
    suggestedContent: (row.suggested_content as string) ?? '',
    hashtags: (row.hashtags as string[]) ?? [],
    recommendedKeywords: (row.recommended_keywords as string[]) ?? [],
    rewriteOptions: (row.rewrite_options as DraftPostAgentResult['rewriteOptions']) ?? {
      fullRewrite: '',
      titleOnly: '',
      contentOnly: '',
      keywordsOnly: [],
    },
    reasoning: (row.reasoning as string) ?? '',
    analyzedAt: (row.analyzed_at as string) ?? new Date().toISOString(),
    originalTitle: (row.original_title as string) ?? '',
    originalContent: (row.original_content as string) ?? '',
  };
}

export async function getDraftPostAgentResult(applicationId: string): Promise<DraftPostAgentResult | null> {
  const { data, error } = await supabase
    .from('ai_draft_post_results')
    .select('*')
    .eq('application_id', applicationId)
    .maybeSingle();
  if (error) {
    if (!isMissingRelationError(error)) console.error('[getDraftPostAgentResult]', error);
    return null;
  }
  return data ? mapDraftPostAgentRow(data as Record<string, unknown>) : null;
}

export async function saveDraftPostAgentResult(result: DraftPostAgentResult): Promise<void> {
  const row = {
    application_id: result.applicationId,
    draft_post_id: result.draftPostId ?? null,
    campaign_id: result.campaignId,
    creator_id: result.creatorId,
    restaurant_id: result.restaurantId,
    platform: result.platform,
    language_fluency_score: result.languageFluencyScore,
    overall_score: result.overallScore,
    sub_scores: result.subScores,
    feedback: result.feedback,
    suggested_title: result.suggestedTitle,
    suggested_content: result.suggestedContent,
    hashtags: result.hashtags,
    recommended_keywords: result.recommendedKeywords,
    rewrite_options: result.rewriteOptions,
    reasoning: result.reasoning,
    original_title: result.originalTitle,
    original_content: result.originalContent,
    analyzed_at: result.analyzedAt,
  };
  const { error } = await supabase
    .from('ai_draft_post_results')
    .upsert(row, { onConflict: 'application_id' });
  if (error && !isMissingRelationError(error)) {
    console.error('[saveDraftPostAgentResult]', error);
  }
}

export async function analyzeDraftPostForApplication(applicationId: string): Promise<DraftPostAgentResult | null> {
  const [draft, access] = await Promise.all([
    getDraftPostForApplication(applicationId),
    getApplicationAccessRow(applicationId),
  ]);
  if (!draft || !access) return null;
  const app = mapApplicationFromAccessRow(access.row);
  const [campaign, restaurant, creator] = await Promise.all([
    getCampaignById(app.campaign_id),
    app.restaurantId ? getRestaurantProfile(String(app.restaurantId)) : Promise.resolve(null),
    getCreatorProfile(app.creator_id),
  ]);
  const fallback = localDraftPostAnalysis({ applicationId, draft, campaign, restaurant, creator });
  const { data, error } = await supabase.functions.invoke('evaluate-draft-post', {
    body: {
      applicationId,
      campaignId: app.campaign_id,
      creatorId: app.creator_id,
      restaurantId: app.restaurantId,
      draftTitle: draft.draftTitle ?? '',
      draftContent: draft.draftContent ?? draft.draftText ?? '',
      draftImages: draft.draftImages ?? [],
      campaign,
      restaurant,
      creator,
    },
  });
  if (error || !data) {
    await saveDraftPostAgentResult(fallback);
    return fallback;
  }
  const payload = (data as { result?: DraftPostAgentResult })?.result ?? (data as DraftPostAgentResult);
  const result = { ...fallback, ...payload };
  await saveDraftPostAgentResult(result);
  return result;
}
