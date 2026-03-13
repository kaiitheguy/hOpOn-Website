import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import {
  getCurrentUserId,
  getCreatorProfile,
  getCreatorAchievementStats,
  getCampaignsForRestaurant,
  getRestaurantProfile,
  sendNotification,
} from '../../lib/merchant/api';
import { isCampaignEligibleForInvite } from '../../lib/merchant/constants';
import type { Creator } from '../../lib/merchant/types';
import type { Campaign } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';
import { isSafeImageUrl } from '../../lib/safeImageUrl';

type AchievementStats = { collaborators: number; deliverables: number } | null;

export const CreatorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isZh } = useMerchantLocale();
  const [profile, setProfile] = useState<Creator | null>(null);
  const [stats, setStats] = useState<AchievementStats>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [restaurantProfile, setRestaurantProfile] = useState<{ name?: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const [creatorData, statsData, campaignsList, restaurantData] = await Promise.all([
        getCreatorProfile(id),
        getCreatorAchievementStats(id),
        getCampaignsForRestaurant(userId),
        getRestaurantProfile(userId),
      ]);
      if (!creatorData) {
        setError(t.creatorNotFound);
        setLoading(false);
        return;
      }
      setProfile(creatorData);
      setStats(statsData);
      setCampaigns((campaignsList ?? []).filter((c) => isCampaignEligibleForInvite(c)));
      setRestaurantProfile(restaurantData ?? null);
    } catch (e) {
      console.error(e);
      setError(t.creatorLoadFailed ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id, t.creatorNotFound, t.creatorLoadFailed]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInvite = () => {
    setSelectedCampaignId('');
    setInviteModalOpen(true);
  };

  const handleSendInvite = async () => {
    if (!profile || !selectedCampaignId || !restaurantProfile) return;
    const campaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!campaign) return;
    setSending(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;
      const ok = await sendNotification({
        recipient_user_id: profile.id,
        sender_user_id: userId,
        type: 'invite_to_campaign',
        title: t.inviteFrom(restaurantProfile.name ?? ''),
        body: t.inviteBody(restaurantProfile.name ?? '', campaign.title),
      });
      if (ok) {
        setToast({ msg: t.inviteSent });
        setInviteModalOpen(false);
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

  const name = profile?.display_name ?? (profile as { name?: string })?.name ?? '';
  const handle = (profile as { handle?: string })?.handle ?? '';
  const avatarRaw = profile?.avatar_url ?? (profile as { avatar?: string })?.avatar ?? null;
  const avatar = isSafeImageUrl(avatarRaw) ? avatarRaw : null;
  const cityDisplay = (profile as { city_display?: string })?.city_display ?? profile?.city ?? '';
  const tags = (profile as { tags?: string[] })?.tags ?? [];
  const languages = (profile as { languages?: string[] })?.languages ?? [];
  const followers = profile?.followers_count ?? (profile as { followers?: number })?.followers ?? 0;
  const bio = (profile as { bio?: string })?.bio ?? '';

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">{t.loading ?? '加载中…'}</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-8">
        <p className="font-display font-bold text-hopon-red mb-4">{error ?? t.creatorNotFound}</p>
        <p className="text-sm text-black/60 mb-6">{t.creatorNotFoundMessage}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="h-12 px-6 border-2 border-black bg-white font-mono text-sm uppercase"
        >
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center border-b border-black/10 pb-8 mb-8">
        <div className="w-28 h-28 rounded-full border-2 border-black bg-hopon-grey overflow-hidden mx-auto mb-4 flex items-center justify-center">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-14 h-14 text-black/40" />
          )}
        </div>
        <h1 className="font-display font-bold text-2xl text-hopon-black">{name}</h1>
        {handle && (
          <p className="text-sm text-black/60 mt-1">
            {handle.startsWith('@') ? handle : `@${handle}`}
          </p>
        )}
        {cityDisplay && (
          <p className="text-sm text-black/60 mt-2">{cityDisplay}</p>
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {tags.slice(0, 5).map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 border border-black/20 rounded-full text-xs text-black/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {languages.length > 0 && (
          <p className="text-sm text-black/60 mt-2">
            {t.languages}: {languages.join(', ')}
          </p>
        )}
        {Number(followers) > 0 && (
          <p className="text-sm text-black/60 mt-2">
            {t.followers}: {Number(followers).toLocaleString()}
          </p>
        )}
        <button
          type="button"
          onClick={handleInvite}
          className="mt-6 h-12 px-8 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors"
        >
          {t.invite}
        </button>
      </div>

      {bio && (
        <section className="mb-8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-2">
            {t.about}
          </h2>
          <p className="text-sm text-black/80">{bio}</p>
        </section>
      )}

      {(profile?.socialAccounts?.length ?? 0) > 0 && (
        <section className="mb-8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
            {isZh ? '社交媒体' : 'Social Media'}
          </h2>
          <ul className="space-y-4">
            {profile!.socialAccounts!.map((acc) => {
              const platformLabel =
                acc.platform === 'xhs' ? (isZh ? '小红书' : 'Xiaohongshu')
                : acc.platform === 'douyin' ? (isZh ? '抖音' : 'Douyin')
                : acc.platform === 'instagram' ? 'Instagram'
                : acc.platform === 'tiktok' ? 'TikTok'
                : acc.platform;
              return (
                <li key={acc.id} className="border-2 border-black/20 p-4 rounded">
                  <p className="font-display font-bold text-hopon-black">{platformLabel}</p>
                  {acc.handle && (
                    <p className="text-sm text-black/70 mt-1">
                      {acc.handle.startsWith('@') ? acc.handle : `@${acc.handle}`}
                    </p>
                  )}
                  {acc.profileUrl && (
                    <a
                      href={acc.profileUrl.startsWith('http') ? acc.profileUrl : `https://${acc.profileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-hopon-red font-mono text-xs uppercase hover:underline"
                    >
                      {isZh ? '打开链接' : 'Open link'}
                    </a>
                  )}
                  {acc.followers != null && acc.followers > 0 && (
                    <p className="text-xs text-black/50 mt-1">
                      {t.followers}: {Number(acc.followers).toLocaleString()}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {stats && (
        <section className="mb-8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
            {t.achievements}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-black p-4 text-center">
              <p className="font-display font-bold text-xl text-hopon-black">{stats.collaborators}</p>
              <p className="text-xs text-black/60 uppercase tracking-wider">{t.collabsCount}</p>
            </div>
            <div className="border-2 border-black p-4 text-center">
              <p className="font-display font-bold text-xl text-hopon-black">{stats.deliverables}</p>
              <p className="text-xs text-black/60 uppercase tracking-wider">{t.completedCount}</p>
            </div>
          </div>
        </section>
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
              <p className="text-sm text-black/70 mb-4">{t.inviteCreatorTo(name)}</p>
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
                  onClick={() => setInviteModalOpen(false)}
                  className="flex-1 h-12 border-2 border-black bg-white text-hopon-black font-display font-bold text-sm uppercase tracking-wider"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={sending || !selectedCampaignId || campaigns.length === 0}
                  className="flex-1 h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  {sending ? '…' : t.sendBtn}
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            onClick={() => setInviteModalOpen(false)}
            aria-label="Close"
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
