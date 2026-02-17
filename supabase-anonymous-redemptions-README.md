# anonymous_redemptions 表说明（给后端）

## 用途
记录**未登录用户**在网站 `/verify` 页「验证/兑换」promo code 的行为。  
前端在用户未登录时只做「验证 + 展示券信息」，不写 `user_coupons`；每次验证成功会往本表 **INSERT 一条**，用于统计/分析。

## 表结构

| 列 | 类型 | 说明 |
|----|------|------|
| id | uuid | 主键，默认 gen_random_uuid() |
| code_id | uuid | FK → codes(id)，ON DELETE SET NULL；可为 NULL |
| code_text | text | 用户输入的码字符串（如 PROMO-VIP） |
| template_code_name | text | 对应券模板 code_name（如 VIP_PRIORITY） |
| redeemed_at | timestamptz | 记录时间，默认 now() |
| metadata | jsonb | 默认 '{}'，后续可扩展 |

索引：`redeemed_at DESC`、`code_id`。

## RLS
- **anon**：只允许 **INSERT**（WITH CHECK true）；**SELECT 显式禁止**（USING false）。
- **authenticated / service_role**：脚本里没有单独策略；默认只有 **service_role** 可绕过 RLS 查全表。若需要「管理员/后台可查」，可取消注释脚本末尾的 `admin_select_anonymous_redemptions` 策略（依赖 `is_code_admin()`）。

## 谁在写、何时写
- **前端**（浏览器 anon key）在「未登录 + 验证成功」时调用 Supabase client：  
  `insert into anonymous_redemptions (code_text, template_code_name, code_id) values (...)`  
- 已登录用户走 RPC `redeem_code` 成功不会写本表，只写 `user_coupons` 等。

## 执行方式
在 Supabase Dashboard → SQL Editor 中执行项目里的 `supabase-anonymous-redemptions.sql` 即可建表并创建上述 RLS 策略。
