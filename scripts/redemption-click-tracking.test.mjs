import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const client = await readFile(new URL('lib/supabaseClient.ts', root), 'utf8');
const shortLinkPage = await readFile(new URL('pages/RedemptionShortLink.tsx', root), 'utf8');

test('short-link tracking reuses the daily temporary visitor id', () => {
  assert.match(shortLinkPage, /getOrCreateVerifyAnonymousVisitor\(\)/);
  assert.match(shortLinkPage, /trackHoponRedemptionLinkClick\(target\.slug, anonymousVisitor\)/);
  assert.match(client, /p_anonymous_visitor_id: anonymousVisitor\.id/);
  assert.match(client, /p_visitor_id_scope: anonymousVisitor\.scope/);
});

test('only a successfully resolved short link is tracked before redirect', () => {
  const resolveOffset = shortLinkPage.indexOf('await resolveHoponRedemptionLink(slug)');
  const invalidOffset = shortLinkPage.indexOf('if (!target)');
  const trackOffset = shortLinkPage.indexOf('await trackHoponRedemptionLinkClick');
  const navigateOffset = shortLinkPage.indexOf('navigate(`/verify?');

  assert.ok(resolveOffset >= 0, 'short link must be resolved');
  assert.ok(invalidOffset > resolveOffset, 'invalid links must be rejected after resolution');
  assert.ok(trackOffset > invalidOffset, 'tracking must happen only after a valid target');
  assert.ok(navigateOffset > trackOffset, 'tracking must finish before redirect');
});

test('client sends only bounded attribution metadata and no client timestamp', () => {
  const marker = 'export async function trackHoponRedemptionLinkClick';
  const start = client.indexOf(marker);
  const end = client.indexOf('\n}\n', start) + 2;
  const definition = client.slice(start, end);

  assert.match(definition, /source: 'website_short_link'/);
  assert.match(definition, /landing_path: `\/r\/\$\{normalizedSlug\}`/);
  assert.match(definition, /platform: 'web'/);
  assert.doesNotMatch(definition, /p_clicked_at|user.?agent|ip_address|email|phone/i);
});
