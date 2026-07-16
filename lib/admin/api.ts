import { supabase } from '../supabaseClient';
import type {
  AdminAppUser,
  AdminCampaign,
  AdminCampaignMonitorData,
  AdminCampaignMonitorRow,
  AdminDashboardData,
  AdminInviteMonitorItem,
  AdminRestaurant,
  AdminSessionState,
  CampaignSourcingCandidate,
  CampaignSourcingRequest,
  DirectCreatorInviteDraft,
  DirectCreatorInviteResult,
  DiscoveryFilters,
  GrowthDiscoveryRunInput,
  GrowthDiscoveryRunResult,
  GrowthOsLead,
  SourcingCreateDraft,
  SourcingDetail,
} from './types';

type DbError = { code?: string; message?: string; details?: string | null };
type JsonRecord = Record<string, unknown>;
type CandidateInviteRow = {
  candidate_id?: string | null;
  invite_token?: string | null;
  dm_draft?: string | null;
  invite_url?: string | null;
  status?: string | null;
  invited_email?: string | null;
  invite_source?: string | null;
  registered_at?: string | null;
};
type CandidateInviteSeed = {
  candidateId: string;
  lead: GrowthOsLead;
  status: string;
};

const HOPON_WEB_BASE_URL = 'https://www.thehoponapp.com';
const CREATOR_INVITE_BASE_URL = `${HOPON_WEB_BASE_URL}/creator/invite`;
const CREATOR_INVITE_URL_PATTERN = /https?:\/\/(?:localhost|127\.0\.0\.1|www\.thehoponapp\.com|thehoponapp\.com)(?::\d+)?\/creator\/invite\/([^/?#\s]+)/gi;
const SOURCING_RUNNING_STALE_MS = 5 * 60 * 1000;
const MAX_SOURCING_RUN_ATTEMPTS = 3;
const SOURCING_REQUEST_WITH_CAMPAIGN_SELECT =
  '*,campaigns(id,restaurant_id,title,description,status,type,budget,location,start_date,end_date,platforms,created_at,restaurant_profiles(id,name,location,category,city_display,cuisine_tags,avatar,is_official))';

const SOURCING_CANDIDATE_SELECT = [
  'id',
  'sourcing_request_id',
  'campaign_id',
  'restaurant_id',
  'growth_os_lead_id',
  'platform',
  'handle',
  'profile_url',
  'display_name',
  'followers',
  'score',
  'fit_reasons',
  'concerns',
  'admin_status',
  'merchant_status',
  'outreach_status',
  'merchant_visible',
  'converted_creator_user_id',
  'created_at',
  'updated_at',
  'campaign_sourcing_invites(candidate_id,invite_token,dm_draft,invite_url,status,invited_email,invite_source,registered_at)',
].join(',');

export function isMissingRelationError(error: unknown): boolean {
  const e = error as DbError | null;
  const message = `${e?.message ?? ''} ${e?.details ?? ''}`.toLowerCase();
  return (
    e?.code === '42P01' ||
    e?.code === '42703' ||
    e?.code === 'PGRST204' ||
    e?.code === 'PGRST205' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  );
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function asJsonRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function normalizeHandle(handle?: string | null): string | null {
  const value = String(handle ?? '').trim().replace(/^@+/, '');
  return value || null;
}

function normalizeEmail(email?: string | null): string | null {
  const value = String(email ?? '').trim().toLowerCase();
  return value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}

function parseSocialInput(platform: 'instagram' | 'tiktok', input: string): { handle: string | null; profileUrl: string | null } {
  const value = input.trim();
  if (!value) return { handle: null, profileUrl: null };
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const segments = url.pathname.split('/').map((part) => part.trim()).filter(Boolean);
      const handle =
        platform === 'instagram'
          ? segments.find((part) => !['p', 'reel', 'tv', 'stories'].includes(part.toLowerCase())) ?? null
          : segments.find((part) => part.startsWith('@'))?.slice(1) ?? segments.find(Boolean) ?? null;
      return { handle: normalizeHandle(handle), profileUrl: value };
    } catch {
      return { handle: normalizeHandle(value), profileUrl: null };
    }
  }
  return { handle: normalizeHandle(value), profileUrl: null };
}

function profileUrlFor(platform: string, handle?: string | null, existingUrl?: string | null): string | null {
  if (existingUrl && /^https?:\/\//i.test(existingUrl)) return existingUrl;
  const clean = normalizeHandle(handle);
  if (!clean) return null;
  if (platform === 'tiktok') return `https://www.tiktok.com/@${clean}`;
  return `https://www.instagram.com/${clean}/`;
}

function mapUser(row: any): AdminAppUser {
  return {
    id: row.id,
    email: row.email ?? null,
    role: row.role,
    status: row.status ?? null,
    createdAt: row.created_at ?? null,
    approvedAt: row.approved_at ?? null,
    rejectionReason: row.rejection_reason ?? null,
  };
}

function mapRestaurant(row: any): AdminRestaurant | null {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? null,
    category: row.category ?? null,
    cityDisplay: row.city_display ?? null,
    cuisineTags: asArray(row.cuisine_tags),
    avatar: row.avatar ?? null,
    isOfficial: row.is_official ?? null,
  };
}

function mapCampaign(row: any): AdminCampaign {
  const restaurant = Array.isArray(row.restaurant_profiles) ? row.restaurant_profiles[0] : row.restaurant_profiles;
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    title: row.title,
    description: row.description ?? null,
    status: row.status,
    type: row.type ?? null,
    budget: row.budget ?? null,
    location: row.location ?? null,
    startDate: row.start_date ?? row.starts_at ?? null,
    endDate: row.end_date ?? row.ends_at ?? null,
    platforms: asArray(row.platforms),
    createdAt: row.created_at ?? null,
    isInternalTest: row.is_internal_test === true,
    restaurant: mapRestaurant(restaurant),
  };
}

function mapRequest(row: any): CampaignSourcingRequest {
  const campaignRow = Array.isArray(row.campaigns) ? row.campaigns[0] : row.campaigns;
  return {
    id: row.id,
    campaignId: row.campaign_id,
    restaurantId: row.restaurant_id,
    requestedBy: row.requested_by ?? null,
    source: row.source ?? 'admin',
    status: row.status ?? 'draft',
    searchBrief: row.search_brief ?? '',
    generatedTags: asArray(row.generated_tags),
    filters: asJsonRecord(row.filters),
    platforms: asArray(row.platforms),
    neededCreatorCount: Number(row.needed_creator_count ?? 5),
    notes: row.notes ?? null,
    lastRunAt: row.last_run_at ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
    campaign: campaignRow ? mapCampaign(campaignRow) : null,
    candidateCount: Number(row.candidate_count ?? 0),
  };
}

function jsonStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object' && 'text' in item) return String((item as { text: unknown }).text);
      return '';
    })
    .filter(Boolean);
}

function inviteFromCandidateRow(row: any): CandidateInviteRow | null {
  const invite = Array.isArray(row.campaign_sourcing_invites) ? row.campaign_sourcing_invites[0] : row.campaign_sourcing_invites;
  return invite && typeof invite === 'object' ? invite : null;
}

function inviteUrlForToken(token?: string | null): string | null {
  const value = String(token ?? '').trim();
  return value ? `${CREATOR_INVITE_BASE_URL}/${encodeURIComponent(value)}` : null;
}

function normalizeInviteUrl(value?: string | null, token?: string | null): string | null {
  const raw = String(value ?? '').trim();
  const tokenFromUrl = raw.match(/\/creator\/invite\/([^/?#\s]+)/i)?.[1];
  const cleanToken = tokenFromUrl || String(token ?? '').trim();
  return cleanToken ? inviteUrlForToken(decodeURIComponent(cleanToken)) : raw || null;
}

function normalizeInviteText(value?: string | null): string | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  return raw.replace(CREATOR_INVITE_URL_PATTERN, (_match, token) => `${CREATOR_INVITE_BASE_URL}/${token}`);
}

function mapCandidate(row: any, invite = inviteFromCandidateRow(row)): CampaignSourcingCandidate {
  const inviteUrl = normalizeInviteUrl(invite?.invite_url, invite?.invite_token);
  return {
    id: row.id,
    sourcingRequestId: row.sourcing_request_id,
    campaignId: row.campaign_id,
    restaurantId: row.restaurant_id,
    growthOsLeadId: row.growth_os_lead_id ?? null,
    platform: row.platform ?? 'instagram',
    handle: row.handle ?? null,
    profileUrl: row.profile_url ?? null,
    displayName: row.display_name ?? null,
    followers: row.followers ?? null,
    score: row.score ?? null,
    fitReasons: jsonStringArray(row.fit_reasons),
    concerns: jsonStringArray(row.concerns),
    adminStatus: row.admin_status ?? 'new',
    merchantStatus: row.merchant_status ?? 'hidden',
    outreachStatus: row.outreach_status ?? 'not_started',
    dmDraft: normalizeInviteText(invite?.dm_draft),
    inviteUrl,
    inviteStatus: invite?.status ?? null,
    invitedEmail: invite?.invited_email ?? null,
    inviteSource: invite?.invite_source ?? null,
    registeredAt: invite?.registered_at ?? null,
    merchantVisible: row.merchant_visible === true,
    convertedCreatorUserId: row.converted_creator_user_id ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapGrowthLead(row: any): GrowthOsLead {
  return {
    id: row.id,
    displayName: row.display_name,
    instagramUsername: row.instagram_username ?? null,
    instagramUrl: row.instagram_url ?? null,
    tiktokUsername: row.tiktok_username ?? null,
    tiktokUrl: row.tiktok_url ?? null,
    city: row.city ?? null,
    primaryCategory: row.primary_category ?? null,
    secondaryCategories: asArray(row.secondary_categories),
    platforms: asArray(row.platforms),
    followers: row.followers ?? null,
    estimatedEngagementRate: row.estimated_engagement_rate ?? null,
    bio: row.bio ?? null,
    creatorSummary: row.creator_summary ?? null,
    recentPostsSummary: row.recent_posts_summary ?? null,
    overallScore: row.overall_score ?? null,
    restaurantFitScore: row.restaurant_fit_score ?? null,
    foodExchangeProbability: row.food_exchange_probability ?? null,
    status: row.status ?? null,
    createdAt: row.created_at ?? null,
  };
}

export async function getAdminSessionState(): Promise<AdminSessionState> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const authUser = authData?.user;
  if (authError || !authUser) return { userId: null, reason: 'no_session' };

  const { data, error } = await supabase
    .from('app_users')
    .select('id,email,role,status')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error || !data) {
    return { userId: authUser.id, email: authUser.email, reason: 'unknown' };
  }
  if (data.role !== 'admin') {
    return {
      userId: authUser.id,
      email: data.email ?? authUser.email,
      role: data.role,
      status: data.status,
      reason: 'not_admin',
    };
  }
  if (data.status === 'pending') {
    return { userId: authUser.id, email: data.email ?? authUser.email, role: data.role, status: data.status, reason: 'pending' };
  }
  if (data.status === 'rejected') {
    return { userId: authUser.id, email: data.email ?? authUser.email, role: data.role, status: data.status, reason: 'rejected' };
  }
  return { userId: authUser.id, email: data.email ?? authUser.email, role: data.role, status: data.status, reason: 'ready' };
}

export async function signOutAdmin(): Promise<void> {
  await supabase.auth.signOut();
}

export async function listPendingUsers(): Promise<AdminAppUser[]> {
  const { data, error } = await supabase
    .from('app_users')
    .select('id,email,role,status,created_at,approved_at,rejection_reason')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return (data ?? []).map(mapUser);
}

export async function approveAppUser(userId: string): Promise<void> {
  const state = await getAdminSessionState();
  if (!state.userId || state.reason !== 'ready') throw new Error('Admin session required');
  const { error } = await supabase
    .from('app_users')
    .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: state.userId, rejection_reason: null })
    .eq('id', userId);
  if (error) throw error;
}

export async function rejectAppUser(userId: string, reason = 'Rejected from web admin'): Promise<void> {
  const { error } = await supabase
    .from('app_users')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', userId);
  if (error) throw error;
}

export async function listAdminCampaigns(limit = 40): Promise<AdminCampaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(
      'id,restaurant_id,title,description,status,type,budget,location,start_date,end_date,platforms,created_at,is_internal_test,restaurant_profiles(id,name,location,category,city_display,cuisine_tags,avatar,is_official)'
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(mapCampaign);
}

export async function listGrowthOsLeads(limit = 40): Promise<GrowthOsLead[]> {
  const { data, error } = await supabase
    .from('growth_os_creator_leads')
    .select(
      'id,display_name,instagram_username,instagram_url,tiktok_username,tiktok_url,city,primary_category,secondary_categories,platforms,followers,estimated_engagement_rate,bio,creator_summary,recent_posts_summary,overall_score,restaurant_fit_score,food_exchange_probability,status,created_at'
    )
    .order('overall_score', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) {
    if (isMissingRelationError(error)) return [];
    throw error;
  }
  return (data ?? []).map(mapGrowthLead);
}

export async function runGrowthOsDiscovery(input: GrowthDiscoveryRunInput): Promise<GrowthDiscoveryRunResult> {
  const city = input.city.trim();
  const categories = unique(input.categories);
  const platforms = unique(input.platforms.map((platform) => platform.toLowerCase())).filter(
    (platform) => platform === 'instagram' || platform === 'tiktok'
  );
  if (!city) throw new Error('City is required');
  if (!categories.length) throw new Error('At least one category is required');
  if (!platforms.length) throw new Error('Select at least one platform');

  const { data, error } = await supabase.functions.invoke('growth-run-discovery', {
    body: {
      provider: 'openai-web-search',
      dryRun: input.dryRun === true,
      filters: {
        city,
        categories,
        platforms,
        minFollowers: input.minFollowers ?? 1000,
        maxFollowers: input.maxFollowers ?? 50000,
      },
    },
  });
  if (error) throw new Error(error.message || 'Growth OS Discovery failed');

  return {
    discoveredCount: Number(data?.discoveredCount ?? 0),
    insertedCount: Number(data?.insertedCount ?? 0),
    updatedCount: Number(data?.updatedCount ?? 0),
    rejectedCount: Number(data?.rejectedCount ?? 0),
    errorCount: Number(data?.errorCount ?? 0),
    diagnostics: Array.isArray(data?.diagnostics)
      ? data.diagnostics.map((item: unknown) => (typeof item === 'string' ? item : JSON.stringify(item))).slice(0, 8)
      : [],
    raw: data,
  };
}

export async function listSourcingRequests(limit = 40): Promise<{ setupMissing: boolean; requests: CampaignSourcingRequest[] }> {
  const { data, error } = await supabase
    .from('campaign_sourcing_requests')
    .select(
      '*,campaigns(id,restaurant_id,title,description,status,type,budget,location,start_date,end_date,platforms,created_at,restaurant_profiles(id,name,location,category,city_display,cuisine_tags,avatar,is_official))'
    )
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) {
    if (isMissingRelationError(error)) return { setupMissing: true, requests: [] };
    throw error;
  }
  return { setupMissing: false, requests: (data ?? []).map(mapRequest) };
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const [pendingUsers, campaigns, sourcing, growthLeads, recentUsersResult] = await Promise.all([
    listPendingUsers().catch(() => []),
    listAdminCampaigns(20).catch(() => []),
    listSourcingRequests(20),
    listGrowthOsLeads(20).catch(() => []),
    supabase
      .from('app_users')
      .select('id,email,role,status,created_at,approved_at,rejection_reason')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const recentUsers = recentUsersResult.error ? [] : (recentUsersResult.data ?? []).map(mapUser);
  const openCampaigns = campaigns.filter((campaign) => String(campaign.status).toUpperCase() === 'OPEN').length;
  const activeSourcingRequests = sourcing.requests.filter((request) =>
    ['draft', 'ready', 'running', 'reviewing', 'merchant_review', 'outreach'].includes(request.status)
  ).length;

  return {
    setupMissing: sourcing.setupMissing,
    pendingUsers,
    recentUsers,
    campaigns,
    sourcingRequests: sourcing.requests,
    growthLeads,
    counts: {
      pendingUsers: pendingUsers.length,
      openCampaigns,
      activeSourcingRequests,
      growthLeads: growthLeads.length,
    },
  };
}

function newestByTimestamp<T extends { submitted_at?: string | null; created_at?: string | null }>(
  rows: T[],
  key: (row: T) => string
): Map<string, T> {
  const result = new Map<string, T>();
  for (const row of rows) {
    const rowKey = key(row);
    if (!rowKey) continue;
    const current = result.get(rowKey);
    const currentTime = new Date(current?.submitted_at ?? current?.created_at ?? 0).getTime();
    const rowTime = new Date(row.submitted_at ?? row.created_at ?? 0).getTime();
    if (!current || rowTime >= currentTime) result.set(rowKey, row);
  }
  return result;
}

function inviteUsageState(row: any): AdminInviteMonitorItem['usageState'] {
  const status = String(row.status ?? '').toLowerCase();
  if (status === 'revoked') return 'revoked';
  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : null;
  if (status === 'expired' || (expiresAt != null && Number.isFinite(expiresAt) && expiresAt < Date.now())) return 'expired';
  if (
    row.claimed_at ||
    row.registered_at ||
    row.claimed_creator_user_id ||
    row.application_id ||
    ['accepted', 'claimed', 'registered'].includes(status)
  ) {
    return 'used';
  }
  return 'unused';
}

function dedupeTrackedVisits(rows: any[]): any[] {
  const canonical = new Map<string, any>();
  const dedupeWindowMs = 30 * 60 * 1000;
  for (const row of rows) {
    if (String(row.status ?? '').toLowerCase() === 'void') continue;
    const redeemedAt = new Date(row.redeemed_at ?? row.created_at ?? 0).getTime();
    if (!Number.isFinite(redeemedAt)) continue;
    const visitorKey = String(row.anonymous_visitor_id || `event:${row.client_redemption_id || row.id}`);
    const key = `${row.campaign_id}:${visitorKey}:${Math.floor(redeemedAt / dedupeWindowMs)}`;
    const previous = canonical.get(key);
    if (!previous || redeemedAt < new Date(previous.redeemed_at ?? previous.created_at ?? 0).getTime()) {
      canonical.set(key, row);
    }
  }
  return Array.from(canonical.values());
}

export async function getAdminCampaignMonitor(): Promise<AdminCampaignMonitorData> {
  const campaigns = await listAdminCampaigns(1000);
  if (!campaigns.length) {
    return {
      campaigns: [],
      invites: [],
      warnings: [],
      totals: { campaigns: 0, openCampaigns: 0, invites: 0, usedInvites: 0, unusedInvites: 0, trackedVisits: 0 },
    };
  }

  const warnings: string[] = [];
  const campaignIds = campaigns.map((campaign) => campaign.id);
  const [applicationsResult, draftsResult, deliverablesResult, invitesResult, candidatesResult, redemptionsResult] = await Promise.all([
    supabase
      .from('applications')
      .select('id,campaign_id,creator_id,status,verified_at,schedule_status,confirmed_visit_time,created_at')
      .in('campaign_id', campaignIds)
      .limit(5000),
    supabase
      .from('draft_posts')
      .select('id,application_id,status,submitted_at,created_at')
      .limit(5000),
    supabase
      .from('deliverables')
      .select('id,application_id,status,submitted_at,created_at')
      .limit(5000),
    supabase
      .from('campaign_sourcing_invites')
      .select('candidate_id,campaign_id,invite_url,invite_token,status,expires_at,claimed_creator_user_id,claimed_at,application_id,invited_email,invite_source,registered_at,created_at,updated_at')
      .in('campaign_id', campaignIds)
      .order('created_at', { ascending: false })
      .limit(5000),
    supabase
      .from('campaign_sourcing_candidates')
      .select('id,display_name,handle,platform,profile_url')
      .in('campaign_id', campaignIds)
      .limit(5000),
    supabase
      .from('offer_redemptions')
      .select('id,client_redemption_id,campaign_id,creator_id,status,anonymous_visitor_id,is_nearby,redeemed_at,created_at')
      .in('campaign_id', campaignIds)
      .order('redeemed_at', { ascending: false })
      .limit(5000),
  ]);

  const collectRows = (result: { data: any[] | null; error: any }, label: string): any[] => {
    if (!result.error) return result.data ?? [];
    warnings.push(`${label} data is unavailable: ${result.error.message ?? 'unknown error'}`);
    return [];
  };

  const applications = collectRows(applicationsResult as any, 'Application');
  const campaignApplicationIds = new Set(applications.map((row) => row.id));
  const drafts = collectRows(draftsResult as any, 'Draft').filter((row) => campaignApplicationIds.has(row.application_id));
  const deliverables = collectRows(deliverablesResult as any, 'Final submission').filter((row) => campaignApplicationIds.has(row.application_id));
  const inviteRows = collectRows(invitesResult as any, 'Invitation');
  const candidates = collectRows(candidatesResult as any, 'Sourcing candidate');
  const redemptionRows = collectRows(redemptionsResult as any, 'Tracked visit');

  const latestDraftByApplication = newestByTimestamp(drafts, (row) => row.application_id);
  const latestDeliverableByApplication = newestByTimestamp(deliverables, (row) => row.application_id);
  const candidatesById = new Map(candidates.map((row) => [row.id, row]));
  const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const dedupedVisits = dedupeTrackedVisits(redemptionRows);

  const invites: AdminInviteMonitorItem[] = inviteRows.map((row) => {
    const campaign = campaignsById.get(row.campaign_id);
    const candidate = candidatesById.get(row.candidate_id);
    const usageState = inviteUsageState(row);
    return {
      candidateId: row.candidate_id,
      campaignId: row.campaign_id,
      campaignTitle: campaign?.title ?? 'Unknown campaign',
      merchantName: campaign?.restaurant?.name ?? 'Unknown merchant',
      inviteUrl: normalizeInviteUrl(row.invite_url, row.invite_token),
      status: row.status ?? 'drafted',
      usageState,
      invitedEmail: row.invited_email ?? null,
      inviteSource: row.invite_source ?? null,
      creatorName: candidate?.display_name ?? null,
      creatorHandle: candidate?.handle ?? null,
      platform: candidate?.platform ?? null,
      createdAt: row.created_at ?? null,
      usedAt: row.claimed_at ?? row.registered_at ?? null,
    };
  });

  const campaignRows: AdminCampaignMonitorRow[] = campaigns.map((campaign) => {
    const campaignApplications = applications.filter((row) => row.campaign_id === campaign.id);
    const stages = { applications: 0, visit: 0, draft: 0, final: 0, done: 0, rejected: 0 };

    for (const application of campaignApplications) {
      const status = String(application.status ?? '').toUpperCase();
      if (status === 'PENDING') {
        stages.applications += 1;
        continue;
      }
      if (status !== 'ACCEPTED') {
        stages.rejected += 1;
        continue;
      }

      const deliverable = latestDeliverableByApplication.get(application.id);
      if (deliverable) {
        if (String(deliverable.status ?? '').toUpperCase() === 'APPROVED') stages.done += 1;
        else stages.final += 1;
        continue;
      }
      const draft = latestDraftByApplication.get(application.id);
      if (String(draft?.status ?? '').toUpperCase() === 'APPROVED') stages.final += 1;
      else if (application.verified_at || draft) stages.draft += 1;
      else stages.visit += 1;
    }

    const campaignInvites = invites.filter((invite) => invite.campaignId === campaign.id);
    const campaignVisits = dedupedVisits.filter((visit) => visit.campaign_id === campaign.id);
    return {
      campaign,
      stages,
      totalApplications: campaignApplications.length,
      inviteCount: campaignInvites.length,
      usedInviteCount: campaignInvites.filter((invite) => invite.usageState === 'used').length,
      trackedVisits: campaignVisits.length,
      nearbyTrackedVisits: campaignVisits.filter((visit) => visit.is_nearby === true).length,
    };
  });

  return {
    campaigns: campaignRows,
    invites,
    warnings: Array.from(new Set(warnings)),
    totals: {
      campaigns: campaignRows.length,
      openCampaigns: campaignRows.filter((row) => String(row.campaign.status).toUpperCase() === 'OPEN').length,
      invites: invites.length,
      usedInvites: invites.filter((invite) => invite.usageState === 'used').length,
      unusedInvites: invites.filter((invite) => invite.usageState === 'unused').length,
      trackedVisits: dedupedVisits.length,
    },
  };
}

function unique(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  for (const raw of values) {
    const value = String(raw ?? '').trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (!seen.has(key)) seen.add(key);
  }
  return Array.from(seen);
}

function inferCampaignCategories(campaign: AdminCampaign): string[] {
  const haystack = `${campaign.title} ${campaign.description ?? ''} ${campaign.type ?? ''} ${campaign.restaurant?.category ?? ''}`.toLowerCase();
  const inferred: string[] = [];
  if (/dessert|matcha|boba|tea|bakery|cake|甜|奶茶|抹茶/.test(haystack)) inferred.push('dessert', 'cafe', 'asian dessert');
  if (/coffee|cafe|brunch|咖啡/.test(haystack)) inferred.push('coffee', 'cafe');
  if (/lunch|dinner|bistro|restaurant|noodle|rice|hotpot|ramen|餐|饭|面/.test(haystack)) inferred.push('restaurant', 'food');
  if (/\bbar\b|cocktail|nightlife|bartender|beer|wine|happy hour|酒/.test(haystack)) inferred.push('bar', 'nightlife');
  const cuisineTags = campaign.restaurant?.cuisineTags ?? [];
  return unique([campaign.restaurant?.category, ...cuisineTags, ...inferred, 'local food']);
}

function inferCity(campaign: AdminCampaign): string {
  return (
    campaign.restaurant?.cityDisplay ??
    campaign.location?.split(',').map((part) => part.trim()).filter(Boolean).slice(-2, -1)[0] ??
    campaign.location ??
    'New York'
  );
}

function buildSearchBrief(campaign: AdminCampaign, filters: DiscoveryFilters): string {
  const merchantName = campaign.restaurant?.name ?? 'this merchant';
  const offer = campaign.budget ? `Budget/offer: ${campaign.budget}.` : '';
  return [
    `Find English-speaking local Instagram/TikTok creators for ${merchantName}.`,
    `Campaign: ${campaign.title}.`,
    campaign.description ? `Context: ${campaign.description}` : '',
    `City: ${filters.city}. Categories: ${filters.categories.join(', ')}.`,
    offer,
    'Prioritize creators who can bring measurable store visits, redemptions, and local audience fit.',
  ]
    .filter(Boolean)
    .join('\n');
}

function truncateText(value: string | null | undefined, maxLength: number): string | null {
  const trimmed = value?.replace(/\s+/g, ' ').trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed;
}

function buildTargetAudience(campaign: AdminCampaign, filters: DiscoveryFilters): string {
  const category = filters.categories.find((item) => !['local food', 'food', 'restaurant'].includes(item.toLowerCase())) ?? 'local food';
  const city = filters.city || 'the local area';
  return `English-speaking ${category} creators with a real local audience in ${city}`;
}

export function buildSourcingSeed(campaign: AdminCampaign): { filters: DiscoveryFilters; tags: string[]; brief: string; platforms: string[] } {
  const categories = inferCampaignCategories(campaign);
  const platforms = (campaign.platforms?.length ? campaign.platforms : ['instagram'])
    .map((platform) => String(platform).toLowerCase())
    .filter((platform) => platform === 'instagram' || platform === 'tiktok');
  const filters: DiscoveryFilters = {
    city: inferCity(campaign),
    categories,
    platforms: platforms.length ? platforms : ['instagram'],
    minFollowers: 1000,
    maxFollowers: 100000,
  };
  return { filters, tags: categories, brief: buildSearchBrief(campaign, filters), platforms: filters.platforms };
}

export async function createSourcingRequestFromCampaign(input: SourcingCreateDraft): Promise<CampaignSourcingRequest> {
  const campaigns = await listAdminCampaigns(80);
  const campaign = campaigns.find((item) => item.id === input.campaignId);
  if (!campaign) throw new Error('Campaign not found');
  const state = await getAdminSessionState();
  if (!state.userId || state.reason !== 'ready') throw new Error('Admin session required');

  const seed = buildSourcingSeed(campaign);
  const { data, error } = await supabase
    .from('campaign_sourcing_requests')
    .insert({
      campaign_id: campaign.id,
      restaurant_id: campaign.restaurantId,
      requested_by: state.userId,
      source: 'admin',
      status: 'ready',
      search_brief: seed.brief,
      generated_tags: seed.tags,
      filters: seed.filters,
      platforms: seed.platforms,
      needed_creator_count: input.neededCreatorCount ?? 5,
      notes: input.notes ?? null,
    })
    .select(
      '*,campaigns(id,restaurant_id,title,description,status,type,budget,location,start_date,end_date,platforms,created_at,restaurant_profiles(id,name,location,category,city_display,cuisine_tags,avatar,is_official))'
    )
    .single();
  if (error) throw error;
  return mapRequest(data);
}

async function getOrCreateDirectInviteRequest(campaign: AdminCampaign, adminUserId: string): Promise<CampaignSourcingRequest> {
  const seed = buildSourcingSeed(campaign);
  const { data: existing, error: existingError } = await supabase
    .from('campaign_sourcing_requests')
    .select(SOURCING_REQUEST_WITH_CAMPAIGN_SELECT)
    .eq('campaign_id', campaign.id)
    .contains('filters', { directInvite: true })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError && !isMissingRelationError(existingError)) throw existingError;
  if (existing) return mapRequest(existing);

  const { data, error } = await supabase
    .from('campaign_sourcing_requests')
    .insert({
      campaign_id: campaign.id,
      restaurant_id: campaign.restaurantId,
      requested_by: adminUserId,
      source: 'admin',
      status: 'outreach',
      search_brief: `Manual direct creator invites for ${campaign.restaurant?.name ?? 'merchant'} · ${campaign.title}`,
      generated_tags: seed.tags,
      filters: { ...seed.filters, directInvite: true },
      platforms: seed.platforms,
      needed_creator_count: 1,
      notes: 'Direct creator invites generated manually by admin.',
    })
    .select(SOURCING_REQUEST_WITH_CAMPAIGN_SELECT)
    .single();
  if (error) throw error;
  return mapRequest(data);
}

export async function createDirectCreatorInvite(input: DirectCreatorInviteDraft): Promise<DirectCreatorInviteResult> {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error('Enter a valid creator email.');
  const platform = input.platform === 'tiktok' ? 'tiktok' : 'instagram';
  const social = parseSocialInput(platform, input.handleOrUrl);
  if (!social.handle && !social.profileUrl) throw new Error('Enter an Instagram/TikTok handle or profile URL.');

  const campaigns = await listAdminCampaigns(120);
  const campaign = campaigns.find((item) => item.id === input.campaignId);
  if (!campaign) throw new Error('Campaign not found');
  if (String(campaign.status).toUpperCase() !== 'OPEN') {
    throw new Error('Direct invites can only be generated for open campaigns.');
  }
  const state = await getAdminSessionState();
  if (!state.userId || state.reason !== 'ready') throw new Error('Admin session required');

  const request = await getOrCreateDirectInviteRequest(campaign, state.userId);
  const displayName = input.displayName?.trim() || social.handle || email.split('@')[0];
  const profileUrl = social.profileUrl || profileUrlFor(platform, social.handle);
  const { data: candidateRow, error: candidateError } = await supabase
    .from('campaign_sourcing_candidates')
    .insert({
      sourcing_request_id: request.id,
      campaign_id: request.campaignId,
      restaurant_id: request.restaurantId,
      growth_os_lead_id: null,
      platform,
      handle: social.handle,
      profile_url: profileUrl,
      display_name: displayName,
      followers: null,
      score: null,
      fit_reasons: [
        'The hOpOn team selected you for this specific local business campaign.',
        `${platform === 'instagram' ? 'Instagram' : 'TikTok'} profile will be added to your creator account during onboarding.`,
        'After email verification, this campaign will appear as accepted in the hOpOn app.',
      ],
      concerns: [],
      admin_status: 'shortlisted',
      merchant_status: 'hidden',
      outreach_status: 'drafted',
      merchant_visible: false,
    })
    .select('id')
    .single();
  if (candidateError) throw candidateError;

  const inviteToken = generateInviteToken();
  const inviteUrl = inviteUrlForToken(inviteToken);
  const dmDraft = generateDirectInviteDmDraft(request, input, inviteUrl);
  const { error: inviteError } = await supabase
    .from('campaign_sourcing_invites')
    .insert({
      candidate_id: candidateRow.id,
      sourcing_request_id: request.id,
      campaign_id: request.campaignId,
      restaurant_id: request.restaurantId,
      dm_draft: dmDraft,
      invite_token: inviteToken,
      invite_url: inviteUrl,
      status: 'drafted',
      invited_email: email,
      invite_source: 'manual_admin',
      created_by_admin_id: state.userId,
    });
  if (inviteError) throw inviteError;

  const { data: fullCandidate, error: fullCandidateError } = await supabase
    .from('campaign_sourcing_candidates')
    .select(SOURCING_CANDIDATE_SELECT)
    .eq('id', candidateRow.id)
    .single();
  if (fullCandidateError) throw fullCandidateError;

  return { request, candidate: mapCandidate(fullCandidate) };
}

function requestFilters(request: CampaignSourcingRequest): DiscoveryFilters {
  const filters = request.filters ?? {};
  const platforms = asArray(filters.platforms).filter((platform) => platform === 'instagram' || platform === 'tiktok');
  const categories = asArray(filters.categories);
  const minFollowers = Number(filters.minFollowers);
  const maxFollowers = Number(filters.maxFollowers);
  return {
    city: String(filters.city ?? 'New York'),
    categories: categories.length ? categories : ['local food'],
    platforms: platforms.length ? platforms : ['instagram'],
    minFollowers: Number.isFinite(minFollowers) ? minFollowers : 1000,
    maxFollowers: Number.isFinite(maxFollowers) ? maxFollowers : 100000,
  };
}

export async function getSourcingDetail(requestId: string): Promise<SourcingDetail> {
  const { data: requestData, error: requestError } = await supabase
    .from('campaign_sourcing_requests')
    .select(
      '*,campaigns(id,restaurant_id,title,description,status,type,budget,location,start_date,end_date,platforms,created_at,restaurant_profiles(id,name,location,category,city_display,cuisine_tags,avatar,is_official))'
    )
    .eq('id', requestId)
    .maybeSingle();
  if (requestError) {
    if (isMissingRelationError(requestError)) return { setupMissing: true, request: null, candidates: [] };
    throw requestError;
  }
  if (!requestData) return { setupMissing: false, request: null, candidates: [] };

  let request = mapRequest(requestData);
  if (request.status === 'running' && request.lastRunAt) {
    const lastRunMs = new Date(request.lastRunAt).getTime();
    const isStaleRunning = Number.isFinite(lastRunMs) && Date.now() - lastRunMs > SOURCING_RUNNING_STALE_MS;
    if (isStaleRunning) {
      try {
        const imported = await importTopGrowthLeadsForRequest(request, request.neededCreatorCount || 12, { campaignOnly: true, updatedAfter: request.lastRunAt });
        const nextStatus: CampaignSourcingRequest['status'] = imported > 0 ? 'reviewing' : 'ready';
        await supabase
          .from('campaign_sourcing_requests')
          .update({ status: nextStatus, last_run_at: new Date().toISOString() })
          .eq('id', request.id);
        request = { ...request, status: nextStatus, lastRunAt: new Date().toISOString() };
      } catch {
        await supabase
          .from('campaign_sourcing_requests')
          .update({ status: 'ready', last_run_at: new Date().toISOString() })
          .eq('id', request.id);
        request = { ...request, status: 'ready', lastRunAt: new Date().toISOString() };
      }
    }
  }

  const { data: candidateData, error: candidateError } = await supabase
    .from('campaign_sourcing_candidates')
    .select(SOURCING_CANDIDATE_SELECT)
    .eq('sourcing_request_id', requestId)
    .order('score', { ascending: false, nullsFirst: false });
  if (candidateError) {
    if (isMissingRelationError(candidateError)) return { setupMissing: true, request, candidates: [] };
    throw candidateError;
  }
  let candidateRows = ((candidateData ?? []) as any[]);
  if (
    candidateRows.length === 0 &&
    request.lastRunAt &&
    (request.status === 'ready' || request.status === 'running')
  ) {
    try {
      const imported = await importTopGrowthLeadsForRequest(request, request.neededCreatorCount || 12, {
        campaignOnly: true,
        updatedAfter: request.lastRunAt,
      });
      if (imported > 0) {
        const nextStatus: CampaignSourcingRequest['status'] = 'reviewing';
        await supabase
          .from('campaign_sourcing_requests')
          .update({ status: nextStatus, last_run_at: new Date().toISOString() })
          .eq('id', request.id);
        request = { ...request, status: nextStatus, lastRunAt: new Date().toISOString() };
        const { data: recoveredCandidateData, error: recoveredCandidateError } = await supabase
          .from('campaign_sourcing_candidates')
          .select(SOURCING_CANDIDATE_SELECT)
          .eq('sourcing_request_id', requestId)
          .order('score', { ascending: false, nullsFirst: false });
        if (recoveredCandidateError) throw recoveredCandidateError;
        candidateRows = ((recoveredCandidateData ?? []) as any[]);
      }
    } catch {
      candidateRows = ((candidateData ?? []) as any[]);
    }
  }
  return {
    setupMissing: false,
    request,
    candidates: candidateRows.map((candidate) => mapCandidate(candidate)),
  };
}

function leadPlatform(lead: GrowthOsLead): 'instagram' | 'tiktok' {
  if (lead.instagramUsername || lead.instagramUrl || lead.platforms?.includes('instagram')) return 'instagram';
  return 'tiktok';
}

function leadHandle(lead: GrowthOsLead, platform: 'instagram' | 'tiktok'): string | null {
  return normalizeHandle(platform === 'instagram' ? lead.instagramUsername : lead.tiktokUsername);
}

function leadUrl(lead: GrowthOsLead, platform: 'instagram' | 'tiktok'): string | null {
  return profileUrlFor(platform, leadHandle(lead, platform), platform === 'instagram' ? lead.instagramUrl : lead.tiktokUrl);
}

function followerLabel(value?: number | null): string {
  if (!value) return 'local audience';
  if (value >= 1000000) return `${Math.round(value / 100000) / 10}M followers`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}K followers`;
  return `${value} followers`;
}

function generateInviteToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

async function ensureCandidateInvites(request: CampaignSourcingRequest, seeds: CandidateInviteSeed[]): Promise<void> {
  if (!seeds.length) return;

  const candidateIds = seeds.map((seed) => seed.candidateId);
  const { data: existingInvites, error: existingError } = await supabase
    .from('campaign_sourcing_invites')
    .select('candidate_id,invite_token,invite_url,dm_draft,status')
    .in('candidate_id', candidateIds);
  if (existingError) throw existingError;

  const existingByCandidateId = new Map<string, CandidateInviteRow>();
  for (const invite of existingInvites ?? []) {
    if (invite.candidate_id) existingByCandidateId.set(invite.candidate_id, invite);
  }

  const insertRows: JsonRecord[] = [];
  const updateRows: (JsonRecord & { candidate_id: string })[] = [];
  for (const seed of seeds) {
    const existing = existingByCandidateId.get(seed.candidateId);
    if (!existing) {
      const inviteToken = generateInviteToken();
      const inviteUrl = inviteUrlForToken(inviteToken);
      insertRows.push({
        candidate_id: seed.candidateId,
        sourcing_request_id: request.id,
        campaign_id: request.campaignId,
        restaurant_id: request.restaurantId,
        invite_token: inviteToken,
        invite_url: inviteUrl,
        dm_draft: generateDmDraft(request, seed.lead, inviteUrl),
        status: seed.status,
      });
      continue;
    }

    if (!String(existing.dm_draft ?? '').trim()) {
      const inviteToken = String(existing.invite_token ?? '').trim() || generateInviteToken();
      const inviteUrl = normalizeInviteUrl(existing.invite_url, inviteToken) ?? inviteUrlForToken(inviteToken);
      updateRows.push({
        candidate_id: seed.candidateId,
        invite_token: inviteToken,
        invite_url: inviteUrl,
        dm_draft: generateDmDraft(request, seed.lead, inviteUrl),
        status: existing.status ?? seed.status,
      });
    }
  }

  if (insertRows.length) {
    const { error } = await supabase
      .from('campaign_sourcing_invites')
      .upsert(insertRows, { onConflict: 'candidate_id', ignoreDuplicates: true });
    if (error) throw error;
  }

  for (const row of updateRows) {
    const { candidate_id, ...payload } = row;
    const { error } = await supabase
      .from('campaign_sourcing_invites')
      .update(payload)
      .eq('candidate_id', candidate_id);
    if (error) throw error;
  }
}

function generateDmDraft(request: CampaignSourcingRequest, lead: GrowthOsLead, inviteUrl: string | null): string {
  const campaign = request.campaign;
  const merchant = campaign?.restaurant?.name ?? 'a local hOpOn merchant';
  const platform = leadPlatform(lead);
  const handle = leadHandle(lead, platform);
  const audience = lead.primaryCategory ? `${lead.primaryCategory} audience` : 'local food audience';
  const city = lead.city ?? String(request.filters.city ?? 'your city');
  return [
    `Hi${handle ? ` @${handle}` : ''}, this is hOpOn. We help local businesses run creator campaigns with trackable store visits and redemptions.`,
    `${merchant} is looking for creators in ${city} for "${campaign?.title ?? 'a new campaign'}". Your ${audience} and ${followerLabel(lead.followers)} look like a strong fit.`,
    `The collaboration details are flexible: it may be a free creator experience, product exchange, or paid collaboration depending on the merchant's campaign budget. hOpOn's platform subscription is separate from creator compensation.`,
    `If you're interested, use this invite link to join the campaign flow: ${inviteUrl ?? 'hOpOn creator invite link'}`,
    `Happy to send the brief before you decide.`,
  ].join('\n\n');
}

function generateDirectInviteDmDraft(request: CampaignSourcingRequest, input: DirectCreatorInviteDraft, inviteUrl: string | null): string {
  const campaign = request.campaign;
  const merchant = campaign?.restaurant?.name ?? 'a local hOpOn merchant';
  const { handle } = parseSocialInput(input.platform, input.handleOrUrl);
  return [
    `Hi${handle ? ` @${handle}` : ''}, this is hOpOn. We help local businesses run creator campaigns with trackable store visits and redemptions.`,
    `${merchant} would like to invite you to "${campaign?.title ?? 'a creator campaign'}".`,
    campaign?.description ? `Campaign context: ${truncateText(campaign.description, 220)}` : null,
    campaign?.budget ? `Collaboration / offer: ${campaign.budget}.` : `Collaboration details are shown in the campaign brief before you accept.`,
    `Use this private invite link to set your password, verify your email, and see the accepted campaign in hOpOn: ${inviteUrl ?? 'hOpOn creator invite link'}`,
    `Creator compensation, free experiences, product exchanges, and customer incentives are controlled by the campaign brief. hOpOn's platform subscription is separate from creator compensation.`,
  ].filter(Boolean).join('\n\n');
}

function fitReasonsForLead(lead: GrowthOsLead, request: CampaignSourcingRequest): string[] {
  const reasons = [
    lead.city ? `Local to ${lead.city}` : null,
    lead.primaryCategory ? `Creates ${lead.primaryCategory} content` : null,
    lead.restaurantFitScore != null ? `Restaurant fit score ${lead.restaurantFitScore}/100` : null,
    lead.foodExchangeProbability != null ? `Food collaboration likelihood ${lead.foodExchangeProbability}/100` : null,
    request.generatedTags.length ? `Matches tags: ${request.generatedTags.slice(0, 4).join(', ')}` : null,
  ];
  return reasons.filter(Boolean) as string[];
}

export async function importTopGrowthLeadsForRequest(
  request: CampaignSourcingRequest,
  limit = 12,
  options: { campaignOnly?: boolean; updatedAfter?: string } = {},
): Promise<number> {
  const filters = requestFilters(request);
  let query = supabase
    .from('growth_os_creator_leads')
    .select(
      'id,display_name,instagram_username,instagram_url,tiktok_username,tiktok_url,city,primary_category,secondary_categories,platforms,followers,estimated_engagement_rate,bio,creator_summary,recent_posts_summary,overall_score,restaurant_fit_score,food_exchange_probability,status,created_at'
    )
    .order('overall_score', { ascending: false, nullsFirst: false })
    .limit(Math.max(limit, request.neededCreatorCount) * 3);
  if (filters.city && !options.campaignOnly) {
    query = query.ilike('city', `%${filters.city.split(',')[0].trim()}%`);
  }
  if (options.campaignOnly) {
    query = query.contains('discovery_metadata', { campaignSourcing: true, campaignId: request.campaignId });
  }
  if (options.updatedAfter) {
    query = query.gte('updated_at', options.updatedAfter);
  }
  const { data, error } = await query;
  if (error) throw error;
  const leads = (data ?? []).map(mapGrowthLead).filter((lead) => {
    const platform = leadPlatform(lead);
    if (filters.platforms.length && !filters.platforms.includes(platform)) return false;
    if (filters.minFollowers && lead.followers && lead.followers < filters.minFollowers) return false;
    if (filters.maxFollowers && lead.followers && lead.followers > filters.maxFollowers) return false;
    return Boolean(leadHandle(lead, platform) || leadUrl(lead, platform));
  });

  const candidatesWithInvites = leads.slice(0, limit).map((lead) => {
    const platform = leadPlatform(lead);
    const handle = leadHandle(lead, platform);
    return {
      growthOsLeadId: lead.id,
      lead,
      candidate: {
        sourcing_request_id: request.id,
        campaign_id: request.campaignId,
        restaurant_id: request.restaurantId,
        growth_os_lead_id: lead.id,
        platform,
        handle,
        profile_url: leadUrl(lead, platform),
        display_name: lead.displayName,
        followers: lead.followers,
        score: lead.overallScore == null ? null : Math.round(Number(lead.overallScore)),
        fit_reasons: fitReasonsForLead(lead, request),
        concerns: [],
        admin_status: 'shortlisted',
        merchant_status: 'hidden',
        outreach_status: 'drafted',
        merchant_visible: false,
      },
    };
  });

  if (!candidatesWithInvites.length) return 0;
  const { data: upsertedCandidates, error: insertError } = await supabase
    .from('campaign_sourcing_candidates')
    .upsert(candidatesWithInvites.map((item) => item.candidate), { onConflict: 'sourcing_request_id,growth_os_lead_id', ignoreDuplicates: false })
    .select('id,growth_os_lead_id');
  if (insertError) throw insertError;
  const candidateIdByLeadId = new Map<string, string>();
  for (const row of upsertedCandidates ?? []) {
    if (row.growth_os_lead_id && row.id) candidateIdByLeadId.set(row.growth_os_lead_id, row.id);
  }
  if (candidateIdByLeadId.size < candidatesWithInvites.length) {
    const missingLeadIds = candidatesWithInvites
      .map((item) => item.growthOsLeadId)
      .filter((leadId) => !candidateIdByLeadId.has(leadId));
    const { data: existingCandidates, error: existingCandidateError } = await supabase
      .from('campaign_sourcing_candidates')
      .select('id,growth_os_lead_id')
      .eq('sourcing_request_id', request.id)
      .in('growth_os_lead_id', missingLeadIds);
    if (existingCandidateError) throw existingCandidateError;
    for (const row of existingCandidates ?? []) {
      if (row.growth_os_lead_id && row.id) candidateIdByLeadId.set(row.growth_os_lead_id, row.id);
    }
  }
  const inviteSeeds = candidatesWithInvites
    .map((item) => {
      const candidateId = candidateIdByLeadId.get(item.growthOsLeadId);
      return candidateId ? { candidateId, lead: item.lead, status: 'drafted' } : null;
    })
    .filter(Boolean) as CandidateInviteSeed[];
  await ensureCandidateInvites(request, inviteSeeds);
  return candidatesWithInvites.length;
}

export async function runGrowthDiscoveryForRequest(request: CampaignSourcingRequest): Promise<{ imported: number; raw: unknown }> {
  const filters = requestFilters(request);
  const campaign = request.campaign;
  const campaignContext = {
    id: request.campaignId,
    merchantName: campaign?.restaurant?.name ?? null,
    campaignTitle: campaign?.title ?? null,
    campaignSummary: truncateText(campaign?.description, 300),
    offerSummary: truncateText(campaign?.budget, 200),
    targetAudience: buildTargetAudience(campaign ?? {
      id: request.campaignId,
      restaurantId: request.restaurantId,
      title: campaign?.title ?? 'Campaign',
      description: null,
      status: 'OPEN',
      restaurant: campaign?.restaurant ?? null,
    }, filters),
    searchIntent: truncateText(
      `Find individual creators who can make ${campaign?.restaurant?.name ?? 'this merchant'} feel visit-worthy for "${campaign?.title ?? 'this campaign'}" and drive measurable store visits or redemptions.`,
      260,
    ),
    targetCreatorCount: request.neededCreatorCount,
  };
  try {
    const targetCount = request.neededCreatorCount || 12;
    const attempts: unknown[] = [];
    let imported = 0;

    for (let attempt = 0; attempt < MAX_SOURCING_RUN_ATTEMPTS; attempt += 1) {
      const attemptStartedAt = new Date().toISOString();
      await supabase
        .from('campaign_sourcing_requests')
        .update({ status: 'running', last_run_at: attemptStartedAt })
        .eq('id', request.id);

      const { data, error } = await supabase.functions.invoke('growth-run-campaign-sourcing', {
        body: {
          provider: 'openai-web-search',
          dryRun: false,
          filters,
          targetCreatorCount: targetCount,
          neededCreatorCount: targetCount,
          campaign: campaignContext,
        },
      });
      if (error) {
        throw error;
      }
      attempts.push(data);

      imported = await importTopGrowthLeadsForRequest(request, targetCount, { campaignOnly: true, updatedAfter: attemptStartedAt });
      if (imported < targetCount) {
        imported = await importTopGrowthLeadsForRequest(request, targetCount, { campaignOnly: true });
      }
      if (imported >= targetCount) {
        break;
      }
    }

    await supabase
      .from('campaign_sourcing_requests')
      .update({ status: imported > 0 ? 'reviewing' : 'ready', last_run_at: new Date().toISOString() })
      .eq('id', request.id);
    return { imported, raw: attempts };
  } catch (error) {
    const imported = await importTopGrowthLeadsForRequest(request, request.neededCreatorCount || 12, { campaignOnly: true }).catch(() => 0);
    await supabase
      .from('campaign_sourcing_requests')
      .update({ status: imported > 0 ? 'reviewing' : 'ready', last_run_at: new Date().toISOString() })
      .eq('id', request.id);
    throw error;
  }
}

export async function updateSourcingCandidate(
  candidateId: string,
  patch: Partial<{
    adminStatus: CampaignSourcingCandidate['adminStatus'];
    merchantStatus: CampaignSourcingCandidate['merchantStatus'];
    outreachStatus: CampaignSourcingCandidate['outreachStatus'];
    merchantVisible: boolean;
    dmDraft: string | null;
  }>
): Promise<void> {
  const payload: JsonRecord = {};
  if (patch.adminStatus) payload.admin_status = patch.adminStatus;
  if (patch.merchantStatus) payload.merchant_status = patch.merchantStatus;
  if (patch.outreachStatus) payload.outreach_status = patch.outreachStatus;
  if (typeof patch.merchantVisible === 'boolean') {
    payload.merchant_visible = patch.merchantVisible;
    payload.merchant_status = patch.merchantVisible ? 'visible' : 'hidden';
    payload.admin_status = patch.merchantVisible ? 'approved_for_merchant' : patch.adminStatus ?? 'shortlisted';
  }
  if (Object.keys(payload).length > 0) {
    const { error } = await supabase.from('campaign_sourcing_candidates').update(payload).eq('id', candidateId);
    if (error) throw error;
  }
  if ('dmDraft' in patch || patch.outreachStatus) {
    const { data: candidateRow, error: candidateError } = await supabase
      .from('campaign_sourcing_candidates')
      .select('sourcing_request_id,campaign_id,restaurant_id')
      .eq('id', candidateId)
      .single();
    if (candidateError) throw candidateError;

    const invitePayload: JsonRecord = {
      candidate_id: candidateId,
      sourcing_request_id: candidateRow.sourcing_request_id,
      campaign_id: candidateRow.campaign_id,
      restaurant_id: candidateRow.restaurant_id,
    };
    if ('dmDraft' in patch) invitePayload.dm_draft = patch.dmDraft;
    if (patch.outreachStatus) invitePayload.status = patch.outreachStatus;
    const { error } = await supabase
      .from('campaign_sourcing_invites')
      .upsert(invitePayload, { onConflict: 'candidate_id', ignoreDuplicates: false });
    if (error) throw error;
  }
}

export async function updateSourcingRequestStatus(requestId: string, status: CampaignSourcingRequest['status']): Promise<void> {
  const { error } = await supabase.from('campaign_sourcing_requests').update({ status }).eq('id', requestId);
  if (error) throw error;
}
