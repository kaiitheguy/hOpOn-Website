import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const terms = read('pages/Terms.tsx');
const privacy = read('pages/PrivacyPolicy.tsx');
const merchantSignup = read('pages/merchant/MerchantSignup.tsx');
const creatorInvite = read('pages/creator/CreatorInvite.tsx');
const legal = read('lib/legal.ts');

const checks = [
  [terms, /not yet a registered\s+company/, 'Terms disclose the current pre-incorporation operator status'],
  [terms, /Card-on-file campaigns/, 'Terms cover the implemented Stripe card-on-file workflow'],
  [terms, /AI-assisted features/, 'Terms cover implemented AI-assisted workflows'],
  [terms, /These Terms do not require arbitration/, 'Terms do not invent an arbitration agreement'],
  [terms, /at least 18 years old/, 'Terms set the account age requirement'],
  [privacy, /not yet a registered\s+company/, 'Privacy discloses the current pre-incorporation operator status'],
  [privacy, /Full card numbers and security\s+codes[\s\S]*not stored by hOpOn/, 'Privacy accurately separates Stripe card data'],
  [privacy, /do not sell or rent personal information/, 'Privacy states the current no-sale policy'],
  [privacy, /does\s+not use continuous background location tracking/, 'Privacy limits location disclosure to implemented behavior'],
  [privacy, /accounts are for people who are at least 18 years old/, 'Privacy matches the Terms account age requirement'],
  [merchantSignup, /hopon_terms_version: LEGAL_VERSION/, 'Merchant signup records the accepted Terms version'],
  [merchantSignup, /hopon_legal_accepted_at: new Date\(\)\.toISOString\(\)/, 'Merchant signup records acceptance time'],
  [creatorInvite, /hopon_terms_version: LEGAL_VERSION/, 'Creator signup records the accepted Terms version'],
  [creatorInvite, /hopon_legal_accepted_at: new Date\(\)\.toISOString\(\)/, 'Creator signup records acceptance time'],
  [legal, /LEGAL_VERSION = '2026-08-22'/, 'Legal documents and consent use a shared version'],
];

for (const [source, pattern, label] of checks) {
  if (!pattern.test(source)) throw new Error(`Legal contract failed: ${label}`);
}

for (const [name, source] of [['Terms', terms], ['Privacy', privacy]]) {
  if (/\b(?:Example Company|Company Name|Your Company|TBD|TODO|\[INSERT|\[STATE|\[ADDRESS)\b/i.test(source)) {
    throw new Error(`Legal contract failed: ${name} contains placeholder language`);
  }
  if (/\bhOpOn,? LLC\b|\bhOpOn,? Inc\.?\b/i.test(source)) {
    throw new Error(`Legal contract failed: ${name} invents a registered hOpOn entity`);
  }
}

console.log('Legal publication contract verified successfully.');
