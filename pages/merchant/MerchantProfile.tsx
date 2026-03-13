import React, { useEffect, useState } from 'react';
import { User, Settings } from 'lucide-react';
import { getCurrentUserId, getRestaurantProfile, updateRestaurantProfile, signOut } from '../../lib/merchant/api';
import type { Restaurant } from '../../lib/merchant/types';
import { SettingsSheet } from '../../components/merchant/SettingsSheet';
import { isSafeImageUrl } from '../../lib/safeImageUrl';

const copy = {
  title: '商家资料',
  edit: '编辑',
  cancel: '取消',
  save: '保存',
  basicInfo: '基本信息',
  name: '商家名称',
  location: '位置',
  locationPlaceholder: '例如：SoHo / Midtown / Williamsburg',
  description: '简介',
  descriptionPlaceholder: '关于你的商家...',
  restaurantImage: '商家图片',
  noImages: '暂无图片',
  categories: '标签',
  mainCategory: '主营类别',
  cuisineTags: '特色标签 (逗号分隔)',
  cuisineTagsPlaceholder: '例如: 辣, 点心',
  internal: '内部信息',
  contactMethod: '方式',
  contactWechat: '微信',
  contactPhone: '电话',
  contactValue: '联系方式',
  contactValuePlaceholder: 'WeChat ID 或手机号',
  socialMedia: '社交媒体',
  instagramHandle: 'Instagram',
  xhsHandle: '小红书账号',
  xhsUrl: '小红书链接',
  douyinHandle: '抖音',
  tiktokHandle: 'TikTok',
  notes: '备注',
  notesPlaceholder: '内部备注...',
  noName: '未设置名称',
  noLocation: '未设置',
  saved: '已保存',
};

export const MerchantProfile: React.FC = () => {
  const [profile, setProfile] = useState<Restaurant | null>(null);
  const [originalProfile, setOriginalProfile] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isZh, setIsZh] = useState(true);

  const loadData = async () => {
    const id = await getCurrentUserId();
    if (!id) {
      setLoading(false);
      return;
    }
    const p = await getRestaurantProfile(id);
    setProfile(p ?? null);
    setOriginalProfile(p ? { ...p } : null);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(false), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const updated = await updateRestaurantProfile(profile.id, {
      name: profile.name ?? '',
      location: profile.location ?? undefined,
      description: profile.description ?? undefined,
      category: profile.category ?? undefined,
      cuisineTags: profile.cuisineTags ?? undefined,
      contactType: profile.contactType ?? undefined,
      contactValue: profile.contactValue ?? profile.contact ?? undefined,
      instagramHandle: profile.instagramHandle ?? undefined,
      xhsHandle: profile.xhsHandle ?? undefined,
      xhsUrl: profile.xhsUrl ?? undefined,
      douyinHandle: profile.douyinHandle ?? undefined,
      tiktokHandle: profile.tiktokHandle ?? undefined,
      notes: profile.notes ?? undefined,
    });
    setSaving(false);
    if (updated) {
      setProfile(updated);
      setOriginalProfile({ ...updated });
      setToast(true);
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile({ ...originalProfile });
    }
    setIsEditMode(false);
  };

  const handleLogout = () => {
    signOut();
    window.location.href = '/merchant/login';
  };

  const handleDeleteAccount = () => {
    if (window.confirm('确定要删除账号吗？此操作不可恢复。')) {
      if (window.confirm('最终确认：确定要继续吗？')) {
        // TODO: call delete-account edge function
        signOut();
        window.location.href = '/merchant/login';
      }
    }
  };

  const renderField = (
    label: string,
    value: string,
    onChange?: (v: string) => void,
    opts?: { placeholder?: string; multiline?: boolean }
  ) => {
    const v = value ?? '';
    if (isEditMode && onChange) {
      if (opts?.multiline) {
        return (
          <div className="mb-4">
            <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{label}</label>
            <textarea
              value={v}
              onChange={(e) => onChange(e.target.value)}
              placeholder={opts.placeholder}
              rows={3}
              className="w-full border-2 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red resize-y"
            />
          </div>
        );
      }
      return (
        <div className="mb-4">
          <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{label}</label>
          <input
            type="text"
            value={v}
            onChange={(e) => onChange(e.target.value)}
            placeholder={opts.placeholder}
            className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
          />
        </div>
      );
    }
    return (
      <div className="mb-4">
        <label className="block font-mono text-xs uppercase tracking-wider text-black/60 mb-1">{label}</label>
        <p className="font-mono text-sm text-hopon-black">{v || (opts?.placeholder ? '—' : '')}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">加载中…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/80">未找到商家资料。</p>
      </div>
    );
  }

  const avatarUrlRaw = profile.avatar ?? profile.avatar_url ?? null;
  const avatarUrl = isSafeImageUrl(avatarUrlRaw) ? avatarUrlRaw : null;
  const gallery = (profile.images ?? profile.gallery ?? []).filter((url: string) => isSafeImageUrl(url));

  return (
    <div className="py-8 max-w-xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black">
          {copy.title}
        </h1>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="p-2 border-2 border-black rounded hover:bg-hopon-grey transition-colors"
          aria-label="设置"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Avatar + name + location */}
      <div className="text-center pb-8 mb-8 border-b border-black/10">
        <div className="inline-flex w-24 h-24 rounded-full border-2 border-black bg-hopon-grey overflow-hidden justify-center items-center mb-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-black/40" />
          )}
        </div>
        <p className="font-display font-bold text-lg text-hopon-black">{profile.name || copy.noName}</p>
        <p className="text-sm text-black/60">{profile.location || ''}</p>
      </div>

      {/* 基本信息 */}
      <section className="mb-10">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {copy.basicInfo}
        </h2>
        {renderField(copy.name, profile.name ?? '', (t) => setProfile({ ...profile, name: t }))}
        {renderField(
          copy.location,
          profile.location ?? '',
          (t) => setProfile({ ...profile, location: t }),
          { placeholder: copy.locationPlaceholder }
        )}
        {renderField(
          copy.description,
          profile.description ?? '',
          (t) => setProfile({ ...profile, description: t }),
          { placeholder: copy.descriptionPlaceholder, multiline: true }
        )}
        <div className="mb-2">
          <span className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">
            {copy.restaurantImage}
          </span>
        </div>
        {gallery.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {gallery.map((url, i) => (
              <div key={i} className="shrink-0 w-40 h-28 rounded border border-black/20 overflow-hidden bg-hopon-grey">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 rounded border-2 border-dashed border-black/20 flex items-center justify-center mb-4 text-black/50 text-sm">
            {copy.noImages}
          </div>
        )}
      </section>

      {/* 标签 */}
      <section className="mb-10">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {copy.categories}
        </h2>
        {renderField(copy.mainCategory, profile.category ?? '', (t) => setProfile({ ...profile, category: t }))}
        {renderField(
          copy.cuisineTags,
          (profile.cuisineTags ?? []).join(', '),
          (t) => setProfile({ ...profile, cuisineTags: t.split(',').map((s) => s.trim()).filter(Boolean) }),
          { placeholder: copy.cuisineTagsPlaceholder }
        )}
      </section>

      {/* 内部信息 */}
      <section className="mb-10">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {copy.internal}
        </h2>
        {isEditMode ? (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setProfile({ ...profile, contactType: 'wechat' })}
              className={`px-4 py-2 rounded-full border-2 font-mono text-xs uppercase ${
                (profile.contactType ?? 'wechat') === 'wechat'
                  ? 'bg-hopon-black text-white border-black'
                  : 'border-black/30 text-black/70 hover:border-black'
              }`}
            >
              {copy.contactWechat}
            </button>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, contactType: 'phone' })}
              className={`px-4 py-2 rounded-full border-2 font-mono text-xs uppercase ${
                profile.contactType === 'phone'
                  ? 'bg-hopon-black text-white border-black'
                  : 'border-black/30 text-black/70 hover:border-black'
              }`}
            >
              {copy.contactPhone}
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block font-mono text-xs uppercase tracking-wider text-black/60 mb-1">
              {copy.contactMethod}
            </label>
            <p className="font-mono text-sm text-hopon-black">
              {profile.contactType === 'phone' ? copy.contactPhone : copy.contactWechat}
            </p>
          </div>
        )}
        {renderField(
          copy.contactValue,
          profile.contactValue ?? profile.contactWeChat ?? profile.contact ?? '',
          (t) => setProfile({ ...profile, contactValue: t }),
          { placeholder: copy.contactValuePlaceholder }
        )}
        <p className="font-mono text-xs uppercase tracking-wider text-black/50 mt-4 mb-2">{copy.socialMedia}</p>
        {renderField(copy.instagramHandle, profile.instagramHandle ?? '', (t) => setProfile({ ...profile, instagramHandle: t }), { placeholder: '@instagram_handle' })}
        {renderField(copy.xhsHandle, profile.xhsHandle ?? '', (t) => setProfile({ ...profile, xhsHandle: t }))}
        {renderField(copy.xhsUrl, profile.xhsUrl ?? '', (t) => setProfile({ ...profile, xhsUrl: t }), { placeholder: 'https://...' })}
        {renderField(copy.douyinHandle, profile.douyinHandle ?? '', (t) => setProfile({ ...profile, douyinHandle: t }), { placeholder: '@douyin_handle' })}
        {renderField(copy.tiktokHandle, profile.tiktokHandle ?? '', (t) => setProfile({ ...profile, tiktokHandle: t }), { placeholder: '@tiktok_handle' })}
        {renderField(
          copy.notes,
          profile.notes ?? '',
          (t) => setProfile({ ...profile, notes: t }),
          { placeholder: copy.notesPlaceholder, multiline: true }
        )}
      </section>

      {isEditMode && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 h-12 border-2 border-black bg-white text-hopon-black font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-grey transition-colors"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors disabled:opacity-50"
          >
            {saving ? '保存中…' : copy.save}
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-hopon-black text-white font-mono text-sm rounded shadow-lg">
          {copy.saved}
        </div>
      )}

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onEditProfile={() => {
          setIsEditMode(true);
          setSettingsOpen(false);
        }}
        onToggleLanguage={() => setIsZh((z) => !z)}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        isZh={isZh}
      />
    </div>
  );
};
