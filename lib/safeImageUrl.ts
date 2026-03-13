/**
 * Browsers block file:// and other non-http(s) URLs in <img src> (e.g. paths from mobile ImagePicker).
 * Use this to only set src when the URL is safe for web.
 */
export function isSafeImageUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:|data:)/i.test(url.trim());
}
