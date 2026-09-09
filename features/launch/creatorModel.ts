export type CreatorStage = 'brief' | 'applied' | 'accepted' | 'received' | 'submitted' | 'approved' | 'posted' | 'paid';
export const creatorStages: CreatorStage[] = ['brief', 'applied', 'accepted', 'received', 'submitted', 'approved', 'posted', 'paid'];

export function validInstagramHandle(value: string) {
  return /^@?[a-zA-Z0-9._]{1,30}$/.test(value.trim());
}

export function validHttpsUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && url.hostname.includes('.') && !url.username && !url.password;
  } catch { return false; }
}

export function validInstagramPost(value: string) {
  if (!validHttpsUrl(value)) return false;
  const url = new URL(value.trim());
  return ['instagram.com', 'www.instagram.com'].includes(url.hostname) && /^\/(reel|p)\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname);
}

export function advanceCreatorStage(current: CreatorStage, next: CreatorStage): CreatorStage {
  return creatorStages.indexOf(next) === creatorStages.indexOf(current) + 1 ? next : current;
}
