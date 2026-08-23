import { isSupabaseConfigured, supabase } from './supabaseClient';
import type { PricingPlanId } from '../components/PricingSection';

export type SubscriptionPlanId = PricingPlanId;

export type SubscriptionErrorCode =
  | 'not_configured'
  | 'invalid_plan'
  | 'invalid_origin'
  | 'checkout_failed'
  | 'invalid_checkout_url'
  | 'invalid_session'
  | 'session_lookup_failed'
  | 'invalid_session_response'
  | 'claim_failed'
  | 'billing_failed'
  | 'invalid_billing_url'
  | 'not_authenticated';

export interface SubscriptionError {
  code: SubscriptionErrorCode;
  message: string;
}

export type StartSubscriptionCheckoutResult =
  | {
      ok: true;
      checkoutUrl: string;
      planId: SubscriptionPlanId;
      clientRequestId: string;
    }
  | { ok: false; error: SubscriptionError };

export interface SubscriptionCheckoutStatus {
  status: string;
  confirmed: boolean;
  planId: SubscriptionPlanId | null;
  planName: string | null;
  trialEnd: string | null;
  founding: boolean;
}

export type GetSubscriptionCheckoutResult =
  | { ok: true; data: SubscriptionCheckoutStatus }
  | { ok: false; error: SubscriptionError };

export type BillingPortalResult =
  | { ok: true; portalUrl: string }
  | { ok: false; error: SubscriptionError };

export type ClaimSubscriptionCheckoutResult =
  | { ok: true; claimed: boolean }
  | { ok: false; error: SubscriptionError };

const PLAN_IDS: readonly SubscriptionPlanId[] = ['starter', 'growth', 'multi-location'];
const REQUEST_KEY_PREFIX = 'hopon_checkout_request_';
const CHECKOUT_SESSION_PATTERN = /^cs_(?:test|live)_[A-Za-z0-9]+$/;
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PLAN_NAMES: Record<SubscriptionPlanId, string> = {
  starter: 'Starter',
  growth: 'Growth',
  'multi-location': 'Multi-location',
};

const CONFIRMED_STATUSES = new Set([
  'active',
  'complete',
  'completed',
  'confirmed',
  'paid',
  'success',
  'succeeded',
  'trialing',
]);

const ERROR_MESSAGES: Record<SubscriptionErrorCode, string> = {
  not_configured: 'Checkout is unavailable right now. Please try again later.',
  invalid_plan: 'Please choose a valid plan and try again.',
  invalid_origin: 'Checkout is unavailable from this page. Please try again.',
  checkout_failed: 'We could not start checkout. Please try again.',
  invalid_checkout_url: 'We could not open secure checkout. Please try again.',
  invalid_session: 'This checkout link is missing or expired. Please return to pricing.',
  session_lookup_failed: 'We could not confirm this checkout. Please refresh and try again.',
  invalid_session_response: 'We could not confirm this checkout yet. Please refresh and try again.',
  claim_failed: 'We could not link this checkout to your account. Please retry.',
  billing_failed: 'We could not open billing management. Please try again.',
  invalid_billing_url: 'We could not open secure billing management. Please try again.',
  not_authenticated: 'Please sign in to manage billing.',
};

function errorResult(code: SubscriptionErrorCode): { ok: false; error: SubscriptionError } {
  return { ok: false, error: { code, message: ERROR_MESSAGES[code] } };
}

function isPlanId(value: unknown): value is SubscriptionPlanId {
  return typeof value === 'string' && PLAN_IDS.includes(value as SubscriptionPlanId);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function unwrap(value: unknown): Record<string, unknown> {
  const row = record(value);
  const nested = record(row.data);
  return Object.keys(nested).length > 0 ? nested : row;
}

function stringValue(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function firstString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = stringValue(row[key]);
    if (value) return value;
  }
  return null;
}

function isStripeHostedUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isStripeHost = hostname === 'stripe.com' || hostname.endsWith('.stripe.com');
    return url.protocol === 'https:' && isStripeHost && !url.username && !url.password && !url.port;
  } catch {
    return false;
  }
}

function safeSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function randomRequestId(): string | null {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const requestId = crypto.randomUUID();
    return UUID_V4_PATTERN.test(requestId) ? requestId : null;
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return null;
}

function requestStorageKey(planId: SubscriptionPlanId): string {
  return `${REQUEST_KEY_PREFIX}${planId}`;
}

function getOrCreateClientRequestId(planId: SubscriptionPlanId): string | null {
  const storage = safeSessionStorage();
  const key = requestStorageKey(planId);
  const existing = storage?.getItem(key)?.trim();
  if (existing && UUID_V4_PATTERN.test(existing)) return existing;
  if (existing) {
    try {
      storage?.removeItem(key);
    } catch {
      // A stale request id should not block creation of a valid UUID.
    }
  }

  const requestId = randomRequestId();
  if (!requestId) return null;
  try {
    storage?.setItem(key, requestId);
  } catch {
    // Private browsing or a full session store should not block checkout.
  }
  return requestId;
}

export function clearSubscriptionCheckoutRequest(planId: SubscriptionPlanId): void {
  try {
    safeSessionStorage()?.removeItem(requestStorageKey(planId));
  } catch {
    // Storage cleanup is best effort and must not block a return navigation.
  }
}

export function isConfirmedSubscriptionStatus(status: string | null | undefined, explicitConfirmed = false): boolean {
  return explicitConfirmed || CONFIRMED_STATUSES.has(status?.trim().toLowerCase() ?? '');
}

export function normalizeCheckoutSessionId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length >= 24 && normalized.length <= 256 && CHECKOUT_SESSION_PATTERN.test(normalized) ? normalized : null;
}

function statusFromRow(row: Record<string, unknown>): { status: string; confirmed: boolean } {
  const status = firstString(row, ['status', 'checkoutStatus', 'checkout_status', 'state']) ?? 'unknown';
  return {
    status,
    confirmed: isConfirmedSubscriptionStatus(status, row.confirmed === true),
  };
}

function errorCodeFromInvokeError(error: unknown, fallback: SubscriptionErrorCode): SubscriptionErrorCode {
  const row = record(error);
  const status = typeof row.status === 'number' ? row.status : null;
  return status === 401 || status === 403 ? 'not_authenticated' : fallback;
}

/** Start a hosted Stripe Checkout session without exposing provider details to the UI. */
export async function startSubscriptionCheckout(planId: SubscriptionPlanId): Promise<StartSubscriptionCheckoutResult> {
  if (!isPlanId(planId)) return errorResult('invalid_plan');
  if (!isSupabaseConfigured()) return errorResult('not_configured');
  if (typeof window === 'undefined' || !window.location.origin) return errorResult('invalid_origin');

  const clientRequestId = getOrCreateClientRequestId(planId);
  if (!clientRequestId) return errorResult('checkout_failed');
  try {
    const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
      body: {
        planId,
        origin: window.location.origin,
        clientRequestId,
      },
    });

    if (error) return errorResult(errorCodeFromInvokeError(error, 'checkout_failed'));
    const row = unwrap(data);
    const checkoutUrl = firstString(row, ['checkoutUrl', 'checkout_url', 'url']);
    if (!isStripeHostedUrl(checkoutUrl)) return errorResult('invalid_checkout_url');

    return { ok: true, checkoutUrl, planId, clientRequestId };
  } catch {
    return errorResult('checkout_failed');
  }
}

/** Read server-confirmed checkout state. A returned pending state is never treated as success. */
export async function getSubscriptionCheckout(sessionId: string): Promise<GetSubscriptionCheckoutResult> {
  const normalizedSessionId = normalizeCheckoutSessionId(sessionId);
  if (!normalizedSessionId) {
    return errorResult('invalid_session');
  }
  if (!isSupabaseConfigured()) return errorResult('not_configured');

  try {
    const { data, error } = await supabase.functions.invoke('get-subscription-checkout', {
      body: { sessionId: normalizedSessionId },
    });
    if (error) return errorResult(errorCodeFromInvokeError(error, 'session_lookup_failed'));

    const row = unwrap(data);
    const state = statusFromRow(row);
    const rawPlanId = firstString(row, ['planId', 'plan_id']);
    const planId = isPlanId(rawPlanId) ? rawPlanId : null;
    const planName = firstString(row, ['planName', 'plan_name']) ?? (planId ? PLAN_NAMES[planId] : null);
    const trialEnd = firstString(row, ['trialEnd', 'trial_end']);
    const founding = row.founding === true || row.isFounding === true || row.is_founding === true;

    if (state.status === 'unknown' && !state.confirmed && !planId && !planName && !trialEnd) {
      return errorResult('invalid_session_response');
    }

    return {
      ok: true,
      data: {
        status: state.status,
        confirmed: state.confirmed,
        planId,
        planName,
        trialEnd,
        founding,
      },
    };
  } catch {
    return errorResult('session_lookup_failed');
  }
}

/** Idempotently attach a confirmed checkout to the authenticated hOpOn account. */
export async function claimSubscriptionCheckout(sessionId: string): Promise<ClaimSubscriptionCheckoutResult> {
  const normalizedSessionId = normalizeCheckoutSessionId(sessionId);
  if (!normalizedSessionId) return errorResult('invalid_session');
  if (!isSupabaseConfigured()) return errorResult('not_configured');

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return errorResult('not_authenticated');

    const { data, error } = await supabase.functions.invoke('claim-subscription-checkout', {
      body: { sessionId: normalizedSessionId },
    });
    if (error) return errorResult(errorCodeFromInvokeError(error, 'claim_failed'));

    const row = unwrap(data);
    if (row.ok !== true && row.claimed !== true && row.status !== 'claimed' && row.status !== 'already_claimed') {
      return errorResult('claim_failed');
    }
    return { ok: true, claimed: row.claimed !== false };
  } catch {
    return errorResult('claim_failed');
  }
}

/** Create a customer billing portal session and only return a verified Stripe URL. */
export async function createBillingPortal(returnUrl: string): Promise<BillingPortalResult> {
  if (!isSupabaseConfigured()) return errorResult('not_configured');
  const normalizedReturnUrl = returnUrl.trim();
  if (!normalizedReturnUrl) return errorResult('billing_failed');

  try {
    const { data, error } = await supabase.functions.invoke('create-billing-portal', {
      body: { returnUrl: normalizedReturnUrl },
    });
    if (error) return errorResult(errorCodeFromInvokeError(error, 'billing_failed'));
    const row = unwrap(data);
    const portalUrl = firstString(row, ['portalUrl', 'portal_url', 'url']);
    if (!isStripeHostedUrl(portalUrl)) return errorResult('invalid_billing_url');
    return { ok: true, portalUrl };
  } catch {
    return errorResult('billing_failed');
  }
}
