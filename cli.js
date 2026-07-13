#!/usr/bin/env node
'use strict';

const BASE_URL = (process.env.SNIP_API || 'http://localhost:3000').replace(/\/$/, '');

function usage() {
  console.log(
    'Usage:\n' +
    '  snip add <url>    Shorten a URL (prints the short link)\n' +
    '  snip ls           List all shortened links\n' +
    '  snip open <code>  Open a short link in the OS browser\n' +
    '  snip help         Show this message'
  );
}

function die(msg) {
  process.stderr.write('Error: ' + msg + '\n');
  process.exit(1);
}

async function cmdAdd(url) {
  if (!url) die('snip add requires a <url> argument');

  let res;
  try {
    res = await fetch(BASE_URL + '/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
  } catch (e) {
    die('Could not reach backend: ' + e.message);
  }

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch (_) {}
    die('Server returned ' + res.status + (body ? ': ' + body.trim() : ''));
  }

  let data;
  try { data = await res.json(); } catch (_) { die('Unexpected response from server'); }

  if (!data.shortUrl) die('Server did not return a shortUrl');
  console.log(data.shortUrl);
}

async function cmdLs() {
  let res;
  try {
    res = await fetch(BASE_URL + '/api/links');
  } catch (e) {
    die('Could not reach backend: ' + e.message);
  }

  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch (_) {}
    die('Server returned ' + res.status + (body ? ': ' + body.trim() : ''));
  }

  let links;
  try { links = await res.json(); } catch (_) { die('Unexpected response from server'); }

  if (!Array.isArray(links) || links.length === 0) {
    console.log('No links yet.');
    return;
  }

  // Calculate column widths
  const codeW  = Math.max(4,  ...links.map(l => String(l.code  || '').length));
  const hitsW  = Math.max(4,  ...links.map(l => String(l.hits  ?? '').length));
  const urlW   = Math.max(11, ...links.map(l => String(l.url   || '').length));

  const pad = (s, w) => String(s).padEnd(w);
  const lpad = (s, w) => String(s).padStart(w);

  const sep = '-'.repeat(codeW + 2 + hitsW + 2 + urlW);
  console.log(pad('CODE', codeW) + '  ' + lpad('HITS', hitsW) + '  ' + pad('ORIGINAL URL', urlW));
  console.log(sep);
  for (const link of links) {
    console.log(pad(link.code || '', codeW) + '  ' + lpad(link.hits ?? 0, hitsW) + '  ' + (link.url || ''));
  }
}

async function cmdOpen(code) {
  if (!code) die('snip open requires a <code> argument');

  let res;
  try {
    res = await fetch(BASE_URL + '/' + encodeURIComponent(code), { redirect: 'manual' });
  } catch (e) {
    die('Could not reach backend: ' + e.message);
  }

  // Expect a 3xx redirect
  if (res.status < 300 || res.status >= 400) {
    if (res.status === 404) die('Unknown code: ' + code);
    die('Unexpected status ' + res.status + ' for code "' + code + '"');
  }

  const location = res.headers.get('location');
  if (!location) die('Server redirected but sent no Location header');

  console.log('Opening: ' + location);

  const { platform } = process;
  const { spawn } = require('child_process');
  let cmd, args;
  if (platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '', location];
  } else if (platform === 'darwin') {
    cmd = 'open';
    args = [location];
  } else {
    cmd = 'xdg-open';
    args = [location];
  }

  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
}

async function main() {
  const [,, command, arg] = process.argv;

  switch (command) {
    case 'add':  await cmdAdd(arg);  break;
    case 'ls':   await cmdLs();      break;
    case 'open': await cmdOpen(arg); break;
    case 'help':
    case undefined:
      usage();
      break;
    default:
      process.stderr.write('Unknown command: ' + command + '\n\n');
      usage();
      process.exit(1);
  }
}

main().catch(e => { die(e.message || String(e)); });
