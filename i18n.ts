export type Locale = 'en' | 'zh';

const translations: Record<
  Locale,
  {
    pageTitle: string;
    placeholder: string;
    redeemButton: string;
    redeemMore: string;
    successTitle: string;
    failedTitle: string;
    tryAgain: string;
    notConfigured: string;
    errors: Record<string, string>;
  }
> = {
  en: {
    pageTitle: 'Redeem your code',
    placeholder: 'PROMOCODE',
    redeemButton: 'Redeem',
    redeemMore: 'Redeem more',
    successTitle: 'Redeemed',
    failedTitle: 'Failed',
    tryAgain: 'Try again',
    notConfigured: 'Redeem is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as Cloud Run environment variables.',
    errors: {
      CODE_NOT_FOUND: 'Code not found',
      CODE_INACTIVE: 'Code inactive',
      CODE_EXPIRED: 'Code expired',
      CODE_MAX_USES: 'Code used up',
      NOT_AUTHENTICATED: 'Please sign in to redeem',
      NO_COUPON_BENEFIT: 'This code has no coupon benefit configured',
      UNKNOWN: 'Something went wrong',
    },
  },
  zh: {
    pageTitle: '兑换优惠码',
    placeholder: 'PROMOCODE',
    redeemButton: '兑换',
    redeemMore: '兑换更多',
    successTitle: '兑换成功',
    failedTitle: '兑换失败',
    tryAgain: '再试一次',
    notConfigured: '未配置兑换功能。请在 Cloud Run 环境变量中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。',
    errors: {
      CODE_NOT_FOUND: '邀请码不存在',
      CODE_INACTIVE: '邀请码已停用',
      CODE_EXPIRED: '邀请码已过期',
      CODE_MAX_USES: '邀请码已用完',
      NOT_AUTHENTICATED: '请先登录后再兑换',
      NO_COUPON_BENEFIT: '该码未配置券权益',
      UNKNOWN: '出错了，请重试',
    },
  },
};

export function getT(locale: Locale) {
  return translations[locale] ?? translations.en;
}

export function getErrorMessage(locale: Locale, errorCode: string): string {
  const t = getT(locale);
  return t.errors[errorCode] ?? t.errors.UNKNOWN;
}

export { translations };

// --- Simple hook for locale state (no heavy i18n lib) ---
import { useState, useCallback } from 'react';

export function useLocale(
  initial: Locale = 'en'
): [Locale, (l: Locale) => void, ReturnType<typeof getT>] {
  const [locale, setLocale] = useState<Locale>(initial);
  const setLocaleCB = useCallback((l: Locale) => setLocale(l), []);
  return [locale, setLocaleCB, getT(locale)];
}
