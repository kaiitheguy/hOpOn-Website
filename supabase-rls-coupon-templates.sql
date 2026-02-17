-- 允许匿名用户读取 coupon_templates 表（用于 /verify 页展示券的 title、description、terms）
-- 在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 若你的表名是 coupon_templates：
CREATE POLICY "anon_select_coupon_templates"
ON public.coupon_templates
FOR SELECT
TO anon
USING (true);

-- 若你的表名是 templates（没有 coupon_ 前缀），用下面这条替代上面：
-- CREATE POLICY "anon_select_templates"
-- ON public.templates
-- FOR SELECT
-- TO anon
-- USING (true);
