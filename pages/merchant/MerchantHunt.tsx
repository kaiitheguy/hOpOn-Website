import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, RefreshCw, Search, User, Users } from 'lucide-react';
import {
  getCampaignsForRestaurant,
  getCurrentUserId,
  getLocations,
  getRestaurantProfile,
  listDiscoverCreators,
  sendNotification,
} from '../../lib/merchant/api';
import { isCampaignEligibleForInvite } from '../../lib/merchant/constants';
import { getPlatformLabel, getPlatformOptions, type CreatorSocialPlatform } from '../../lib/merchant/platformLabels';
import type { Campaign, DiscoverCreator, LocationOption, Restaurant } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';
import { isSafeImageUrl } from '../../lib/safeImageUrl';

const FOLLOWER_PRESETS = [
  { id: 'any', min: undefined as number | undefined, max: undefined as number | undefined, labelZh: '不限', labelEn: 'Any' },
  { id: '0-1k', min: 0, max: 1000, labelZh: '0-1千', labelEn: '0-1k' },
  { id: '1k-10k', min: 1000, max: 10000, labelZh: '1千-1万', labelEn: '1k-10k' },
  { id: '10k-50k', min: 10000, max: 50000, labelZh: '1万-5万', labelEn: '10k-50k' },
  { id: '50k+', min: 50000, max: undefined, labelZh: '5万+', labelEn: '50k+' },
];

type SortOption = 'followers_desc' | 'followers_asc' | 'name_asc';

function creatorName(creator: DiscoverCreator): string {
  return creator.display_name ?? creator.name ?? '未知';
}

function creatorFollowers(creator: DiscoverCreator): number {
  return Number(creator.maxFollowersPublicApproved ?? creator.followers_count ?? creator.followers ?? 0);
}

function creatorCity(creator: DiscoverCreator): string {
  return creator.cityDisplay ?? creator.city ?? (creator as { city_display?: string }).city_display ?? '';
}

function creatorPlatforms(creator: DiscoverCreator): string[] {
  return ((creator.platformsPublicApproved?.length ? creator.platformsPublicApproved : creator.platforms) ?? []).filter(Boolean);
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'H';
}

function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return value.toLocaleString();
}

export const MerchantHunt: React.FC = () => {
  const { t, isZh } = useMerchantLocale();
  const platformOptions = getPlatformOptions(isZh);
  const [creators, setCreators] = useState<DiscoverCreator[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<Restaurant | null>(null);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [platformFilter, setPlatformFilter] = useState<CreatorSocialPlatform[]>([]);
  const [followersPresetId, setFollowersPresetId] = useState<string>('any');
  const [followersMin, setFollowersMin] = useState<number | undefined>(undefined);
  const [followersMax, setFollowersMax] = useState<number | undefined>(undefined);
  const [cityKey, setCityKey] = useState<string | undefined>(undefined);
  const [areaKey, setAreaKey] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>('followers_desc');
  const [visibleCount, setVisibleCount] = useState(30);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<DiscoverCreator | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const loadData = React.useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [creatorsList, campaignsList, restaurantProfile, locationsList] = await Promise.all([
        listDiscoverCreators({
          platforms: platformFilter.length ? platformFilter : undefined,
          followersMin: followersMin ?? undefined,
          followersMax: followersMax ?? undefined,
          cityKey,
          areaKey: areaKey ?? undefined,
        }),
        getCampaignsForRestaurant(userId),
        getRestaurantProfile(userId),
        getLocations(),
      ]);
      setCreators(creatorsList);
      setCampaigns((campaignsList ?? []).filter(isCampaignEligibleForInvite));
      setProfile(restaurantProfile ?? null);
      setLocations(locationsList ?? []);
    } catch (err) {
      console.error(err);
      setError(isZh ? '加载博主失败，请重试' : 'Failed to load creators. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [areaKey, cityKey, followersMax, followersMin, isZh, platformFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredCreators = useMemo(() => {
    let list = creators;
    const query = searchText.trim().toLowerCase();
    if (query) {
      list = list.filter((creator) =>
        creatorName(creator).toLowerCase().includes(query) ||
        (creator.handle ?? '').toLowerCase().includes(query) ||
        creatorCity(creator).toLowerCase().includes(query) ||
        ((creator.tags as string[] | undefined) ?? []).some((tag) => String(tag).toLowerCase().includes(query))
      );
    }
    if (sortBy === 'followers_desc') return [...list].sort((a, b) => creatorFollowers(b) - creatorFollowers(a));
    if (sortBy === 'followers_asc') return [...list].sort((a, b) => creatorFollowers(a) - creatorFollowers(b));
    return [...list].sort((a, b) => creatorName(a).localeCompare(creatorName(b)));
  }, [creators, searchText, sortBy]);

  const visibleCreators = filteredCreators.slice(0, visibleCount);
  const activeFilterCount = platformFilter.length + (followersMin != null || followersMax != null ? 1 : 0) + (cityKey ? 1 : 0);
  const totalReach = filteredCreators.reduce((sum, creator) => sum + creatorFollowers(creator), 0);

  useEffect(() => {
    setVisibleCount(30);
  }, [areaKey, cityKey, followersMax, followersMin, platformFilter, searchText, sortBy]);

  const resetFilters = () => {
    setPlatformFilter([]);
    setFollowersPresetId('any');
    setFollowersMin(undefined);
    setFollowersMax(undefined);
    setCityKey(undefined);
    setAreaKey(undefined);
  };

  const handleInvite = (creator: DiscoverCreator) => {
    if (campaigns.length === 0) return;
    setSelectedCreator(creator);
    setSelectedCampaignId('');
    setInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!selectedCreator || !selectedCampaignId || !profile) return;
    const campaign = campaigns.find((item) => item.id === selectedCampaignId);
    if (!campaign) return;
    setSending(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const ok = await sendNotification({
        recipient_user_id: selectedCreator.id,
        sender_user_id: userId,
        type: 'invite_to_campaign',
        title: t.inviteFrom(profile.name ?? ''),
        body: t.inviteBody(profile.name ?? '', campaign.title),
        data: {
          campaign_id: campaign.id,
          restaurant_id: userId,
          campaign_title: campaign.title,
          restaurant_name: profile.name,
        },
      });
      if (ok) {
        setToast({ msg: t.inviteSent });
        setInviteModalOpen(false);
        setSelectedCreator(null);
        setSelectedCampaignId('');
      } else {
        setToast({ msg: t.inviteFailed, error: true });
      }
    } catch {
      setToast({ msg: t.inviteFailed, error: true });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  if (loading && creators.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display font-bold text-hopon-black">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="py-7">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 font-mono text-[11px] uppercase text-black/50">
            {isZh ? '创作者匹配' : 'Creator matching'}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-hopon-black">{t.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/60">
            {isZh ? '筛选已审核创作者，查看公开认证平台和粉丝规模，再邀请到开放活动。' : 'Browse approved creators, verified platforms, and audience size, then invite them to open campaigns.'}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
          <StatCard label={isZh ? '匹配' : 'Matches'} value={filteredCreators.length.toLocaleString()} />
          <StatCard label={isZh ? '触达' : 'Reach'} value={compactNumber(totalReach)} />
          <StatCard label={isZh ? '活动' : 'Open'} value={campaigns.length.toLocaleString()} />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-hopon-red/30 bg-red-50 px-4 py-3 text-sm text-hopon-red">
          {error}
        </div>
      )}

      <section className="mb-6 rounded-3xl border border-black/10 bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,0.04)]">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/35" />
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-12 w-full rounded-2xl border border-black/10 bg-[#FAFAF7] pl-12 pr-4 font-mono text-sm outline-none focus:border-black/30 focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="h-11 rounded-full border border-black/10 bg-white px-4 font-mono text-[11px] uppercase text-black/60 outline-none hover:border-black/30"
            >
              <option value="followers_desc">{isZh ? '粉丝从高到低' : 'Followers high to low'}</option>
              <option value="followers_asc">{isZh ? '粉丝从低到高' : 'Followers low to high'}</option>
              <option value="name_asc">{isZh ? '名字 A-Z' : 'Name A-Z'}</option>
            </select>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4 font-mono text-[11px] uppercase text-black/60 hover:border-black/30 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {isZh ? '刷新' : 'Refresh'}
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-11 rounded-full border border-black/10 bg-white px-4 font-mono text-[11px] uppercase text-black/60 hover:border-hopon-red hover:text-hopon-red"
              >
                {t.filterReset}
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <FilterGroup label={t.filterPlatform}>
            {platformOptions.map((platform) => {
              const selected = platformFilter.includes(platform.value);
              return (
                <Chip
                  key={platform.value}
                  selected={selected}
                  onClick={() => setPlatformFilter(selected ? platformFilter.filter((item) => item !== platform.value) : [...platformFilter, platform.value])}
                >
                  {platform.label}
                </Chip>
              );
            })}
          </FilterGroup>
          <FilterGroup label={t.filterFollowers}>
            {FOLLOWER_PRESETS.map((preset) => (
              <Chip
                key={preset.id}
                selected={followersPresetId === preset.id}
                onClick={() => {
                  setFollowersPresetId(preset.id);
                  setFollowersMin(preset.min);
                  setFollowersMax(preset.max);
                }}
              >
                {isZh ? preset.labelZh : preset.labelEn}
              </Chip>
            ))}
          </FilterGroup>
        </div>

        {locations.length > 0 && (
          <FilterGroup label={isZh ? '地区' : 'Location'} className="mt-4">
            <Chip selected={!cityKey} onClick={() => { setCityKey(undefined); setAreaKey(undefined); }}>
              {isZh ? '不限' : 'Any'}
            </Chip>
            {locations.slice(0, 12).map((loc) => {
              const key = loc.areaKey ? `${loc.cityKey}-${loc.areaKey}` : loc.cityKey;
              const label = loc.areaName ? `${loc.cityName} · ${loc.areaName}` : loc.cityName;
              const selected = cityKey === loc.cityKey && (loc.areaKey == null ? !areaKey : areaKey === loc.areaKey);
              return (
                <Chip key={key} selected={selected} onClick={() => { setCityKey(loc.cityKey); setAreaKey(loc.areaKey ?? undefined); }}>
                  {label}
                </Chip>
              );
            })}
          </FilterGroup>
        )}
      </section>

      {filteredCreators.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center">
          <Users className="mx-auto h-7 w-7 text-hopon-red" />
          <p className="mt-4 font-display text-xl font-bold text-hopon-black">{t.emptyTitle}</p>
          <p className="mt-2 text-sm text-black/55">{searchText || activeFilterCount > 0 ? t.emptyFiltersMsg : t.emptyMsg}</p>
          {campaigns.length === 0 && (
            <Link to="/merchant/campaign/new" className="mt-5 inline-flex h-11 items-center rounded-xl bg-hopon-black px-5 font-display text-xs font-bold uppercase tracking-wide text-white hover:bg-hopon-red">
              {isZh ? '先创建活动' : 'Create campaign first'}
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase text-black/45">
              {isZh ? `显示 ${visibleCreators.length} / ${filteredCreators.length} 位创作者` : `Showing ${visibleCreators.length} / ${filteredCreators.length} creators`}
            </p>
            {visibleCreators.length < filteredCreators.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 30)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 font-mono text-[11px] uppercase text-black/55 hover:border-black/30"
              >
                {isZh ? '加载更多' : 'Show more'}
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleCreators.map((creator) => {
              const name = creatorName(creator);
              const avatar = creator.avatar_url ?? creator.avatar ?? null;
              const showAvatar = isSafeImageUrl(avatar);
              const handle = creator.handle ? (creator.handle.startsWith('@') ? creator.handle : `@${creator.handle}`) : '';
              const city = creatorCity(creator);
              const platforms = creatorPlatforms(creator);
              return (
                <article key={creator.id} className="rounded-3xl border border-black/10 bg-white p-4 shadow-[0_12px_34px_rgba(0,0,0,0.035)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.065)]">
                  <Link to={`/merchant/creator/${creator.id}`} className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F2F0EA] font-display font-bold text-hopon-black">
                      {showAvatar ? <img src={avatar!} alt="" className="h-full w-full object-cover" /> : initials(name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold text-hopon-black">{name}</p>
                      {handle && <p className="mt-0.5 truncate font-mono text-[11px] uppercase text-black/45">{handle}</p>}
                      {city && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-black/50">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{city}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <MiniStat label={t.followers} value={compactNumber(creatorFollowers(creator))} />
                    <MiniStat label={isZh ? '平台' : 'Platforms'} value={String(platforms.length)} />
                  </div>
                  {platforms.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {platforms.slice(0, 4).map((platform) => (
                        <span key={platform} className="rounded-full border border-black/10 bg-white px-2.5 py-1 font-mono text-[10px] uppercase text-black/55">
                          {getPlatformLabel(platform, isZh)}
                        </span>
                      ))}
                    </div>
                  )}
                  {(creator.tags?.length ?? 0) > 0 && (
                    <p className="mt-3 truncate text-sm text-black/45">{creator.tags!.slice(0, 3).join(' · ')}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleInvite(creator)}
                    disabled={campaigns.length === 0}
                    className="mt-4 h-11 w-full rounded-xl bg-hopon-black font-display text-xs font-bold uppercase tracking-wide text-white hover:bg-hopon-red disabled:bg-black/10 disabled:text-black/35"
                  >
                    {campaigns.length === 0 ? (isZh ? '先创建活动' : 'Create campaign') : t.inviteBtn}
                  </button>
                </article>
              );
            })}
          </div>
        </>
      )}

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 pb-3 sm:items-center sm:p-6">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
            <div className="border-b border-black/10 p-6">
              <h2 className="font-display text-xl font-bold text-hopon-black">{t.selectCampaign}</h2>
              {selectedCreator && <p className="mt-1 text-sm text-black/60">{t.inviteCreatorTo(creatorName(selectedCreator))}</p>}
            </div>
            <div className="max-h-[55vh] overflow-auto p-5">
              {campaigns.length === 0 ? (
                <div className="rounded-2xl bg-[#FAFAF7] p-5">
                  <p className="text-sm text-black/60">{t.noCampaigns}</p>
                  <Link to="/merchant/campaign/new" className="mt-4 inline-flex h-10 items-center rounded-xl bg-hopon-black px-4 font-display text-xs font-bold uppercase tracking-wide text-white hover:bg-hopon-red">
                    {isZh ? '创建活动' : 'Create Campaign'}
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {campaigns.map((campaign) => (
                    <li key={campaign.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignId(campaign.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selectedCampaignId === campaign.id ? 'border-hopon-red bg-red-50' : 'border-black/10 bg-white hover:border-black/30'
                        }`}
                      >
                        <p className="font-display font-bold text-hopon-black">{campaign.title}</p>
                        {campaign.description && <p className="mt-1 truncate text-sm text-black/55">{campaign.description}</p>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-black/10 p-5">
              <button
                type="button"
                onClick={() => {
                  setInviteModalOpen(false);
                  setSelectedCreator(null);
                  setSelectedCampaignId('');
                }}
                className="h-11 rounded-xl border border-black/10 bg-white font-display text-xs font-bold uppercase tracking-wide text-hopon-black hover:bg-[#FAFAF7]"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleSendInvite}
                disabled={sending || !selectedCampaignId || campaigns.length === 0}
                className="h-11 rounded-xl bg-hopon-black font-display text-xs font-bold uppercase tracking-wide text-white hover:bg-hopon-red disabled:opacity-50"
              >
                {sending ? (isZh ? '发送中…' : 'Sending…') : t.sendBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 font-mono text-xs uppercase shadow-lg ${toast.error ? 'bg-hopon-red text-white' : 'bg-hopon-black text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.035)]">
      <p className="font-display text-xl font-bold text-hopon-black">{value}</p>
      <p className="font-mono text-[10px] uppercase text-black/45">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#FAFAF7] p-3">
      <p className="font-mono text-[10px] uppercase text-black/40">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-hopon-black">{value}</p>
    </div>
  );
}

function FilterGroup({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wide text-black/45">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode; key?: React.Key }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-9 rounded-full border px-3.5 py-2 font-mono text-[11px] uppercase transition ${
        selected ? 'border-hopon-red bg-red-50 text-hopon-red' : 'border-black/10 bg-white text-black/55 hover:border-black/30 hover:text-hopon-black'
      }`}
    >
      {children}
    </button>
  );
}
