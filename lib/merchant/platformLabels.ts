/**
 * Audit §2.4: platform options for campaign create (Blanc getPlatformOptions).
 */

export type CreatorSocialPlatform = 'xhs' | 'douyin' | 'instagram' | 'tiktok';

const PLATFORM_LABEL: Record<CreatorSocialPlatform, { en: string; zh: string }> = {
  xhs: { en: 'Xiaohongshu', zh: '小红书' },
  douyin: { en: 'Douyin', zh: '抖音' },
  instagram: { en: 'Instagram', zh: 'Instagram' },
  tiktok: { en: 'TikTok', zh: 'TikTok' },
};

export const PLATFORM_ORDER: CreatorSocialPlatform[] = ['xhs', 'douyin', 'instagram', 'tiktok'];

export function getPlatformOptions(isZh: boolean): { label: string; value: CreatorSocialPlatform }[] {
  return PLATFORM_ORDER.map((value) => ({
    label: PLATFORM_LABEL[value][isZh ? 'zh' : 'en'],
    value,
  }));
}
