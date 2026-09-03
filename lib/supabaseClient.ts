import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { GeoCTA, GeoDiscoveryPage, GeoFAQ, GeoMerchant, GeoSection } from './geoMockData';

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      EXPO_PUBLIC_SUPABASE_URL?: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
      VITE_MAPBOX_ACCESS_TOKEN?: string;
      EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN?: string;
    };
  }
}

function getSupabaseConfig(): { url: string; anonKey: string } {
  const runtime = typeof window !== 'undefined' ? window.__RUNTIME_CONFIG__ : undefined;
  const viteEnv = import.meta.env;
  const url =
    runtime?.VITE_SUPABASE_URL ??
    runtime?.EXPO_PUBLIC_SUPABASE_URL ??
    viteEnv.VITE_SUPABASE_URL ??
    viteEnv.EXPO_PUBLIC_SUPABASE_URL ??
    '';
  const anonKey =
    runtime?.VITE_SUPABASE_ANON_KEY ??
    runtime?.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    viteEnv.VITE_SUPABASE_ANON_KEY ??
    viteEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    '';
  return { url, anonKey };
}

let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_client) {
    const { url, anonKey } = getSupabaseConfig();
    if (!url || !anonKey) {
      if (typeof window !== 'undefined') {
        console.warn(
          '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set in .env (local) or Cloud Run env (production).'
        );
      }
    }
    _client = createClient(url || '', anonKey || '');
  }
  return _client;
}

/** 单例 Supabase 客户端。本地用 import.meta.env，生产用 window.__RUNTIME_CONFIG__（/config.js）。不写死 key。 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as unknown as Record<string, unknown>)[prop as string];
  },
});

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

/** @deprecated 请直接 import { supabase } from '@/lib/supabaseClient' */
export function getSupabase(): SupabaseClient {
  return getClient();
}

/** validate_code / redeem_code 返回的权益项 */
export type CodeBenefit = {
  type: string;
  value?: unknown;
  title?: string | null;
  description?: string | null;
};

/** validate_code / redeem_code 成功时返回的可直接展示结构（不再需要查 coupon_templates） */
export type ValidateOrRedeemPayload = {
  valid?: boolean;
  success?: boolean;
  code_type: string | null;
  code_id: string | null;
  title: string | null;
  description: string | null;
  benefits: CodeBenefit[];
  reason?: string;
  redemption_id?: string;
};

export type ValidateOrRedeemResult =
  | { ok: true; data: ValidateOrRedeemPayload }
  | { ok: false; reason: string };

/** 将 RPC 返回的 JSONB 转为统一结果；失败时用 reason。支持 valid/success/ok 任一为 true，或有效载荷在 data 里。 */
function normalizeRpcResponse(raw: unknown): ValidateOrRedeemResult {
  let d = raw as Record<string, unknown> | null;
  if (!d || typeof d !== 'object') {
    return { ok: false, reason: 'invalid_code' };
  }
  if (d.data != null && typeof d.data === 'object' && !Array.isArray(d.data)) {
    d = d.data as Record<string, unknown>;
  }
  const valid = d.valid === true || d.success === true || d.ok === true;
  const reason = typeof d.reason === 'string' ? d.reason : 'invalid_code';
  if (valid) {
    const payload: ValidateOrRedeemPayload = {
      valid: d.valid === true,
      success: d.success === true,
      code_type: (d.code_type as string | null) ?? null,
      code_id: (d.code_id as string | null) ?? null,
      title: (d.title as string | null) ?? null,
      description: (d.description as string | null) ?? null,
      benefits: Array.isArray(d.benefits)
        ? (d.benefits as CodeBenefit[]).map((b) => ({
            type: typeof b?.type === 'string' ? b.type : '',
            value: (b as CodeBenefit).value,
            title: (b as CodeBenefit).title ?? null,
            description: (b as CodeBenefit).description ?? null,
          }))
        : [],
      reason: reason,
      redemption_id: d.redemption_id as string | undefined,
    };
    return { ok: true, data: payload };
  }
  return { ok: false, reason };
}

/** 仅校验码，不兑换。RPC: validate_code(p_code)。 */
export async function validateCode(codeText: string): Promise<ValidateOrRedeemResult> {
  const supabase = getClient();
  const { data, error } = await supabase.rpc('validate_code', {
    p_code: codeText.trim(),
  });
  if (error) {
    console.error('[validate_code RPC error]', error.message, error);
    return { ok: false, reason: 'invalid_code' };
  }
  return normalizeRpcResponse(data);
}

/** 校验并兑换。RPC: redeem_code(p_code)。要求已登录；未登录时返回 reason: not_authenticated。 */
export async function redeemCode(codeText: string): Promise<ValidateOrRedeemResult> {
  const supabase = getClient();
  const { data, error } = await supabase.rpc('redeem_code', {
    p_code: codeText.trim(),
  });
  if (error) {
    console.error('[redeem_code RPC error]', error.message, error);
    return { ok: false, reason: 'invalid_code' };
  }
  return normalizeRpcResponse(data);
}

export type HoponRedeemCreator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
  avatarExpiresAt?: string | null;
  platform: string;
  label: string;
};

export type HoponRedeemCampaign = {
  id: string;
  title: string;
  merchantName: string;
  status: string;
  offerType: 'percent_off';
  offerValue: number;
  startDate?: string | null;
  endDate?: string | null;
  creators: HoponRedeemCreator[];
};

export type HoponRedemptionLinkTarget = {
  campaignId: string;
  creatorId: string;
  slug: string;
};

export type HoponRedemptionLinkClickResult = {
  ok: boolean;
  duplicate: boolean;
  clickId: string | null;
};

export async function resolveHoponRedemptionLink(
  slug: string
): Promise<HoponRedemptionLinkTarget | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!isSupabaseConfigured() || !normalizedSlug) return null;

  const { data, error } = await getClient().rpc('resolve_public_redemption_link', {
    p_slug: normalizedSlug,
  });
  if (error) {
    console.warn('[resolve_public_redemption_link]', error.message);
    return null;
  }

  const row = data as Record<string, unknown> | null;
  const campaignId = typeof row?.campaignId === 'string' ? row.campaignId : '';
  const creatorId = typeof row?.creatorId === 'string' ? row.creatorId : '';
  const resolvedSlug = typeof row?.slug === 'string' ? row.slug : normalizedSlug;
  return campaignId && creatorId
    ? { campaignId, creatorId, slug: resolvedSlug }
    : null;
}

export async function trackHoponRedemptionLinkClick(
  slug: string,
  anonymousVisitor: HoponAnonymousVisitor
): Promise<HoponRedemptionLinkClickResult> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!isSupabaseConfigured() || !normalizedSlug || !anonymousVisitor.id) {
    return { ok: false, duplicate: false, clickId: null };
  }

  try {
    const { data, error } = await getClient().rpc('record_public_redemption_link_click', {
      p_slug: normalizedSlug,
      p_anonymous_visitor_id: anonymousVisitor.id,
      p_visitor_id_scope: anonymousVisitor.scope,
      p_metadata: {
        source: 'website_short_link',
        landing_path: `/r/${normalizedSlug}`,
        platform: 'web',
      },
    });

    if (error) {
      console.warn('[record_public_redemption_link_click]', error.message);
      return { ok: false, duplicate: false, clickId: null };
    }

    const row = data as Record<string, unknown> | null;
    return {
      ok: row?.ok === true,
      duplicate: row?.duplicate === true,
      clickId: typeof row?.click_id === 'string' ? row.click_id : null,
    };
  } catch (error) {
    console.warn('[record_public_redemption_link_click]', error);
    return { ok: false, duplicate: false, clickId: null };
  }
}

type SupabaseRelation<T> = T | T[] | null;

type RedeemCreatorProfileRow = {
  id: string;
  name: string | null;
  handle: string | null;
  avatar: string | null;
  tags: string[] | null;
  tiktok_handle: string | null;
};

type RedeemApplicationRow = {
  id: string;
  campaign_id: string;
  creator_id: string;
  status: string;
  verified_at: string | null;
  creator_profiles: SupabaseRelation<RedeemCreatorProfileRow>;
};

type RedeemAppUserRow = {
  id: string;
  role: string;
  status: string;
  is_test_account: boolean | null;
};

type RedeemCampaignRow = {
  id: string;
  restaurant_id: string;
  title: string;
  description?: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  platforms: string[] | null;
  is_internal_test: boolean | null;
  restaurant_profiles: SupabaseRelation<{ name: string | null }>;
};

function firstRelated<T>(value: SupabaseRelation<T> | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

async function fetchRedeemAppUsers(ids: string[]): Promise<Map<string, RedeemAppUserRow> | null> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map();

  const { data, error } = await getClient()
    .from('app_users')
    .select('id,role,status,is_test_account')
    .in('id', uniqueIds);

  if (error) {
    console.warn('[redeem visibility] app user eligibility query failed', error.message);
    return null;
  }

  return new Map(((data || []) as RedeemAppUserRow[]).map((row) => [row.id, row]));
}

function isApprovedProductionUser(
  user: RedeemAppUserRow | undefined,
  role: 'creator' | 'restaurant',
): boolean {
  return Boolean(
    user &&
    user.role === role &&
    user.status === 'approved' &&
    user.is_test_account !== true,
  );
}

const platformLabel = (platform?: string | null): string => {
  const value = String(platform || '').toLowerCase();
  if (value.includes('xhs') || value.includes('xiaohong')) return 'Xiaohongshu';
  if (value.includes('douyin')) return 'Douyin';
  if (value.includes('tiktok')) return 'TikTok';
  if (value.includes('instagram')) return 'Instagram';
  return 'Social';
};

const creatorLabel = (tags: unknown): string => {
  const values = Array.isArray(tags) ? tags.map(String).map((tag) => tag.toLowerCase()) : [];
  if (values.some((tag) => tag.includes('beauty') || tag.includes('skin'))) return 'Local beauty creator';
  if (values.some((tag) => tag.includes('wellness') || tag.includes('fitness'))) return 'Local wellness creator';
  if (values.some((tag) => tag.includes('cafe') || tag.includes('coffee'))) return 'Local cafe creator';
  return 'Local food creator';
};

const normalizeHandle = (handle?: string | null): string =>
  String(handle || 'creator').trim().replace(/^@+/, '') || 'creator';

function checkedInCreatorFromApplication(
  application: RedeemApplicationRow,
  campaignId: string,
  platform?: string | null,
  eligibleCreatorIds?: ReadonlySet<string>,
): HoponRedeemCreator | null {
  if (
    application.campaign_id !== campaignId ||
    application.status !== 'ACCEPTED' ||
    typeof application.verified_at !== 'string' ||
    !application.verified_at.trim()
  ) {
    return null;
  }

  if (eligibleCreatorIds && !eligibleCreatorIds.has(application.creator_id)) return null;

  const creator = firstRelated(application.creator_profiles);
  if (!creator?.id || creator.id !== application.creator_id) return null;

  return {
    id: creator.id,
    name: creator.name || creator.handle || 'Creator',
    handle: normalizeHandle(creator.handle || creator.tiktok_handle),
    avatarUrl: creator.avatar || null,
    platform: platformLabel(platform),
    label: creatorLabel(creator.tags),
  };
}

const VERIFY_AVATAR_CACHE_KEY = 'hopon:verify-avatar-cache:v1';
const VERIFY_VISITOR_STORAGE_KEY = 'hopon:verify-anon-visitor:v1';

type VerifyAvatarCache = Record<string, { url: string; expiresAt: string }>;

export type HoponAnonymousVisitor = {
  id: string;
  scope: 'daily';
  expiresAt: string;
};

export type HoponRedemptionLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  capturedAt: string;
};

function readVerifyAvatarCache(): VerifyAvatarCache {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(VERIFY_AVATAR_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as VerifyAvatarCache;
  } catch {
    return {};
  }
}

function writeVerifyAvatarCache(cache: VerifyAvatarCache): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VERIFY_AVATAR_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Non-critical: the page can still render initials.
  }
}

function isFreshAvatarCacheEntry(entry: { url: string; expiresAt: string } | undefined): entry is { url: string; expiresAt: string } {
  if (!entry?.url || !entry.expiresAt) return false;
  return Date.parse(entry.expiresAt) > Date.now() + 60_000;
}

function cacheVerifyAvatars(campaigns: HoponRedeemCampaign[]): void {
  const cache = readVerifyAvatarCache();
  let changed = false;
  for (const campaign of campaigns) {
    for (const creator of campaign.creators) {
      if (!creator.avatarUrl || !creator.avatarExpiresAt) continue;
      cache[creator.id] = { url: creator.avatarUrl, expiresAt: creator.avatarExpiresAt };
      changed = true;
    }
  }
  if (changed) writeVerifyAvatarCache(cache);
}

function applyCachedVerifyAvatars(campaigns: HoponRedeemCampaign[]): HoponRedeemCampaign[] {
  const cache = readVerifyAvatarCache();
  return campaigns.map((campaign) => ({
    ...campaign,
    creators: campaign.creators.map((creator) => {
      if (creator.avatarUrl) return creator;
      const cached = cache[creator.id];
      if (!isFreshAvatarCacheEntry(cached)) return creator;
      return {
        ...creator,
        avatarUrl: cached.url,
        avatarExpiresAt: cached.expiresAt,
      };
    }),
  }));
}

function createClientRedemptionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (char) => {
    const randomValue =
      typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : Math.floor(Math.random() * 256);
    return (Number(char) ^ (randomValue & (15 >> (Number(char) / 4)))).toString(16);
  });
}

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function nextLocalMidnightIso(): string {
  const value = new Date();
  value.setHours(24, 0, 0, 0);
  return value.toISOString();
}

function isFreshVisitor(value: unknown, dateKey: string): value is HoponAnonymousVisitor & { dateKey: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    row.id.length > 8 &&
    row.scope === 'daily' &&
    row.dateKey === dateKey &&
    typeof row.expiresAt === 'string' &&
    Date.parse(row.expiresAt) > Date.now()
  );
}

export function getOrCreateVerifyAnonymousVisitor(): HoponAnonymousVisitor {
  const dateKey = localDateKey();
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(VERIFY_VISITOR_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (isFreshVisitor(parsed, dateKey)) {
        return { id: parsed.id, scope: 'daily', expiresAt: parsed.expiresAt };
      }
    } catch {
      // Non-critical: create a fresh visitor for this page.
    }
  }

  const visitor: HoponAnonymousVisitor & { dateKey: string } = {
    id: `daily:${dateKey}:${createClientRedemptionId()}`,
    scope: 'daily',
    expiresAt: nextLocalMidnightIso(),
    dateKey,
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(VERIFY_VISITOR_STORAGE_KEY, JSON.stringify(visitor));
    } catch {
      // Local storage may be blocked; the in-memory value still works for this click.
    }
  }

  return { id: visitor.id, scope: visitor.scope, expiresAt: visitor.expiresAt };
}

function normalizePublicRedeemCampaigns(raw: unknown): HoponRedeemCampaign[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): HoponRedeemCampaign | null => {
      if (!item || typeof item !== 'object') return null;
      const campaign = item as Record<string, unknown>;
      const creators = Array.isArray(campaign.creators) ? campaign.creators : [];
      const normalizedCreators = creators
        .map((creator): HoponRedeemCreator | null => {
          if (!creator || typeof creator !== 'object') return null;
          const row = creator as Record<string, unknown>;
          const id = typeof row.id === 'string' ? row.id : '';
          const name = typeof row.name === 'string' ? row.name : '';
          const handle = typeof row.handle === 'string' ? normalizeHandle(row.handle) : 'creator';
          if (!id || !name) return null;
          return {
            id,
            name,
            handle,
            avatarUrl: typeof row.avatarUrl === 'string' ? row.avatarUrl : null,
            avatarExpiresAt: typeof row.avatarExpiresAt === 'string' ? row.avatarExpiresAt : null,
            platform: typeof row.platform === 'string' ? row.platform : 'Social',
            label: typeof row.label === 'string' ? row.label : 'Local food creator',
          };
        })
        .filter((creator): creator is HoponRedeemCreator => Boolean(creator));

      const id = typeof campaign.id === 'string' ? campaign.id : '';
      const title = typeof campaign.title === 'string' ? campaign.title : '';
      if (!id || !title || normalizedCreators.length === 0) return null;

      return {
        id,
        title,
        merchantName: typeof campaign.merchantName === 'string' ? campaign.merchantName : 'Hopon merchant',
        status: typeof campaign.status === 'string' ? campaign.status : 'OPEN',
        offerType: 'percent_off',
        offerValue: typeof campaign.offerValue === 'number' ? campaign.offerValue : 5,
        startDate: typeof campaign.startDate === 'string' ? campaign.startDate : null,
        endDate: typeof campaign.endDate === 'string' ? campaign.endDate : null,
        creators: normalizedCreators,
      };
    })
    .filter((campaign): campaign is HoponRedeemCampaign => Boolean(campaign));
}

function findDirectRedeemCampaign(
  campaigns: HoponRedeemCampaign[],
  campaignId: string,
  creatorId?: string
): HoponRedeemCampaign | null {
  const campaign = campaigns.find((item) => item.id === campaignId);
  if (!campaign) return null;
  if (!creatorId) return campaign;

  const creator = campaign.creators.find((item) => item.id === creatorId);
  return creator ? { ...campaign, creators: [creator] } : null;
}

function isMissingRpcError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42883' ||
    error.code === 'PGRST202' ||
    /function .*(list_public_redeem_campaigns|get_public_redeem_campaign_by_link)/i.test(error.message || '')
  );
}

export async function getHoponRedeemCampaignByLink(
  campaignId: string,
  creatorId?: string
): Promise<HoponRedeemCampaign | null> {
  if (!isSupabaseConfigured() || !campaignId) return null;

  try {
    const { data: functionCampaigns, error: functionError } = await getClient().functions.invoke('public-redeem-campaigns', {
      body: {
        campaignId,
        creatorId: creatorId || undefined,
      },
    });

    if (!functionError) {
      const campaigns = normalizePublicRedeemCampaigns(functionCampaigns);
      const directCampaign = findDirectRedeemCampaign(campaigns, campaignId, creatorId);
      if (directCampaign) {
        cacheVerifyAvatars([directCampaign]);
        return applyCachedVerifyAvatars([directCampaign])[0] ?? null;
      }
      return null;
    } else {
      console.warn('[getHoponRedeemCampaignByLink] public function failed, falling back to RPC', functionError.message);
    }

    const { data: rpcCampaigns, error: rpcError } = await getClient().rpc('get_public_redeem_campaign_by_link', {
      p_campaign_id: campaignId,
      p_creator_id: creatorId || null,
    });

    if (!rpcError) {
      const campaigns = normalizePublicRedeemCampaigns(rpcCampaigns);
      const directCampaign = findDirectRedeemCampaign(campaigns, campaignId, creatorId);
      return directCampaign ? applyCachedVerifyAvatars([directCampaign])[0] ?? null : null;
    }

    if (!isMissingRpcError(rpcError)) {
      console.warn('[getHoponRedeemCampaignByLink] direct RPC failed', rpcError.message);
      return null;
    }

    const { data: campaign, error: campaignError } = await getClient()
      .from('campaigns')
      .select(`
        id,
        restaurant_id,
        title,
        is_internal_test,
        status,
        start_date,
        end_date,
        platforms,
        restaurant_profiles!campaigns_restaurant_id_fkey (
          name
        )
      `)
      .eq('id', campaignId)
      .eq('status', 'OPEN')
      .maybeSingle();

    if (campaignError || !campaign) {
      if (campaignError) console.warn('[getHoponRedeemCampaignByLink] campaign query failed', campaignError.message);
      return null;
    }
    const campaignRow = campaign as unknown as RedeemCampaignRow;

    const merchantUsers = await fetchRedeemAppUsers([campaignRow.restaurant_id]);
    const merchantUser = merchantUsers?.get(campaignRow.restaurant_id);
    if (!merchantUsers || !merchantUser || merchantUser.role !== 'restaurant' || merchantUser.status !== 'approved') {
      return null;
    }

    let applicationQuery = getClient()
      .from('applications')
      .select(`
        id,
        campaign_id,
        status,
        creator_id,
        verified_at,
        creator_profiles!applications_creator_id_fkey (
          id,
          name,
          handle,
          avatar,
          tags,
          tiktok_handle
        )
      `)
      .eq('campaign_id', campaignId)
      .eq('status', 'ACCEPTED')
      .not('verified_at', 'is', null)
      .limit(50);

    if (creatorId) {
      applicationQuery = applicationQuery.eq('creator_id', creatorId);
    }

    const { data: applicationRows, error: appError } = await applicationQuery;
    if (appError) {
      console.warn('[getHoponRedeemCampaignByLink] creator query failed', appError.message);
      return null;
    }

    const creatorIds = ((applicationRows || []) as unknown as RedeemApplicationRow[])
      .map((row) => row.creator_id);
    const creatorUsers = await fetchRedeemAppUsers(creatorIds);
    if (!creatorUsers) return null;

    const directTestQa = Boolean(creatorId) && (
      merchantUser?.is_test_account === true ||
      creatorUsers.get(creatorId)?.is_test_account === true
    );
    if (campaignRow.is_internal_test === true && !directTestQa) return null;
    const eligibleCreatorIds = new Set(
      ((applicationRows || []) as unknown as RedeemApplicationRow[])
        .filter((row) => {
          const user = creatorUsers.get(row.creator_id);
          if (!user || user.role !== 'creator' || user.status !== 'approved') return false;
          if (isApprovedProductionUser(user, 'creator')) return true;
          return directTestQa && row.creator_id === creatorId;
        })
        .map((row) => row.creator_id),
    );

    const creators = ((applicationRows || []) as unknown as RedeemApplicationRow[])
      .map((row) => checkedInCreatorFromApplication(
        row,
        campaignId,
        campaignRow.platforms?.[0],
        eligibleCreatorIds,
      ))
      .filter((creator): creator is HoponRedeemCreator => Boolean(creator));

    if (creators.length === 0) return null;
    const restaurantProfile = firstRelated(campaignRow.restaurant_profiles);

    return {
      id: campaignRow.id,
      title: campaignRow.title,
      merchantName: restaurantProfile?.name || 'Hopon merchant',
      status: campaignRow.status,
      offerType: 'percent_off',
      offerValue: 5,
      startDate: campaignRow.start_date,
      endDate: campaignRow.end_date,
      creators,
    };
  } catch (error) {
    console.warn('[getHoponRedeemCampaignByLink] unexpected error', error);
    return null;
  }
}

export async function listActiveHoponRedeemCampaigns(): Promise<HoponRedeemCampaign[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data: functionCampaigns, error: functionError } = await getClient().functions.invoke('public-redeem-campaigns', {
      body: { limit: 12 },
    });

    if (!functionError) {
      const campaigns = normalizePublicRedeemCampaigns(functionCampaigns);
      if (campaigns.length > 0) {
        cacheVerifyAvatars(campaigns);
      }
      return applyCachedVerifyAvatars(campaigns);
    }
    if (functionError) {
      console.warn('[listActiveHoponRedeemCampaigns] public function failed, falling back to RPC', functionError.message);
    }

    const { data: publicCampaigns, error: publicError } = await getClient().rpc('list_public_redeem_campaigns', {
      p_limit: 12,
    });

    if (!publicError) {
      const campaigns = normalizePublicRedeemCampaigns(publicCampaigns);
      return applyCachedVerifyAvatars(campaigns);
    }

    if (!isMissingRpcError(publicError)) {
      console.warn('[listActiveHoponRedeemCampaigns] public RPC failed', publicError.message);
      return [];
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await getClient()
      .from('campaigns')
      .select(`
        id,
        restaurant_id,
        title,
        description,
        status,
        start_date,
        end_date,
        platforms,
        is_internal_test,
        restaurant_profiles!campaigns_restaurant_id_fkey (
          name
        )
      `)
      .eq('status', 'OPEN')
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      console.warn('[listActiveHoponRedeemCampaigns] campaign query failed', error.message);
      return [];
    }
    const campaignRows = (data || []) as unknown as RedeemCampaignRow[];

    const campaigns = await Promise.all(
      campaignRows
        .filter((campaign) => campaign.status === 'OPEN' && campaign.is_internal_test !== true)
        .map(async (campaign): Promise<HoponRedeemCampaign | null> => {
          const merchantUsers = await fetchRedeemAppUsers([campaign.restaurant_id]);
          if (!merchantUsers || !isApprovedProductionUser(merchantUsers.get(campaign.restaurant_id), 'restaurant')) {
            return null;
          }

          const { data: applicationRows, error: appError } = await getClient()
            .from('applications')
            .select(`
              id,
              campaign_id,
              status,
              creator_id,
              verified_at,
              creator_profiles!applications_creator_id_fkey (
                id,
                name,
                handle,
                avatar,
                tags,
                tiktok_handle
              )
            `)
            .eq('campaign_id', campaign.id)
            .eq('status', 'ACCEPTED')
            .not('verified_at', 'is', null)
            .limit(50);

          if (appError) {
            console.warn('[listActiveHoponRedeemCampaigns] creator query failed', appError.message);
            return null;
          }

          const creatorUsers = await fetchRedeemAppUsers(
            ((applicationRows || []) as unknown as RedeemApplicationRow[]).map((row) => row.creator_id),
          );
          if (!creatorUsers) return null;

          const eligibleCreatorIds = new Set(
            ((applicationRows || []) as unknown as RedeemApplicationRow[])
              .filter((row) => isApprovedProductionUser(creatorUsers.get(row.creator_id), 'creator'))
              .map((row) => row.creator_id),
          );

          const creators = ((applicationRows || []) as unknown as RedeemApplicationRow[])
            .map((row) => checkedInCreatorFromApplication(
              row,
              campaign.id,
              campaign.platforms?.[0],
              eligibleCreatorIds,
            ))
            .filter((creator): creator is HoponRedeemCreator => Boolean(creator));

          if (creators.length === 0) return null;
          const restaurantProfile = firstRelated(campaign.restaurant_profiles);

          return {
            id: campaign.id,
            title: campaign.title,
            merchantName: restaurantProfile?.name || 'Hopon merchant',
            status: campaign.status,
            offerType: 'percent_off',
            offerValue: 5,
            startDate: campaign.start_date,
            endDate: campaign.end_date,
            creators,
          };
        })
    );

    return campaigns.filter((campaign): campaign is HoponRedeemCampaign => Boolean(campaign));
  } catch (error) {
    console.warn('[listActiveHoponRedeemCampaigns] unexpected error', error);
    return [];
  }
}

export function trackHoponOfferRedeem(payload: {
  campaignId: string;
  campaignTitle: string;
  merchantName: string;
  creatorId: string;
  creatorHandle: string;
  offerType: 'percent_off';
  offerValue: number;
  anonymousVisitor?: HoponAnonymousVisitor;
  location?: HoponRedemptionLocation | null;
  sourceUrl?: string;
  directLink?: boolean;
}): void {
  const clientRedemptionId = createClientRedemptionId();

  const metadata = {
    campaign_title: payload.campaignTitle,
    merchant_name: payload.merchantName,
    creator_handle: payload.creatorHandle,
    verify_url: payload.sourceUrl ?? null,
    verify_access_mode: payload.directLink ? 'direct_link' : 'public_list',
  };

  const extendedArgs = {
    p_campaign_id: payload.campaignId,
    p_creator_id: payload.creatorId,
    p_client_redemption_id: clientRedemptionId,
    p_offer_type: payload.offerType,
    p_offer_value: payload.offerValue,
    p_metadata: metadata,
    p_anonymous_visitor_id: payload.anonymousVisitor?.id ?? null,
    p_visitor_id_scope: payload.anonymousVisitor?.scope ?? 'daily',
    p_visitor_id_expires_at: payload.anonymousVisitor?.expiresAt ?? null,
    p_location_latitude: payload.location?.latitude ?? null,
    p_location_longitude: payload.location?.longitude ?? null,
    p_location_accuracy_meters: payload.location?.accuracyMeters ?? null,
    p_location_captured_at: payload.location?.capturedAt ?? null,
  };

  const legacyArgs = {
    p_campaign_id: payload.campaignId,
    p_creator_id: payload.creatorId,
    p_client_redemption_id: clientRedemptionId,
    p_offer_type: payload.offerType,
    p_offer_value: payload.offerValue,
    p_metadata: metadata,
  };

  const shouldRetryLegacy = (error: { code?: string; message?: string } | null): boolean => {
    if (!error) return false;
    const message = error.message || '';
    return error.code === 'PGRST202' || error.code === '42883' || /record_public_offer_redemption/i.test(message);
  };

  try {
    getClient()
      .rpc('record_public_offer_redemption', extendedArgs)
      .then(({ error }) => {
        if (!error) return;
        if (shouldRetryLegacy(error)) {
          getClient()
            .rpc('record_public_offer_redemption', legacyArgs)
            .then(({ error: legacyError }) => {
              if (!legacyError) return;
              console.warn('[record_public_offer_redemption legacy]', legacyError.message);
            });
          return;
        }
        console.warn('[record_public_offer_redemption]', error.message);
      });
  } catch (error) {
    console.warn('[record_public_offer_redemption]', error);
  }
}

type JsonRecord = Record<string, unknown>;
export type GeneratedPageSummary = {
  slug: string;
  pageType: 'merchant' | 'discovery';
  title: string;
  metaDescription: string;
  href: string;
  publishedAt: string | null;
};

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const asFAQArray = (value: unknown): GeoFAQ[] =>
  Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((item) => ({
          question: asString(item.question),
          answer: asString(item.answer),
        }))
        .filter((item) => item.question && item.answer)
    : [];

const asSectionArray = (value: unknown): GeoSection[] =>
  Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((item) => ({
          heading: asString(item.heading, asString(item.title)),
          body: asString(item.body, asString(item.description)),
        }))
        .filter((item) => item.heading && item.body)
    : [];

const asCTA = (value: unknown): GeoCTA | null => {
  if (!isRecord(value)) return null;

  const label = asString(value.label, asString(value.text, 'See Details'));
  if (!label) return null;

  return {
    label,
    href: asString(value.href, asString(value.url, asString(value.path, '#'))),
    variant: value.variant === 'secondary' ? 'secondary' : 'primary',
  };
};

const asCTAArray = (value: unknown): GeoCTA[] =>
  Array.isArray(value) ? value.map(asCTA).filter((item): item is GeoCTA => Boolean(item)) : [];

const pagePayload = (row: JsonRecord): JsonRecord => {
  const nested =
    (isRecord(row.content) && row.content) ||
    (isRecord(row.data) && row.data) ||
    (isRecord(row.page_data) && row.page_data) ||
    (isRecord(row.generated_content) && row.generated_content) ||
    {};

  return {
    ...row,
    ...nested,
  };
};

const pick = (source: JsonRecord, ...keys: string[]) => {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
};

const normalizeMerchantPage = (row: JsonRecord): GeoMerchant | null => {
  const source = pagePayload(row);
  const content = isRecord(row.content) ? row.content : {};
  const hero = isRecord(content.hero) ? content.hero : {};
  const slug = asString(pick(source, 'slug'));
  const name = asString(pick(source, 'name', 'merchant_name', 'title'), asString(row.title));

  if (!slug || !name) return null;

  const sections = asSectionArray(pick(source, 'sections'));
  const ctas = [
    ...asCTAArray(pick(source, 'ctas', 'cta_buttons')),
    ...asCTAArray(pick(source, 'cta') ? [pick(source, 'cta')] : undefined),
  ];

  return {
    slug,
    name,
    category: asString(pick(source, 'category'), 'Local merchant'),
    neighborhood: asString(pick(source, 'neighborhood'), 'New York'),
    city: asString(pick(source, 'city'), 'NYC'),
    address: asString(pick(source, 'address')),
    priceRange: asString(pick(source, 'priceRange', 'price_range'), '$$'),
    heroImage: asString(
      pick(source, 'heroImage', 'hero_image', 'image_url', 'cover_image'),
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?q=80&w=1800&auto=format&fit=crop'
    ),
    seoTitle: asString(pick(row, 'title'), asString(pick(source, 'seoTitle', 'seo_title'), `${name} | hOpOn`)),
    seoDescription: asString(
      pick(row, 'meta_description') ??
        pick(source, 'seoDescription', 'seo_description', 'meta_description', 'description'),
      `Discover ${name} on hOpOn.`
    ),
    eyebrow: asString(pick(source, 'eyebrow'), 'Merchant guide'),
    headline: asString(pick(hero, 'headline'), asString(pick(source, 'headline'), `${name} on hOpOn.`)),
    summary: asString(
      pick(hero, 'subheadline'),
      asString(pick(source, 'summary', 'description'))
    ),
    highlights: asStringArray(pick(source, 'highlights')),
    signatureItems: asStringArray(pick(source, 'signatureItems', 'signature_items')),
    bestFor: asStringArray(pick(source, 'bestFor', 'best_for')),
    sections,
    faqs: asFAQArray(pick(source, 'faqs', 'faq')),
    ctas,
  };
};

const normalizeDiscoveryPage = (row: JsonRecord): GeoDiscoveryPage | null => {
  const source = pagePayload(row);
  const content = isRecord(row.content) ? row.content : {};
  const hero = isRecord(content.hero) ? content.hero : {};
  const slug = asString(pick(source, 'slug'));
  const title = asString(pick(row, 'title'), asString(pick(source, 'title', 'name')));

  if (!slug || !title) return null;

  const ctas = [
    ...asCTAArray(pick(source, 'ctas', 'cta_buttons')),
    ...asCTAArray(pick(source, 'cta') ? [pick(source, 'cta')] : undefined),
  ];

  return {
    slug,
    title,
    seoTitle: asString(pick(row, 'title'), asString(pick(source, 'seoTitle', 'seo_title'), `${title} | hOpOn Discovery`)),
    seoDescription: asString(
      pick(row, 'meta_description') ??
        pick(source, 'seoDescription', 'seo_description', 'meta_description', 'description', 'intro'),
      `Discover ${title} on hOpOn.`
    ),
    eyebrow: asString(pick(source, 'eyebrow'), 'Discovery guide'),
    headline: asString(pick(hero, 'headline'), asString(pick(source, 'headline'), title)),
    intro: asString(
      pick(hero, 'subheadline'),
      asString(pick(source, 'intro', 'summary', 'description'))
    ),
    heroImage: asString(
      pick(source, 'heroImage', 'hero_image', 'image_url', 'cover_image'),
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=1800&auto=format&fit=crop'
    ),
    city: asString(pick(source, 'city'), 'NYC'),
    category: asString(pick(source, 'category'), 'Discovery'),
    sections: asSectionArray(pick(source, 'sections')),
    merchantSlugs: asStringArray(pick(source, 'merchantSlugs', 'merchant_slugs')),
    faqs: asFAQArray(pick(source, 'faqs', 'faq')),
    ctas,
  };
};

async function getPublishedGeneratedPage(
  slug: string,
  pageType: 'merchant' | 'discovery'
): Promise<JsonRecord | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await getClient()
    .from('generated_pages')
    .select('*')
    .eq('slug', slug)
    .eq('page_type', pageType)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.error('[generated_pages fetch error]', error.message, error);
    return null;
  }

  return isRecord(data) ? data : null;
}

export async function getMerchantPageBySlug(slug: string): Promise<GeoMerchant | null> {
  const row = await getPublishedGeneratedPage(slug, 'merchant');
  return row ? normalizeMerchantPage(row) : null;
}

export async function getDiscoveryPageBySlug(slug: string): Promise<GeoDiscoveryPage | null> {
  const row = await getPublishedGeneratedPage(slug, 'discovery');
  return row ? normalizeDiscoveryPage(row) : null;
}

export async function getPublishedGeneratedPages(): Promise<GeneratedPageSummary[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getClient()
    .from('generated_pages')
    .select('slug,page_type,title,meta_description,published_at')
    .eq('status', 'published')
    .in('page_type', ['merchant', 'discovery'])
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[generated_pages list error]', error.message, error);
    return [];
  }

  return Array.isArray(data)
    ? data
        .filter(isRecord)
        .map((row) => {
          const pageType: 'merchant' | 'discovery' = row.page_type === 'discovery' ? 'discovery' : 'merchant';
          const slug = asString(row.slug);
          return {
            slug,
            pageType,
            title: asString(row.title, slug),
            metaDescription: asString(row.meta_description),
            href: pageType === 'discovery' ? `/discover/${slug}` : `/merchant/${slug}`,
            publishedAt: asString(row.published_at) || null,
          };
        })
        .filter((row) => row.slug && row.title)
    : [];
}
