export type PasswordPolicyIssue =
  | 'min_length'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'whitespace'
  | 'repeated'
  | 'common'
  | 'email_local_part';

const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  'qwerty123',
  'admin123',
  'letmein1',
  'welcome1',
  'hopon123',
]);

export function validatePasswordStrength(password: string, email?: string): PasswordPolicyIssue | null {
  if (password.length < 8) return 'min_length';
  if (/\s/.test(password)) return 'whitespace';
  if (!/[A-Z]/.test(password)) return 'uppercase';
  if (!/[a-z]/.test(password)) return 'lowercase';
  if (!/[0-9]/.test(password)) return 'number';
  if (/^(.)\1+$/.test(password)) return 'repeated';
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return 'common';
  const emailLocal = email?.split('@')[0]?.trim().toLowerCase();
  if (emailLocal && emailLocal.length >= 4 && lower.includes(emailLocal)) return 'email_local_part';
  return null;
}

export function passwordPolicyText(): string {
  return 'Use at least 8 characters with uppercase, lowercase, and a number. Avoid spaces, your email name, or common passwords.';
}

export function passwordPolicyError(issue: PasswordPolicyIssue): string {
  const messages: Record<PasswordPolicyIssue, string> = {
    min_length: 'Password must be at least 8 characters.',
    uppercase: 'Password must include at least one uppercase letter.',
    lowercase: 'Password must include at least one lowercase letter.',
    number: 'Password must include at least one number.',
    whitespace: 'Password cannot contain spaces.',
    repeated: 'Password cannot repeat the same character only.',
    common: 'This password is too common. Choose a stronger password.',
    email_local_part: 'Password should not include your email username.',
  };
  return messages[issue];
}
