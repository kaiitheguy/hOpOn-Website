/**
 * Campaign detail: info, applicants (ACCEPTED) with deliverables/drafts, view/nudge/approve/revision.
 * Matches Blanc app/(restaurant)/campaign/[id].tsx.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCurrentUserId,
  getCampaignById,
  updateCampaign,
  listApplicantsForRestaurant,
  listDeliverablesForRestaurant,
  listDraftPostsForRestaurant,
  reviewDraftPost,
  reviewDeliverable,
  sendNotification,
} from '../../lib/merchant/api';
import { COPY_ZH, COPY_EN } from '../../lib/merchant/constants';
import type { Campaign, Application, Deliverable, DraftPost } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';
import { PostPreviewModal } from '../../components/merchant/PostPreviewModal';

function getCreatorName(app: Application): string {
  return app.creatorName ?? (app.creator as { name?: string })?.name ?? '—';
}

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, isZh } = useMerchantLocale();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [draftPosts, setDraftPosts] = useState<DraftPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewApp, setPreviewApp] = useState<Application | null>(null);
  const [previewDraft, setPreviewDraft] = useState<DraftPost | null>(null);
  const [previewDeliverable, setDeliverablePreview] = useState<Deliverable | null>(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionTargetId, setRevisionTargetId] = useState<string | null>(null);
  const [revisionIsDraft, setRevisionIsDraft] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    const userId = await getCurrentUserId();
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [camp, apps, delivs, drafts] = await Promise.all([
        getCampaignById(id),
        listApplicantsForRestaurant(userId),
        listDeliverablesForRestaurant(userId),
        listDraftPostsForRestaurant(userId),
      ]);
      setCampaign(camp ?? null);
      const campaignApps = (apps ?? []).filter((a) => a.campaign_id === id);
      const campaignAppIds = new Set(campaignApps.map((a) => a.id));
      setApplications(campaignApps);
      setDeliverables((delivs ?? []).filter((d) => campaignAppIds.has(d.application_id)));
      setDraftPosts((drafts ?? []).filter((dp) => campaignAppIds.has(dp.application_id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const acceptedApps = applications.filter((a) => a.status === 'ACCEPTED');
  const draftByAppId = new Map<string, DraftPost>(draftPosts.map((d) => [d.application_id, d]));
  const delivByAppId = new Map<string, Deliverable>(deliverables.map((d) => [d.application_id, d]));

  const handleNudge = async (app: Application) => {
    if (nudgingId) return;
    const creatorId = (app as { creator_id?: string }).creator_id ?? (app.creator as { id?: string })?.id;
    if (!creatorId) return;
    const userId = await getCurrentUserId();
    if (!userId || !campaign) return;
    setNudgingId(app.id);
    try {
      const ok = await sendNotification({
        recipient_user_id: creatorId,
        sender_user_id: userId,
        type: 'nudge_deliverable',
        title: isZh ? '作业提醒' : 'Deliverable reminder',
        body: (isZh ? `请尽快提交活动「${campaign.title}」的作业` : `Please submit deliverable for "${campaign.title}"`),
      });
      if (ok) {
        setToast({ msg: isZh ? '提醒已发送' : 'Reminder sent' });
      } else {
        setToast({ msg: t.operationFailed, error: true });
      }
    } catch {
      setToast({ msg: t.operationFailed, error: true });
    } finally {
      setNudgingId(null);
    }
  };

  const handleApproveDraft = async (draftId: string) => {
    const ok = await reviewDraftPost(draftId, 'APPROVED');
    if (ok) {
      setToast({ msg: t.draftApproved });
      loadData();
    } else {
      setToast({ msg: t.operationFailed, error: true });
    }
  };

  const handleApproveDeliverable = async (delId: string) => {
    const ok = await reviewDeliverable(delId, 'APPROVED');
    if (ok) {
      setToast({ msg: t.deliverableApproved });
      loadData();
    } else {
      setToast({ msg: t.operationFailed, error: true });
    }
  };

  const openPreview = (app: Application, draft: DraftPost | null, deliv: Deliverable | null) => {
    setPreviewApp(app);
    setPreviewDraft(draft ?? null);
    setDeliverablePreview(deliv ?? null);
    setPreviewOpen(true);
  };

  const openRevision = (targetId: string, isDraft: boolean) => {
    setRevisionTargetId(targetId);
    setRevisionIsDraft(isDraft);
    setRevisionFeedback('');
    setRevisionOpen(true);
  };

  const submitRevision = async () => {
    if (!revisionTargetId || !revisionFeedback.trim()) return;
    const ok = revisionIsDraft
      ? await reviewDraftPost(revisionTargetId, 'REVISION_REQUESTED', revisionFeedback.trim())
      : await reviewDeliverable(revisionTargetId, 'REVISION_REQUESTED', revisionFeedback.trim());
    if (ok) {
      setToast({ msg: t.revisionRequested });
      setRevisionOpen(false);
      setRevisionTargetId(null);
      setRevisionFeedback('');
      loadData();
    } else {
      setToast({ msg: t.operationFailed, error: true });
    }
  };

  const copyNoSelected = isZh ? '暂无已选中的创作者' : 'No selected creators yet';
  const copyAwaiting = isZh ? '作业待提交' : 'Awaiting submission';
  const copySubmitted = isZh ? '已提交/审核中' : 'Submitted / Under review';
  const copyNeedsRevision = isZh ? '需修改' : 'Needs revision';
  const copyCompleted = isZh ? '已完成' : 'Completed';
  const copyViewPost = t.viewPost ?? (isZh ? '查看帖子' : 'View post');
  const copyNudge = t.nudge ?? (isZh ? '提醒' : 'Nudge');

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">{t.loading}</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/80">{isZh ? '活动不存在。' : 'Campaign not found.'}</p>
        <Link to="/merchant/campaigns" className="mt-4 inline-block font-mono text-sm uppercase text-hopon-red hover:underline">
          {isZh ? '返回首页' : 'Back to home'}
        </Link>
      </div>
    );
  }

  const isOfficial = campaign.merchant?.is_official === true;
  const copy = (isZh ? COPY_ZH : COPY_EN)[isOfficial ? 'official' : 'normal'];

  return (
    <div className="py-8">
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded border-2 font-mono text-sm z-50 ${
            toast.error ? 'bg-red-50 border-red-400 text-red-800' : 'bg-hopon-grey border-black text-hopon-black'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <PostPreviewModal
        visible={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewApp(null);
          setPreviewDraft(null);
          setDeliverablePreview(null);
        }}
        mode={previewDeliverable ? 'final' : 'draft'}
        title={previewApp ? getCreatorName(previewApp) : ''}
        subtitle={campaign.title}
        draftText={previewDraft?.draftText ?? undefined}
        draftImages={previewDraft?.draftImages ?? undefined}
        xhsUrl={previewDeliverable?.xhsUrl ?? undefined}
        screenshotUrl={previewDeliverable?.images?.[0] ?? undefined}
        screenshotUrls={previewDeliverable?.images ?? undefined}
        notes={previewDeliverable?.notes ?? undefined}
        isZh={isZh}
      />

      <div className="flex items-center gap-2 mb-6">
        <Link to="/merchant/campaigns" className="font-mono text-sm uppercase text-black/60 hover:text-hopon-red">
          ← {t.back}
        </Link>
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black">
          {copy.campaignDetailTitle}
        </h1>
        {isOfficial && (
          <span className="px-2 py-0.5 bg-hopon-red text-white font-mono text-xs uppercase">
            {isZh ? '官方' : 'Official'}
          </span>
        )}
        <span
          className={`px-2 py-0.5 border border-black font-mono text-xs uppercase ${
            campaign.status === 'OPEN' ? 'bg-green-100' : 'bg-black/10'
          }`}
        >
          {campaign.status === 'OPEN' ? (isZh ? '开放' : 'Open') : (isZh ? '已关闭' : 'Closed')}
        </span>
      </div>

      <section className="border-2 border-black p-6 mb-6">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {copy.campaignDetailSection}
        </h2>
        <p className="font-display font-bold text-lg text-hopon-black">{campaign.title}</p>
        {campaign.description && (
          <p className="mt-2 text-sm text-black/80 whitespace-pre-wrap">{campaign.description}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-black/60">
          {campaign.starts_at && (
            <span>
              {isZh ? '开始' : 'Start'}: {campaign.starts_at}
            </span>
          )}
          {campaign.ends_at && (
            <span>
              {isZh ? '结束' : 'End'}: {campaign.ends_at}
            </span>
          )}
          {campaign.location && <span>{campaign.location}</span>}
          {campaign.budget && <span>{campaign.budget}</span>}
        </div>
        {campaign.platforms?.length ? (
          <p className="mt-2 text-sm text-black/60">
            {isZh ? '平台：' : 'Platforms: '}
            {campaign.platforms.join(isZh ? '、' : ', ')}
          </p>
        ) : null}
      </section>

      <section className="border-2 border-black p-6">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/70 mb-4">
          {isZh ? '作业' : 'Deliverables'}
        </h2>
        {acceptedApps.length === 0 ? (
          <p className="text-black/60">{copyNoSelected}</p>
        ) : (
          <ul className="space-y-4">
            {acceptedApps.map((app) => {
              const draft = draftByAppId.get(app.id) ?? null;
              const deliv = delivByAppId.get(app.id) ?? null;
              let statusLabel = copyAwaiting;
              if (deliv) {
                if (deliv.status === 'SUBMITTED') statusLabel = copySubmitted;
                else if (deliv.status === 'REVISION_REQUESTED') statusLabel = copyNeedsRevision;
                else if (deliv.status === 'APPROVED') statusLabel = copyCompleted;
              } else if (draft?.status === 'SUBMITTED') {
                statusLabel = isZh ? '初稿待审核' : 'Draft under review';
              } else if (draft?.status === 'REVISION_REQUESTED') {
                statusLabel = copyNeedsRevision;
              }
              const creatorId = (app as { creator_id?: string }).creator_id ?? (app.creator as { id?: string })?.id;
              return (
                <li key={app.id} className="border border-black/20 p-4 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={creatorId ? `/merchant/creator/${creatorId}` : '#'}
                        className="font-display font-bold text-hopon-black hover:underline"
                      >
                        {getCreatorName(app)}
                      </Link>
                      <span className="px-2 py-0.5 border border-black/40 font-mono text-xs uppercase">
                        {statusLabel}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/merchant/application/${app.id}/chat`}
                        className="px-3 py-1.5 border-2 border-black font-mono text-xs uppercase hover:bg-hopon-grey"
                      >
                        {isZh ? '沟通' : 'Chat'}
                      </Link>
                      <button
                        type="button"
                        onClick={() => openPreview(app, draft, deliv)}
                        className="px-3 py-1.5 border-2 border-black font-mono text-xs uppercase hover:bg-hopon-grey"
                      >
                        {copyViewPost}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(app)}
                        disabled={!!nudgingId}
                        className="px-3 py-1.5 border-2 border-black font-mono text-xs uppercase hover:bg-hopon-grey disabled:opacity-50"
                      >
                        {copyNudge}
                      </button>
                      {draft?.status === 'SUBMITTED' && (
                        <>
                          <Link
                            to={`/merchant/application/${app.id}/draft-post`}
                            className="px-3 py-1.5 border-2 border-black font-mono text-xs uppercase hover:bg-hopon-grey"
                          >
                            {isZh ? 'AI 审稿' : 'AI Review'}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleApproveDraft(draft.id)}
                            className="px-3 py-1.5 border-2 border-green-600 text-green-700 font-mono text-xs uppercase hover:bg-green-50"
                          >
                            {isZh ? '通过初稿' : 'Approve draft'}
                          </button>
                          <button
                            type="button"
                            onClick={() => openRevision(draft.id, true)}
                            className="px-3 py-1.5 border-2 border-amber-600 text-amber-700 font-mono text-xs uppercase hover:bg-amber-50"
                          >
                            {t.requestRevision}
                          </button>
                        </>
                      )}
                      {deliv?.status === 'SUBMITTED' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApproveDeliverable(deliv.id)}
                            className="px-3 py-1.5 border-2 border-green-600 text-green-700 font-mono text-xs uppercase hover:bg-green-50"
                          >
                            {t.approve}
                          </button>
                          <button
                            type="button"
                            onClick={() => openRevision(deliv.id, false)}
                            className="px-3 py-1.5 border-2 border-amber-600 text-amber-700 font-mono text-xs uppercase hover:bg-amber-50"
                          >
                            {t.requestRevision}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {revisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border-2 border-black max-w-md w-full p-6">
            <h3 className="font-display font-bold text-lg text-hopon-black mb-2">
              {t.revisionTitle ?? (isZh ? '请求修改' : 'Request revision')}
            </h3>
            <p className="text-sm text-black/60 mb-2">
              {isZh ? '填写修改意见（将发送给创作者）' : 'Enter feedback for the creator'}
            </p>
            <textarea
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              placeholder={t.revisionPlaceholder ?? (isZh ? '例如：链接无法打开，请更换' : 'e.g. Link not working, please update')}
              className="w-full h-24 border-2 border-black p-3 font-mono text-sm mb-4 resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setRevisionOpen(false);
                  setRevisionTargetId(null);
                  setRevisionFeedback('');
                }}
                className="px-4 py-2 border-2 border-black font-mono text-xs uppercase hover:bg-hopon-grey"
              >
                {t.cancelBtn ?? (isZh ? '取消' : 'Cancel')}
              </button>
              <button
                type="button"
                onClick={submitRevision}
                disabled={!revisionFeedback.trim()}
                className="px-4 py-2 border-2 border-amber-600 text-amber-700 font-mono text-xs uppercase hover:bg-amber-50 disabled:opacity-50"
              >
                {t.confirmSend ?? (isZh ? '发送' : 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
