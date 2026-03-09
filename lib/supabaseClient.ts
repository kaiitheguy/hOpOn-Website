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

let _client: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_client) {
    const { url, anonKey } = getSupabaseConfig();
    if (!url || !anonKey) {
      if (typeof window !== 'undefined') {
        console.warn(
          '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set in .env (local) or Cloud Run env (production).'
        );
      }
    }
    _client = createClient(url || '', anonKey || '');
  }
  return _client;
}

/** 单例 Supabase 客户端。本地用 import.meta.env，生产用 window.__RUNTIME_CONFIG__（/config.js）。不写死 key。 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getClient() as Record<string, unknown>)[prop as string];
  },
});

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

/** @deprecated 请直接 import { supabase } from '@/lib/supabaseClient' */
export function getSupabase(): SupabaseClient {
  return getClient();
}

/** validate_code / redeem_code 返回的权益项 */
export type CodeBenefit = {
  type: string;
  value?: unknown;
  title?: string | null;
  description?: string | null;
};

/** validate_code / redeem_code 成功时返回的可直接展示结构（不再需要查 coupon_templates） */
export type ValidateOrRedeemPayload = {
  valid?: boolean;
  success?: boolean;
  code_type: string | null;
  code_id: string | null;
  title: string | null;
  description: string | null;
  benefits: CodeBenefit[];
  reason?: string;
  redemption_id?: string;
};

export type ValidateOrRedeemResult =
  | { ok: true; data: ValidateOrRedeemPayload }
  | { ok: false; reason: string };

/** 将 RPC 返回的 JSONB 转为统一结果；失败时用 reason。支持 valid/success/ok 任一为 true，或有效载荷在 data 里。 */
function normalizeRpcResponse(raw: unknown): ValidateOrRedeemResult {
  let d = raw as Record<string, unknown> | null;
  if (!d || typeof d !== 'object') {
    return { ok: false, reason: 'invalid_code' };
  }
  if (d.data != null && typeof d.data === 'object' && !Array.isArray(d.data)) {
    d = d.data as Record<string, unknown>;
  }
  const valid = d.valid === true || d.success === true || d.ok === true;
  const reason = typeof d.reason === 'string' ? d.reason : 'invalid_code';
  if (valid) {
    const payload: ValidateOrRedeemPayload = {
      valid: d.valid === true,
      success: d.success === true,
      code_type: (d.code_type as string | null) ?? null,
      code_id: (d.code_id as string | null) ?? null,
      title: (d.title as string | null) ?? null,
      description: (d.description as string | null) ?? null,
      benefits: Array.isArray(d.benefits)
        ? (d.benefits as CodeBenefit[]).map((b) => ({
            type: typeof b?.type === 'string' ? b.type : '',
            value: (b as CodeBenefit).value,
            title: (b as CodeBenefit).title ?? null,
            description: (b as CodeBenefit).description ?? null,
          }))
        : [],
      reason: reason,
      redemption_id: d.redemption_id as string | undefined,
    };
    return { ok: true, data: payload };
  }
  return { ok: false, reason };
}

/** 仅校验码，不兑换。RPC: validate_code(p_code)。 */
export async function validateCode(codeText: string): Promise<ValidateOrRedeemResult> {
  const supabase = getClient();
  const { data, error } = await supabase.rpc('validate_code', {
    p_code: codeText.trim(),
  });
  if (error) {
    console.error('[validate_code RPC error]', error.message, error);
    return { ok: false, reason: 'invalid_code' };
  }
  return normalizeRpcResponse(data);
}

/** 校验并兑换。RPC: redeem_code(p_code)。要求已登录；未登录时返回 reason: not_authenticated。 */
export async function redeemCode(codeText: string): Promise<ValidateOrRedeemResult> {
  const supabase = getClient();
  const { data, error } = await supabase.rpc('redeem_code', {
    p_code: codeText.trim(),
  });
  if (error) {
    console.error('[redeem_code RPC error]', error.message, error);
    return { ok: false, reason: 'invalid_code' };
  }
  return normalizeRpcResponse(data);
}

/** 记录未登录用户的 promocode 兑换（仅插入，不阻塞 UI）。 */
export function trackAnonymousRedemption(payload: {
  code_text: string;
  template_code_name: string;
  code_id?: string;
}): void {
  try {
    getClient()
      .from('anonymous_redemptions')
      .insert({
        code_text: payload.code_text.trim(),
        template_code_name: payload.template_code_name,
        code_id: payload.code_id || null,
      })
      .then(({ error }) => {
        if (error) console.warn('[trackAnonymousRedemption]', error.message);
      });
  } catch {
    // 忽略：未配置 Supabase 或表不存在时不报错
  }
}
