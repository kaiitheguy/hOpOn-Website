import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Plus, RefreshCcw, Search } from 'lucide-react';
import {
  buildSourcingSeed,
  createSourcingRequestFromCampaign,
  listAdminCampaigns,
  listSourcingRequests,
} from '../../lib/admin/api';
import type { AdminCampaign, CampaignSourcingRequest } from '../../lib/admin/types';

const statusClasses: Record<string, string> = {
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  reviewing: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  merchant_review: 'border-teal-200 bg-teal-50 text-teal-800',
  running: 'border-amber-200 bg-amber-50 text-amber-800',
  draft: 'border-black/10 bg-white text-black/55',
  outreach: 'border-blue-200 bg-blue-50 text-blue-800',
  completed: 'border-black/10 bg-[#FAFAF7] text-black/55',
  cancelled: 'border-red-200 bg-red-50 text-red-800',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${tone ?? 'border-black/10 bg-white text-black/50'}`}>
    {children}
  </span>
);

export const AdminSourcing: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [requests, setRequests] = useState<CampaignSourcingRequest[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [neededCount, setNeededCount] = useState('8');
  const [loading, setLoading] = useState(true);
  const [setupMissing, setSetupMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignList, sourcing] = await Promise.all([listAdminCampaigns(80), listSourcingRequests(80)]);
      setCampaigns(campaignList);
      setRequests(sourcing.requests);
      setSetupMissing(sourcing.setupMissing);
      if (!selectedCampaignId && campaignList[0]) {
        setSelectedCampaignId(campaignList[0].id);
      }
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not load sourcing workspace', error: true });
    } finally {
      setLoading(false);
    }
  }, [selectedCampaignId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId]
  );
  const selectedSeed = useMemo(() => (selectedCampaign ? buildSourcingSeed(selectedCampaign) : null), [selectedCampaign]);
  const handleNeededCountChange = (value: string) => {
    setNeededCount(value.replace(/\D/g, ''));
  };

  const handleCreate = async () => {
    if (!selectedCampaignId || setupMissing || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const parsedNeededCount = Number(neededCount);
      const normalizedNeededCount = Number.isFinite(parsedNeededCount) && parsedNeededCount > 0
        ? Math.min(50, Math.round(parsedNeededCount))
        : 8;
      const request = await createSourcingRequestFromCampaign({
        campaignId: selectedCampaignId,
        neededCreatorCount: normalizedNeededCount,
      });
      navigate(`/admin/sourcing/${request.id}`);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not create sourcing request', error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-black/50">
            <Search className="h-4 w-4 text-hopon-red" />
            Campaign Sourcing
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Campaign Sourcing</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-black/60">
            Turn a merchant campaign into Growth OS search filters, review candidates, copy outreach drafts, and decide what becomes merchant-visible.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="admin-button inline-flex items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-xs uppercase tracking-wider text-black/65"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${message.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {message.text}
        </div>
      )}

      {setupMissing && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          Apply the campaign sourcing migration before creating requests.
        </div>
      )}

      <section className="admin-card p-5">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Create Campaign Sourcing request</h2>
            <p className="mt-1 text-sm leading-6 text-black/55">
              Pick a live merchant campaign. hOpOn will generate Growth OS filters and keep the outreach process human-reviewed.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/50">Campaign</label>
                <select
                  value={selectedCampaignId}
                  onChange={(event) => setSelectedCampaignId(event.target.value)}
                  className="admin-input h-12 w-full px-3 text-sm"
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.restaurant?.name ?? 'Unknown'} · {campaign.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/50">Creators needed</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="8"
                  value={neededCount}
                  onChange={(event) => handleNeededCountChange(event.target.value)}
                  className="admin-input h-12 w-full px-3 text-sm"
                />
              </div>
              <button
                type="button"
                disabled={!selectedCampaignId || setupMissing || busy}
                onClick={handleCreate}
                className="admin-button inline-flex h-12 w-full items-center justify-center gap-2 bg-hopon-black px-4 font-display text-sm font-bold uppercase tracking-wider text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Create Campaign Sourcing
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-bold tracking-tight">Generated search brief</h3>
                <p className="mt-1 text-sm text-black/45">Editable in future; generated from campaign and merchant profile for now.</p>
              </div>
              <Compass className="h-5 w-5 text-hopon-red" />
            </div>
            {selectedSeed ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Pill>{selectedSeed.filters.city}</Pill>
                  {selectedSeed.platforms.map((platform) => (
                    <Pill key={platform}>{platform}</Pill>
                  ))}
                  <Pill>{selectedSeed.filters.minFollowers?.toLocaleString()}-{selectedSeed.filters.maxFollowers?.toLocaleString()} followers</Pill>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSeed.tags.slice(0, 8).map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-2xl border border-black/10 bg-white p-4 text-sm leading-6 text-black/65">
                  {selectedSeed.brief}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-black/45">Select a campaign to preview Growth OS filters.</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-card p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Campaign Sourcing requests</h2>
            <p className="mt-1 text-sm text-black/50">Each request is attached to one campaign and can import Growth OS leads.</p>
          </div>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/50">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/50">No Campaign Sourcing requests yet.</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {requests.map((request) => (
              <Link
                key={request.id}
                to={`/admin/sourcing/${request.id}`}
                className="group rounded-3xl border border-black/10 bg-white p-5 transition hover:border-black/25 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-xl font-bold tracking-tight">{request.campaign?.title ?? 'Untitled campaign'}</p>
                    <p className="mt-1 text-sm text-black/50">
                      {request.campaign?.restaurant?.name ?? 'Unknown merchant'} · {String(request.filters.city ?? 'No city')}
                    </p>
                  </div>
                  <Pill tone={statusClasses[request.status] ?? statusClasses.draft}>{request.status}</Pill>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {request.generatedTags.slice(0, 5).map((tag) => (
                    <Pill key={tag}>{tag}</Pill>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-sm text-black/45">
                  <span>{request.neededCreatorCount} creators needed</span>
                  <span className="inline-flex items-center gap-1 text-hopon-red">
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
