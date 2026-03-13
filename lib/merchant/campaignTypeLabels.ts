/**
 * Audit §2.4: campaign type labels (Blanc lib/campaignTypeLabels).
 */

export type CampaignType = 'FREE_TASTING' | 'PAID_POST';

const LABEL: Record<CampaignType, { en: string; zh: string }> = {
  FREE_TASTING: { en: 'Experience', zh: '体验' },
  PAID_POST: { en: 'Paid', zh: '付费' },
};

export function getCampaignTypeLabel(type: CampaignType | string, isZh: boolean): string {
  if (type in LABEL) return LABEL[type as CampaignType][isZh ? 'zh' : 'en'];
  return String(type);
}

export function getCampaignTypeOptions(isZh: boolean): { label: string; value: CampaignType }[] {
  return [
    { label: LABEL.FREE_TASTING[isZh ? 'zh' : 'en'], value: 'FREE_TASTING' },
    { label: LABEL.PAID_POST[isZh ? 'zh' : 'en'], value: 'PAID_POST' },
  ];
}
