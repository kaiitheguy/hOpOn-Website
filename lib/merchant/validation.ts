/**
 * Merchant validation helpers (campaign create, etc.).
 */

export function validateCampaignCreate(payload: {
  title: string;
  selectedPlatforms: string[];
}): { ok: boolean; error?: string } {
  if (!payload.title?.trim()) {
    return { ok: false, error: '标题不能为空' };
  }
  if (!Array.isArray(payload.selectedPlatforms) || payload.selectedPlatforms.length === 0) {
    return { ok: false, error: '请至少选择一个平台' };
  }
  return { ok: true };
}
