import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const scratch = await mkdtemp(path.join(tmpdir(), 'hopon-launch-render-'));
let rendered;
try {
  const output = await build({
    stdin: { contents: `
      import React from 'react';
      import { renderToString } from 'react-dom/server';
      import { MemoryRouter } from 'react-router-dom';
      import Landing from './features/launch/LaunchLanding';
      import Workspace from './features/launch/LaunchWorkspace';
      import Creator from './features/launch/LaunchCreator';
      const routes = [
        ['/launch', Landing], ['/launch/creator', Creator],
        ...['overview', 'creators', 'review', 'reports', 'geo'].map(view => ['/launch/demo?view=' + view, Workspace])
      ];
      export default routes.map(([route, Component]) => ({route, html: renderToString(React.createElement(MemoryRouter, {initialEntries:[route]}, React.createElement(Component)))}));
    `, resolveDir: root, loader: 'tsx' },
    bundle: true, platform: 'node', format: 'cjs', write: false, logLevel: 'silent', loader: { '.css': 'empty' },
  });
  const compiled = path.join(scratch, 'render.cjs');
  await writeFile(compiled, output.outputFiles[0].text);
  rendered = createRequire(import.meta.url)(compiled).default;
} finally { await rm(scratch, { recursive: true, force: true }); }

test('all seven demo route states render meaningful content without runtime errors', () => {
  assert.equal(rendered.length, 7);
  for (const { route, html } of rendered) {
    assert(html.length > 4000, `${route}: unexpectedly empty`);
    assert(html.includes('<h1'), `${route}: missing page title`);
    assert(html.includes('<main'), `${route}: missing main landmark`);
    assert(!html.includes('undefined'), `${route}: undefined visible value`);
  }
});

test('all rendered local image assets exist; demo links stay in the isolated route tree', async () => {
  for (const { route, html } of rendered) {
    const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]);
    for (const src of images) {
      assert(src.startsWith('/assets/launch/'), `${route}: unexpected image ${src}`);
      await access(path.join(root, 'public', src));
    }
    const links = [...html.matchAll(/<a[^>]+href="([^"]+)"/g)].map(match => match[1]);
    for (const href of links) {
      const url = new URL(href, 'https://www.thehoponapp.com' + route);
      assert(['/', '/launch', '/launch/demo', '/launch/creator'].includes(url.pathname), `${route}: broken route ${href}`);
    }
  }
});

test('public integration keeps demo pages lazy-loaded and has a local recovery boundary', async () => {
  const entry = await readFile(path.join(root, 'index.tsx'), 'utf8');
  for (const component of ['LaunchLanding', 'LaunchWorkspace', 'LaunchCreator']) assert(entry.includes(`lazy(() => import('./features/launch/${component}'))`));
  const frame = await readFile(path.join(root, 'features/launch/LaunchFrame.tsx'), 'utf8');
  assert(frame.includes('getDerivedStateFromError'));
  assert(frame.includes('window.scrollTo(0, 0)'));
});
