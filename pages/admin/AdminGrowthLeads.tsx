import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseZap, ExternalLink, RefreshCcw, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { listGrowthOsLeads, runGrowthOsDiscovery } from '../../lib/admin/api';
import type { GrowthOsLead } from '../../lib/admin/types';

function profileUrl(lead: GrowthOsLead): string | null {
  if (lead.instagramUrl) return lead.instagramUrl;
  if (lead.instagramUsername) return `https://www.instagram.com/${lead.instagramUsername.replace(/^@+/, '')}/`;
  if (lead.tiktokUrl) return lead.tiktokUrl;
  if (lead.tiktokUsername) return `https://www.tiktok.com/@${lead.tiktokUsername.replace(/^@+/, '')}`;
  return null;
}

function followerLabel(value?: number | null): string {
  if (!value) return 'Unknown audience';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M followers`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K followers`;
  return `${value} followers`;
}

function parseCategories(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${tone ?? 'border-black/10 bg-white text-black/50'}`}>
    {children}
  </span>
);

const PlatformToggle: React.FC<{
  active: boolean;
  label: string;
  onClick: () => void;
}> = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`admin-button inline-flex h-11 items-center justify-center px-4 font-mono text-xs uppercase tracking-wider ${
      active ? 'border-hopon-black bg-hopon-black text-white' : 'bg-white text-black/60'
    }`}
  >
    {label}
  </button>
);

export const AdminGrowthLeads: React.FC = () => {
  const [leads, setLeads] = useState<GrowthOsLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [city, setCity] = useState('New York');
  const [categoryText, setCategoryText] = useState('dessert, cafe, local food');
  const [platforms, setPlatforms] = useState<string[]>(['instagram']);
  const [minFollowers, setMinFollowers] = useState('1000');
  const [maxFollowers, setMaxFollowers] = useState('50000');
  const [dryRun, setDryRun] = useState(false);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  const categories = useMemo(() => parseCategories(categoryText), [categoryText]);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      setLeads(await listGrowthOsLeads(80));
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Could not load Growth OS leads', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePlatform = (platform: string) => {
    setPlatforms((current) => {
      if (current.includes(platform)) {
        const next = current.filter((item) => item !== platform);
        return next.length ? next : current;
      }
      return [...current, platform];
    });
  };

  const runDiscovery = async () => {
    setRunning(true);
    setMessage(null);
    setDiagnostics([]);
    try {
      const result = await runGrowthOsDiscovery({
        city,
        categories,
        platforms,
        minFollowers: Number(minFollowers) || 1000,
        maxFollowers: Number(maxFollowers) || 50000,
        dryRun,
      });
      setMessage({
        text: `Discovery completed: ${result.discoveredCount} found, ${result.insertedCount} inserted, ${result.updatedCount} updated, ${result.rejectedCount} rejected, ${result.errorCount} errors.`,
      });
      setDiagnostics(result.diagnostics);
      await load();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'Growth OS Discovery failed', error: true });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-black/50">
            <Sparkles className="h-4 w-4 text-hopon-red" />
            Growth OS Discovery
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Internal lead pool</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-black/60">
            Search for foreign Instagram or TikTok creators and save them into the internal Growth OS lead pool. These leads are not attached to a campaign and are not merchant-visible.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="admin-button inline-flex items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-xs uppercase tracking-wider text-black/65"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh leads
        </button>
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${message.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
          {message.text}
        </div>
      )}

      <section className="admin-card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.48fr]">
          <div className="p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-[#FAFAF7]">
                <DatabaseZap className="h-5 w-5 text-hopon-red" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">Run Growth OS Discovery</h2>
                <p className="mt-1 text-sm text-black/50">Use this for admin research and reusable creator pool building.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/50">City</label>
                <input value={city} onChange={(event) => setCity(event.target.value)} className="admin-input h-12 w-full px-3 text-sm" />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/50">Platforms</label>
                <div className="flex gap-2">
                  <PlatformToggle active={platforms.includes('instagram')} label="Instagram" onClick={() => togglePlatform('instagram')} />
                  <PlatformToggle active={platforms.includes('tiktok')} label="TikTok" onClick={() => togglePlatform('tiktok')} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/50">Categories</label>
                <input
                  value={categoryText}
                  onChange={(event) => setCategoryText(event.target.value)}
                  className="admin-input h-12 w-full px-3 text-sm"
                  placeholder="dessert, cafe, matcha"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/50">Min followers</label>
                <input
                  type="number"
                  min={0}
                  value={minFollowers}
                  onChange={(event) => setMinFollowers(event.target.value)}
                  className="admin-input h-12 w-full px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-black/50">Max followers</label>
                <input
                  type="number"
                  min={0}
                  value={maxFollowers}
                  onChange={(event) => setMaxFollowers(event.target.value)}
                  className="admin-input h-12 w-full px-3 text-sm"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-3 text-sm text-black/60">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(event) => setDryRun(event.target.checked)}
                  className="h-4 w-4 accent-hopon-red"
                />
                Dry run only, do not write new leads
              </label>
              <button
                type="button"
                disabled={running || categories.length === 0 || platforms.length === 0}
                onClick={runDiscovery}
                className="admin-button inline-flex h-12 items-center justify-center gap-2 bg-hopon-black px-5 font-display text-sm font-bold uppercase tracking-wider text-white disabled:opacity-40"
              >
                <Search className="h-4 w-4" />
                {running ? 'Running...' : 'Run Discovery'}
              </button>
            </div>

            {diagnostics.length > 0 && (
              <div className="mt-5 rounded-3xl border border-black/10 bg-[#FAFAF7] p-4">
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-black/45">Diagnostics</p>
                <div className="space-y-2">
                  {diagnostics.map((item, index) => (
                    <pre key={`${index}-${item.slice(0, 12)}`} className="whitespace-pre-wrap text-xs leading-5 text-black/55">
                      {item}
                    </pre>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="border-t border-black/10 bg-[#FAFAF7] p-5 lg:border-l lg:border-t-0 md:p-6">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-black/45">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              Two separate workflows
            </div>
            <div className="mt-5 space-y-4 text-sm leading-6 text-black/60">
              <div>
                <p className="font-display text-lg font-bold text-black">Growth OS Discovery</p>
                <p>Builds an internal creator pool from city, category, platform, and follower filters.</p>
              </div>
              <div>
                <p className="font-display text-lg font-bold text-black">Campaign Sourcing</p>
                <p>Starts from a specific merchant campaign, imports candidates for admin review, and controls merchant visibility.</p>
              </div>
            </div>
            <Link
              to="/admin/sourcing"
              className="admin-button mt-6 inline-flex w-full items-center justify-center gap-2 bg-white px-4 py-3 font-mono text-xs uppercase tracking-wider text-black/65"
            >
              Open Campaign Sourcing
            </Link>
          </aside>
        </div>
      </section>

      <section className="admin-card p-5">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">Growth OS leads</h2>
            <p className="mt-1 text-sm text-black/50">Reusable creator leads from internal discovery and campaign sourcing runs.</p>
          </div>
          <Pill>{leads.length} loaded</Pill>
        </div>
        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/50">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-5 text-sm text-black/50">
            No Growth OS leads found yet.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {leads.map((lead) => {
              const url = profileUrl(lead);
              return (
                <article key={lead.id} className="rounded-3xl border border-black/10 bg-white p-5 transition hover:border-black/25 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight">{lead.displayName || 'Unnamed creator'}</h3>
                      <p className="mt-1 text-sm text-black/50">
                        {lead.city ?? 'Unknown city'} · {followerLabel(lead.followers)}
                      </p>
                    </div>
                    {lead.overallScore != null && (
                      <div className="rounded-2xl bg-hopon-black px-3 py-2 text-center text-white">
                        <div className="font-display text-xl font-bold">{Math.round(Number(lead.overallScore))}</div>
                        <div className="font-mono text-[10px] uppercase tracking-wider opacity-70">score</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lead.platforms?.map((platform) => <Pill key={platform}>{platform}</Pill>)}
                    {lead.primaryCategory && <Pill>{lead.primaryCategory}</Pill>}
                    {lead.status && <Pill>{lead.status}</Pill>}
                  </div>
                  <p className="mt-4 min-h-16 text-sm leading-6 text-black/60">
                    {lead.creatorSummary ?? lead.bio ?? 'No creator summary yet.'}
                  </p>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-button mt-5 inline-flex items-center gap-2 bg-[#FAFAF7] px-3 py-2 font-mono text-xs uppercase tracking-wider text-black/65"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open profile
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
