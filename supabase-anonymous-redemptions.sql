-- 未登录用户的 promocode 兑换记录表
-- 在 Supabase Dashboard → SQL Editor 中执行

CREATE TABLE IF NOT EXISTS public.anonymous_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid REFERENCES public.codes(id) ON DELETE SET NULL,
  code_text text NOT NULL,
  template_code_name text NOT NULL,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_anonymous_redemptions_redeemed_at
  ON public.anonymous_redemptions(redeemed_at DESC);
CREATE INDEX IF NOT EXISTS idx_anonymous_redemptions_code_id
  ON public.anonymous_redemptions(code_id);

COMMENT ON TABLE public.anonymous_redemptions IS '未登录用户在 /verify 页兑换 promocode 的记录（仅验证/展示，未写 user_coupons）';

-- RLS：匿名用户只能 INSERT，不能 SELECT/UPDATE/DELETE；管理员可查
ALTER TABLE public.anonymous_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_anonymous_redemptions"
  ON public.anonymous_redemptions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_anonymous_redemptions_deny"
  ON public.anonymous_redemptions
  FOR SELECT
  TO anon
  USING (false);

-- 已登录用户不写入此表，若需要可加 authenticated 只读策略；管理员用 service_role 或 is_code_admin() 查
-- 例：允许 is_code_admin() 查全部
-- CREATE POLICY "admin_select_anonymous_redemptions"
--   ON public.anonymous_redemptions FOR SELECT TO authenticated
--   USING (public.is_code_admin());
