import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    }
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

export type CouponTemplate = {
  title: string | null;
  description: string | null;
  terms: string | null;
  code?: string;
};

export type RedeemResult =
  | { ok: true; templateCodeName: string }
  | { ok: false; errorCode: string };

/** Call RPC redeem_code(code_text). Returns template code name on success. */
export async function redeemCode(codeText: string): Promise<RedeemResult> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('redeem_code', {
    code_text: codeText.trim(),
  });

  if (error) {
    const msg = (error.message || '').toUpperCase();
    let errorCode = 'UNKNOWN';
    if (msg.includes('NOT_FOUND') || msg.includes('CODE_NOT_FOUND')) errorCode = 'CODE_NOT_FOUND';
    else if (msg.includes('INACTIVE') || msg.includes('CODE_INACTIVE')) errorCode = 'CODE_INACTIVE';
    else if (msg.includes('EXPIRED') || msg.includes('CODE_EXPIRED')) errorCode = 'CODE_EXPIRED';
    else if (msg.includes('MAX_USES') || msg.includes('USED_UP')) errorCode = 'CODE_MAX_USES';
    return { ok: false, errorCode };
  }

  const name = data?.template_code_name ?? data?.templateCodeName ?? data;
  if (name && typeof name === 'string') {
    return { ok: true, templateCodeName: name };
  }
  return { ok: false, errorCode: 'UNKNOWN' };
}

/** Fetch coupon_templates by code/template name. */
export async function getCouponTemplate(
  templateCodeName: string
): Promise<CouponTemplate | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('coupon_templates')
    .select('title, description, terms, code')
    .or(`code.eq.${templateCodeName},id.eq.${templateCodeName}`)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as CouponTemplate;
}

/** Fallback: verify-only. Query codes + code_benefits (coupon) + coupon_templates. */
export async function verifyCodeOnly(codeText: string): Promise<RedeemResult & { template?: CouponTemplate }> {
  const supabase = getSupabase();
  const code = codeText.trim();
  if (!code) return { ok: false, errorCode: 'CODE_NOT_FOUND' };

  const { data: codeRow, error: codeError } = await supabase
    .from('codes')
    .select('id, is_active, valid_from, valid_until, max_uses, used_count')
    .eq('code_text', code)
    .maybeSingle();

  if (codeError || !codeRow) return { ok: false, errorCode: 'CODE_NOT_FOUND' };
  if (codeRow.is_active === false) return { ok: false, errorCode: 'CODE_INACTIVE' };

  const now = new Date().toISOString();
  if (codeRow.valid_from && codeRow.valid_from > now) return { ok: false, errorCode: 'CODE_EXPIRED' };
  if (codeRow.valid_until && codeRow.valid_until < now) return { ok: false, errorCode: 'CODE_EXPIRED' };
  if (
    typeof codeRow.max_uses === 'number' &&
    typeof codeRow.used_count === 'number' &&
    codeRow.used_count >= codeRow.max_uses
  ) {
    return { ok: false, errorCode: 'CODE_MAX_USES' };
  }

  const { data: benefit } = await supabase
    .from('code_benefits')
    .select('template_code_name, templateCodeName')
    .eq('code_id', codeRow.id)
    .eq('benefit_type', 'coupon')
    .limit(1)
    .maybeSingle();

  const templateName =
    benefit?.template_code_name ?? benefit?.templateCodeName ?? null;
  if (!templateName) return { ok: false, errorCode: 'UNKNOWN' };

  const template = await getCouponTemplate(templateName);
  return { ok: true, templateCodeName: templateName, template: template ?? undefined };
}
