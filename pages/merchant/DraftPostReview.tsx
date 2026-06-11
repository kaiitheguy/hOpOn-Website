import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Clipboard, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import {
  analyzeDraftPostForApplication,
  getCampaignById,
  getCreatorProfile,
  getDraftPostAgentResult,
  getDraftPostForApplication,
  loadApplicationChatContext,
  reviewDraftPost,
  sendNotification,
} from '../../lib/merchant/api';
import type { Campaign, Creator, DraftPost, DraftPostAgentResult } from '../../lib/merchant/types';
import { isSafeImageUrl } from '../../lib/safeImageUrl';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

function scoreClass(score: number): string {
  if (score >= 75) return 'bg-green-50 border-green-500 text-green-700';
  if (score >= 55) return 'bg-yellow-50 border-yellow-500 text-yellow-700';
  return 'bg-red-50 border-red-500 text-red-700';
}

export const DraftPostReview: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { isZh, t } = useMerchantLocale();
  const [draft, setDraft] = useState<DraftPost | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [agent, setAgent] = useState<DraftPostAgentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionText, setRevisionText] = useState('');
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const loadData = React.useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    const [draftPost, ctx] = await Promise.all([
      getDraftPostForApplication(applicationId),
      loadApplicationChatContext(applicationId),
    ]);
    setDraft(draftPost);
    const cached = await getDraftPostAgentResult(applicationId);
    setAgent(cached);
    if (ctx?.application.campaign_id) {
      const [campaignRow, creatorRow] = await Promise.all([
        getCampaignById(ctx.application.campaign_id),
        getCreatorProfile(ctx.application.creator_id),
      ]);
      setCampaign(campaignRow);
      setCreator(creatorRow);
    }
    setLoading(false);
  }, [applicationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleAnalyze = async () => {
    if (!applicationId) return;
    setBusy('analyze');
    const result = await analyzeDraftPostForApplication(applicationId);
    setAgent(result);
    setToast({ msg: result ? (isZh ? '分析完成' : 'Analysis ready') : (isZh ? '分析失败' : 'Analysis failed'), error: !result });
    setBusy(null);
  };

  const handleApprove = async () => {
    if (!draft) return;
    setBusy('approve');
    const ok = await reviewDraftPost(draft.id, 'APPROVED');
    setToast({ msg: ok ? t.draftApproved : t.operationFailed, error: !ok });
    await loadData();
    setBusy(null);
  };

  const handleRevision = async () => {
    if (!draft || !revisionText.trim()) return;
    setBusy('revision');
    const ok = await reviewDraftPost(draft.id, 'REVISION_REQUESTED', revisionText.trim());
    if (ok && applicationId) {
      await sendNotification({
        recipient_user_id: draft.creatorId ?? creator?.id,
        type: 'deliverable_revision_requested',
        title: isZh ? '草稿需要修改' : 'Draft needs revision',
        body: revisionText.trim(),
        data: { application_id: applicationId, campaign_id: campaign?.id, campaign_title: campaign?.title },
      });
    }
    setToast({ msg: ok ? t.revisionRequested : t.operationFailed, error: !ok });
    setRevisionOpen(false);
    await loadData();
    setBusy(null);
  };

  const prefillRevision = () => {
    if (!agent) return;
    const lines = [
      isZh ? '请根据以下建议修改草稿：' : 'Please revise the draft based on:',
      ...agent.feedback.missingKeywords.map((kw) => `${isZh ? '补充关键词' : 'Add keyword'}: ${kw}`),
      ...agent.feedback.phrasesToStrengthen,
      agent.feedback.platformOptimization,
      agent.feedback.suggestedCta,
    ].filter(Boolean);
    setRevisionText(lines.join('\n'));
    setRevisionOpen(true);
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><p className="font-display font-bold">{t.loading}</p></div>;
  }

  if (!draft) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/70">{isZh ? '创作者还没有提交初稿。' : 'No draft post has been submitted yet.'}</p>
        <Link to="/merchant/review" className="mt-4 inline-block font-mono text-sm uppercase text-hopon-red hover:underline">
          {isZh ? '返回审核' : 'Back to review'}
        </Link>
      </div>
    );
  }

  const images = (draft.draftImages ?? []).filter(isSafeImageUrl);
  const draftTitle = draft.draftTitle || (draft.draftText?.split('\n')[0] ?? '');
  const draftContent = draft.draftContent || draft.draftText || '';

  return (
    <div className="py-8">
      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded border-2 px-4 py-2 font-mono text-sm ${toast.error ? 'bg-red-50 border-red-500 text-red-700' : 'bg-hopon-black border-black text-white'}`}>
          {toast.msg}
        </div>
      )}

      <Link to="/merchant/review" className="font-mono text-sm uppercase text-black/60 hover:text-hopon-red">← {t.back}</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="border-2 border-black bg-white p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-hopon-red">{isZh ? '初稿审核' : 'Draft review'}</p>
            <h1 className="mt-2 font-display text-3xl font-bold">{campaign?.title || (isZh ? '活动初稿' : 'Campaign draft')}</h1>
            <p className="mt-2 text-sm text-black/60">{creator?.display_name || creator?.name || creator?.handle || draft.creatorId}</p>
          </div>

          <div className="border-2 border-black bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase text-black/55">{isZh ? '创作者标题' : 'Creator title'}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{draftTitle || (isZh ? '未填写标题' : 'Untitled')}</h2>
              </div>
              <span className="border border-black px-2 py-1 font-mono text-xs uppercase">{draft.status}</span>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-black/80">{draftContent || (isZh ? '暂无正文' : 'No body text')}</p>
            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                {images.map((image, idx) => (
                  <img key={`${image}-${idx}`} src={image} alt="" className="aspect-square w-full border border-black/20 object-cover" />
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="border-2 border-black bg-white p-5">
            <Sparkles className="h-6 w-6 text-hopon-red" />
            <h2 className="mt-3 font-display text-xl font-bold text-hopon-black">{isZh ? 'AI 审核助手' : 'AI review assistant'}</h2>
            <p className="mt-2 text-sm text-black/65">
              {isZh ? '分析草稿是否覆盖活动目标、本地关键词、CTA 和平台适配。' : 'Analyze campaign fit, local keywords, CTA, and platform readiness.'}
            </p>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={busy === 'analyze'}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 border-2 border-black bg-hopon-black px-4 font-mono text-xs uppercase text-white hover:bg-hopon-red disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              {busy === 'analyze' ? '...' : isZh ? '分析草稿' : 'Analyze draft'}
            </button>
          </div>

          {agent && (
            <div className="border-2 border-black bg-white p-5">
              <div className={`inline-flex border-2 px-3 py-2 font-mono text-xs uppercase ${scoreClass(agent.overallScore)}`}>
                {isZh ? '总分' : 'Score'} {agent.overallScore}/100
              </div>
              <div className="mt-4 space-y-3">
                {Object.entries(agent.subScores).slice(0, 6).map(([key, rawValue]) => {
                  const value = Number(rawValue) || 0;
                  return (
                  <div key={key}>
                    <div className="mb-1 flex justify-between gap-3 font-mono text-xs uppercase text-black/60">
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 border border-black bg-white">
                      <div className="h-full bg-hopon-red" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
                    </div>
                  </div>
                  );
                })}
              </div>
              <div className="mt-5 border-t border-black/10 pt-4">
                <p className="font-display font-bold">{isZh ? '建议修改' : 'Recommended edits'}</p>
                <ul className="mt-2 space-y-2 text-sm text-black/70">
                  {agent.feedback.missingKeywords.slice(0, 4).map((kw) => <li key={kw}>• {isZh ? '补充关键词' : 'Add'}: {kw}</li>)}
                  {agent.feedback.phrasesToStrengthen.slice(0, 3).map((item) => <li key={item}>• {item}</li>)}
                  <li>• {agent.feedback.suggestedCta}</li>
                </ul>
              </div>
              <button
                type="button"
                onClick={prefillRevision}
                className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 border-2 border-black bg-white font-mono text-xs uppercase hover:bg-hopon-grey"
              >
                <Clipboard className="h-4 w-4" />
                {isZh ? '填入修改意见' : 'Prefill revision'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRevisionOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 border-2 border-black bg-white font-mono text-xs uppercase hover:bg-hopon-grey"
            >
              <XCircle className="h-4 w-4" />
              {t.requestRevision}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={busy === 'approve'}
              className="inline-flex h-12 items-center justify-center gap-2 border-2 border-black bg-hopon-black font-mono text-xs uppercase text-white hover:bg-hopon-red disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busy === 'approve' ? '...' : t.approve}
            </button>
          </div>
        </aside>
      </div>

      {revisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg border-2 border-black bg-white p-6">
            <h2 className="font-display text-xl font-bold">{t.revisionTitle}</h2>
            <textarea
              value={revisionText}
              onChange={(event) => setRevisionText(event.target.value)}
              rows={8}
              placeholder={t.revisionPlaceholder}
              className="mt-4 w-full resize-y border-2 border-black p-3 text-sm"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setRevisionOpen(false)}
                className="h-11 flex-1 border-2 border-black bg-white font-mono text-xs uppercase"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleRevision}
                disabled={!revisionText.trim() || busy === 'revision'}
                className="h-11 flex-1 border-2 border-black bg-hopon-black font-mono text-xs uppercase text-white hover:bg-hopon-red disabled:opacity-50"
              >
                {busy === 'revision' ? '...' : t.confirmSend}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
