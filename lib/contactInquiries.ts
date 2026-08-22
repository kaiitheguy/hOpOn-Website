import { isSupabaseConfigured, supabase } from './supabaseClient';

export type ContactInquiryType =
  | 'merchant_pilot'
  | 'platform_partnership'
  | 'creator_partnership'
  | 'support'
  | 'other';

export type ContactInquiryInput = {
  inquiryType: ContactInquiryType;
  companyName: string;
  contactName: string;
  workEmail: string;
  roleTitle?: string;
  website?: string;
  locationCount?: number;
  message: string;
  consentToContact: boolean;
  honeypot?: string;
};

export type ContactInquiryResult =
  | { ok: true; duplicate: boolean }
  | { ok: false; reason: 'not_configured' | 'invalid_submission' | 'submit_failed' };

function normalizeWebsite(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export async function submitPublicContactInquiry(input: ContactInquiryInput): Promise<ContactInquiryResult> {
  if (!isSupabaseConfigured()) return { ok: false, reason: 'not_configured' };

  const { data, error } = await supabase.rpc('submit_public_contact_inquiry', {
    p_inquiry_type: input.inquiryType,
    p_company_name: input.companyName.trim(),
    p_contact_name: input.contactName.trim(),
    p_work_email: input.workEmail.trim().toLowerCase(),
    p_message: input.message.trim(),
    p_role_title: input.roleTitle?.trim() || null,
    p_website: normalizeWebsite(input.website),
    p_location_count: Number.isFinite(input.locationCount) ? input.locationCount : null,
    p_source_path: typeof window === 'undefined' ? '/contact' : window.location.pathname,
    p_consent_to_contact: input.consentToContact,
    p_honeypot: input.honeypot?.trim() || null,
  });

  if (error) {
    console.warn('[submit_public_contact_inquiry]', error.message);
    return { ok: false, reason: 'submit_failed' };
  }

  const row = data as Record<string, unknown> | null;
  if (row?.ok !== true) return { ok: false, reason: 'invalid_submission' };
  return { ok: true, duplicate: row.duplicate === true };
}
