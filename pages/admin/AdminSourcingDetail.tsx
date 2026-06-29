import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCcw,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  getSourcingDetail,
  importTopGrowthLeadsForRequest,
  runGrowthDiscoveryForRequest,
  updateSourcingCandidate,
  updateSourcingRequestStatus,
} from '../../lib/admin/api';
import type { CampaignSourcingCandidate, CampaignSourcingRequest, SourcingDetail } from '../../lib/admin/types';

const statusTone = (value?: string | null): string => {
  const status = String(value ?? '').toLowerCase();
  if (['shortlisted', 'approved_for_merchant', 'visible', 'interested', 'registered', 'reviewing', 'merchant_review'].includes(status)) {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (['drafted', 'contacted', 'running', 'ready'].includes(status)) return 'border-amber-200 bg-amber-50 text-amber-800';
  if (['rejected', 'declined', 'hidden'].includes(status)) return 'border-red-100 bg-red-50 text-red-700';
  return 'border-black/10 bg-white text-black/55';
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${tone ?? 'border-black/10 bg-white text-black/50'}`}>
    {children}
  </span>
);

function formatFollowers(value?: number | null): string {
  if (!value) return 'Audience unknown';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M followers`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K followers`;
  return `${value} followers`;
}

function candidateTitle(candidate: CampaignSourcingCandidate): string {
  return candidate.displayName || (candidate.handle ? `@${candidate.handle}` : 'Unnamed creator');
}

const CandidateCard: React.FC<{
  candidate: CampaignSourcingCandidate;
  onUpdate: (candidateId: string, patch: Parameters<typeof updateSourcingCandidate>[1]) => Promise<void>;
  busy: boolean;
}> = ({ candidate, onUpdate, busy }) => {
  const [copied, setCopied] = useState<'dm' | 'link' | null>(null);
  const [editing, setEditing] = useState(false);
  const [dmDraft, setDmDraft] = useState(candidate.dmDraft ?? '');

  useEffect(() => {
    setDmDraft(candidate.dmDraft ?? '');
  }, [candidate.dmDraft]);

  const copyDm = async () => {
    if (!candidate.dmDraft) return;
    await navigator.clipboard.writeText(candidate.dmDraft);
    setCopied('dm');
    setTimeout(() => setCopied(null), 1500);
  };

  const copyInviteLink = async () => {
    if (!candidate.inviteUrl) return;
    await navigator.clipboard.writeText(candidate.inviteUrl);
    setCopied('link');
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl font-bold tracking-tight">{candidateTitle(candidate)}</h3>
            {candidate.handle && <Pill>@{candidate.handle}</Pill>}
            <Pill tone={statusTone(candidate.adminStatus)}>{candidate.adminStatus}</Pill>
            <Pill tone={statusTone(candidate.outreachStatus)}>{candidate.outreachStatus}</Pill>
            {candidate.inviteStatus && <Pill tone={statusTone(candidate.inviteStatus)}>invite {candidate.inviteStatus}</Pill>}
            {candidate.merchantVisible && <Pill tone="border-teal-200 bg-teal-50 text-teal-800">merchant visible</Pill>}
          </div>
          <p className="mt-2 text-sm text-black/50">
            {candidate.platform} · {formatFollowers(candidate.followers)} · score {candidate.score ?? 'n/a'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate.profileUrl && (
            <a
              href={candidate.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-button inline-flex items-center gap-2 bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-black/65"
            >
              <ExternalLink className="h-4 w-4" />
              Profile
            </a>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              onUpdate(candidate.id, {
                merchantVisible: !candidate.merchantVisible,
                merchantStatus: candidate.merchantVisible ? 'hidden' : 'visible',
                adminStatus: candidate.merchantVisible ? 'shortlisted' : 'approved_for_merchant',
              })
            }
            className="admin-button inline-flex items-center gap-2 bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-black/65"
          >
            {candidate.merchantVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {candidate.merchantVisible ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate(candidate.id, { outreachStatus: 'contacted' })}
            className="admin-button inline-flex items-center gap-2 bg-hopon-black px-3 py-2 font-mono text-xs uppercase tracking-wider text-white"
          >
            <Send className="h-4 w-4" />
            Mark contacted
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-2xl border border-black/10 bg-[#FAFAF7] p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-black/45">Why this creator</p>
          <div className="space-y-2">
            {candidate.fitReasons.length === 0 ? (
              <p className="text-sm text-black/45">No fit notes yet.</p>
            ) : (
              candidate.fitReasons.map((reason) => (
                <div key={reason} className="flex items-start gap-2 text-sm leading-6 text-black/65">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{reason}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#FAFAF7] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-black/45">DM draft from hOpOn account</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing((value) => !value)}
                className="font-mono text-xs uppercase tracking-wider text-black/50 hover:text-black"
              >
                {editing ? 'Preview' : 'Edit'}
              </button>
              <button
                type="button"
                onClick={copyDm}
                disabled={!candidate.dmDraft}
                className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-hopon-red disabled:text-black/30"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied === 'dm' ? 'Copied' : 'Copy DM'}
              </button>
              <button
                type="button"
                onClick={copyInviteLink}
                disabled={!candidate.inviteUrl}
                className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-hopon-red disabled:text-black/30"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied === 'link' ? 'Copied' : 'Invite URL'}
              </button>
            </div>
          </div>
          {editing ? (
            <div className="space-y-3">
              <textarea
                value={dmDraft}
                onChange={(event) => setDmDraft(event.target.value)}
                className="admin-input min-h-48 w-full p-3 text-sm leading-6"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => onUpdate(candidate.id, { dmDraft, outreachStatus: 'drafted' }).then(() => setEditing(false))}
                className="admin-button inline-flex items-center gap-2 bg-hopon-black px-3 py-2 font-mono text-xs uppercase tracking-wider text-white"
              >
                Save draft
              </button>
            </div>
          ) : (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-sm leading-6 text-black/65">
              {candidate.dmDraft || 'No DM draft yet.'}
            </pre>
          )}
        </div>
      </div>
    </article>
  );
};

export const AdminSourcingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<SourcingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setDetail(await getSourcingDetail(id));
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not load sourcing request', error: true });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const request = detail?.request ?? null;
  const candidates = detail?.candidates ?? [];
  const visibleCount = useMemo(() => candidates.filter((candidate) => candidate.merchantVisible).length, [candidates]);

  const runDiscovery = async () => {
    if (!request) return;
    setBusy('run');
    setMessage(null);
    try {
      const result = await runGrowthDiscoveryForRequest(request);
      setMessage({ text: `Campaign Search completed. Imported ${result.imported} candidates.` });
      await load();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Campaign Search failed', error: true });
    } finally {
      setBusy(null);
    }
  };

  const importLeads = async () => {
    if (!request) return;
    setBusy('import');
    setMessage(null);
    try {
      const count = await importTopGrowthLeadsForRequest(request);
      setMessage({ text: `Imported ${count} candidates from existing Growth OS leads.` });
      await load();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not import leads', error: true });
    } finally {
      setBusy(null);
    }
  };

  const updateCandidate = async (candidateId: string, patch: Parameters<typeof updateSourcingCandidate>[1]) => {
    setBusy(candidateId);
    setMessage(null);
    try {
      await updateSourcingCandidate(candidateId, patch);
      await load();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not update candidate', error: true });
    } finally {
      setBusy(null);
    }
  };

  const advanceToMerchantReview = async () => {
    if (!request) return;
    setBusy('status');
    setMessage(null);
    try {
      await updateSourcingRequestStatus(request.id, 'merchant_review');
      setMessage({ text: 'Request moved to merchant review.' });
      await load();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not update request status', error: true });
    } finally {
      setBusy(null);
    }
  };

  if (loading && !detail) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="admin-card px-6 py-5 font-display font-bold">Loading sourcing request...</div>
      </div>
    );
  }

  if (detail?.setupMissing) {
    return (
      <div className="space-y-4">
        <Link to="/admin/sourcing" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black">
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign Sourcing
        </Link>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Apply the Campaign Sourcing migration before using this page.
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-4">
        <Link to="/admin/sourcing" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black">
          <ArrowLeft className="h-4 w-4" />
          Back to Campaign Sourcing
        </Link>
        <div className="admin-card p-6">Sourcing request not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/sourcing" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black">
        <ArrowLeft className="h-4 w-4" />
        Back to Campaign Sourcing
      </Link>

      <section className="admin-card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.42fr]">
          <div className="p-6 md:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Pill tone={statusTone(request.status)}>{request.status}</Pill>
              {request.platforms.map((platform) => (
                <Pill key={platform}>{platform}</Pill>
              ))}
              <Pill>{visibleCount} visible to merchant</Pill>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">{request.campaign?.title ?? 'Campaign sourcing'}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-black/60">
              {request.campaign?.restaurant?.name ?? 'Unknown merchant'} · {String(request.filters.city ?? request.campaign?.location ?? 'No city')}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {request.generatedTags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
            <pre className="mt-5 max-h-52 overflow-auto whitespace-pre-wrap rounded-3xl border border-black/10 bg-[#FAFAF7] p-4 text-sm leading-6 text-black/65">
              {request.searchBrief || 'No brief available.'}
            </pre>
          </div>

          <aside className="border-t border-black/10 bg-[#FAFAF7] p-6 lg:border-l lg:border-t-0 md:p-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-black/45">Actions</p>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                disabled={busy != null}
                onClick={runDiscovery}
                className="admin-button inline-flex h-12 w-full items-center justify-center gap-2 bg-hopon-black px-4 font-display text-sm font-bold uppercase tracking-wider text-white disabled:opacity-40"
              >
                <Search className="h-4 w-4" />
                Run Campaign Search
              </button>
              <button
                type="button"
                disabled={busy != null}
                onClick={importLeads}
                className="admin-button inline-flex h-12 w-full items-center justify-center gap-2 bg-white px-4 font-mono text-xs uppercase tracking-wider text-black/65 disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                Import existing leads
              </button>
              <button
                type="button"
                disabled={busy != null || visibleCount === 0}
                onClick={advanceToMerchantReview}
                className="admin-button inline-flex h-12 w-full items-center justify-center gap-2 bg-white px-4 font-mono text-xs uppercase tracking-wider text-black/65 disabled:opacity-40"
              >
                <Eye className="h-4 w-4" />
                Send to merchant review
              </button>
              <button
                type="button"
                onClick={load}
                className="admin-button inline-flex h-12 w-full items-center justify-center gap-2 bg-white px-4 font-mono text-xs uppercase tracking-wider text-black/65"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </aside>
        </div>
      </section>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${message.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {message.text}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Candidate review</h2>
            <p className="mt-1 text-sm text-black/50">
              Admin reviews first. Merchant only sees candidates you explicitly show.
            </p>
          </div>
          <Pill>{candidates.length} candidates</Pill>
        </div>

        {candidates.length === 0 ? (
          <div className="admin-card p-8 text-center">
            <p className="font-display text-2xl font-bold">No candidates yet</p>
            <p className="mt-2 text-sm text-black/50">Run Campaign Search or import existing campaign-matched leads to start review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onUpdate={updateCandidate}
                busy={busy === candidate.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
