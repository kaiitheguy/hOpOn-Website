import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getCurrentUserId,
  getCampaignsForRestaurant,
  listApplicantsForRestaurant,
  listDraftPostsForRestaurant,
  listDeliverablesForRestaurant,
  reviewApplication,
  reviewDraftPost,
  reviewDeliverable,
  verifyCreatorPresence,
  confirmCreatorVerification,
  sendNotification,
} from '../../lib/merchant/api';
import { getApplicationReviewTab, REVIEW_TABS } from '../../lib/merchant/constants';
import type { Application, Deliverable, DraftPost } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';
import { PostPreviewModal } from '../../components/merchant/PostPreviewModal';

/** Audit §5: tab keys from REVIEW_TABS (applications, visit_pending, deliverable_pending, final_pending, deliverable_review) */
type ReviewTab = keyof typeof REVIEW_TABS;

/** Audit §1 Review = applications + deliverables review; §2.2 Application, Deliverable, DraftPost. */
type ReviewItem = {
  application: Application;
  draftPost?: DraftPost | null;
  deliverable?: Deliverable | null;
  campaignTitle?: string;
  creatorName?: string;
  creatorFollowers?: number | null;
  creatorTags?: string[] | null;
};

/** Build app-like object for getApplicationReviewTab (Audit §5.2) */
function toAppForTab(item: ReviewItem): Application & { draft_post?: DraftPost | null; deliverable?: Deliverable | null } {
  return {
    ...item.application,
    draft_post: item.draftPost,
    deliverable: item.deliverable,
  };
}

function getCampaignTitle(app: Application): string {
  return app.campaignTitle ?? (app.campaign as { title?: string } | undefined)?.title ?? '';
}

function getCreatorName(app: Application): string {
  return app.creatorName ?? (app.creator as { display_name?: string; name?: string } | undefined)?.display_name ?? (app.creator as { name?: string })?.name ?? '—';
}

function isVerified(app: Application | undefined): boolean {
  const v = app?.verified_at ?? app?.verifiedAt;
  return v != null && v !== '' && String(v).length > 0;
}

/** Filter by tab using Audit §5 source of truth (getApplicationReviewTab). */
function filterByTab(items: ReviewItem[], tab: ReviewTab): ReviewItem[] {
  return items.filter((item) => getApplicationReviewTab(toAppForTab(item)) === tab);
}

function getItemStatus(item: ReviewItem): string | null {
  const { application, draftPost, deliverable } = item;
  if (application?.status === 'PENDING') return 'pending';
  if (application?.status === 'REJECTED') return 'rejected';
  if (application?.status === 'ACCEPTED') {
    if (deliverable) {
      if (deliverable.status === 'SUBMITTED') return 'submitted';
      if (deliverable.status === 'REVISION_REQUESTED') return 'pending_submit';
      if (deliverable.status === 'APPROVED') return 'approved';
    }
    if (draftPost) {
      if (draftPost.status === 'SUBMITTED') return 'submitted';
      if (draftPost.status === 'APPROVED' || draftPost.status === 'REVISION_REQUESTED') return 'pending_submit';
    }
    return 'accepted';
  }
  return null;
}

const TAB_KEYS: ReviewTab[] = [
  'applications',
  'visit_pending',
  'deliverable_pending',
  'final_pending',
  'deliverable_review',
];

export const MerchantReview: React.FC = () => {
  const { t, isZh } = useMerchantLocale();
  const [applications, setApplications] = useState<Application[]>([]);
  const [draftPosts, setDraftPosts] = useState<DraftPost[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [campaigns, setCampaigns] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReviewTab>('applications');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionTargetId, setRevisionTargetId] = useState<string | null>(null);
  const [revisionIsDraft, setRevisionIsDraft] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState<ReviewItem | null>(null);

  const loadData = React.useCallback(async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [apps, drafts, delivs, camps] = await Promise.all([
        listApplicantsForRestaurant(userId),
        listDraftPostsForRestaurant(userId),
        listDeliverablesForRestaurant(userId),
        getCampaignsForRestaurant(userId),
      ]);
      setApplications(apps);
      setDraftPosts(drafts);
      setDeliverables(delivs);
      setCampaigns(camps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reviewItems = useMemo((): ReviewItem[] => {
    const draftByApp = new Map<string, DraftPost>();
    draftPosts.forEach((d) => draftByApp.set(d.application_id, d));
    const delivByApp = new Map<string, Deliverable>();
    deliverables.forEach((d) => delivByApp.set(d.application_id, d));

    return applications.map((app) => ({
      application: app,
      draftPost: draftByApp.get(app.id) ?? null,
      deliverable: delivByApp.get(app.id) ?? null,
      campaignTitle: getCampaignTitle(app),
      creatorName: getCreatorName(app),
      creatorFollowers: app.creatorFollowers ?? null,
      creatorTags: app.creatorTags ?? null,
    }));
  }, [applications, draftPosts, deliverables]);

  const filteredItems = useMemo(() => filterByTab(reviewItems, tab), [reviewItems, tab]);

  const handleReview = async (appId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (reviewingId) return;
    setReviewingId(appId);
    try {
      const ok = await reviewApplication(appId, status);
      if (ok) {
        setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));
        setToast({ msg: status === 'ACCEPTED' ? t.accepted : t.rejected });
        loadData();
      } else {
        setToast({ msg: t.operationFailed, error: true });
      }
    } catch {
      setToast({ msg: '操作失败，请重试', error: true });
    } finally {
      setReviewingId(null);
    }
  };

  const handleVerify = async () => {
    const code = verifyCode.trim();
    if (!code || verifying) return;
    setVerifying(true);
    try {
      const { ok, applicationId } = await verifyCreatorPresence(code);
      if (ok && applicationId) {
        const confirmed = await confirmCreatorVerification(applicationId);
        if (confirmed) {
          setApplications((prev) =>
            prev.map((a) =>
              a.id === applicationId ? { ...a, verified_at: new Date().toISOString() } : a
            )
          );
          setToast({ msg: t.verificationSuccess });
          setVerifyModalOpen(false);
          setVerifyCode('');
          loadData();
        } else {
          setToast({ msg: t.operationFailed, error: true });
        }
      } else {
        setToast({ msg: t.invalidCode, error: true });
      }
    } catch {
      setToast({ msg: t.operationFailed, error: true });
    } finally {
      setVerifying(false);
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    try {
      const ok = await reviewDraftPost(draftId, 'APPROVED');
      if (ok) {
        setToast({ msg: t.draftApproved });
        loadData();
      } else {
        setToast({ msg: t.operationFailed, error: true });
      }
    } catch {
      setToast({ msg: '操作失败', error: true });
    }
  };

  const handleApproveDeliverable = async (delId: string) => {
    try {
      const ok = await reviewDeliverable(delId, 'APPROVED');
      if (ok) {
        setToast({ msg: t.deliverableApproved });
        loadData();
      } else {
        setToast({ msg: t.operationFailed, error: true });
      }
    } catch {
      setToast({ msg: '操作失败', error: true });
    }
  };

  const openRevision = (targetId: string, isDraft: boolean) => {
    setRevisionTargetId(targetId);
    setRevisionIsDraft(isDraft);
    setRevisionReason('');
    setRevisionModalOpen(true);
  };

  const submitRevision = async () => {
    if (!revisionTargetId || !revisionReason.trim()) return;
    try {
      const ok = revisionIsDraft
        ? await reviewDraftPost(revisionTargetId, 'REVISION_REQUESTED', revisionReason.trim())
        : await reviewDeliverable(revisionTargetId, 'REVISION_REQUESTED', revisionReason.trim());
      if (ok) {
        setToast({ msg: t.revisionRequested });
        setRevisionModalOpen(false);
        setRevisionTargetId(null);
        setRevisionReason('');
        loadData();
      } else {
        setToast({ msg: t.operationFailed, error: true });
      }
    } catch {
      setToast({ msg: '操作失败', error: true });
    }
  };

  const handleNudge = async (app: Application) => {
    if (nudgingId) return;
    const creatorId = (app as { creator_id?: string }).creator_id ?? app.creator?.id;
    if (!creatorId) return;
    setNudgingId(app.id);
    try {
      const userId = await getCurrentUserId();
      if (!userId) return;
      await sendNotification({
        recipient_user_id: creatorId,
        sender_user_id: userId,
        type: 'nudge_deliverable',
        title: '作业提醒',
        body: `请尽快提交活动「${getCampaignTitle(app)}」的作业`,
      });
      setToast({ msg: t.nudgeSuccess });
      loadData();
    } catch {
      setToast({ msg: t.operationFailed, error: true });
    } finally {
      setNudgingId(null);
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const openPreview = (item: ReviewItem) => {
    setPreviewItem(item);
    setPreviewVisible(true);
  };

  const getStatusLabel = (item: ReviewItem): string => {
    const s = getItemStatus(item);
    if (s === 'pending') return t.statusPending;
    if (s === 'rejected') return t.statusRejected;
    if (s === 'accepted') {
      return isVerified(item.application) ? t.statusDeliverablePending : t.statusPendingCheckin;
    }
    if (s === 'pending_submit') {
      if (item.deliverable?.status === 'REVISION_REQUESTED' || item.draftPost?.status === 'REVISION_REQUESTED') {
        return t.statusNeedsRevision;
      }
      return t.statusDeliverablePending;
    }
    if (s === 'submitted') return t.statusUnderReview;
    if (s === 'approved') return t.statusApproved;
    return '—';
  };

  if (loading && applications.length === 0) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">Loading…</p>
      </div>
    );
  }

  const tabLabels: Record<ReviewTab, string> = {
    applications: t.applicationReview,
    visit_pending: t.pendingCheckinReview,
    deliverable_pending: t.pendingDeliverableReview,
    final_pending: t.pendingFinalDeliverableReview,
    deliverable_review: t.deliverableReview,
  };

  return (
    <div className="py-8">
      <PostPreviewModal
        visible={previewVisible}
        onClose={() => { setPreviewVisible(false); setPreviewItem(null); }}
        mode={previewItem?.deliverable ? 'final' : 'draft'}
        title={previewItem?.creatorName ?? t.unknownCreator}
        subtitle={previewItem?.campaignTitle ?? ''}
        draftText={previewItem?.draftPost?.draftText ?? undefined}
        draftImages={previewItem?.draftPost?.draftImages ?? undefined}
        xhsUrl={previewItem?.deliverable?.xhsUrl ?? undefined}
        screenshotUrl={previewItem?.deliverable?.images?.[0] ?? undefined}
        screenshotUrls={previewItem?.deliverable?.images ?? undefined}
        notes={previewItem?.deliverable?.notes ?? undefined}
        isZh={isZh}
      />

      <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-6">
        {t.reviewTitle}
      </h1>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-black/10">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 px-4 py-2 rounded font-mono text-xs uppercase border-2 transition-colors ${
              tab === key
                ? 'bg-hopon-black text-white border-black'
                : 'border-black/30 text-black/70 hover:border-black'
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="border-2 border-dashed border-black/20 p-12 text-center">
          <p className="font-display font-bold text-hopon-black mb-1">{t.emptyReviewTitle}</p>
          <p className="text-sm text-black/60">{t.emptyReviewMessage}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredItems.map((item) => {
            const app = item.application;
            const creatorId = (app as { creator_id?: string }).creator_id ?? (app.creator as { id?: string })?.id;
            return (
              <li key={app.id} className="border-2 border-black p-6 bg-white">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <Link
                      to={creatorId ? `/merchant/creator/${creatorId}` : '#'}
                      className="font-display font-bold text-hopon-black hover:underline"
                    >
                      {item.creatorName ?? t.unknownCreator}
                    </Link>
                    <p className="text-sm text-black/60 mt-1">{item.campaignTitle}</p>
                  </div>
                  <span className="px-2 py-0.5 border border-black font-mono text-xs uppercase shrink-0">
                    {getStatusLabel(item)}
                  </span>
                </div>

                {(item.creatorFollowers != null || (item.creatorTags?.length ?? 0) > 0) && (
                  <p className="text-xs text-black/50 mb-2">
                    {item.creatorFollowers != null && `${t.followers}: ${Number(item.creatorFollowers).toLocaleString()}`}
                    {item.creatorFollowers != null && (item.creatorTags?.length ?? 0) > 0 && ' · '}
                    {(item.creatorTags?.length ?? 0) > 0 && (item.creatorTags ?? []).join(', ')}
                  </p>
                )}

                {(item.draftPost || item.deliverable) && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => openPreview(item)}
                      className="w-full sm:w-auto h-10 px-4 border-2 border-black bg-white text-hopon-black font-mono text-xs uppercase hover:bg-hopon-grey"
                    >
                      {t.viewPost}
                    </button>
                  </div>
                )}

                {item.draftPost?.feedback && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    <p className="font-mono text-xs uppercase text-black/60 mb-1">{t.feedback}</p>
                    <p className="text-sm text-black/80">{item.draftPost.feedback}</p>
                  </div>
                )}
                {item.deliverable?.feedback && (
                  <div className="mt-3 pt-3 border-t border-black/10">
                    <p className="font-mono text-xs uppercase text-black/60 mb-1">{t.feedback}</p>
                    <p className="text-sm text-black/80">{item.deliverable.feedback}</p>
                  </div>
                )}

                {app.status === 'PENDING' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => handleReview(app.id, 'REJECTED')}
                      disabled={reviewingId !== null}
                      className="flex-1 h-10 border-2 border-black bg-white text-hopon-black font-mono text-xs uppercase disabled:opacity-50"
                    >
                      {t.reject}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(app.id, 'ACCEPTED')}
                      disabled={reviewingId !== null}
                      className="flex-1 h-10 border-2 border-black bg-hopon-black text-white font-mono text-xs uppercase hover:bg-hopon-red disabled:opacity-50"
                    >
                      {reviewingId === app.id ? '…' : t.accept}
                    </button>
                  </div>
                )}

                {app.status === 'ACCEPTED' && !isVerified(app) && tab === 'visit_pending' && (
                  <div className="mt-4 grid gap-3 pt-4 border-t border-black/10 sm:grid-cols-2">
                    <Link
                      to={`/merchant/application/${app.id}/chat`}
                      className="flex h-10 items-center justify-center border-2 border-black bg-white text-hopon-black font-mono text-xs uppercase hover:bg-hopon-grey"
                    >
                      {isZh ? '沟通时间' : 'Schedule Chat'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setVerifyModalOpen(true)}
                      className="w-full h-10 border-2 border-black bg-hopon-black text-white font-mono text-xs uppercase hover:bg-hopon-red"
                    >
                      {t.verifyCreator}（{t.enterVerificationCode}）
                    </button>
                  </div>
                )}

                {app.status === 'ACCEPTED' && isVerified(app) && !item.draftPost && !item.deliverable && (
                  <div className="mt-4 pt-4 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => handleNudge(app)}
                      disabled={nudgingId !== null}
                      className="w-full h-10 border-2 border-black bg-white text-hopon-black font-mono text-xs uppercase hover:bg-hopon-grey disabled:opacity-50"
                    >
                      {nudgingId === app.id ? '…' : t.nudge}
                    </button>
                  </div>
                )}

                {item.draftPost?.status === 'SUBMITTED' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-black/10">
                    <Link
                      to={`/merchant/application/${app.id}/draft-post`}
                      className="flex-1 h-10 border-2 border-black bg-white text-hopon-black font-mono text-xs uppercase flex items-center justify-center"
                    >
                      {isZh ? 'AI 审稿' : 'AI Review'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => openRevision(item.draftPost!.id, true)}
                      className="flex-1 h-10 border-2 border-black bg-white text-hopon-black font-mono text-xs uppercase"
                    >
                      {t.requestRevision}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveDraft(item.draftPost!.id)}
                      className="flex-1 h-10 border-2 border-black bg-hopon-black text-white font-mono text-xs uppercase hover:bg-hopon-red"
                    >
                      {t.approve}
                    </button>
                  </div>
                )}

                {item.deliverable?.status === 'SUBMITTED' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => openRevision(item.deliverable!.id, false)}
                      className="flex-1 h-10 border-2 border-black bg-white text-hopon-black font-mono text-xs uppercase"
                    >
                      {t.requestRevision}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveDeliverable(item.deliverable!.id)}
                      className="flex-1 h-10 border-2 border-black bg-hopon-black text-white font-mono text-xs uppercase hover:bg-hopon-red"
                    >
                      {t.approve}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white border-2 border-black p-6">
            <h2 className="font-display font-bold text-lg uppercase text-hopon-black mb-4">
              {t.verificationTitle}
            </h2>
            <p className="text-sm text-black/60 mb-2">{t.enterVerificationCode}</p>
            <input
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder={t.verificationCodePlaceholder}
              className="w-full h-12 border-2 border-black px-4 font-mono text-sm mb-6"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setVerifyModalOpen(false);
                  setVerifyCode('');
                }}
                className="flex-1 h-10 border-2 border-black bg-white font-mono text-xs uppercase"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="flex-1 h-10 border-2 border-black bg-hopon-black text-white font-mono text-xs uppercase hover:bg-hopon-red disabled:opacity-50"
              >
                {verifying ? '…' : t.verifyCode}
              </button>
            </div>
          </div>
        </div>
      )}

      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-white border-2 border-black p-6">
            <h2 className="font-display font-bold text-lg uppercase text-hopon-black mb-4">
              {t.revisionTitle}
            </h2>
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder={t.revisionPlaceholder}
              rows={4}
              className="w-full border-2 border-black p-4 font-mono text-sm mb-6 resize-y"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRevisionModalOpen(false);
                  setRevisionTargetId(null);
                  setRevisionReason('');
                }}
                className="flex-1 h-10 border-2 border-black bg-white font-mono text-xs uppercase"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={submitRevision}
                disabled={!revisionReason.trim()}
                className="flex-1 h-10 border-2 border-black bg-hopon-black text-white font-mono text-xs uppercase hover:bg-hopon-red disabled:opacity-50"
              >
                {t.confirmSend}
              </button>
            </div>
          </div>
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
