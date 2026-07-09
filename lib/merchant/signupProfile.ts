import { supabase } from '../supabaseClient';

export type MerchantSignupProfile = {
  name: string;
  location: string;
  category: string;
  cuisine_tags: string[];
  description: string | null;
  contact_type: 'wechat' | 'phone';
  contact_value: string | null;
  contact_wechat: string | null;
  notes: string | null;
};

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const SIGNUP_ROLE_KEY = 'hopon_signup_role';
const RESTAURANT_PROFILE_KEY = 'hopon_restaurant_profile';

export class SignupProfileError extends Error {
  stage: 'account' | 'restaurant_profile';
  source?: SupabaseLikeError;

  constructor(stage: SignupProfileError['stage'], source?: SupabaseLikeError) {
    super(formatSignupProfileError(stage, source));
    this.name = 'SignupProfileError';
    this.stage = stage;
    this.source = source;
  }
}

export function buildMerchantSignupMetadata(profile: MerchantSignupProfile): Record<string, unknown> {
  return {
    [SIGNUP_ROLE_KEY]: 'restaurant',
    [RESTAURANT_PROFILE_KEY]: profile,
  };
}

export function readMerchantSignupProfile(metadata: unknown): MerchantSignupProfile | null {
  if (!metadata || typeof metadata !== 'object') return null;
  const record = metadata as Record<string, unknown>;
  if (record[SIGNUP_ROLE_KEY] !== 'restaurant') return null;
  const profile = record[RESTAURANT_PROFILE_KEY];
  if (!profile || typeof profile !== 'object') return null;
  const raw = profile as Partial<MerchantSignupProfile>;
  if (!raw.name || !raw.location || !raw.category || !raw.contact_type) return null;
  if (raw.contact_type !== 'wechat' && raw.contact_type !== 'phone') return null;
  return {
    name: String(raw.name),
    location: String(raw.location),
    category: String(raw.category),
    cuisine_tags: Array.isArray(raw.cuisine_tags) ? raw.cuisine_tags.map(String) : [],
    description: raw.description ? String(raw.description) : null,
    contact_type: raw.contact_type,
    contact_value: raw.contact_value ? String(raw.contact_value) : null,
    contact_wechat: raw.contact_wechat ? String(raw.contact_wechat) : null,
    notes: raw.notes ? String(raw.notes) : null,
  };
}

export function formatSignupProfileError(stage: SignupProfileError['stage'], error?: SupabaseLikeError): string {
  const prefix = stage === 'account'
    ? 'Account setup failed'
    : 'Store profile setup failed';
  if (!error?.message) return `${prefix}. Please try again or contact hOpOn.`;
  if (error.code === '23505') return 'This email is already registered. Please login or use another email.';
  if (/row-level security|permission denied|not authorized/i.test(error.message)) {
    return `${prefix}: permission was denied. Please confirm your email first or contact hOpOn.`;
  }
  if (/violates not-null constraint/i.test(error.message)) {
    return `${prefix}: a required field is missing. Please review the highlighted signup step.`;
  }
  return `${prefix}: ${error.message}`;
}

export async function completeMerchantSignupProfile(params: {
  userId: string;
  email: string;
  profile: MerchantSignupProfile;
}): Promise<void> {
  const { userId, email, profile } = params;
  const { error: appUserError } = await supabase
    .from('app_users')
    .upsert({
      id: userId,
      role: 'restaurant',
      status: 'pending',
      email,
    }, { onConflict: 'id' });

  if (appUserError) {
    throw new SignupProfileError('account', appUserError);
  }

  const { error: profileError } = await supabase
    .from('restaurant_profiles')
    .upsert({
      id: userId,
      ...profile,
    }, { onConflict: 'id' });

  if (profileError) {
    throw new SignupProfileError('restaurant_profile', profileError);
  }
}
