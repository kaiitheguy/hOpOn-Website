/**
 * Merchant constants: status enums, review tab filters, official vs campaign copy.
 * Portable from Blanc app; used by merchant web.
 */

import type { Application } from './types';

export const CAMPAIGN_STATUS = {
  OPEN: 'OPEN' as const,
  CLOSED: 'CLOSED' as const,
};

export const APPLICATION_STATUS = {
  PENDING: 'PENDING' as const,
  ACCEPTED: 'ACCEPTED' as const,
  REJECTED: 'REJECTED' as const,
};

export const DELIVERABLE_STATUS = {
  SUBMITTED: 'SUBMITTED' as const,
  APPROVED: 'APPROVED' as const,
  REVISION_REQUESTED: 'REVISION_REQUESTED' as const,
};

export const DRAFT_POST_STATUS = {
  SUBMITTED: 'SUBMITTED' as const,
  APPROVED: 'APPROVED' as const,
  REVISION_REQUESTED: 'REVISION_REQUESTED' as const,
};

/** Copy keys for official (公告) vs normal (活动) — zh */
export const COPY_ZH = {
  official: {
    homeSectionTitle: '我的公告',
    createButton: '发布公告',
    homeEmpty: '暂无公告，点击发布第一条公告',
    campaignDetailTitle: '公告详情',
    campaignDetailSection: '公告信息',
    badgeLabel: '公告',
    cardCta: '查看',
  },
  normal: {
    homeSectionTitle: '我的活动',
    createButton: '创建活动',
    homeEmpty: '暂无活动，点击创建第一个活动',
    campaignDetailTitle: '活动详情',
    campaignDetailSection: '活动信息',
    badgeLabel: '活动',
    cardCta: '查看',
  },
};

/** Copy keys for official vs normal — en */
export const COPY_EN = {
  official: {
    homeSectionTitle: 'My announcements',
    createButton: 'Post announcement',
    homeEmpty: 'No announcements yet. Post your first.',
    campaignDetailTitle: 'Announcement details',
    campaignDetailSection: 'Announcement info',
    badgeLabel: 'Announcement',
    cardCta: 'View',
  },
  normal: {
    homeSectionTitle: 'My campaigns',
    createButton: 'Create campaign',
    homeEmpty: 'No campaigns yet. Create your first.',
    campaignDetailTitle: 'Campaign details',
    campaignDetailSection: 'Campaign info',
    badgeLabel: 'Campaign',
    cardCta: 'View',
  },
};

export const ANNOUNCEMENT_LABEL = '公告';
export const CAMPAIGN_LABEL = '活动';

/** Review tab keys (申请审核, 待博主探店, ...) */
export const REVIEW_TABS = {
  applications: 'applications',       // 申请审核
  visit_pending: 'visit_pending',     // 待博主探店
  deliverable_pending: 'deliverable_pending', // 待提交作业
  final_pending: 'final_pending',     // 待提交终稿
  deliverable_review: 'deliverable_review',   // 作业审核
} as const;

/** Which applications belong to which review tab (merchant view) */
export function getApplicationReviewTab(app: Application): keyof typeof REVIEW_TABS | null {
  const status = app.status;
  const campaignStatus = app.campaignStatus;
  const verifiedAt = app.verifiedAt ?? app.verified_at;
  const draft = app.draft_post;
  const deliverable = app.deliverable;

  if (campaignStatus === 'OPEN' && (status === 'PENDING' || status === 'REJECTED')) {
    return 'applications';
  }
  if (status === 'ACCEPTED' && !verifiedAt) {
    return 'visit_pending';
  }
  if (status === 'ACCEPTED' && verifiedAt) {
    const draftApproved = draft?.status === 'APPROVED';
    const dvStatus = deliverable?.status;
    if (deliverable && dvStatus !== 'REVISION_REQUESTED') return 'deliverable_review';
    if (draftApproved && (!deliverable || dvStatus === 'REVISION_REQUESTED')) return 'final_pending';
    if (
      !draft ||
      draft.status === 'SUBMITTED' ||
      draft.status === 'REVISION_REQUESTED' ||
      dvStatus === 'SUBMITTED'
    ) {
      return 'deliverable_pending';
    }
  }
  if (deliverable && deliverable.status !== 'REVISION_REQUESTED') {
    return 'deliverable_review';
  }
  return null;
}

/** Campaign eligible for invite (Hunt): OPEN only */
export function isCampaignEligibleForInvite(campaign: { status: string }): boolean {
  return campaign.status === 'OPEN';
}

/** Official home: hide CLOSED campaigns */
export function filterOfficialCampaigns<T extends { status: string }>(items: T[]): T[] {
  return items.filter((c) => c.status !== 'CLOSED');
}
