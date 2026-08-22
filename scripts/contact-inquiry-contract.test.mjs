import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(websiteRoot, '..');
const migrationPath = path.join(
  repoRoot,
  'Blanc/supabase/migrations/20260821160000_add_public_contact_inquiries.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');
const client = fs.readFileSync(path.join(websiteRoot, 'lib/contactInquiries.ts'), 'utf8');
const form = fs.readFileSync(path.join(websiteRoot, 'components/ContactInquiryForm.tsx'), 'utf8');

const checks = [
  [/CREATE TABLE IF NOT EXISTS public\.contact_inquiries/, 'creates the private inquiry table'],
  [/ALTER TABLE public\.contact_inquiries ENABLE ROW LEVEL SECURITY/, 'enables RLS'],
  [/REVOKE ALL ON TABLE public\.contact_inquiries FROM PUBLIC, anon, authenticated/, 'revokes direct client table access'],
  [/GRANT ALL ON TABLE public\.contact_inquiries TO service_role/, 'keeps operational table access server-side'],
  [/CREATE OR REPLACE FUNCTION public\.submit_public_contact_inquiry/, 'defines a bounded public submission RPC'],
  [/SECURITY DEFINER\s+SET search_path = public, pg_temp/, 'pins the security-definer search path'],
  [/p_consent_to_contact/, 'requires contact consent'],
  [/p_honeypot/, 'checks a bot honeypot'],
  [/created_at >= now\(\) - interval '1 hour'/, 'rate-limits repeated email submissions'],
  [/GRANT EXECUTE ON FUNCTION public\.submit_public_contact_inquiry\([\s\S]*?\) TO anon, authenticated/, 'grants only RPC execution to clients'],
];

for (const [pattern, label] of checks) {
  if (!pattern.test(migration)) throw new Error(`Contact inquiry contract failed: ${label}`);
}

if (/\b(ip_address|user_agent|request_headers)\b/i.test(migration)) {
  throw new Error('Contact inquiry contract failed: raw network or request-header fields must not be stored');
}
if (!/\.rpc\('submit_public_contact_inquiry'/.test(client)) {
  throw new Error('Contact inquiry contract failed: website client must call the validated RPC');
}
if (!/consentToContact/.test(form) || !/honeypot/.test(form) || !/to="\/privacy"/.test(form)) {
  throw new Error('Contact inquiry contract failed: form must include consent, honeypot, and Privacy link');
}

console.log('Contact inquiry contract verified successfully.');
