/**
 * Audit §1 campaign/create.tsx, §3 official copy, §4 validation, §2.1 createCampaign.
 * Match app: basicInfo (title, description), details (type, platforms, budget, dates, location, requirements), images.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentUserId, getRestaurantProfile, createCampaign } from '../../lib/merchant/api';
import { COPY_ZH, COPY_EN } from '../../lib/merchant/constants';
import { getCampaignTypeOptions } from '../../lib/merchant/campaignTypeLabels';
import { getPlatformOptions } from '../../lib/merchant/platformLabels';
import type { CreatorSocialPlatform } from '../../lib/merchant/platformLabels';
import type { Restaurant } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

function validateCampaignCreate(p: { title: string; selectedPlatforms: unknown[] }): { ok: boolean; error?: string } {
  if (!p.title.trim()) return { ok: false, error: 'fillTitle' };
  if (p.selectedPlatforms.length === 0) return { ok: false, error: 'selectAtLeastOnePlatform' };
  return { ok: true };
}

export const CampaignCreate: React.FC = () => {
  const navigate = useNavigate();
  const { t, isZh } = useMerchantLocale();
  const [profile, setProfile] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeValue, setTypeValue] = useState<'FREE_TASTING' | 'PAID_POST'>('FREE_TASTING');
  const [selectedPlatforms, setSelectedPlatforms] = useState<CreatorSocialPlatform[]>([]);
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [requirementsStr, setRequirementsStr] = useState('');
  const [isOfficial, setIsOfficial] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOfficialProfile = profile?.is_official === true;
  const copy = (isZh ? COPY_ZH : COPY_EN)[isOfficial ? 'official' : 'normal'];
  const TYPE_OPTIONS = getCampaignTypeOptions(isZh);
  const PLATFORM_OPTIONS = getPlatformOptions(isZh);

  useEffect(() => {
    getCurrentUserId().then((id) => {
      if (!id) {
        setLoading(false);
        return;
      }
      getRestaurantProfile(id).then((p) => {
        setProfile(p ?? null);
        if (p?.location?.trim()) setLocation((prev) => prev || p.location!.trim());
      }).finally(() => setLoading(false));
    });
  }, []);

  const getEndDateForPayload = (): string => {
    if (endDate) return endDate;
    if (startDate) {
      const parts = startDate.split('-').map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        d.setFullYear(d.getFullYear() + 1);
        return d.toISOString().split('T')[0];
      }
    }
    const now = new Date();
    now.setFullYear(now.getFullYear() + 1);
    return now.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCampaignCreate({ title, selectedPlatforms });
    if (!validation.ok) {
      const key = validation.error;
      setError(key === 'fillTitle' ? (isZh ? '请填写标题' : 'Please enter a title')
        : key === 'selectAtLeastOnePlatform' ? (isZh ? '请至少选择一个平台' : 'Please select at least one platform')
        : (isZh ? '请检查输入' : 'Please check your input'));
      return;
    }
    if (!profile) return;
    setError(null);
    setSubmitLoading(true);
    let budgetVal = (budget || '').trim();
    if (budgetVal && !budgetVal.startsWith('$')) budgetVal = '$' + budgetVal;
    const campaign = await createCampaign({
      restaurant_id: profile.id,
      title: title.trim(),
      description: description.trim() || undefined,
      type: typeValue,
      budget: budgetVal || '$0',
      start_date: startDate || undefined,
      end_date: getEndDateForPayload(),
      location: location.trim() || undefined,
      requirements: requirementsStr.split(',').map((s) => s.trim()).filter(Boolean),
      images: [],
      platforms: selectedPlatforms,
      status: 'OPEN',
      is_official: isOfficial,
    });
    setSubmitLoading(false);
    if (campaign) {
      navigate(`/merchant/campaign/${campaign.id}`, { replace: true });
    } else {
      setError(isZh ? '创建失败，请重试' : 'Failed to create. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">{t.loading}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/80">{isZh ? '未找到商家信息。' : 'Restaurant profile not found.'}</p>
      </div>
    );
  }

  const copyCreate = isZh
    ? (isOfficial ? '发布公告' : '创建活动')
    : (isOfficial ? 'Post Announcement' : 'Create Campaign');
  const copyBasicInfo = isZh ? '基本信息' : 'Basic Information';
  const copyTitleLabel = isZh ? '标题' : 'Title';
  const copyTitlePlaceholder = isOfficial ? (isZh ? '例如：平台新功能上线' : 'e.g., New platform feature') : (isZh ? '例如：周末体验合作' : 'e.g., Weekend Experience Collaboration');
  const copyDescLabel = isZh ? '描述' : 'Description';
  const copyDescPlaceholder = isOfficial ? (isZh ? '公告内容、说明' : 'Announcement content') : (isZh ? '活动介绍、流程、注意事项' : 'Campaign introduction, process, notes');
  const copyDetails = isOfficial ? (isZh ? '公告详情' : 'Announcement Details') : (isZh ? '活动详情' : 'Campaign Details');
  const copyType = isZh ? '类型' : 'Type';
  const copyBudget = isZh ? '预算' : 'Budget';
  const copyBudgetPlaceholder = isZh ? '$0 或 100-200' : '$0 or 100-200';
  const copyStartDate = isZh ? '开始日期' : 'Start Date';
  const copyEndDate = isZh ? '结束日期' : 'End Date';
  const copySelectDate = isZh ? '选择日期' : 'Select Date';
  const copyLocation = isZh ? '地点' : 'Location';
  const copyLocationPlaceholder = isZh ? '例如：SoHo / Midtown / Williamsburg' : 'e.g., SoHo, Midtown, Williamsburg';
  const copyRequirements = isZh ? '要求' : 'Requirements';
  const copyRequirementsPlaceholder = isZh ? '例如：粉丝>1000, 本地, 美食博主' : 'e.g., Followers>1000, Local, Food Blogger';
  const copyPlatforms = isZh ? '平台' : 'Platforms';
  const copyPlatformsHint = isZh ? '选择活动面向的创作者平台（可多选）' : 'Select platforms for this campaign (multi-select)';

  return (
    <div className="py-8 max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/merchant" className="font-mono text-sm uppercase text-black/60 hover:text-hopon-red">
          ← {t.back}
        </Link>
      </div>
      <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-8">
        {copyCreate}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
            {copyBasicInfo}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyTitleLabel} *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={copyTitlePlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyDescLabel}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={copyDescPlaceholder}
                rows={4}
                className="w-full border-2 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red resize-y"
              />
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 pt-8">
          <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
            {copyDetails}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-2">{copyType}</label>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTypeValue(opt.value)}
                    className={`px-4 py-2 border-2 font-mono text-sm uppercase transition-colors ${
                      typeValue === opt.value ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70 hover:border-black'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyPlatforms} *</label>
              <p className="text-xs text-black/50 mb-2">{copyPlatformsHint}</p>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_OPTIONS.map((opt) => {
                  const on = selectedPlatforms.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedPlatforms((prev) => on ? prev.filter((p) => p !== opt.value) : [...prev, opt.value])}
                      className={`px-4 py-2 border-2 font-mono text-sm uppercase transition-colors ${
                        on ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70 hover:border-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyBudget}</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={copyBudgetPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyStartDate}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyEndDate}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyLocation}</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={copyLocationPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copyRequirements}</label>
              <input
                type="text"
                value={requirementsStr}
                onChange={(e) => setRequirementsStr(e.target.value)}
                placeholder={copyRequirementsPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
          </div>
        </section>

        {isOfficialProfile && (
          <div className="flex items-center gap-2">
            <input
              id="official"
              type="checkbox"
              checked={isOfficial}
              onChange={(e) => setIsOfficial(e.target.checked)}
              className="w-4 h-4 border-2 border-black"
            />
            <label htmlFor="official" className="font-mono text-sm uppercase">
              {isZh ? '作为官方公告发布' : 'Post as official announcement'}
            </label>
          </div>
        )}

        {error && <p className="text-sm text-hopon-red">{error}</p>}
        <button
          type="submit"
          disabled={submitLoading}
          className="w-full h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors disabled:opacity-50"
        >
          {submitLoading ? (isZh ? '提交中…' : 'Submitting…') : copyCreate}
        </button>
      </form>
    </div>
  );
};
