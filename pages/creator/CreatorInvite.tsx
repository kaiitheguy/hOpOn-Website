import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Download, Instagram, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { passwordPolicyError, passwordPolicyText, validatePasswordStrength } from '../../lib/passwordPolicy';
import { LEGAL_VERSION } from '../../lib/legal';

type InvitePreview = {
  invite?: {
    status?: string | null;
    claimed?: boolean | null;
    applicationId?: string | null;
    invitedEmail?: string | null;
    invitedEmailMasked?: string | null;
    inviteSource?: string | null;
    registeredAt?: string | null;
  };
  campaign?: {
    title?: string | null;
    description?: string | null;
    offer?: string | null;
    location?: string | null;
    platforms?: string[];
    startDate?: string | null;
    endDate?: string | null;
    merchant?: {
      name?: string | null;
      category?: string | null;
      city?: string | null;
    };
  };
  creatorFit?: {
    platform?: string | null;
    handle?: string | null;
    reasons?: string[];
  };
  compensationNote?: string | null;
  claim?: {
    ok?: boolean;
    nextAction?: string | null;
    applicationId?: string | null;
    message?: string | null;
  };
};

const APP_STORE_URL = 'https://apps.apple.com/us/app/hopon-%E4%B8%B2%E5%BA%97/id6757418054';
const CONTACT_EMAIL = 'contact@thehoponapp.com';

function normalizeHandle(value?: string | null): string {
  return String(value ?? '').trim().replace(/^@+/, '');
}

function creatorFacingFitReasons(preview: InvitePreview | null): string[] {
  const rawReasons = preview?.creatorFit?.reasons ?? [];
  const publicReasons = rawReasons.filter((reason) => {
    const lower = reason.toLowerCase();
    return !(
      lower.includes('provided by admin') ||
      lower.includes('manually invited') ||
      lower.includes('application after email verification')
    );
  });
  if (preview?.invite?.inviteSource === 'manual_admin') {
    const platform = preview.creatorFit?.platform === 'tiktok' ? 'TikTok' : 'Instagram';
    const handle = normalizeHandle(preview.creatorFit?.handle);
    return [
      'The hOpOn team selected you for this specific local business campaign.',
      handle ? `${platform} profile: @${handle}.` : `Your ${platform} profile will be added during onboarding.`,
      'After email verification, this campaign will appear as accepted in the hOpOn app.',
      ...publicReasons,
    ].slice(0, 4);
  }
  return publicReasons.slice(0, 4);
}

async function inviteErrorMessage(error: unknown, fallback: string): Promise<string> {
  const err = error as { message?: string; context?: Response } | null;
  const context = err?.context;
  if (context instanceof Response) {
    try {
      const payload = await context.clone().json();
      if (payload?.error) return String(payload.error);
      if (payload?.message) return String(payload.message);
    } catch {
      try {
        const text = await context.clone().text();
        if (text.trim()) return text.trim();
      } catch {
        // Ignore and use Supabase's fallback message.
      }
    }
  }
  return err?.message || fallback;
}

export const CreatorInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const deepLink = token ? `hamono:///creator-invite?token=${encodeURIComponent(token)}` : 'hamono:///';
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [signupBusy, setSignupBusy] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [formMessage, setFormMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadPreview = async () => {
      if (!token) return;
      setLoadingPreview(true);
      const { data, error } = await supabase.functions.invoke('resolve-creator-invite', {
        body: { action: 'resolve', token },
      });
      if (!cancelled) {
        if (!error && data?.ok) {
          const nextPreview = data as InvitePreview;
          setPreview(nextPreview);
          setRegistered(Boolean(nextPreview.invite?.registeredAt || nextPreview.invite?.status === 'registered'));
          if (nextPreview.invite?.invitedEmail) setEmail(nextPreview.invite.invitedEmail);
        }
        setLoadingPreview(false);
      }
    };
    loadPreview();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const claimInvite = async () => {
    if (!token || claimBusy) return;
    setClaimBusy(true);
    setFormMessage(null);
    const { data, error } = await supabase.functions.invoke('resolve-creator-invite', {
      body: { action: 'claim', token },
    });
    if (error || !data?.ok) {
      const message = error
        ? await inviteErrorMessage(error, 'Could not complete this invite.')
        : data?.error || 'Could not complete this invite.';
      setFormMessage({ text: message, error: true });
      setClaimBusy(false);
      return;
    }
    setPreview(data as InvitePreview);
    setRegistered(true);
    setFormMessage({ text: data?.claim?.message || 'Invite accepted. Download the app and sign in with this email.' });
    setClaimBusy(false);
  };

  useEffect(() => {
    if (!token || !searchParams.get('verified') || registered || claimBusy) return;
    let cancelled = false;
    const run = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!cancelled && sessionData.session) {
        await claimInvite();
      }
    };
    run();
    return () => {
      cancelled = true;
    };
    // claimInvite intentionally omitted so verified callback runs once per token/session state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, searchParams, registered]);

  const handleSignup = async () => {
    if (!token || signupBusy) return;
    const inviteEmail = preview?.invite?.invitedEmail?.trim();
    const emailToUse = (inviteEmail || email).trim().toLowerCase();
    if (!emailToUse) {
      setFormMessage({ text: 'Enter your email address.', error: true });
      return;
    }
    if (inviteEmail && emailToUse !== inviteEmail.toLowerCase()) {
      setFormMessage({ text: 'Use the email address this invite was generated for.', error: true });
      return;
    }
    const passwordIssue = validatePasswordStrength(password, emailToUse);
    if (passwordIssue) {
      setFormMessage({ text: passwordPolicyError(passwordIssue), error: true });
      return;
    }
    if (password !== confirmPassword) {
      setFormMessage({ text: 'Passwords do not match.', error: true });
      return;
    }
    if (!acceptedLegal) {
      setFormMessage({ text: 'Agree to the Terms of Use and acknowledge the Privacy Policy to create an account.', error: true });
      return;
    }

    setSignupBusy(true);
    setFormMessage(null);
    const redirectTo = `${window.location.origin}/auth/callback?creator_invite_token=${encodeURIComponent(token)}`;
    const { data, error } = await supabase.auth.signUp({
      email: emailToUse,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          creator_invite_token: token,
          hopon_signup_role: 'creator',
          role: 'creator',
          hopon_terms_version: LEGAL_VERSION,
          hopon_privacy_version: LEGAL_VERSION,
          hopon_legal_accepted_at: new Date().toISOString(),
        },
      },
    });
    if (error) {
      setFormMessage({ text: error.message, error: true });
      setSignupBusy(false);
      return;
    }

    if (data.session) {
      await claimInvite();
    } else {
      setFormMessage({
        text: `Check ${emailToUse} for the verification email. After verification, this page will finish your invite automatically.`,
      });
    }
    setSignupBusy(false);
  };

  const merchantName = preview?.campaign?.merchant?.name ?? 'a local hOpOn merchant';
  const campaignTitle = preview?.campaign?.title ?? 'a hOpOn creator campaign';
  const campaignDescription = preview?.campaign?.description;
  const offer = preview?.campaign?.offer;
  const fitReasons = creatorFacingFitReasons(preview);
  const invitedEmail = preview?.invite?.invitedEmail ?? '';
  const emailLocked = Boolean(invitedEmail);
  const canSignup = Boolean(token && (invitedEmail || email.trim()) && password && confirmPassword && acceptedLegal && !signupBusy);
  const appStoreButton = (
    <a
      href={APP_STORE_URL}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-hopon-black px-5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-hopon-red"
    >
      <Download className="h-4 w-4" />
      Download on App Store
    </a>
  );

  return (
    <div className="min-h-screen bg-[#F7F2E8] text-hopon-black">
      <style>{`
        .creator-invite-bg {
          background:
            radial-gradient(circle at 16% 10%, rgba(255,42,42,0.14), transparent 28rem),
            radial-gradient(circle at 84% 6%, rgba(13,148,136,0.10), transparent 24rem),
            linear-gradient(180deg, #fbf6ec 0%, #f7f2e8 56%, #f2e5d6 100%);
        }
      `}</style>
      <main className="creator-invite-bg flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl rounded-[34px] border border-black/10 bg-white/82 p-6 shadow-[0_28px_90px_rgba(20,14,8,0.10)] backdrop-blur md:p-10">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                  <rect x="11" y="2" width="2" height="20" fill="#5C3A21" stroke="black" strokeWidth="1.5" />
                  <rect x="5" y="6" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="7" width="2" height="2" fill="white" fillOpacity="0.85" />
                  <rect x="5" y="14" width="14" height="6" rx="1" fill="#FF2A2A" stroke="black" strokeWidth="1.5" />
                  <rect x="14" y="15" width="2" height="2" fill="white" fillOpacity="0.85" />
                </svg>
              </div>
              <div>
                <div className="font-display text-2xl font-bold tracking-tight">hOpOn</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-black/45">creator invite</div>
              </div>
            </Link>
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-emerald-800 sm:inline-flex">
              Campaign invite
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#FAFAF7] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-black/50">
                <Instagram className="h-4 w-4 text-hopon-red" />
                Local business collaboration
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
                {preview ? `${merchantName} invited you to ${campaignTitle}.` : `You were invited to a hOpOn creator campaign.`}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-black/65">
                {preview
                  ? `This private invite lets you create a hOpOn creator account with the invited email. After email verification, this campaign will already be accepted in the app so you can review the brief and next steps.`
                  : 'hOpOn connects creators with local restaurants, cafes, dessert shops, and other neighborhood businesses. Campaigns can be free experiences, product exchanges, or paid collaborations, depending on the merchant brief.'}
              </p>
              {loadingPreview && <p className="mt-4 font-mono text-xs uppercase tracking-wider text-black/35">Loading invite details...</p>}
              {preview && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Merchant</div>
                    <div className="mt-1 font-display text-lg font-bold">{merchantName}</div>
                    <div className="mt-1 text-sm text-black/55">{[preview.campaign?.merchant?.category, preview.campaign?.merchant?.city].filter(Boolean).join(' · ')}</div>
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Offer / budget</div>
                    <div className="mt-1 text-sm leading-6 text-black/65">{offer || 'Campaign-specific collaboration details will be shown in the app.'}</div>
                  </div>
                  {campaignDescription && (
                    <div className="rounded-2xl border border-black/10 bg-white p-4 sm:col-span-2">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Brief</div>
                      <div className="mt-1 text-sm leading-6 text-black/65">{campaignDescription}</div>
                    </div>
                  )}
                </div>
              )}
              {registered ? (
                <div className="mt-7 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-700" />
                    <div>
                      <h2 className="font-display text-2xl font-bold tracking-tight text-emerald-950">You're in.</h2>
                      <p className="mt-2 text-sm leading-6 text-emerald-900">
                        Your hOpOn creator account is approved and this campaign is accepted. Download the app, sign in with the same email, and continue from Work.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    {appStoreButton}
                    <a
                      href={deepLink}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-white px-5 font-mono text-xs uppercase tracking-wider text-emerald-900 transition hover:border-emerald-500"
                    >
                      Open hOpOn app
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-7 rounded-3xl border border-black/10 bg-[#FAFAF7] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-hopon-red" />
                    <h2 className="font-display text-2xl font-bold tracking-tight">Set your creator password</h2>
                  </div>
                  <p className="mb-4 text-sm leading-6 text-black/55">
                    Use the invited email below, choose a password, and verify your email. hOpOn will approve your creator account and add this campaign automatically.
                  </p>
                  <div className="grid gap-3">
                    <label className="block">
                      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Email</span>
                      <input
                        type="email"
                        value={emailLocked ? invitedEmail : email}
                        onChange={(event) => setEmail(event.target.value)}
                        readOnly={emailLocked}
                        className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-hopon-red/50"
                        placeholder="creator@example.com"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Password</span>
                        <input
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-hopon-red/50"
                          autoComplete="new-password"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-black/40">Confirm password</span>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none transition focus:border-hopon-red/50"
                          autoComplete="new-password"
                        />
                      </label>
                    </div>
                    <p className="text-xs leading-5 text-black/45">{passwordPolicyText()}</p>
                    <label className="flex items-start gap-3 text-sm leading-6 text-black/60">
                      <input
                        type="checkbox"
                        checked={acceptedLegal}
                        onChange={(event) => setAcceptedLegal(event.target.checked)}
                        className="mt-1 h-4 w-4 accent-hopon-red"
                      />
                      <span>
                        I agree to the{' '}
                        <Link to="/terms" target="_blank" rel="noreferrer" className="font-semibold text-hopon-black underline underline-offset-4">
                          Terms of Use
                        </Link>{' '}
                        and acknowledge the{' '}
                        <Link to="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-hopon-black underline underline-offset-4">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    {formMessage && (
                      <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${formMessage.error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                        {formMessage.text}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={!canSignup}
                      onClick={handleSignup}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-hopon-black px-5 font-display text-sm font-bold uppercase tracking-wider text-white transition hover:bg-hopon-red disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {signupBusy ? 'Sending verification...' : 'Create account and verify email'}
                      {!signupBusy && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              {token && (
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-black/35">
                  Invite token: {token.slice(0, 8)}...
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-black/10 bg-[#FAFAF7] p-5 md:p-6">
              <div className="mb-5 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <h2 className="font-display text-2xl font-bold tracking-tight">What happens next</h2>
              </div>
              <div className="space-y-4">
                {[
                  'Create your hOpOn creator account with the invited email and verify it.',
                  'Download hOpOn and sign in with the same email.',
                  'Open the accepted campaign in Work and review the brief, deliverables, timing, and compensation before posting.',
                  'Add or confirm your Instagram/TikTok handle or profile link in the app.',
                  'Submit approved post links and redemption details through hOpOn so campaign results can be tracked.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    <p className="text-sm leading-6 text-black/65">{item}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                {preview?.compensationNote || "Compensation, free experiences, product exchanges, and customer incentives are defined by each campaign. hOpOn's platform subscription does not automatically include creator payment."}
              </p>
              {fitReasons.length > 0 && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="font-display text-sm font-bold text-emerald-950">Why we invited you</div>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-emerald-900">
                    {fitReasons.slice(0, 4).map((reason) => <li key={reason}>• {reason}</li>)}
                  </ul>
                </div>
              )}
              <div className="mt-5 rounded-2xl border border-black/10 bg-white p-4">
                <div className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-black">
                  <Smartphone className="h-4 w-4 text-hopon-red" />
                  Download hOpOn
                </div>
                <p className="text-sm leading-6 text-black/60">
                  You can download the app now. After your email is verified, sign in with the same email to continue this campaign.
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {appStoreButton}
                  <a
                    href={`mailto:${CONTACT_EMAIL}?subject=hOpOn creator invite help&body=Invite token: ${encodeURIComponent(token ?? '')}`}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-[#FAFAF7] px-4 font-mono text-xs uppercase tracking-wider text-black/60 transition hover:border-black/25"
                  >
                    Contact hOpOn
                  </a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
