import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function loadModel(name) {
  const source = await readFile(new URL(`../features/launch/${name}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const creator = await loadModel('creatorModel');
const workspace = await loadModel('workspaceModel');

test('creator journey advances in order, never skips approvals or moves backwards', () => {
  let stage = 'brief';
  assert.equal(creator.advanceCreatorStage(stage, 'paid'), 'brief');
  for (const next of creator.creatorStages.slice(1)) stage = creator.advanceCreatorStage(stage, next);
  assert.equal(stage, 'paid');
  assert.equal(creator.advanceCreatorStage(stage, 'applied'), 'paid');
  assert.equal(creator.advanceCreatorStage('submitted', 'posted'), 'submitted');
});

test('creator links reject malformed and non-HTTPS URLs without opening them', () => {
  for (const value of ['@sample.creator', 'sample_creator', 'a']) assert.equal(creator.validInstagramHandle(value), true);
  for (const value of ['', '@', 'a b', 'https://instagram.com/name', 'x'.repeat(31)]) assert.equal(creator.validInstagramHandle(value), false);
  for (const value of ['javascript:alert(1)', 'http://example.com/draft', 'not a url', 'https://user:password@example.com/']) assert.equal(creator.validHttpsUrl(value), false);
  assert.equal(creator.validHttpsUrl('https://example.com/draft?version=2'), true);
  assert.equal(creator.validInstagramPost('https://www.instagram.com/reel/sample/'), true);
  assert.equal(creator.validInstagramPost('https://instagram.com/p/sample?igsh=demo'), true);
  for (const value of ['https://instagram.com.attacker.com/reel/a/', 'https://instagram.com/username', 'https://example.com/reel/a/']) assert.equal(creator.validInstagramPost(value), false);
});

test('requesting revision records feedback on the current version and waits for resubmission', () => {
  const original = workspace.initialContent();
  assert.equal(workspace.reviewContent(original, 'request_revision', '   '), original);
  const requested = workspace.reviewContent(original, 'request_revision', '  Add a close-up.  ');
  assert.equal(requested.version, 1);
  assert.equal(requested.status, 'revision_requested');
  assert.equal(requested.feedback, 'Add a close-up.');
  assert.equal(requested.history.at(-1).detail, 'Add a close-up.');
  assert.equal(workspace.reviewContent(requested, 'approve'), requested);
  assert.equal(workspace.reviewContent(requested, 'request_revision', 'duplicate'), requested);
  const revised = workspace.reviewContent(requested, 'submit_revision');
  assert.equal(revised.version, 2);
  assert.equal(revised.status, 'in_review');
  const approved = workspace.reviewContent(revised, 'approve');
  assert.equal(approved.status, 'approved');
  assert.equal(approved.version, 2);
  assert.equal(approved.history.length, 4);
  assert.equal(workspace.reviewContent(approved, 'approve'), approved);
  assert.equal(original.history.length, 1, 'updates must not mutate the initial state');
});

test('shortlist spend tracks selected candidates and ignores unknown or duplicated IDs', () => {
  const quotes = [{ id: 'a', quote: 450 }, { id: 'b', quote: 650 }, { id: 'c', quote: 520 }];
  assert.equal(workspace.shortlistTotal(['a', 'b'], quotes), 1100);
  assert.equal(workspace.shortlistTotal([], quotes), 0);
  assert.equal(workspace.shortlistTotal(['a', 'a', 'unknown'], quotes), 450);
});

test('demo is excluded from indexing without changing existing crawler routes', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert(config.headers.find(rule => rule.source === '/launch/:path*')?.headers.some(h => h.key === 'X-Robots-Tag' && h.value.includes('noindex')));
  const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  assert(!sitemap.includes('/launch'));
});
