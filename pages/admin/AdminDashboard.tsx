import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Clock3, Compass, RefreshCcw, ShieldAlert, Sparkles, UserCheck, X } from 'lucide-react';
import {
  approveAppUser,
  createSourcingRequestFromCampaign,
  getAdminDashboard,
  rejectAppUser,
} from '../../lib/admin/api';
import type { AdminDashboardData } from '../../lib/admin/types';

const statusTone = (status?: string | null): string => {
  const value = String(status ?? '').toLowerCase();
  if (['approved', 'active', 'open', 'ready', 'reviewing', 'merchant_review'].includes(value)) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (['pending', 'running', 'draft'].includes(value)) return 'bg-amber-50 text-amber-800 border-amber-200';
  if (['rejected', 'cancelled', 'closed'].includes(value)) return 'bg-red-50 text-red-800 border-red-200';
  return 'bg-white text-black/60 border-black/10';
};

const StatusPill: React.FC<{ status?: string | null }> = ({ status }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${statusTone(status)}`}>
    {status ?? 'unknown'}
  </span>
);

const StatCard: React.FC<{ label: string; value: number | string; icon: React.ReactNode; hint: string }> = ({ label, value, icon, hint }) => (
  <section className="admin-card p-5">
    <div className="mb-6 flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-hopon-black text-white">{icon}</div>
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-black/40">{label}</span>
    </div>
    <div className="font-display text-4xl font-bold tracking-tight">{value}</div>
    <p className="mt-2 text-sm text-black/55">{hint}</p>
  </section>
);

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getAdminDashboard());
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Failed to load admin dashboard', error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const newestCampaigns = useMemo(() => data?.campaigns.slice(0, 5) ?? [], [data?.campaigns]);
  const requests = useMemo(() => data?.sourcingRequests.slice(0, 5) ?? [], [data?.sourcingRequests]);

  const handleApprove = async (userId: string) => {
    setBusyId(userId);
    setMessage(null);
    try {
      await approveAppUser(userId);
      setMessage({ text: 'User approved.' });
      await load();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not approve user', error: true });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setBusyId(userId);
    setMessage(null);
    try {
      await rejectAppUser(userId);
      setMessage({ text: 'User rejected.' });
      await load();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not reject user', error: true });
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateSourcing = async (campaignId: string) => {
    setBusyId(campaignId);
    setMessage(null);
    try {
      const request = await createSourcingRequestFromCampaign({ campaignId, neededCreatorCount: 8 });
      setMessage({ text: 'Sourcing request created.' });
      await load();
      navigate(`/admin/sourcing/${request.id}`);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not create sourcing request', error: true });
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="admin-card px-6 py-5 font-display font-bold">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-black/50">
            <Compass className="h-4 w-4 text-hopon-red" />
            Admin workspace
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Campaign operations</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/60">
            Review platform users, monitor live campaigns, and move external creator discovery into campaign-specific sourcing workflows.
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

      {data?.setupMissing && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-display font-bold">Database migration required</p>
              <p className="mt-1 text-sm leading-6">
                Apply `20260629090000_add_campaign_sourcing_requests.sql` before using Campaign Sourcing.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pending users" value={data?.counts.pendingUsers ?? 0} icon={<Clock3 className="h-5 w-5" />} hint="Need approval or rejection" />
        <StatCard label="Open campaigns" value={data?.counts.openCampaigns ?? 0} icon={<Compass className="h-5 w-5" />} hint="Active merchant demand" />
        <StatCard label="Campaign Sourcing" value={data?.counts.activeSourcingRequests ?? 0} icon={<UserCheck className="h-5 w-5" />} hint="Campaign-bound pipelines" />
        <StatCard label="Growth OS Discovery" value={data?.counts.growthLeads ?? 0} icon={<Sparkles className="h-5 w-5" />} hint="Internal lead pool" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="admin-card p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Pending accounts</h2>
              <p className="mt-1 text-sm text-black/50">Same app users, now manageable from web.</p>
            </div>
          </div>
          <div className="space-y-3">
            {(data?.pendingUsers.length ?? 0) === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-5 text-sm text-black/50">No pending accounts.</div>
            ) : (
              data?.pendingUsers.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold">{user.email ?? user.id}</p>
                      <StatusPill status={user.role} />
                      <StatusPill status={user.status} />
                    </div>
                    <p className="mt-1 font-mono text-xs text-black/40">{user.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => handleReject(user.id)}
                      className="admin-button inline-flex items-center gap-2 bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-red-700"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => handleApprove(user.id)}
                      className="admin-button inline-flex items-center gap-2 bg-hopon-black px-3 py-2 font-mono text-xs uppercase tracking-wider text-white"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-card p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Campaign Sourcing pipeline</h2>
              <p className="mt-1 text-sm text-black/50">Campaign-bound candidates reviewed before merchant visibility.</p>
            </div>
            <Link to="/admin/sourcing" className="admin-button inline-flex items-center gap-2 bg-white px-3 py-2 font-mono text-xs uppercase tracking-wider text-black/65">
              Open
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 py-5 text-sm text-black/50">No Campaign Sourcing requests yet.</div>
            ) : (
              requests.map((request) => (
                <Link
                  key={request.id}
                  to={`/admin/sourcing/${request.id}`}
                  className="block rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:border-black/25 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-bold">{request.campaign?.title ?? 'Untitled campaign'}</p>
                      <p className="mt-1 text-sm text-black/50">{request.campaign?.restaurant?.name ?? 'Unknown merchant'}</p>
                    </div>
                    <StatusPill status={request.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {request.generatedTags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-[#FAFAF7] px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-black/45">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="admin-card p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Recent campaigns</h2>
            <p className="mt-1 text-sm text-black/50">Create Campaign Sourcing when internal creator matching is not enough.</p>
          </div>
          <Link to="/admin/sourcing" className="font-mono text-xs uppercase tracking-wider text-hopon-red hover:underline">Manage Campaign Sourcing</Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {newestCampaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-bold">{campaign.title}</p>
                    <StatusPill status={campaign.status} />
                  </div>
                  <p className="mt-1 text-sm text-black/50">{campaign.restaurant?.name ?? 'Unknown merchant'} · {campaign.location ?? campaign.restaurant?.cityDisplay ?? 'No location'}</p>
                </div>
                <button
                  type="button"
                  disabled={busyId === campaign.id || data?.setupMissing}
                  onClick={() => handleCreateSourcing(campaign.id)}
                  className="admin-button inline-flex shrink-0 items-center justify-center gap-2 bg-hopon-black px-3 py-2 font-mono text-xs uppercase tracking-wider text-white disabled:opacity-40"
                >
                  <Compass className="h-4 w-4" />
                  Campaign Sourcing
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
