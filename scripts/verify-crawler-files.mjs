import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://www.thehoponapp.com';
const expectedUrls = [`${origin}/`, `${origin}/pricing`, `${origin}/merchants`, `${origin}/creators`, `${origin}/partners`, `${origin}/privacy`, `${origin}/terms`, `${origin}/contact`, `${origin}/discover`];
const failures = [];

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const robots = read('public/robots.txt');
const sitemap = read('public/sitemap.xml');
const vercel = JSON.parse(read('vercel.json'));

assert(!/<html[\s>]/i.test(robots), 'robots.txt must not contain HTML');
assert(!/<html[\s>]/i.test(sitemap), 'sitemap.xml must not contain HTML');
assert(
  /<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/.test(sitemap),
  'sitemap.xml must use the sitemap.org urlset namespace',
);

const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1].trim());
assert(
  JSON.stringify(sitemapUrls) === JSON.stringify(expectedUrls),
  `sitemap.xml must contain exactly: ${expectedUrls.join(', ')}`,
);

for (const value of sitemapUrls) {
  const url = new URL(value);
  assert(url.origin === origin, `sitemap URL must use canonical host: ${value}`);
  assert(!url.search && !url.hash, `sitemap URL must not contain query or hash: ${value}`);
}

const directives = robots
  .split(/\r?\n/)
  .map((line) => line.replace(/#.*$/, '').trim())
  .filter(Boolean)
  .map((line) => {
    const match = line.match(/^([A-Za-z-]+)\s*:\s*(.+)$/);
    assert(Boolean(match), `invalid robots.txt directive: ${line}`);
    return match ? { name: match[1].toLowerCase(), value: match[2].trim() } : null;
  })
  .filter(Boolean);

const values = (name) => directives.filter((item) => item.name === name).map((item) => item.value);
const disallows = values('disallow');
const requiredDisallows = [
  '/admin',
  '/auth',
  '/api',
  '/verify',
  '/r/',
  '/creator/invite',
  '/pending',
  '/rejected',
  '/reset-password',
  '/merchant$',
  '/merchant/login$',
  '/merchant/signup$',
  '/merchant/campaign/',
  '/merchant/application/',
];

assert(values('user-agent').includes('*'), 'robots.txt must include User-agent: *');
assert(values('allow').includes('/'), 'robots.txt must include Allow: /');
assert(
  JSON.stringify(values('sitemap')) === JSON.stringify([`${origin}/sitemap.xml`]),
  'robots.txt must point to the canonical absolute sitemap URL',
);

for (const rule of requiredDisallows) {
  assert(disallows.includes(rule), `robots.txt is missing Disallow: ${rule}`);
}

const ruleMatches = (rule, pathname) =>
  rule.endsWith('$') ? pathname === rule.slice(0, -1) : pathname.startsWith(rule);
assert(
  !disallows.some((rule) => ruleMatches(rule, '/merchant/fer-restaurant')),
  'robots.txt must not block public /merchant/:slug pages',
);

const fallback = vercel.rewrites?.find((rewrite) => rewrite.destination === '/index.html');
assert(Boolean(fallback), 'vercel.json must keep the SPA fallback');
assert(fallback?.source?.includes('robots\\.txt'), 'SPA fallback must exclude robots.txt');
assert(fallback?.source?.includes('sitemap\\.xml'), 'SPA fallback must exclude sitemap.xml');

const contentType = (source) =>
  vercel.headers
    ?.find((entry) => entry.source === source)
    ?.headers?.find((header) => header.key.toLowerCase() === 'content-type')?.value;
assert(
  contentType('/robots.txt') === 'text/plain; charset=utf-8',
  'vercel.json must serve robots.txt as text/plain; charset=utf-8',
);
assert(
  contentType('/sitemap.xml') === 'application/xml; charset=utf-8',
  'vercel.json must serve sitemap.xml as application/xml; charset=utf-8',
);

const headerValue = (source, name) =>
  vercel.headers
    ?.find((entry) => entry.source === source)
    ?.headers?.find((header) => header.key.toLowerCase() === name.toLowerCase())?.value;
assert(headerValue('/(.*)', 'X-Content-Type-Options') === 'nosniff', 'global headers must disable MIME sniffing');
assert(headerValue('/(.*)', 'X-Frame-Options') === 'DENY', 'global headers must block framing');
assert(
  headerValue('/(.*)', 'Referrer-Policy') === 'strict-origin-when-cross-origin',
  'global headers must limit referrer data',
);
assert(
  headerValue('/(.*)', 'Permissions-Policy') === 'camera=(), microphone=(), geolocation=(self)',
  'global headers must restrict browser permissions',
);
assert(headerValue('/config.js', 'Cache-Control') === 'no-store', 'runtime config must not be cached');

if (fs.existsSync(path.join(root, 'dist'))) {
  assert(read('dist/robots.txt') === robots, 'dist/robots.txt must match public/robots.txt');
  assert(read('dist/sitemap.xml') === sitemap, 'dist/sitemap.xml must match public/sitemap.xml');
}

if (failures.length) {
  console.error(`Crawler file verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Crawler files verified successfully.');
