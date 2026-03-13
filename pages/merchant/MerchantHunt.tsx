import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import {
  getCurrentUserId,
  getRestaurantProfile,
  getCampaignsForRestaurant,
  listDiscoverCreators,
  getLocations,
  sendNotification,
} from '../../lib/merchant/api';
import { isCampaignEligibleForInvite } from '../../lib/merchant/constants';
import type { DiscoverCreator } from '../../lib/merchant/types';
import type { Campaign } from '../../lib/merchant/types';
import type { LocationOption } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';
import { isSafeImageUrl } from '../../lib/safeImageUrl';

const PLATFORMS = [
  { value: 'xhs', labelZh: '小红书', labelEn: 'Xiaohongshu' },
  { value: 'douyin', labelZh: '抖音', labelEn: 'Douyin' },
  { value: 'instagram', labelZh: 'Instagram', labelEn: 'Instagram' },
  { value: 'tiktok', labelZh: 'TikTok', labelEn: 'TikTok' },
];

const FOLLOWER_PRESETS = [
  { id: 'any', min: undefined as number | undefined, max: undefined as number | undefined, labelZh: '不限', labelEn: 'Any' },
  { id: '0-1k', min: 0, max: 1000, labelZh: '0-1千', labelEn: '0-1k' },
  { id: '1k-10k', min: 1000, max: 10000, labelZh: '1千-1万', labelEn: '1k-10k' },
  { id: '10k-50k', min: 10000, max: 50000, labelZh: '1万-5万', labelEn: '10k-50k' },
  { id: '50k+', min: 50000, max: undefined, labelZh: '5万+', labelEn: '50k+' },
];

type SortOption = 'followers_desc' | 'followers_asc' | 'name_asc';

export const MerchantHunt: React.FC = () => {
  const { t, isZh } = useMerchantLocale();
  const [creators, setCreators] = useState<DiscoverCreator[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profile, setProfile] = useState<{ name?: string } | null>(null);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [followersPresetId, setFollowersPresetId] = useState<string>('any');
  const [followersMin, setFollowersMin] = useState<number | undefined>(undefined);
  const [followersMax, setFollowersMax] = useState<number | undefined>(undefined);
  const [cityKey, setCityKey] = useState<string | undefined>(undefined);
  const [areaKey, setAreaKey] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortOption>('followers_desc');
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
    try {
      const filtersParam = {
        platforms: platformFilter.length ? platformFilter : undefined,
        followersMin: followersMin ?? undefined,
        followersMax: followersMax ?? undefined,
        cityKey,
        areaKey: areaKey ?? undefined,
      };
      const [creatorsList, campaignsList, restaurantProfile, locationsList] = await Promise.all([
        listDiscoverCreators(filtersParam),
        getCampaignsForRestaurant(userId),
        getRestaurantProfile(userId),
        getLocations(),
      ]);
      setCreators(creatorsList);
      setCampaigns((campaignsList ?? []).filter(isCampaignEligibleForInvite));
      setProfile(restaurantProfile ?? null);
      setLocations(locationsList ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [platformFilter, followersMin, followersMax, cityKey, areaKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAndSortedCreators = useMemo(() => {
    let list = creators;
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      const cityDisplay = (c: DiscoverCreator) => (c as { city_display?: string }).city_display ?? c.city ?? '';
      list = list.filter(
        (c) =>
          (c.display_name ?? (c as { name?: string }).name ?? '')
            .toLowerCase()
            .includes(lower) ||
          ((c as { handle?: string }).handle ?? '')
            .toLowerCase()
            .includes(lower) ||
          cityDisplay(c).toLowerCase().includes(lower) ||
          ((c.tags as string[] | undefined) ?? []).some((tag) =>
            String(tag).toLowerCase().includes(lower)
          )
      );
    }
    const name = (c: DiscoverCreator) =>
      c.display_name ?? (c as { name?: string }).name ?? '';
    const followers = (c: DiscoverCreator) =>
      Number(c.followers_count ?? (c as { followers?: number }).followers ?? 0);
    if (sortBy === 'followers_desc') {
      list = [...list].sort((a, b) => followers(b) - followers(a));
    } else if (sortBy === 'followers_asc') {
      list = [...list].sort((a, b) => followers(a) - followers(b));
    } else {
      list = [...list].sort((a, b) => name(a).localeCompare(name(b)));
    }
    return list;
  }, [creators, searchText, sortBy]);

  const handleInvite = (creator: DiscoverCreator) => {
    setSelectedCreator(creator);
    setSelectedCampaignId('');
    setInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!selectedCreator || !selectedCampaignId || !profile) return;
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign) return;
    setSending(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const ok = await sendNotification({
        recipient_user_id: selectedCreator.id,
        sender_user_id: userId,
        type: 'invite_to_campaign',
        title: `来自 ${profile.name} 的合作邀请`,
        body: `${profile.name} 邀请你参与：${campaign.title}`,
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
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading && creators.length === 0) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">加载中…</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-6">
        {t.title}
      </h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full h-12 pl-12 pr-4 border-2 border-black font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
        />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-black/60 py-1">{t.filterPlatform}:</span>
          {PLATFORMS.map((p) => {
            const on = platformFilter.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlatformFilter(on ? platformFilter.filter((x) => x !== p.value) : [...platformFilter, p.value])}
                className={`px-4 py-2 rounded-full border-2 font-mono text-xs uppercase transition-colors ${
                  on ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70 hover:border-black'
                }`}
              >
                {isZh ? p.labelZh : p.labelEn}
              </button>
            );
          })}
          {(platformFilter.length > 0 || followersMin != null || followersMax != null || cityKey) && (
            <button
              type="button"
              onClick={() => {
                setPlatformFilter([]);
                setFollowersPresetId('any');
                setFollowersMin(undefined);
                setFollowersMax(undefined);
                setCityKey(undefined);
                setAreaKey(undefined);
              }}
              className="px-4 py-2 rounded-full border-2 border-black/30 font-mono text-xs uppercase text-black/60 hover:border-hopon-red"
            >
              {t.filterReset}
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase text-black/60 py-1">{t.filterFollowers}:</span>
          {FOLLOWER_PRESETS.map((p) => {
            const on = followersPresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setFollowersPresetId(p.id);
                  setFollowersMin(p.min);
                  setFollowersMax(p.max);
                }}
                className={`px-4 py-2 rounded-full border-2 font-mono text-xs uppercase transition-colors ${
                  on ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70 hover:border-black'
                }`}
              >
                {isZh ? p.labelZh : p.labelEn}
              </button>
            );
          })}
        </div>
        {locations.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase text-black/60 py-1">{isZh ? '地区' : 'Location'}:</span>
            <button
              type="button"
              onClick={() => { setCityKey(undefined); setAreaKey(undefined); }}
              className={`px-4 py-2 rounded-full border-2 font-mono text-xs uppercase transition-colors ${
                !cityKey ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70 hover:border-black'
              }`}
            >
              {isZh ? '不限' : 'Any'}
            </button>
            {locations.slice(0, 12).map((loc) => {
              const key = loc.areaKey ? `${loc.cityKey}-${loc.areaKey}` : loc.cityKey;
              const label = loc.areaName ? `${loc.cityName} · ${loc.areaName}` : loc.cityName;
              const on = cityKey === loc.cityKey && (loc.areaKey == null ? !areaKey : areaKey === loc.areaKey);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setCityKey(loc.cityKey); setAreaKey(loc.areaKey ?? undefined); }}
                  className={`px-4 py-2 rounded-full border-2 font-mono text-xs uppercase transition-colors truncate max-w-[180px] ${
                    on ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70 hover:border-black'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase text-black/60 py-1">{isZh ? '排序' : 'Sort'}:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 px-3 border-2 border-black font-mono text-xs uppercase bg-white"
          >
            <option value="followers_desc">{isZh ? '粉丝从高到低' : 'Followers (high→low)'}</option>
            <option value="followers_asc">{isZh ? '粉丝从低到高' : 'Followers (low→high)'}</option>
            <option value="name_asc">{isZh ? '名字 A-Z' : 'Name A-Z'}</option>
          </select>
        </div>
      </div>

      {filteredAndSortedCreators.length === 0 ? (
        <div className="border-2 border-dashed border-black/20 p-12 text-center">
          <p className="font-display font-bold text-hopon-black mb-1">{t.emptyTitle}</p>
          <p className="text-sm text-black/60">
            {searchText || platformFilter ? t.emptyFiltersMsg : t.emptyMsg}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredAndSortedCreators.map((creator) => {
            const name = creator.display_name ?? (creator as { name?: string }).name ?? '未知';
            const avatar = creator.avatar_url ?? (creator as { avatar?: string }).avatar ?? null;
            const followers = creator.followers_count ?? (creator as { followers?: number }).followers ?? 0;
            const showAvatar = isSafeImageUrl(avatar);
            return (
              <li
                key={creator.id}
                className="border-2 border-black p-6 bg-white flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <Link
                  to={`/merchant/creator/${creator.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-black bg-hopon-grey overflow-hidden shrink-0 flex items-center justify-center">
                    {showAvatar ? (
                      <img src={avatar!} alt="" className="w-full h-full object-cover" />
                    ) : (
                    <User className="w-6 h-6 text-black/40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-hopon-black truncate">{name}</p>
                    <p className="text-sm text-black/60">
                      {t.followers}: {(followers as number).toLocaleString()}
                      {creator.city ? ` · ${creator.city}` : ''}
                    </p>
                    {(creator.platforms?.length ?? 0) > 0 && (
                      <p className="text-xs text-black/50 mt-1">
                        {(creator.platforms as string[]).slice(0, 3).join('、')}
                      </p>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleInvite(creator)}
                  className="h-12 px-6 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors shrink-0"
                >
                  {t.inviteBtn}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-auto bg-white border-t-2 sm:border-2 border-black"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="font-display font-bold text-lg uppercase text-hopon-black mb-2">
                {t.selectCampaign}
              </h2>
              {selectedCreator && (
                <p className="text-sm text-black/70 mb-4">
                  {t.inviteCreatorTo(selectedCreator.display_name ?? (selectedCreator as { name?: string }).name ?? '')}
                </p>
              )}
              {campaigns.length === 0 ? (
                <p className="text-sm text-black/60 py-4">{t.noCampaigns}</p>
              ) : (
                <ul className="space-y-2 mb-6">
                  {campaigns.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCampaignId(c.id)}
                        className={`w-full text-left p-4 rounded border-2 transition-colors ${
                          selectedCampaignId === c.id
                            ? 'border-hopon-red bg-red-50'
                            : 'border-black/20 hover:border-black/50'
                        }`}
                      >
                        <p className="font-display font-bold text-hopon-black">{c.title}</p>
                        {c.description && (
                          <p className="text-sm text-black/60 truncate mt-1">{c.description}</p>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setInviteModalOpen(false);
                    setSelectedCreator(null);
                    setSelectedCampaignId('');
                  }}
                  className="flex-1 h-12 border-2 border-black bg-white text-hopon-black font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-grey transition-colors"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={sending || !selectedCampaignId || campaigns.length === 0}
                  className="flex-1 h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors disabled:opacity-50"
                >
                  {sending ? (isZh ? '发送中…' : 'Sending…') : t.sendBtn}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            onClick={() => setInviteModalOpen(false)}
            aria-label="关闭"
          />
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 font-mono text-sm rounded shadow-lg ${
            toast.error ? 'bg-hopon-red text-white' : 'bg-hopon-black text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
};

