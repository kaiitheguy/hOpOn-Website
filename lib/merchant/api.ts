/**
 * Merchant API layer — Supabase-backed (or stubbed until backend is ready).
 * Matches audit store functions: getRestaurantProfile, getCampaignsForRestaurant, etc.
 */

import { supabase } from '../supabaseClient';
import type {
  Restaurant,
  Campaign,
  Application,
  Deliverable,
  DraftPost,
  Creator,
  CreatorSocialAccount,
  DiscoverCreator,
  DiscoverCreatorsFilters,
  Notification,
  LocationOption,
} from './types';

/** Current user id from Supabase auth; null if not logged in. */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ——— Restaurant (table: restaurant_profiles; id = app_users.id) ———
export async function getRestaurantProfile(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurant_profiles')
    .select('*')
    .eq('id', id)
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

function mapRowToCampaign(row: Record<string, unknown>): Campaign {
  const r = { ...row, merchant: Array.isArray(row.merchant) ? row.merchant[0] : row.merchant } as Record<string, unknown>;
  if (r.start_date != null && r.starts_at == null) r.starts_at = r.start_date;
  if (r.end_date != null && r.ends_at == null) r.ends_at = r.end_date;
  return r as Campaign;
}

// ——— Campaigns (merchant join: restaurant_profiles for is_official) ———
export async function getCampaignsForRestaurant(restaurantId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, merchant:restaurant_profiles!campaigns_restaurant_id_fkey(id, is_official)')
    .eq('restaurant_id', restaurantId)
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
    .select('*, merchant:restaurant_profiles!campaigns_restaurant_id_fkey(id, is_official)')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error('[getCampaignById]', error);
    return null;
  }
  if (!data) return null;
  return mapRowToCampaign(data as Record<string, unknown>);
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
  requirements?: string[];
  is_official?: boolean;
}): Promise<Campaign | null> {
  const allowedPlatforms = ['xhs', 'douyin', 'instagram', 'tiktok'] as const;
  const platformMap: Record<string, string> = { '小红书': 'xhs', '抖音': 'douyin', 'Instagram': 'instagram', 'instagram': 'instagram', 'TikTok': 'tiktok', 'tiktok': 'tiktok' };
  const raw = payload.platforms ?? [];
  const platforms = [...new Set(raw.map((p: string) => platformMap[p] ?? p).filter((v: string) => allowedPlatforms.includes(v as typeof allowedPlatforms[number])))];

  const today = new Date().toISOString().slice(0, 10);
  const row: Record<string, unknown> = {
    restaurant_id: payload.restaurant_id,
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
    requirements: payload.requirements ?? [],
  };
  const { data, error } = await supabase
    .from('campaigns')
    .insert(row)
    .select()
    .single();
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
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('restaurant_id', restaurantId);
  if (campError || !campaigns?.length) return [];
  const campaignIds = campaigns.map((c: { id: string }) => c.id);

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      campaign_id,
      creator_id,
      status,
      applied_at,
      verification_code,
      verified_at,
      campaign:campaigns(title, status, restaurant_id),
      creator:creator_profiles(name, handle, followers, tags)
    `)
    .in('campaign_id', campaignIds)
    .order('applied_at', { ascending: false });
  if (error) {
    console.error('[listApplicantsForRestaurant]', error);
    return [];
  }
  return (data ?? []).map((row: Record<string, unknown>) => {
    const camp = row.campaign as { title?: string; status?: string; restaurant_id?: string } | null;
    const creator = row.creator as { name?: string; handle?: string; followers?: number; tags?: string[] } | null;
    return {
      id: row.id,
      campaign_id: row.campaign_id,
      creator_id: row.creator_id,
      status: row.status,
      applied_at: row.applied_at,
      verification_code: row.verification_code,
      verified_at: row.verified_at != null ? (typeof row.verified_at === 'string' ? row.verified_at : String((row.verified_at as { toISOString?: () => string })?.toISOString?.() ?? row.verified_at)) : undefined,
      restaurantId: camp?.restaurant_id ?? null,
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
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('restaurant_id', restaurantId);
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
    .select('*')
    .in('application_id', applicationIds)
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('[listDeliverablesForRestaurant]', error);
    return [];
  }
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id,
    application_id: d.application_id,
    status: d.status,
    submitted_at: d.submitted_at,
    xhsUrl: d.xhs_url ?? d.link ?? null,
    notes: d.notes ?? null,
    images: (d.images as string[] | null) ?? [],
    feedback: d.feedback ?? null,
  })) as Deliverable[];
}

/** Audit §2.2: draftText, draftImages, feedback (Blanc listDraftPostsForRestaurant). */
export async function listDraftPostsForRestaurant(restaurantId: string): Promise<DraftPost[]> {
  const { data: campaigns, error: campError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('restaurant_id', restaurantId);
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
    .in('application_id', applicationIds)
    .order('submitted_at', { ascending: false });
  if (error) {
    console.error('[listDraftPostsForRestaurant]', error);
    return [];
  }
  return (data ?? []).map((d: Record<string, unknown>) => ({
    id: d.id,
    application_id: d.application_id,
    status: d.status,
    submitted_at: d.submitted_at,
    draftText: (d.draft_text as string) ?? '',
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
// Uses creator_profiles; applies filters server-side when columns exist, else client-side.
export async function listDiscoverCreators(filters?: DiscoverCreatorsFilters): Promise<DiscoverCreator[]> {
  const { data, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .order('followers', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500);
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
    city_key: row.city_key,
    area_key: row.area_key,
    ...row,
  })) as DiscoverCreator[];

  const platforms = filters?.platforms;
  const minF = filters?.followersMin;
  const maxF = filters?.followersMax;
  if (platforms?.length) {
    list = list.filter((c) => {
      const p = (c.platforms as string[] | undefined) ?? [];
      return platforms.some((f) => p.some((x) => String(x).toLowerCase() === String(f).toLowerCase()));
    });
  }
  if (minF != null && !Number.isNaN(minF)) {
    const v = (c: DiscoverCreator) => Number((c as { followers_count?: number }).followers_count ?? (c as { followers?: number }).followers ?? 0);
    list = list.filter((c) => v(c) >= minF);
  }
  if (maxF != null && !Number.isNaN(maxF)) {
    const v = (c: DiscoverCreator) => Number((c as { followers_count?: number }).followers_count ?? (c as { followers?: number }).followers ?? 0);
    list = list.filter((c) => v(c) <= maxF);
  }
  const cityKey = filters?.cityKey;
  const areaKey = filters?.areaKey;
  if (cityKey) {
    list = list.filter((c) => {
      const row = c as { city_key?: string; area_key?: string | null };
      if (row.city_key !== cityKey) return false;
      if (areaKey != null && areaKey !== '') return row.area_key === areaKey;
      return true;
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
