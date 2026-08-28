import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import {
  createCampaign,
  createCampaignDraft,
  getCampaignDraftById,
  getCurrentUserId,
  getRestaurantProfile,
  updateCampaignDraft,
  uploadImageFileToSupabase,
} from '../../lib/merchant/api';
import { getCampaignTypeOptions } from '../../lib/merchant/campaignTypeLabels';
import { getPlatformOptions, type CreatorSocialPlatform } from '../../lib/merchant/platformLabels';
import { hasMapboxToken } from '../../lib/merchant/mapboxAddress';
import type { CampaignDraft, CampaignVisitMode, Restaurant, StructuredAddress } from '../../lib/merchant/types';
import { AddressAutocomplete } from '../../components/merchant/AddressAutocomplete';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

const CAMPAIGN_PAYLOAD_KEY = 'campaign_payload_v1';

function normalizeBudget(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '$0';
  return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
}

function getBudgetRange(raw: string): { min: number; max: number } {
  const nums = (raw.match(/\d+/g) || []).map(Number).filter(Number.isFinite);
  if (nums.length === 0) return { min: 0, max: 0 };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
}

function getEndDateForPayload(startDate: string, endDate: string): string {
  if (endDate) return endDate;
  const base = startDate ? new Date(`${startDate}T00:00:00`) : new Date();
  base.setFullYear(base.getFullYear() + 1);
  return base.toISOString().slice(0, 10);
}

export const CampaignCreate: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId') || '';
  const isDraftMode = !!draftId;
  const { t, isZh } = useMerchantLocale();
  const typeOptions = getCampaignTypeOptions(isZh);
  const platformOptions = getPlatformOptions(isZh);
  const mapboxEnabled = hasMapboxToken();

  const [profile, setProfile] = useState<Restaurant | null>(null);
  const [loadedDraft, setLoadedDraft] = useState<CampaignDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [typeValue, setTypeValue] = useState<'FREE_TASTING' | 'PAID_POST'>('FREE_TASTING');
  const [visitMode, setVisitMode] = useState<CampaignVisitMode>('appointment');
  const [selectedPlatforms, setSelectedPlatforms] = useState<CreatorSocialPlatform[]>([]);
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<StructuredAddress | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [archivingDraft, setArchivingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useMemo(() => {
    const official = profile?.is_official === true || isOfficial;
    return isZh
      ? {
          title: isDraftMode ? '编辑草稿' : official ? '发布公告' : '创建活动',
          basicInfo: '基本信息',
          campaignTitle: '标题',
          titlePlaceholder: official ? '例如：平台新功能上线' : '例如：周末体验合作',
          description: '描述',
          descriptionPlaceholder: official ? '公告内容、说明' : '活动介绍、流程、注意事项',
          details: official ? '公告详情' : '活动详情',
          type: '类型',
          visitMode: '到店方式',
          appointment: '需要预约',
          appointmentHint: '博主需先确认到店时间，再进行签到。',
          walkIn: '直接 Walk-in',
          walkInHint: '无需预约；申请通过后，博主到店即可签到。',
          platforms: '平台',
          platformsHint: '选择活动面向的创作者平台（可多选）',
          budget: '预算',
          budgetPlaceholder: '$0 或 100-200',
          startDate: '开始日期',
          endDate: '结束日期',
          location: '地点',
          locationPlaceholder: '例如：123 Main St, New York, NY',
          locationInvalid: mapboxEnabled ? '请选择一个有效的街道地址' : '请填写活动地点',
          requirements: '要求',
          requirementPlaceholder: '例如：粉丝超过 1000',
          addRequirement: '添加',
          noRequirements: '还没有添加要求',
          images: '图片',
          addImage: '添加图片',
          create: official ? '发布公告' : '创建活动',
          saveDraft: '保存草稿',
          archiveDraft: '移除草稿',
          saving: '保存中…',
          submitting: '提交中…',
          archiving: '移除中…',
          validationTitle: '请填写标题',
          validationPlatform: '请至少选择一个平台',
          createFailed: '创建失败，请重试',
          draftSaved: '草稿已保存',
          draftFailed: '草稿保存失败',
          archived: '草稿已移除',
          archiveFailed: '移除失败',
          publishDraft: '发布草稿为活动',
        }
      : {
          title: isDraftMode ? 'Edit Draft' : official ? 'Post Announcement' : 'Create Campaign',
          basicInfo: 'Basic Information',
          campaignTitle: 'Title',
          titlePlaceholder: official ? 'e.g., New platform feature' : 'e.g., Weekend Experience Collaboration',
          description: 'Description',
          descriptionPlaceholder: official ? 'Announcement content' : 'Campaign introduction, process, notes',
          details: official ? 'Announcement Details' : 'Campaign Details',
          type: 'Type',
          visitMode: 'Visit flow',
          appointment: 'Appointment required',
          appointmentHint: 'The creator confirms a visit time before check-in.',
          walkIn: 'Walk-in',
          walkInHint: 'No appointment; accepted creators can check in when they arrive.',
          platforms: 'Platforms',
          platformsHint: 'Select platforms for this campaign (multi-select)',
          budget: 'Budget',
          budgetPlaceholder: '$0 or 100-200',
          startDate: 'Start Date',
          endDate: 'End Date',
          location: 'Location',
          locationPlaceholder: 'e.g., 123 Main St, New York, NY',
          locationInvalid: mapboxEnabled ? 'Please select a valid street address' : 'Please enter a campaign location',
          requirements: 'Requirements',
          requirementPlaceholder: 'e.g., 1,000+ followers',
          addRequirement: 'Add',
          noRequirements: 'No requirements added yet',
          images: 'Images',
          addImage: 'Add Image',
          create: official ? 'Post Announcement' : 'Create Campaign',
          saveDraft: 'Save Draft',
          archiveDraft: 'Remove Draft',
          saving: 'Saving…',
          submitting: 'Submitting…',
          archiving: 'Removing…',
          validationTitle: 'Please enter a title',
          validationPlatform: 'Please select at least one platform',
          createFailed: 'Failed to create. Please try again.',
          draftSaved: 'Draft saved',
          draftFailed: 'Failed to save draft',
          archived: 'Draft removed',
          archiveFailed: 'Failed to remove draft',
          publishDraft: 'Publish Draft as Campaign',
        };
  }, [isDraftMode, isOfficial, isZh, mapboxEnabled, profile?.is_official]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const userId = await getCurrentUserId();
      if (!userId) {
        setLoading(false);
        return;
      }
      const restaurant = await getRestaurantProfile(userId);
      if (cancelled) return;
      setProfile(restaurant ?? null);

      if (draftId) {
        const draft = await getCampaignDraftById(draftId, userId);
        if (cancelled) return;
        setLoadedDraft(draft);
        const brief = (draft?.creator_brief || {}) as Record<string, unknown>;
        const payload = brief[CAMPAIGN_PAYLOAD_KEY] as
          | Record<string, unknown>
          | undefined;
        const inferredPlatforms = Array.isArray(brief.platforms)
          ? (brief.platforms as CreatorSocialPlatform[])
          : typeof brief.platform === 'string'
            ? ([brief.platform] as CreatorSocialPlatform[])
            : [];
        const inferredRequirements = Array.isArray(brief.requirements) ? (brief.requirements as string[]) : [];
        setTitle(draft?.title || (payload?.title as string) || '');
        setDescription((payload?.description as string) || draft?.overview || '');
        if (payload?.type === 'PAID_POST' || payload?.type === 'FREE_TASTING') setTypeValue(payload.type);
        setVisitMode(payload?.visitMode === 'walk_in' ? 'walk_in' : 'appointment');
        setSelectedPlatforms(Array.isArray(payload?.platforms) ? (payload.platforms as CreatorSocialPlatform[]) : inferredPlatforms.filter((p) => ['xhs', 'douyin', 'instagram', 'tiktok'].includes(p)));
        setBudget((payload?.budget as string) || (draft?.suggested_budget_min || draft?.suggested_budget_max ? `${draft.suggested_budget_min ?? 0}-${draft.suggested_budget_max ?? 0}` : ''));
        setStartDate((payload?.startDate as string) || '');
        setEndDate((payload?.endDate as string) || '');
        setLocation((payload?.location as string) || '');
        setSelectedAddress((payload?.selectedAddress as StructuredAddress) || null);
        setRequirements(Array.isArray(payload?.requirements) ? (payload.requirements as string[]) : inferredRequirements);
        setImages(Array.isArray(payload?.images) ? (payload.images as string[]) : []);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [draftId]);

  const buildDraftCreatorBrief = (existing?: Record<string, unknown> | null) => ({
    ...(existing || {}),
    [CAMPAIGN_PAYLOAD_KEY]: {
      title: title.trim(),
      description: description.trim(),
      type: typeValue,
      visitMode,
      budget: budget.trim(),
      startDate,
      endDate,
      location: location.trim(),
      selectedAddress,
      requirements,
      images,
      platforms: selectedPlatforms,
    },
  });

  const addRequirement = () => {
    const next = requirementInput.trim();
    if (!next) return;
    setRequirements((prev) => [...prev, next]);
    setRequirementInput('');
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !profile) return;
    setUploadingImages(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files).slice(0, 8 - images.length)) {
      if (!file.type.startsWith('image/')) continue;
      const url = await uploadImageFileToSupabase(file, 'campaigns', profile.id);
      if (url) uploaded.push(url);
    }
    setImages((prev) => [...prev, ...uploaded].slice(0, 8));
    setUploadingImages(false);
  };

  const validateBase = () => {
    if (!title.trim()) return copy.validationTitle;
    if (selectedPlatforms.length === 0) return copy.validationPlatform;
    if (!location.trim()) return copy.locationInvalid;
    if (mapboxEnabled && (!selectedAddress || selectedAddress.formatted_address.trim() !== location.trim())) return copy.locationInvalid;
    return null;
  };

  const handleSaveDraft = async () => {
    if (!title.trim() || !profile) {
      setError(copy.validationTitle);
      return;
    }
    setError(null);
    setSavingDraft(true);
    const range = getBudgetRange(budget.trim());
    const goal = selectedPlatforms.length ? `Launch on ${selectedPlatforms.join(', ')}` : isZh ? '生成可发布活动草稿' : 'Prepare a publish-ready campaign draft';
    const payload = {
      title: title.trim(),
      goal,
      overview: description.trim(),
      target_audience: '',
      creator_brief: buildDraftCreatorBrief(loadedDraft?.creator_brief),
      suggested_budget_min: range.min,
      suggested_budget_max: range.max,
      status: 'draft',
    };
    const saved = isDraftMode
      ? await updateCampaignDraft(draftId, profile.id, payload)
      : await createCampaignDraft({ restaurant_id: profile.id, source: 'campaign_create', ...payload });
    setSavingDraft(false);
    if (saved) {
      navigate('/merchant/growth', { replace: true });
    } else {
      setError(copy.draftFailed);
    }
  };

  const handleArchiveDraft = async () => {
    if (!profile || !draftId) return;
    setArchivingDraft(true);
    const saved = await updateCampaignDraft(draftId, profile.id, { status: 'archived' });
    setArchivingDraft(false);
    if (saved) navigate('/merchant/growth', { replace: true });
    else setError(copy.archiveFailed);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateBase();
    if (validation) {
      setError(validation);
      setLocationError(validation === copy.locationInvalid ? validation : null);
      return;
    }
    if (!profile) return;

    setError(null);
    setLocationError(null);
    setSubmitting(true);
    const campaign = await createCampaign({
      restaurant_id: profile.id,
      title: title.trim(),
      description: description.trim(),
      type: typeValue,
      visitMode,
      budget: normalizeBudget(budget),
      start_date: startDate || undefined,
      end_date: getEndDateForPayload(startDate, endDate),
      location: selectedAddress?.formatted_address || location.trim(),
      formattedAddress: selectedAddress?.formatted_address || location.trim(),
      streetAddress: selectedAddress?.street_address,
      city: selectedAddress?.city,
      state: selectedAddress?.state,
      zipCode: selectedAddress?.zip_code,
      country: selectedAddress?.country,
      latitude: selectedAddress?.latitude,
      longitude: selectedAddress?.longitude,
      mapboxId: selectedAddress?.mapbox_id,
      requirements,
      images,
      platforms: selectedPlatforms,
      status: 'OPEN',
      is_official: isOfficial,
    });

    if (campaign && isDraftMode) {
      await updateCampaignDraft(draftId, profile.id, {
        status: 'published',
        title: title.trim(),
        overview: description.trim(),
        creator_brief: buildDraftCreatorBrief(loadedDraft?.creator_brief),
      });
    }

    setSubmitting(false);
    if (campaign) navigate(`/merchant/campaign/${campaign.id}`, { replace: true });
    else setError(copy.createFailed);
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

  return (
    <div className="py-8 max-w-3xl">
      <Link to="/merchant/campaigns" className="font-mono text-sm uppercase text-black/60 hover:text-hopon-red">
        ← {t.back}
      </Link>
      <h1 className="mt-6 mb-8 font-display text-2xl font-bold uppercase tracking-tight text-hopon-black">
        {copy.title}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section>
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-black/70">{copy.basicInfo}</h2>
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.campaignTitle} *</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={copy.titlePlaceholder}
                className="h-12 w-full border-2 border-black bg-white px-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.description}</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={copy.descriptionPlaceholder}
                rows={5}
                className="w-full resize-y border-2 border-black bg-white px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-black/10 pt-8">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-black/70">{copy.details}</h2>
          <div className="grid gap-5">
            <div>
              <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.type}</span>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTypeValue(option.value)}
                    className={`border-2 px-4 py-2 font-mono text-sm uppercase ${
                      typeValue === option.value ? 'border-black bg-hopon-black text-white' : 'border-black/30 text-black/70 hover:border-black'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {!isOfficial ? (
              <div>
                <span className="mb-2 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.visitMode}</span>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'appointment' as const, label: copy.appointment },
                    { value: 'walk_in' as const, label: copy.walkIn },
                  ]).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setVisitMode(option.value)}
                      className={`border-2 px-4 py-2 font-mono text-sm uppercase ${
                        visitMode === option.value ? 'border-black bg-hopon-black text-white' : 'border-black/30 text-black/70 hover:border-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-black/50">
                  {visitMode === 'walk_in' ? copy.walkInHint : copy.appointmentHint}
                </p>
              </div>
            ) : null}

            <div>
              <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.platforms} *</span>
              <p className="mb-2 text-xs text-black/50">{copy.platformsHint}</p>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((option) => {
                  const active = selectedPlatforms.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPlatforms((prev) => (active ? prev.filter((p) => p !== option.value) : [...prev, option.value]))}
                      className={`border-2 px-4 py-2 font-mono text-sm uppercase ${
                        active ? 'border-black bg-hopon-black text-white' : 'border-black/30 text-black/70 hover:border-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.budget}</span>
              <input
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder={copy.budgetPlaceholder}
                className="h-12 w-full border-2 border-black bg-white px-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.startDate}</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="h-12 w-full border-2 border-black bg-white px-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hopon-red"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.endDate}</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="h-12 w-full border-2 border-black bg-white px-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hopon-red"
                />
              </label>
            </div>

            <div>
              <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.location} *</span>
              <AddressAutocomplete
                value={location}
                selectedAddress={selectedAddress}
                onChange={(value) => {
                  setLocation(value);
                  if (locationError) setLocationError(null);
                }}
                onSelectAddress={setSelectedAddress}
                placeholder={copy.locationPlaceholder}
                isZh={isZh}
                error={locationError}
              />
            </div>

            <div>
              <span className="mb-1 block font-mono text-xs uppercase tracking-wider text-black/70">{copy.requirements}</span>
              <div className="flex gap-2">
                <input
                  value={requirementInput}
                  onChange={(event) => setRequirementInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addRequirement();
                    }
                  }}
                  placeholder={copy.requirementPlaceholder}
                  className="h-12 min-w-0 flex-1 border-2 border-black bg-white px-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-hopon-red"
                />
                <button type="button" onClick={addRequirement} className="flex h-12 items-center gap-2 border-2 border-black bg-white px-4 font-mono text-xs uppercase hover:bg-hopon-grey">
                  <Plus className="h-4 w-4" />
                  {copy.addRequirement}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {requirements.length === 0 ? (
                  <p className="text-xs text-black/45">{copy.noRequirements}</p>
                ) : (
                  requirements.map((item, index) => (
                    <button
                      key={`${item}-${index}`}
                      type="button"
                      onClick={() => setRequirements((prev) => prev.filter((_, i) => i !== index))}
                      className="inline-flex items-center gap-2 border border-black/20 bg-white px-3 py-1.5 text-xs text-black/70 hover:border-hopon-red"
                    >
                      {item}
                      <X className="h-3 w-3" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-black/10 pt-8">
          <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-black/70">{copy.images}</h2>
          {images.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {images.map((url) => (
                <div key={url} className="relative aspect-square border border-black/20 bg-hopon-grey">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((item) => item !== url))}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center border border-black bg-white"
                    aria-label={isZh ? '删除图片' : 'Remove image'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex h-12 cursor-pointer items-center justify-center gap-2 border-2 border-dashed border-black/40 bg-white font-mono text-xs uppercase text-black/70 hover:border-black">
            <Plus className="h-4 w-4" />
            {uploadingImages ? (isZh ? '上传中…' : 'Uploading…') : copy.addImage}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingImages}
              className="hidden"
              onChange={(event) => {
                void handleImageUpload(event.target.files);
                event.currentTarget.value = '';
              }}
            />
          </label>
        </section>

        {profile.is_official === true && (
          <label className="flex items-center gap-2">
            <input id="official" type="checkbox" checked={isOfficial} onChange={(event) => setIsOfficial(event.target.checked)} className="h-4 w-4 border-2 border-black" />
            <span className="font-mono text-sm uppercase">{isZh ? '作为官方公告发布' : 'Post as official announcement'}</span>
          </label>
        )}

        {error && <p className="text-sm text-hopon-red">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-3">
          {isDraftMode && (
            <button
              type="button"
              onClick={handleArchiveDraft}
              disabled={archivingDraft || savingDraft || submitting}
              className="h-12 border-2 border-black bg-white font-display text-sm font-bold uppercase tracking-wider text-hopon-black hover:bg-hopon-grey disabled:opacity-50"
            >
              {archivingDraft ? copy.archiving : copy.archiveDraft}
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={archivingDraft || savingDraft || submitting}
            className="h-12 border-2 border-black bg-white font-display text-sm font-bold uppercase tracking-wider text-hopon-black hover:bg-hopon-grey disabled:opacity-50"
          >
            {savingDraft ? copy.saving : copy.saveDraft}
          </button>
          <button
            type="submit"
            disabled={archivingDraft || savingDraft || submitting}
            className="h-12 border-2 border-black bg-hopon-black font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-hopon-red disabled:opacity-50"
          >
            {submitting ? copy.submitting : isDraftMode ? copy.publishDraft : copy.create}
          </button>
        </div>
      </form>
    </div>
  );
};
