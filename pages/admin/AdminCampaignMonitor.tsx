import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Link2,
  MapPinCheck,
  RefreshCcw,
  Search,
  Send,
  TestTube2,
  UsersRound,
} from 'lucide-react';
import { getAdminCampaignMonitor } from '../../lib/admin/api';
import type {
  AdminCampaignMonitorData,
  AdminCampaignMonitorRow,
  AdminInviteMonitorItem,
  AdminInviteUsageState,
} from '../../lib/admin/types';

type CampaignFilter = 'all' | 'open' | 'closed';
type InviteFilter = 'all' | AdminInviteUsageState;

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const campaignStatusTone = (status: string): string => {
  const value = status.toLowerCase();
  if (value === 'open') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (value === 'closed') return 'border-black/10 bg-[#F6F4EF] text-black/55';
  return 'border-amber-200 bg-amber-50 text-amber-800';
};

const inviteTone: Record<AdminInviteUsageState, string> = {
  unused: 'border-amber-200 bg-amber-50 text-amber-800',
  used: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  expired: 'border-black/10 bg-[#F6F4EF] text-black/55',
  revoked: 'border-red-200 bg-red-50 text-red-800',
};

const FilterButton: React.FC<{
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}> = ({ active, label, count, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`admin-button inline-flex min-h-10 shrink-0 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-wider ${
      active ? 'border-hopon-black bg-hopon-black text-white' : 'bg-white text-black/55'
    }`}
  >
    {label}
    {count != null ? <span className={active ? 'text-white/65' : 'text-black/35'}>{count}</span> : null}
  </button>
);

const SummaryCard: React.FC<{
  label: string;
  value: number;
  note: string;
  icon: React.ReactNode;
}> = ({ label, value, note, icon }) => (
  <section className="admin-card min-w-0 p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-black/45">{label}</p>
        <p className="mt-3 font-display text-4xl font-bold tracking-tight">{value}</p>
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-hopon-black text-white">{icon}</div>
    </div>
    <p className="mt-3 text-sm text-black/50">{note}</p>
  </section>
);

const CampaignPipeline: React.FC<{ row: AdminCampaignMonitorRow }> = ({ row }) => {
  const stages = [
    { label: 'Apply', value: row.stages.applications },
    { label: 'Visit', value: row.stages.visit },
    { label: 'Draft', value: row.stages.draft },
    { label: 'Final', value: row.stages.final },
    { label: 'Done', value: row.stages.done },
  ];

  return (
    <div className="grid grid-cols-5 overflow-hidden rounded-2xl border border-black/10 bg-[#FAFAF7]">
      {stages.map((stage, index) => (
        <div key={stage.label} className={`min-w-0 px-2 py-3 text-center ${index > 0 ? 'border-l border-black/10' : ''}`}>
          <div className="font-display text-xl font-bold leading-none">{stage.value}</div>
          <div className="mt-1 truncate font-mono text-[9px] uppercase tracking-wide text-black/40 sm:text-[10px]">{stage.label}</div>
        </div>
      ))}
    </div>
  );
};

const CampaignRow: React.FC<{ row: AdminCampaignMonitorRow }> = ({ row }) => (
  <article className="border-t border-black/10 px-4 py-5 first:border-t-0 md:px-5">
    <div className="grid gap-4 xl:grid-cols-[minmax(240px,0.8fr)_minmax(420px,1.25fr)_260px] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 truncate font-display text-lg font-bold tracking-tight">{row.campaign.title}</h3>
          <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${campaignStatusTone(row.campaign.status)}`}>
            {row.campaign.status}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-black/50">{row.campaign.restaurant?.name ?? 'Unknown merchant'}</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-black/35">
          {formatDate(row.campaign.startDate)} – {formatDate(row.campaign.endDate)}
        </p>
        {row.stages.rejected > 0 ? (
          <p className="mt-1 text-xs text-black/35">{row.stages.rejected} closed application{row.stages.rejected === 1 ? '' : 's'}</p>
        ) : null}
      </div>

      <CampaignPipeline row={row} />

      <div className="grid grid-cols-3 gap-2">
        <div className="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2">
          <div className="flex items-center gap-1.5 text-black/40"><Send className="h-3.5 w-3.5" /><span className="font-mono text-[9px] uppercase tracking-wide">Invites</span></div>
          <p className="mt-1 font-display font-bold">{row.usedInviteCount}<span className="text-black/30">/{row.inviteCount}</span></p>
        </div>
        <div className="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2">
          <div className="flex items-center gap-1.5 text-black/40"><MapPinCheck className="h-3.5 w-3.5" /><span className="font-mono text-[9px] uppercase tracking-wide">Visits</span></div>
          <p className="mt-1 font-display font-bold">{row.trackedVisits}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2">
          <div className="flex items-center gap-1.5 text-black/40"><UsersRound className="h-3.5 w-3.5" /><span className="font-mono text-[9px] uppercase tracking-wide">Active</span></div>
          <p className="mt-1 font-display font-bold">{row.totalApplications - row.stages.rejected}</p>
        </div>
      </div>
    </div>
  </article>
);

const InviteRow: React.FC<{
  invite: AdminInviteMonitorItem;
  copied: boolean;
  onCopy: (invite: AdminInviteMonitorItem) => void;
}> = ({ invite, copied, onCopy }) => (
  <article className="grid gap-3 border-t border-black/10 px-4 py-4 first:border-t-0 md:px-5 lg:grid-cols-[1.1fr_1.2fr_0.7fr_0.65fr_auto] lg:items-center">
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="truncate font-display font-bold">{invite.creatorName || invite.creatorHandle || invite.invitedEmail || 'Creator invite'}</p>
        <span className={`rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${inviteTone[invite.usageState]}`}>
          {invite.usageState}
        </span>
      </div>
      <p className="mt-1 truncate text-sm text-black/45">
        {invite.creatorHandle ? `@${String(invite.creatorHandle).replace(/^@+/, '')}` : invite.invitedEmail || 'No contact saved'}
        {invite.platform ? ` · ${invite.platform}` : ''}
      </p>
    </div>

    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-black/75">{invite.campaignTitle}</p>
      <p className="mt-1 truncate text-sm text-black/45">{invite.merchantName}</p>
    </div>

    <div>
      <p className="font-mono text-[9px] uppercase tracking-wider text-black/35">Created</p>
      <p className="mt-1 text-sm text-black/65">{formatDate(invite.createdAt)}</p>
    </div>

    <div>
      <p className="font-mono text-[9px] uppercase tracking-wider text-black/35">{invite.usageState === 'used' ? 'Used' : 'Source'}</p>
      <p className="mt-1 truncate text-sm text-black/65">{invite.usageState === 'used' ? formatDate(invite.usedAt) : invite.inviteSource || 'Growth OS'}</p>
    </div>

    <div className="flex items-center gap-2 lg:justify-end">
      <button
        type="button"
        disabled={!invite.inviteUrl}
        onClick={() => onCopy(invite)}
        className="admin-button inline-flex h-10 w-10 items-center justify-center bg-white text-black/65 disabled:cursor-not-allowed disabled:opacity-35"
        aria-label="Copy invitation link"
        title="Copy invitation link"
      >
        {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
      </button>
      {invite.inviteUrl ? (
        <a
          href={invite.inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="admin-button inline-flex h-10 w-10 items-center justify-center bg-hopon-black text-white"
          aria-label="Open invitation page"
          title="Open invitation page"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  </article>
);

export const AdminCampaignMonitor: React.FC = () => {
  const [data, setData] = useState<AdminCampaignMonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<CampaignFilter>('all');
  const [excludeTestCampaigns, setExcludeTestCampaigns] = useState(false);
  const [inviteFilter, setInviteFilter] = useState<InviteFilter>('all');
  const [inviteCampaignId, setInviteCampaignId] = useState('all');
  const [copiedCandidateId, setCopiedCandidateId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAdminCampaignMonitor());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load campaign monitor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (data?.campaigns ?? []).filter((row) => {
      const status = String(row.campaign.status).toLowerCase();
      if (excludeTestCampaigns && row.campaign.isInternalTest) return false;
      if (campaignFilter === 'open' && status !== 'open') return false;
      if (campaignFilter === 'closed' && status === 'open') return false;
      if (!query) return true;
      return `${row.campaign.title} ${row.campaign.restaurant?.name ?? ''}`.toLowerCase().includes(query);
    });
  }, [campaignFilter, data?.campaigns, excludeTestCampaigns, search]);

  const testCampaignCount = useMemo(
    () => (data?.campaigns ?? []).filter((row) => row.campaign.isInternalTest).length,
    [data?.campaigns]
  );

  const inviteCampaignOptions = useMemo(() => {
    const campaignsById = new Map<string, { id: string; label: string }>();
    for (const invite of data?.invites ?? []) {
      if (!campaignsById.has(invite.campaignId)) {
        campaignsById.set(invite.campaignId, {
          id: invite.campaignId,
          label: `${invite.campaignTitle} · ${invite.merchantName}`,
        });
      }
    }
    return Array.from(campaignsById.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [data?.invites]);

  const campaignScopedInvites = useMemo(
    () => (data?.invites ?? []).filter((invite) => inviteCampaignId === 'all' || invite.campaignId === inviteCampaignId),
    [data?.invites, inviteCampaignId]
  );

  const inviteCounts = useMemo(() => {
    const invites = campaignScopedInvites;
    return {
      all: invites.length,
      unused: invites.filter((invite) => invite.usageState === 'unused').length,
      used: invites.filter((invite) => invite.usageState === 'used').length,
      expired: invites.filter((invite) => invite.usageState === 'expired').length,
      revoked: invites.filter((invite) => invite.usageState === 'revoked').length,
    };
  }, [campaignScopedInvites]);

  const filteredInvites = useMemo(
    () => campaignScopedInvites.filter((invite) => inviteFilter === 'all' || invite.usageState === inviteFilter),
    [campaignScopedInvites, inviteFilter]
  );

  const copyInvite = async (invite: AdminInviteMonitorItem) => {
    if (!invite.inviteUrl) return;
    await navigator.clipboard.writeText(invite.inviteUrl);
    setCopiedCandidateId(invite.candidateId);
    window.setTimeout(() => setCopiedCandidateId((current) => (current === invite.candidateId ? null : current)), 1500);
  };

  if (loading && !data) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="admin-card flex items-center gap-3 px-6 py-5 font-display font-bold">
          <RefreshCcw className="h-5 w-5 animate-spin text-hopon-red" />
          Loading campaign monitor...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-black/50">
            <Activity className="h-4 w-4 text-hopon-red" />
            Live operations
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Campaign monitor</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-black/60">
            Track invitation usage, creator workflow stages, and visits attributed through creator links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="admin-button inline-flex h-11 items-center justify-center gap-2 bg-white px-4 font-mono text-xs uppercase tracking-wider text-black/65 disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}
      {data?.warnings.map((warning) => (
        <div key={warning} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{warning}</div>
      ))}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Campaigns" value={data?.totals.campaigns ?? 0} note={`${data?.totals.openCampaigns ?? 0} currently open`} icon={<ClipboardCheck className="h-5 w-5" />} />
        <SummaryCard label="Invites used" value={data?.totals.usedInvites ?? 0} note={`of ${data?.totals.invites ?? 0} generated links`} icon={<CheckCircle2 className="h-5 w-5" />} />
        <SummaryCard label="Invites unused" value={data?.totals.unusedInvites ?? 0} note="Ready for follow-up outreach" icon={<Link2 className="h-5 w-5" />} />
        <SummaryCard label="Tracked visits" value={data?.totals.trackedVisits ?? 0} note="30-minute deduped creator-link visits" icon={<MapPinCheck className="h-5 w-5" />} />
      </div>

      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-black/10 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Campaign status</h2>
            <p className="mt-1 text-sm text-black/50">Current creator count at each workflow stage.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <label className="admin-input flex h-10 min-w-0 items-center gap-2 px-3 sm:w-64">
              <Search className="h-4 w-4 shrink-0 text-black/35" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search campaign or merchant"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto">
              <FilterButton active={campaignFilter === 'all'} label="All" count={data?.campaigns.length ?? 0} onClick={() => setCampaignFilter('all')} />
              <FilterButton active={campaignFilter === 'open'} label="Open" count={data?.totals.openCampaigns ?? 0} onClick={() => setCampaignFilter('open')} />
              <FilterButton active={campaignFilter === 'closed'} label="Closed" onClick={() => setCampaignFilter('closed')} />
              <button
                type="button"
                onClick={() => setExcludeTestCampaigns((current) => !current)}
                className={`admin-button inline-flex min-h-10 shrink-0 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-wider ${
                  excludeTestCampaigns ? 'border-hopon-black bg-hopon-black text-white' : 'bg-white text-black/55'
                }`}
              >
                <TestTube2 className="h-3.5 w-3.5" />
                Hide tests
                <span className={excludeTestCampaigns ? 'text-white/65' : 'text-black/35'}>{testCampaignCount}</span>
              </button>
            </div>
          </div>
        </div>
        {filteredCampaigns.length ? (
          filteredCampaigns.map((row) => <CampaignRow key={row.campaign.id} row={row} />)
        ) : (
          <div className="px-5 py-10 text-center text-sm text-black/45">No campaigns match this filter.</div>
        )}
      </section>

      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-black/10 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Invitation links</h2>
            <p className="mt-1 text-sm text-black/50">Direct and Growth OS creator invitations, including claimed registration links.</p>
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:items-end">
            <label className="admin-input flex h-10 min-w-0 items-center px-3 sm:w-80">
              <span className="sr-only">Filter invitation links by campaign</span>
              <select
                value={inviteCampaignId}
                onChange={(event) => setInviteCampaignId(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-black/70 outline-none"
                aria-label="Filter invitation links by campaign"
              >
                <option value="all">All campaigns</option>
                {inviteCampaignOptions.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>{campaign.label}</option>
                ))}
              </select>
            </label>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {(['all', 'unused', 'used', 'expired', 'revoked'] as const).map((filter) => (
                <FilterButton
                  key={filter}
                  active={inviteFilter === filter}
                  label={filter}
                  count={inviteCounts[filter]}
                  onClick={() => setInviteFilter(filter)}
                />
              ))}
            </div>
          </div>
        </div>
        {filteredInvites.length ? (
          filteredInvites.map((invite) => (
            <InviteRow
              key={invite.candidateId}
              invite={invite}
              copied={copiedCandidateId === invite.candidateId}
              onCopy={(item) => void copyInvite(item)}
            />
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-black/45">No invitation links in this state.</div>
        )}
      </section>
    </div>
  );
};
