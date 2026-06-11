import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarClock, Check, RotateCcw, Send } from 'lucide-react';
import {
  confirmVisitScheduleProposal,
  createVisitScheduleProposal,
  loadApplicationChatContext,
  reopenApplicationScheduling,
  sendApplicationChatMessage,
} from '../../lib/merchant/api';
import type { ApplicationChatContext, VisitSlot } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

function formatWhen(value?: string | null): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function toInputDateTime(value: Date): string {
  const offset = value.getTimezoneOffset();
  const local = new Date(value.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export const ApplicationChat: React.FC = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { isZh, t } = useMerchantLocale();
  const [ctx, setCtx] = useState<ApplicationChatContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [slots, setSlots] = useState<string[]>([
    toInputDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000)),
    toInputDateTime(new Date(Date.now() + 48 * 60 * 60 * 1000)),
  ]);
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  const loadData = React.useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    const data = await loadApplicationChatContext(applicationId);
    setCtx(data);
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

  const quickPrompts = useMemo(() => {
    const title = ctx?.application.campaignTitle || (isZh ? '这次活动' : 'this campaign');
    return isZh
      ? [`你好，我们来确认一下「${title}」的到店时间。`, '这两个时间段你方便吗？', '确认后请按约定时间到店，现场出示验证码。']
      : [`Hi, let us confirm the visit time for "${title}".`, 'Do either of these time slots work for you?', 'Once confirmed, please arrive on time and show your verification code.'];
  }, [ctx?.application.campaignTitle, isZh]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!applicationId || !body) return;
    setBusy('send');
    const sent = await sendApplicationChatMessage(applicationId, body);
    if (sent) {
      setDraft('');
      await loadData();
    } else {
      setToast({ msg: isZh ? '发送失败' : 'Send failed', error: true });
    }
    setBusy(null);
  };

  const handlePropose = async () => {
    if (!applicationId) return;
    const payload: VisitSlot[] = slots
      .map((slot) => slot ? { start: new Date(slot).toISOString() } : null)
      .filter(Boolean) as VisitSlot[];
    if (!payload.length) return;
    setBusy('proposal');
    const result = await createVisitScheduleProposal(applicationId, payload);
    setToast({ msg: result.ok ? (isZh ? '已发送时间建议' : 'Proposal sent') : (isZh ? '发送失败' : 'Proposal failed'), error: !result.ok });
    await loadData();
    setBusy(null);
  };

  const handleConfirm = async (slot: VisitSlot) => {
    if (!ctx?.pendingProposal) return;
    setBusy(`confirm-${slot.start}`);
    const ok = await confirmVisitScheduleProposal(ctx.pendingProposal.id, slot);
    setToast({ msg: ok ? (isZh ? '已确认到店时间' : 'Visit time confirmed') : (isZh ? '确认失败' : 'Confirm failed'), error: !ok });
    await loadData();
    setBusy(null);
  };

  const handleReopen = async () => {
    if (!applicationId) return;
    setBusy('reopen');
    const ok = await reopenApplicationScheduling(applicationId);
    setToast({ msg: ok ? (isZh ? '已重开排期' : 'Scheduling reopened') : (isZh ? '操作失败' : 'Operation failed'), error: !ok });
    await loadData();
    setBusy(null);
  };

  if (loading) {
    return <div className="py-12 flex justify-center"><p className="font-display font-bold">{t.loading}</p></div>;
  }

  if (!ctx) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/70">{isZh ? '无法打开这条沟通记录。' : 'Unable to open this conversation.'}</p>
        <Link to="/merchant/review" className="mt-4 inline-block font-mono text-sm uppercase text-hopon-red hover:underline">
          {isZh ? '返回审核' : 'Back to review'}
        </Link>
      </div>
    );
  }

  const app = ctx.application;
  const confirmed = app.scheduleStatus === 'confirmed' && app.confirmedVisitTime;
  const pending = ctx.pendingProposal;

  return (
    <div className="py-8">
      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded border-2 px-4 py-2 font-mono text-sm ${toast.error ? 'bg-red-50 border-red-500 text-red-700' : 'bg-hopon-black border-black text-white'}`}>
          {toast.msg}
        </div>
      )}

      <Link to="/merchant/review" className="font-mono text-sm uppercase text-black/60 hover:text-hopon-red">← {t.back}</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="border-2 border-black bg-white">
          <div className="border-b border-black/10 p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-hopon-red">{isZh ? '探店沟通' : 'Visit scheduling'}</p>
            <h1 className="mt-1 font-display text-2xl font-bold">{app.campaignTitle || (isZh ? '活动沟通' : 'Campaign chat')}</h1>
            <p className="mt-1 text-sm text-black/60">{app.creatorName || app.creatorHandle || app.creator_id}</p>
          </div>

          <div className="max-h-[58vh] min-h-[420px] overflow-y-auto bg-hopon-grey p-5">
            {ctx.messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-center">
                <p className="text-sm text-black/55">{isZh ? '暂无消息，先发送一个时间建议。' : 'No messages yet. Send a proposal to start.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ctx.messages.map((message) => {
                  const self = message.senderRole === 'restaurant' || message.senderRole === 'merchant';
                  const system = message.senderRole === 'system' || message.messageType === 'system';
                  const proposalSlots = Array.isArray(message.metadata?.slots) ? message.metadata.slots as VisitSlot[] : [];
                  return (
                    <div key={message.id} className={`flex ${self ? 'justify-end' : system ? 'justify-center' : 'justify-start'}`}>
                      <div className={`max-w-[82%] border-2 p-3 ${system ? 'border-black/20 bg-white text-center' : self ? 'border-black bg-hopon-black text-white' : 'border-black bg-white text-hopon-black'}`}>
                        <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                        {proposalSlots.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {proposalSlots.map((slot) => (
                              <button
                                key={slot.start}
                                type="button"
                                onClick={() => handleConfirm(slot)}
                                disabled={!pending || busy === `confirm-${slot.start}`}
                                className="flex w-full items-center justify-between gap-3 border border-current px-3 py-2 text-left font-mono text-xs disabled:opacity-50"
                              >
                                {formatWhen(slot.start)}
                                <Check className="h-4 w-4" />
                              </button>
                            ))}
                          </div>
                        )}
                        <p className={`mt-2 font-mono text-[10px] uppercase ${self ? 'text-white/55' : 'text-black/45'}`}>{formatWhen(message.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-black/10 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setDraft(prompt)}
                  className="rounded-full border border-black/25 px-3 py-1.5 text-left text-xs text-black/65 hover:border-black"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={2}
                placeholder={isZh ? '输入消息...' : 'Type a message...'}
                className="min-w-0 flex-1 resize-y border-2 border-black px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draft.trim() || busy === 'send'}
                className="inline-flex w-14 items-center justify-center border-2 border-black bg-hopon-black text-white hover:bg-hopon-red disabled:opacity-50"
                aria-label={isZh ? '发送' : 'Send'}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border-2 border-black bg-white p-5">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-hopon-red" />
              <h2 className="font-display text-lg font-bold">{isZh ? '到店时间' : 'Visit time'}</h2>
            </div>
            {confirmed ? (
              <div className="mt-4 border border-green-500 bg-green-50 p-3">
                <p className="font-mono text-xs uppercase text-green-700">{isZh ? '已确认' : 'Confirmed'}</p>
                <p className="mt-1 font-display font-bold">{formatWhen(app.confirmedVisitTime)}</p>
              </div>
            ) : pending ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-black/60">{isZh ? '等待对方确认以下时间：' : 'Waiting for confirmation:'}</p>
                {pending.slots.map((slot) => (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => handleConfirm(slot)}
                    className="w-full border-2 border-black px-3 py-2 text-left font-mono text-xs hover:bg-hopon-grey"
                  >
                    {formatWhen(slot.start)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-black/60">{isZh ? '尚未发送时间建议。' : 'No proposal has been sent.'}</p>
            )}
          </div>

          <div className="border-2 border-black bg-white p-5">
            <h2 className="font-display text-lg font-bold">{isZh ? '发送时间建议' : 'Send proposal'}</h2>
            <div className="mt-4 space-y-3">
              {slots.map((slot, idx) => (
                <input
                  key={idx}
                  type="datetime-local"
                  value={slot}
                  onChange={(event) => setSlots((prev) => prev.map((item, i) => i === idx ? event.target.value : item))}
                  className="h-11 w-full border-2 border-black px-3 font-mono text-sm"
                />
              ))}
              <button
                type="button"
                onClick={() => setSlots((prev) => [...prev, toInputDateTime(new Date(Date.now() + (prev.length + 1) * 24 * 60 * 60 * 1000))].slice(0, 3))}
                className="w-full border-2 border-black bg-white py-2 font-mono text-xs uppercase hover:bg-hopon-grey"
              >
                {isZh ? '添加时间' : 'Add slot'}
              </button>
              <button
                type="button"
                onClick={handlePropose}
                disabled={busy === 'proposal'}
                className="w-full border-2 border-black bg-hopon-black py-3 font-mono text-xs uppercase text-white hover:bg-hopon-red disabled:opacity-50"
              >
                {busy === 'proposal' ? '...' : isZh ? '发送建议' : 'Send proposal'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReopen}
            disabled={busy === 'reopen'}
            className="inline-flex w-full items-center justify-center gap-2 border-2 border-black bg-white py-3 font-mono text-xs uppercase hover:bg-hopon-grey disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            {isZh ? '重开排期' : 'Reopen scheduling'}
          </button>
        </aside>
      </div>
    </div>
  );
};
