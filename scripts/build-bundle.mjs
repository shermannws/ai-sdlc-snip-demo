#!/usr/bin/env node
/**
 * scripts/build-bundle.mjs
 * Assembles the generated "bundle" submodule from the backend/frontend/cli
 * submodules and optionally pushes all branches.
 *
 * Usage:
 *   node scripts/build-bundle.mjs          # build only (no push)
 *   node scripts/build-bundle.mjs --push   # build + push bundle and main
 *
 * Zero runtime dependencies — uses only Node.js built-ins.
 */

import { spawnSync, execSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT    = resolve(__dirname, '..');
const PUSH    = process.argv.includes('--push');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run a command, inherit stdio, throw on non-zero exit.
 * @param {string}   cmd
 * @param {string[]} args
 * @param {{ cwd?: string }} [opts]
 */
function run(cmd, args, opts = {}) {
  const cwd    = opts.cwd ?? ROOT;
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Command exited with status ${result.status}: ${cmd} ${args.join(' ')}`);
  }
}

/** Run git in ROOT. */
function git(...args) { run('git', args); }

/** Run git inside a specific directory. */
function gitIn(dir, ...args) { run('git', args, { cwd: dir }); }

/**
 * Return true if there is anything staged for commit.
 * "git diff --cached --quiet" exits with 0 (clean) or 1 (staged changes).
 */
function hasStagedChanges(cwd) {
  const r = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd, shell: false });
  return r.status !== 0;
}

// ---------------------------------------------------------------------------
// Step 1 – Update backend / frontend / cli submodules to their branch tips
// ---------------------------------------------------------------------------
console.log('\n▸ Updating backend / frontend / cli submodules to branch tips…');
git('submodule', 'update', '--init', '--remote', 'backend', 'frontend', 'cli');

// ---------------------------------------------------------------------------
// Step 2 – Build the frontend
// ---------------------------------------------------------------------------
const FRONTEND = resolve(ROOT, 'frontend');

console.log('\n▸ Installing frontend dependencies…');
execSync('npm install', { cwd: FRONTEND, stdio: 'inherit' });

console.log('\n▸ Building frontend (ng build)…');
execSync('npm run build', { cwd: FRONTEND, stdio: 'inherit' });

const INDEX_HTML = resolve(FRONTEND, 'dist', 'snip-frontend', 'browser', 'index.html');
if (!existsSync(INDEX_HTML)) {
  console.error(`\nERROR: Expected build artifact not found:\n  ${INDEX_HTML}`);
  process.exit(1);
}
console.log(`✓  index.html present: ${INDEX_HTML}`);

// ---------------------------------------------------------------------------
// Step 3 – Assemble bundle/
// ---------------------------------------------------------------------------
const BUNDLE = resolve(ROOT, 'bundle');
console.log('\n▸ Assembling bundle/…');

// server.js and cli.js — copy as-is
cpSync(resolve(ROOT, 'backend', 'server.js'), resolve(BUNDLE, 'server.js'));
cpSync(resolve(ROOT, 'cli',     'cli.js'),    resolve(BUNDLE, 'cli.js'));

// public/ — replace entirely with the Angular browser build output
const PUBLIC      = resolve(BUNDLE, 'public');
const BROWSER_DIR = resolve(FRONTEND, 'dist', 'snip-frontend', 'browser');
if (existsSync(PUBLIC)) rmSync(PUBLIC, { recursive: true, force: true });
cpSync(BROWSER_DIR, PUBLIC, { recursive: true });

// .env — Bun auto-loads this; tells server.js to serve the UI
writeFileSync(resolve(BUNDLE, '.env'), 'PUBLIC_DIR=./public\n', 'utf8');

// package.json — "start" via bun; intentionally NO "type" field so cli.js
// continues to work under plain node (CommonJS mode).
writeFileSync(
  resolve(BUNDLE, 'package.json'),
  JSON.stringify(
    {
      name:    'snip-bundle',
      version: '1.0.0',
      scripts: { start: 'bun server.js' },
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

// Dockerfile
writeFileSync(
  resolve(BUNDLE, 'Dockerfile'),
  [
    'FROM oven/bun:1-alpine',
    'WORKDIR /app',
    'COPY . .',
    'ENV PORT=3000',
    'EXPOSE 3000',
    'CMD bun server.js',
  ].join('\n') + '\n',
  'utf8',
);

// .dockerignore
writeFileSync(
  resolve(BUNDLE, '.dockerignore'),
  ['node_modules', '.git', '*.md'].join('\n') + '\n',
  'utf8',
);

// railway.json — select the Dockerfile builder
writeFileSync(
  resolve(BUNDLE, 'railway.json'),
  JSON.stringify({ build: { builder: 'DOCKERFILE' } }, null, 2) + '\n',
  'utf8',
);

console.log('✓  bundle/ assembled');

// ---------------------------------------------------------------------------
// Step 4 – Commit inside bundle/ (safe no-op when nothing changed)
// ---------------------------------------------------------------------------
console.log('\n▸ Staging bundle/ changes…');
gitIn(BUNDLE, 'add', '-A');

if (hasStagedChanges(BUNDLE)) {
  gitIn(BUNDLE, 'commit', '-m', 'chore: build bundle [ci skip]');
  console.log('✓  bundle/ committed');

  if (PUSH) {
    console.log('\n▸ Pushing bundle branch…');
    // Submodule checkouts are detached HEAD; use HEAD:bundle to push correctly.
    gitIn(BUNDLE, 'push', 'origin', 'HEAD:bundle');
    console.log('✓  bundle branch pushed');
  }
} else {
  console.log('  nothing to commit in bundle/ — skipping');
}

// ---------------------------------------------------------------------------
// Step 5 – Bump submodule pointer in the superproject
// ---------------------------------------------------------------------------
console.log('\n▸ Staging superproject submodule pointer…');
git('add', 'bundle');

if (hasStagedChanges(ROOT)) {
  git('commit', '-m', 'chore: bump bundle submodule pointer [ci skip]');
  console.log('✓  superproject committed');

  if (PUSH) {
    console.log('\n▸ Pushing main branch…');
    git('push', 'origin', 'main');
    console.log('✓  main pushed');
  }
} else {
  console.log('  nothing to commit in superproject — skipping');
}

console.log('\n✅  build-bundle done!\n');
