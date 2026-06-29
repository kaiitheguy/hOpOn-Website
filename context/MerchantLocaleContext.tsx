import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type MerchantLocale = 'zh' | 'en';

export type MerchantCopy = {
  loading: string;
  back: string;
  invite: string;
  followers: string;
  languages: string;
  about: string;
  noBio: string;
  achievements: string;
  collabsCount: string;
  completedCount: string;
  creatorNotFound: string;
  creatorNotFoundMessage: string;
  creatorLoadFailed: string;
  inviteSent: string;
  inviteFailed: string;
  inviteFrom: (name: string) => string;
  inviteBody: (restaurantName: string, campaignTitle: string) => string;
  inviteCreatorTo: (name: string) => string;
  selectCampaign: string;
  noCampaigns: string;
  cancelBtn: string;
  sendBtn: string;
  // Hunt
  title: string;
  searchPlaceholder: string;
  filterPlatform: string;
  filterFollowers: string;
  filterReset: string;
  emptyTitle: string;
  emptySearchMsg: string;
  emptyMsg: string;
  emptyFiltersMsg: string;
  inviteBtn: string;
  // Review
  reviewTitle: string;
  applicationReview: string;
  pendingCheckinReview: string;
  pendingDeliverableReview: string;
  pendingFinalDeliverableReview: string;
  deliverableReview: string;
  unknownCreator: string;
  reject: string;
  accept: string;
  nudge: string;
  requestRevision: string;
  approve: string;
  feedback: string;
  emptyReviewTitle: string;
  emptyReviewMessage: string;
  viewPost: string;
  verifyCreator: string;
  verificationTitle: string;
  enterVerificationCode: string;
  verificationCodePlaceholder: string;
  verifyCode: string;
  verificationSuccess: string;
  invalidCode: string;
  revisionTitle: string;
  revisionPlaceholder: string;
  confirmSend: string;
  statusPending: string;
  statusRejected: string;
  statusPendingCheckin: string;
  statusDeliverablePending: string;
  statusUnderReview: string;
  statusNeedsRevision: string;
  statusApproved: string;
  accepted: string;
  rejected: string;
  draftApproved: string;
  deliverableApproved: string;
  revisionRequested: string;
  operationFailed: string;
  nudgeSuccess: string;
  // Achievements
  achievementsTitle: string;
  campaignsPublished: string;
  participants: string;
  submitted: string;
  approved: string;
  trend: string;
  trendEmpty: string;
  badges: string;
  firstCampaign: string;
  firstCampaignDesc: string;
  firstAcceptance: string;
  firstAcceptanceDesc: string;
  firstDeliverable: string;
  firstDeliverableDesc: string;
  firstApproval: string;
  firstApprovalDesc: string;
  activeBrand: string;
  activeBrandDesc: string;
  excellentBrand: string;
  excellentBrandDesc: string;
  // Creator profile
  creatorProfileTitle: string;
  // Layout nav
  home: string;
  review: string;
  hunt: string;
  profile: string;
  merchantBrand: string;
};

const MERCHANT_COPY_ZH: MerchantCopy = {
  loading: '加载中…',
  back: '返回',
  invite: '邀请',
  followers: '粉丝',
  languages: '语言',
  about: '关于',
  noBio: '暂无简介',
  achievements: '成就',
  collabsCount: '合作次数',
  completedCount: '完成次数',
  creatorNotFound: '博主不存在',
  creatorNotFoundMessage: '该博主可能已被移除或不存在',
  creatorLoadFailed: '加载失败，请重试',
  inviteSent: '邀请已发送',
  inviteFailed: '发送失败，请重试',
  inviteFrom: (name) => `来自 ${name} 的合作邀请`,
  inviteBody: (restaurantName, campaignTitle) => `${restaurantName} 邀请你参与：${campaignTitle}`,
  inviteCreatorTo: (name) => `邀请 ${name} 参与：`,
  selectCampaign: '选择活动',
  noCampaigns: '暂无开放的活动，请先创建活动',
  cancelBtn: '取消',
  sendBtn: '发送邀请',
  title: '发现博主',
  searchPlaceholder: '搜索博主...',
  filterPlatform: '平台',
  filterFollowers: '粉丝',
  filterReset: '重置',
  emptyTitle: '暂无博主',
  emptySearchMsg: '试试调整搜索关键词',
  emptyMsg: '暂无注册的博主',
  emptyFiltersMsg: '没有符合筛选条件的博主',
  inviteBtn: '邀请',
  reviewTitle: '审核',
  applicationReview: '申请审核',
  pendingCheckinReview: '待博主探店',
  pendingDeliverableReview: '待提交作业',
  pendingFinalDeliverableReview: '待提交终稿',
  deliverableReview: '作业审核',
  unknownCreator: '未知创作者',
  reject: '这次不选',
  accept: '选中',
  nudge: '催作业',
  requestRevision: '申请修改',
  approve: '通过',
  feedback: '修改意见',
  emptyReviewTitle: '暂无待审核内容',
  emptyReviewMessage: '创作者会在这里提交作业',
  viewPost: '查看作业',
  verifyCreator: '验证创作者',
  verificationTitle: '创作者到店验证',
  enterVerificationCode: '输入验证码',
  verificationCodePlaceholder: '6位验证码',
  verifyCode: '验证',
  verificationSuccess: '验证成功',
  invalidCode: '无效的验证码',
  revisionTitle: '修改意见',
  revisionPlaceholder: '例如：图片不够清晰，请重拍...',
  confirmSend: '确认发送',
  statusPending: '未审核',
  statusRejected: '已拒绝',
  statusPendingCheckin: '待博主探店',
  statusDeliverablePending: '待投稿',
  statusUnderReview: '待审核',
  statusNeedsRevision: '需修改',
  statusApproved: '已通过验收',
  accepted: '已选中',
  rejected: '未选中',
  draftApproved: '已通过初稿',
  deliverableApproved: '已通过验收',
  revisionRequested: '已请求修改',
  operationFailed: '操作失败，请重试',
  nudgeSuccess: '提醒已发送',
  achievementsTitle: '成就',
  campaignsPublished: '发布活动数',
  participants: '参与人数',
  submitted: '提交作业数',
  approved: '完成作业数',
  trend: '表现趋势',
  trendEmpty: '暂无兑换数据',
  badges: '徽章',
  firstCampaign: '首次发布',
  firstCampaignDesc: '发布第一个活动',
  firstAcceptance: '首次合作',
  firstAcceptanceDesc: '第一次选中创作者',
  firstDeliverable: '首次验收',
  firstDeliverableDesc: '收到第一个作业',
  firstApproval: '首次完成',
  firstApprovalDesc: '完成第一个作业验收',
  activeBrand: '活跃商家',
  activeBrandDesc: '发布10个活动',
  excellentBrand: '优秀商家',
  excellentBrandDesc: '完成50个作业验收',
  creatorProfileTitle: '博主资料',
  home: '首页',
  review: '审核',
  hunt: '发现博主',
  profile: '我的主页',
  merchantBrand: 'hOpOn 商家',
};

const MERCHANT_COPY_EN: MerchantCopy = {
  loading: 'Loading…',
  back: 'Back',
  invite: 'Invite',
  followers: 'Followers',
  languages: 'Languages',
  about: 'About',
  noBio: 'No bio available',
  achievements: 'Achievements',
  collabsCount: 'Collabs',
  completedCount: 'Completed',
  creatorNotFound: 'Creator not found',
  creatorNotFoundMessage: 'This creator may have been removed or does not exist',
  creatorLoadFailed: 'Failed to load, please retry',
  inviteSent: 'Invite sent',
  inviteFailed: 'Send failed, please retry',
  inviteFrom: (name) => `Collaboration invite from ${name}`,
  inviteBody: (restaurantName, campaignTitle) => `${restaurantName} invites you to: ${campaignTitle}`,
  inviteCreatorTo: (name) => `Invite ${name} to:`,
  selectCampaign: 'Select Campaign',
  noCampaigns: 'No open campaigns, please create one first',
  cancelBtn: 'Cancel',
  sendBtn: 'Send Invite',
  title: 'Creators',
  searchPlaceholder: 'Search creators...',
  filterPlatform: 'Platform',
  filterFollowers: 'Followers',
  filterReset: 'Reset',
  emptyTitle: 'No creators',
  emptySearchMsg: 'Try adjusting search keywords',
  emptyMsg: 'No registered creators yet',
  emptyFiltersMsg: 'No creators match your filters',
  inviteBtn: 'Invite',
  reviewTitle: 'Review',
  applicationReview: 'Applications',
  pendingCheckinReview: 'Pending Check-in',
  pendingDeliverableReview: 'Pending',
  pendingFinalDeliverableReview: 'Pending Final',
  deliverableReview: 'Deliverables',
  unknownCreator: 'Unknown Creator',
  reject: 'Not this time',
  accept: 'Accept',
  nudge: 'Send Reminder',
  requestRevision: 'Request Revision',
  approve: 'Approve',
  feedback: 'Feedback',
  emptyReviewTitle: 'No pending reviews',
  emptyReviewMessage: 'Creators will submit their work here',
  viewPost: 'View Post',
  verifyCreator: 'Verify Creator',
  verificationTitle: 'Creator Check-in Verification',
  enterVerificationCode: 'Enter Verification Code',
  verificationCodePlaceholder: '6-digit code',
  verifyCode: 'Verify',
  verificationSuccess: 'Verification Successful',
  invalidCode: 'Invalid verification code',
  revisionTitle: 'Revision Feedback',
  revisionPlaceholder: 'e.g., Images are not clear enough...',
  confirmSend: 'Confirm',
  statusPending: 'Pending',
  statusRejected: 'Rejected',
  statusPendingCheckin: 'Pending Check-in',
  statusDeliverablePending: 'Draft Required',
  statusUnderReview: 'Under Review',
  statusNeedsRevision: 'Needs Revision',
  statusApproved: 'Approved',
  accepted: 'Accepted',
  rejected: 'Rejected',
  draftApproved: 'Draft approved',
  deliverableApproved: 'Approved',
  revisionRequested: 'Revision requested',
  operationFailed: 'Operation failed, please retry',
  nudgeSuccess: 'Reminder sent',
  achievementsTitle: 'Achievements',
  campaignsPublished: 'Campaigns Published',
  participants: 'Participants',
  submitted: 'Deliverables Submitted',
  approved: 'Deliverables Approved',
  trend: 'Performance Trend',
  trendEmpty: 'No redemptions yet',
  badges: 'Badges',
  firstCampaign: 'First Campaign',
  firstCampaignDesc: 'Publish your first campaign',
  firstAcceptance: 'First Collaboration',
  firstAcceptanceDesc: 'Accept first creator',
  firstDeliverable: 'First Submission',
  firstDeliverableDesc: 'Receive first deliverable',
  firstApproval: 'First Completion',
  firstApprovalDesc: 'Complete first deliverable review',
  activeBrand: 'Active Brand',
  activeBrandDesc: 'Publish 10 campaigns',
  excellentBrand: 'Excellent Brand',
  excellentBrandDesc: 'Complete 50 deliverable reviews',
  creatorProfileTitle: 'Creator Profile',
  home: 'Home',
  review: 'Review',
  hunt: 'Creators',
  profile: 'Profile',
  merchantBrand: 'hOpOn Merchant',
};

type ContextValue = {
  locale: MerchantLocale;
  setLocale: (l: MerchantLocale) => void;
  isZh: boolean;
  t: MerchantCopy;
};

const MerchantLocaleContext = createContext<ContextValue | undefined>(undefined);

const STORAGE_KEY = 'merchant_locale';

export function MerchantLocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<MerchantLocale>(() => {
    if (typeof window === 'undefined') return 'en';
    try {
      localStorage.setItem(STORAGE_KEY, 'en');
    } catch {}
    return 'en';
  });

  const setLocale = useCallback((_l: MerchantLocale) => {
    setLocaleState('en');
    try {
      localStorage.setItem(STORAGE_KEY, 'en');
    } catch {}
  }, []);

  const value = useMemo<ContextValue>(() => ({
    locale,
    setLocale,
    isZh: locale === 'zh',
    t: locale === 'zh' ? MERCHANT_COPY_ZH : MERCHANT_COPY_EN,
  }), [locale, setLocale]);

  return (
    <MerchantLocaleContext.Provider value={value}>
      {children}
    </MerchantLocaleContext.Provider>
  );
}

export function useMerchantLocale(): ContextValue {
  const ctx = useContext(MerchantLocaleContext);
  if (!ctx) {
    throw new Error('useMerchantLocale must be used within MerchantLocaleProvider');
  }
  return ctx;
}
