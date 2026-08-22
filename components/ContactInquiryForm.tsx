import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  submitPublicContactInquiry,
  type ContactInquiryInput,
  type ContactInquiryType,
} from '../lib/contactInquiries';

const inquiryOptions: { value: ContactInquiryType; label: string }[] = [
  { value: 'merchant_pilot', label: 'Merchant pilot' },
  { value: 'platform_partnership', label: 'Platform or integration partnership' },
  { value: 'creator_partnership', label: 'Creator partnership' },
  { value: 'support', label: 'Product support' },
  { value: 'other', label: 'Something else' },
];

const emptyForm: ContactInquiryInput = {
  inquiryType: 'merchant_pilot',
  companyName: '',
  contactName: '',
  workEmail: '',
  roleTitle: '',
  website: '',
  locationCount: undefined,
  message: '',
  consentToContact: false,
  honeypot: '',
};

const fieldClass =
  'min-h-12 w-full rounded-2xl border border-black/15 bg-white px-4 text-sm text-hopon-black outline-none transition focus:border-hopon-red focus:ring-4 focus:ring-hopon-red/10';

export function ContactInquiryForm() {
  const [form, setForm] = useState<ContactInquiryInput>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const update = <K extends keyof ContactInquiryInput>(key: K, value: ContactInquiryInput[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    const result = await submitPublicContactInquiry(form);
    if (result.ok) {
      setSubmitted(true);
      setForm(emptyForm);
    } else {
      setError(
        'reason' in result && result.reason === 'not_configured'
          ? 'The form is temporarily unavailable. Please email contact@thehoponapp.com.'
          : 'We could not submit your request. Please try again or email contact@thehoponapp.com.'
      );
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-7 text-emerald-950 md:p-9" role="status">
        <CheckCircle2 className="h-8 w-8" />
        <h2 className="mt-5 font-display text-3xl font-bold">Thanks — we received your request.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-900/75">
          The hOpOn team will review the details and follow up using the email you provided.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 font-mono text-xs font-bold uppercase underline underline-offset-4"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[28px] border border-black/10 bg-[#FAF7F1] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">How can we help? *</span>
          <select
            value={form.inquiryType}
            onChange={(event) => update('inquiryType', event.target.value as ContactInquiryType)}
            className={fieldClass}
            required
          >
            {inquiryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">Company or business *</span>
          <input value={form.companyName} onChange={(event) => update('companyName', event.target.value)} className={fieldClass} maxLength={160} autoComplete="organization" required />
        </label>
        <label>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">Your name *</span>
          <input value={form.contactName} onChange={(event) => update('contactName', event.target.value)} className={fieldClass} maxLength={120} autoComplete="name" required />
        </label>
        <label>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">Work email *</span>
          <input type="email" value={form.workEmail} onChange={(event) => update('workEmail', event.target.value)} className={fieldClass} maxLength={254} autoComplete="email" required />
        </label>
        <label>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">Role</span>
          <input value={form.roleTitle} onChange={(event) => update('roleTitle', event.target.value)} className={fieldClass} maxLength={120} autoComplete="organization-title" />
        </label>
        <label>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">Website</span>
          <input value={form.website} onChange={(event) => update('website', event.target.value)} className={fieldClass} maxLength={240} placeholder="example.com" inputMode="url" />
        </label>
        <label>
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">Number of locations</span>
          <input
            type="number"
            min={1}
            max={100000}
            value={form.locationCount ?? ''}
            onChange={(event) => update('locationCount', event.target.value ? Number(event.target.value) : undefined)}
            className={fieldClass}
            inputMode="numeric"
          />
        </label>
        <label className="hidden" aria-hidden="true">
          Leave this field empty
          <input value={form.honeypot} onChange={(event) => update('honeypot', event.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
        <label className="md:col-span-2">
          <span className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-black/55">What are you trying to accomplish? *</span>
          <textarea
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            className={`${fieldClass} min-h-36 resize-y py-3 leading-6`}
            maxLength={3000}
            placeholder="Tell us about your goals, market, current creator program, and any integration needs."
            required
          />
        </label>
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-black/65">
        <input
          type="checkbox"
          checked={form.consentToContact}
          onChange={(event) => update('consentToContact', event.target.checked)}
          className="mt-1 h-4 w-4 accent-hopon-red"
          required
        />
        <span>
          I agree that hOpOn may use these details to respond to my request. See the{' '}
          <Link to="/privacy" className="font-semibold text-hopon-black underline underline-offset-4">Privacy Policy</Link>.
        </span>
      </label>

      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-hopon-black px-5 font-display text-sm font-bold uppercase text-white transition hover:bg-hopon-red disabled:cursor-not-allowed disabled:opacity-55"
      >
        <Send className="h-4 w-4" />
        {submitting ? 'Submitting…' : 'Send request'}
      </button>
    </form>
  );
}
