import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      VITE_SUPABASE_URL?: string;
      VITE_SUPABASE_ANON_KEY?: string;
      GEMINI_API_KEY?: string;
    };
  }
}

function getSupabaseConfig(): { url: string; anonKey: string } {
  const runtime = typeof window !== 'undefined' ? window.__RUNTIME_CONFIG__ : undefined;
  const url = runtime?.VITE_SUPABASE_URL ?? import.meta.env?.VITE_SUPABASE_URL ?? '';
  const anonKey = runtime?.VITE_SUPABASE_ANON_KEY ?? import.meta.env?.VITE_SUPABASE_ANON_KEY ?? '';
  return { url, anonKey };
}

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    const { url, anonKey } = getSupabaseConfig();
    if (!url || !anonKey) {
      throw new Error(
        'Redeem is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as Cloud Run environment variables (or in .env for local dev).'
      );
    }
    client = createClient(url, anonKey);
  }
  return client;
}

/** 券模板：coupon_templates 表，用于展示「这类券是什么」 */
export type CouponTemplate = {
  title: string | null;
  description: string | null;
  terms: string | null;
  code_name?: string;
  icon?: string;
};

export type RedeemResult =
  | { ok: true; templateCodeName: string }
  | { ok: false; errorCode: string; rawMessage?: string };

/** Call RPC redeem_code(p_code, p_context, p_data). Returns template code name on success. */
export async function redeemCode(codeText: string): Promise<RedeemResult> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('redeem_code', {
    p_code: codeText.trim(),
    p_context: null,
    p_data: null,
  });

  if (error) {
    // Debug: always log full RPC error to console
    console.error('[redeem_code RPC error]', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    const msg = (error.message || '').toUpperCase();
    let errorCode = 'UNKNOWN';
    if (msg.includes('NOT_FOUND') || msg.includes('CODE_NOT_FOUND')) errorCode = 'CODE_NOT_FOUND';
    else if (msg.includes('INACTIVE') || msg.includes('CODE_INACTIVE')) errorCode = 'CODE_INACTIVE';
    else if (msg.includes('EXPIRED') || msg.includes('CODE_EXPIRED')) errorCode = 'CODE_EXPIRED';
    else if (msg.includes('MAX_USES') || msg.includes('USED_UP')) errorCode = 'CODE_MAX_USES';
    return { ok: false, errorCode, rawMessage: error.message };
  }

  const name = data?.template_code_name ?? data?.templateCodeName ?? data;
  if (name && typeof name === 'string') {
    return { ok: true, templateCodeName: name };
  }
  const rpcError = (data as { ok?: boolean; error?: string } | null)?.error;
  if (rpcError === 'not_authenticated') {
    return { ok: false, errorCode: 'NOT_AUTHENTICATED', rawMessage: rpcError };
  }
  console.warn('[redeem_code] unexpected data shape', data);
  return { ok: false, errorCode: 'UNKNOWN', rawMessage: 'RPC returned no template code name' };
}

/** 用 code_name 查 coupon_templates，取 title、description、terms/term 等。 */
export async function getCouponTemplate(
  templateCodeName: string
): Promise<CouponTemplate | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('coupon_templates')
    .select('title, description, terms, term, code_name, icon')
    .eq('code_name', templateCodeName)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[getCouponTemplate]', error.message, error);
    return null;
  }
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    title: (row.title as string) ?? null,
    description: (row.description as string) ?? null,
    terms: (row.terms as string) ?? (row.term as string) ?? null,
    code_name: row.code_name as string | undefined,
    icon: row.icon as string | undefined,
  };
}

/** Fallback: verify-only. Query codes + code_benefits (coupon) + coupon_templates. */
export async function verifyCodeOnly(codeText: string): Promise<RedeemResult & { template?: CouponTemplate }> {
  const supabase = getSupabase();
  const code = codeText.trim();
  if (!code) return { ok: false, errorCode: 'CODE_NOT_FOUND' };

  // 只查 codes 表的 code 列（表里没有 code_text 列，不要用 code_text 会 400）
  const { data: codeRow, error: codeError } = await supabase
    .from('codes')
    .select('id, is_active, valid_from, valid_until, max_uses, used_count')
    .eq('code', code)
    .maybeSingle();

  if (codeError) {
    console.error('[verifyCodeOnly] codes 查询失败', { error: codeError, queryCode: code });
    return { ok: false, errorCode: 'CODE_NOT_FOUND' };
  }
  if (!codeRow) {
    console.warn('[verifyCodeOnly] codes 无匹配行 (code 列)', { queryCode: code, hint: '若 Supabase 返回 200 但无数据，多半是 codes 表 RLS 未允许 anon SELECT，需在 Table Editor → codes → RLS 里为 anon 添加 SELECT policy' });
    return { ok: false, errorCode: 'CODE_NOT_FOUND' };
  }
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

  const { data: benefit, error: benefitError } = await supabase
    .from('code_benefits')
    .select('id, code_id, benefit_type, benefit_value')
    .eq('code_id', codeRow.id)
    .eq('benefit_type', 'coupon')
    .limit(1)
    .maybeSingle();

  if (benefitError) {
    console.error('[verifyCodeOnly] code_benefits 查询失败', { error: benefitError, codeId: codeRow.id });
    return { ok: false, errorCode: 'UNKNOWN', rawMessage: benefitError.message };
  }
  if (!benefit) {
    console.warn('[verifyCodeOnly] 该码没有 coupon 权益', { codeId: codeRow.id, hint: '在 code_benefits 表添加一条 code_id + benefit_type=coupon + benefit_value: { templateCodeName: "券的code_name" }' });
    return { ok: false, errorCode: 'NO_COUPON_BENEFIT' };
  }

  const templateName =
    (benefit.benefit_value as { templateCodeName?: string } | null)?.templateCodeName ?? null;
  if (!templateName) {
    console.warn('[verifyCodeOnly] benefit_value 缺少 templateCodeName', { benefit_value: benefit.benefit_value });
    return { ok: false, errorCode: 'NO_COUPON_BENEFIT' };
  }

  const template = await getCouponTemplate(templateName);
  return { ok: true, templateCodeName: templateName, template: template ?? undefined };
}
