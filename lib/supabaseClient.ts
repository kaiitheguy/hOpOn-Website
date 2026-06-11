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
      GEMINI_API_KEY?: string;
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

/** 记录未登录用户的 promocode 兑换（仅插入，不阻塞 UI）。 */
export function trackAnonymousRedemption(payload: {
  code_text: string;
  template_code_name: string;
  code_id?: string;
}): void {
  try {
    getClient()
      .from('anonymous_redemptions')
      .insert({
        code_text: payload.code_text.trim(),
        template_code_name: payload.template_code_name,
        code_id: payload.code_id || null,
      })
      .then(({ error }) => {
        if (error) console.warn('[trackAnonymousRedemption]', error.message);
      });
  } catch {
    // 忽略：未配置 Supabase 或表不存在时不报错
  }
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

const TEST_CAMPAIGN_PATTERN = /test|demo|sandbox|internal|\bqa\b|测试|測試/i;
const VERIFY_AVATAR_CACHE_KEY = 'hopon:verify-avatar-cache:v1';

type VerifyAvatarCache = Record<string, { url: string; expiresAt: string }>;

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

function isLikelyPublicOpenCampaign(campaign: {
  title?: string | null;
  description?: string | null;
  status?: string | null;
  restaurant_profiles?: { name?: string | null } | null;
}): boolean {
  if (campaign.status !== 'OPEN') return false;
  const searchable = [
    campaign.title,
    campaign.description,
    campaign.restaurant_profiles?.name,
  ].filter(Boolean).join(' ');
  return !TEST_CAMPAIGN_PATTERN.test(searchable);
}

export const fallbackRedeemCampaigns: HoponRedeemCampaign[] = [
  {
    id: 'demo-strawberry-matcha',
    title: 'Strawberry Matcha Launch',
    merchantName: 'Atelier Matcha',
    status: 'OPEN',
    offerType: 'percent_off',
    offerValue: 5,
    creators: [
      { id: 'maya-chen', name: 'Maya Chen', handle: 'mayabites', platform: 'TikTok', label: 'Local food creator' },
      { id: 'iris-lin', name: 'Iris Lin', handle: 'irisnotes', platform: 'Instagram', label: 'Local cafe creator' },
    ],
  },
  {
    id: 'demo-ramen-lunch',
    title: 'Weekday Ramen Lunch',
    merchantName: 'Mori Ramen Bar',
    status: 'OPEN',
    offerType: 'percent_off',
    offerValue: 5,
    creators: [
      { id: 'noah-park', name: 'Noah Park', handle: 'noahvisits', platform: 'TikTok', label: 'Local food creator' },
      { id: 'emi-sato', name: 'Emi Sato', handle: 'eminyc', platform: 'Instagram', label: 'Local food creator' },
    ],
  },
  {
    id: 'demo-first-facial',
    title: 'First Facial Visit',
    merchantName: 'Bloom Skin Studio',
    status: 'OPEN',
    offerType: 'percent_off',
    offerValue: 5,
    creators: [
      { id: 'lena-ross', name: 'Lena Ross', handle: 'lenaglow', platform: 'Instagram', label: 'Local beauty creator' },
      { id: 'talia-cho', name: 'Talia Cho', handle: 'taliacare', platform: 'TikTok', label: 'Local beauty creator' },
    ],
  },
  {
    id: 'demo-pastry-drop',
    title: 'Seasonal Pastry Drop',
    merchantName: 'Mori Bakehouse',
    status: 'OPEN',
    offerType: 'percent_off',
    offerValue: 5,
    creators: [
      { id: 'marco-lee', name: 'Marco Lee', handle: 'marcoeats', platform: 'TikTok', label: 'Local food creator' },
      { id: 'nina-wu', name: 'Nina Wu', handle: 'ninabakes', platform: 'Instagram', label: 'Local food creator' },
    ],
  },
];

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

function isMissingRpcError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42883' ||
    error.code === 'PGRST202' ||
    /function .*list_public_redeem_campaigns/i.test(error.message || '')
  );
}

export async function listActiveHoponRedeemCampaigns(): Promise<HoponRedeemCampaign[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data: functionCampaigns, error: functionError } = await getClient().functions.invoke('public-redeem-campaigns', {
      body: { limit: 12 },
    });

    if (!functionError) {
      const campaigns = normalizePublicRedeemCampaigns(functionCampaigns);
      cacheVerifyAvatars(campaigns);
      return applyCachedVerifyAvatars(campaigns);
    }

    console.warn('[listActiveHoponRedeemCampaigns] public function failed, falling back to RPC', functionError.message);

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
        title,
        description,
        status,
        start_date,
        end_date,
        platforms,
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

    const campaigns = await Promise.all(
      (data || [])
        .filter((campaign: any) => isLikelyPublicOpenCampaign(campaign))
        .map(async (campaign: any): Promise<HoponRedeemCampaign | null> => {
          const { data: applicationRows, error: appError } = await getClient()
            .from('applications')
            .select(`
              id,
              status,
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
            .limit(8);

          if (appError) {
            console.warn('[listActiveHoponRedeemCampaigns] creator query failed', appError.message);
          }

          const creators = (applicationRows || [])
            .map((row: any): HoponRedeemCreator | null => {
              const creator = row.creator_profiles;
              if (!creator?.id) return null;
              const platform = platformLabel((campaign.platforms || [])[0]);
              return {
                id: creator.id,
                name: creator.name || creator.handle || 'Creator',
                handle: normalizeHandle(creator.handle || creator.tiktok_handle),
                avatarUrl: creator.avatar || null,
                platform,
                label: creatorLabel(creator.tags),
              };
            })
            .filter((creator): creator is HoponRedeemCreator => Boolean(creator));

          if (creators.length === 0) return null;

          return {
            id: campaign.id,
            title: campaign.title,
            merchantName: campaign.restaurant_profiles?.name || 'Hopon merchant',
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
}): void {
  try {
    // TODO: Replace this compatibility insert with a dedicated public offer_redemptions table
    // when the production schema adds campaign_id, creator_id, offer_type, and offer_value columns.
    getClient()
      .from('anonymous_redemptions')
      .insert({
        code_text: `hopon:${payload.campaignId}:${payload.creatorId}`,
        template_code_name: 'hopon_in_store_offer',
        metadata: {
          campaign_id: payload.campaignId,
          campaign_title: payload.campaignTitle,
          merchant_name: payload.merchantName,
          creator_id: payload.creatorId,
          creator_handle: payload.creatorHandle,
          offer_type: payload.offerType,
          offer_value: payload.offerValue,
        },
      })
      .then(({ error }) => {
        if (error) console.warn('[trackHoponOfferRedeem]', error.message);
      });
  } catch {
    // Non-blocking: the customer should still be able to show the offer in-store.
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
