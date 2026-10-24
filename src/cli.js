#!/usr/bin/env node
'use strict';

/**
 * 1min-bulk-apikey CLI — create 1min.AI accounts, one API key per account, and
 * keep only the keys that survived a live chat call.
 *
 * The whole gate is Turnstile + a readable inbox:
 *   1. mailbox     a fresh inbound address from YOUR Mailtrap folder
 *   2. challenge   `POST /auth/signup-challenge {email}` -> {action, challengeId}
 *   3. turnstile   a token FOR THAT challengeId, from `--token-cmd`, a captured
 *                  `--token <challengeId>:<token>` pair, or a manual paste
 *   4. signup      `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}`
 *   5. password    the signup itself mails "Password to log in to 1min.AI!" —
 *                  a 6-digit initial password, read from the same inbox
 *   6. login       `POST /auth/login {email,password}` -> JWT
 *   7. key         `POST /api/teams/{teamId}/keys` -> {apiKey:{key:"…64 hex…"}}
 *   8. gate        `POST /openai/v1/chat/completions` -> 200 with content = keep
 *
 * A key is appended to `keys.txt` only after step 8 answers 200; an account that
 * never passes is recorded in `accounts.json` and retried on the next run.
 *
 * Turnstile notes (measured):
 *   - the token must carry BOTH `action=signup` and the `cData` of the
 *     challengeId this CLI just received, so a token is only reusable for the
 *     exact challenge it solved;
 *   - `--token-cmd` is run once per account with ONEMIN_CDATA / ONEMIN_ACTION /
 *     ONEMIN_SITEKEY / ONEMIN_URL in the environment and must print one token;
 *   - without a solver, use `--manual`: the CLI prints the challengeId and waits
 *     for the token you copy from the widget (DevTools → the hidden
 *     `input[name="cf-turnstile-response"]` after starting a signup with the
 *     SAME address on app.1min.ai).
 *
 * Options:
 *   --count N        accounts (= keys) to mint                           [1]
 *   --conc N         accounts in flight at once, max 4                  [1]
 *   --gap MS         pause between accounts                           [15000]
 *   --model <id>     model used for the live gate            [deepseek-flash]
 *   --mailtrap-token <t>  Mailtrap API token (env ONEMIN_MAILTRAP_TOKEN)
 *   --mt-folder <n>  Mailtrap folder the inboxes live in       [1min-bulk]
 *   --email <addr>   reuse an existing Mailtrap inbox instead of a new one
 *   --token <cid:tok>   one captured challengeId:token pair (single account)
 *   --token-cmd <c>  command that prints one Turnstile token (one per account)
 *   --manual         paste the Turnstile token by hand (one per account)
 *   --pool <file>    proxy list, one exit per line (env ONEMIN_PROXIES) [optional]
 *   --exits N        exits tried per account before giving up            [6]
 *   --timeout MS     per-request timeout                             [60000]
 *   --verify-only    re-run every key in keys.txt through the chat gate
 *   --screen         only test the proxy list against 1min.AI
 *   --help
 *
 * Zero dependencies. Node.js >= 18. Your proxy list is OPTIONAL: pass --pool
 * (or the ONEMIN_PROXIES env) and every request goes through an exit from it;
 * without a pool the tool connects directly. Signup is rate-limited per exit IP
 * (4-5 signups, then `429 … try again after ~653 seconds`), so rotate exits when
 * you mint in bulk.
 */

const fs = require('fs');
const path = require('path');
const net = require('net');
const tls = require('tls');
const http = require('http');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const readline = require('readline');

const ROOT = path.basename(__dirname) === 'src' ? path.resolve(__dirname, '..') : __dirname;
const KEYS_FILE = path.join(ROOT, 'keys.txt');
const DEAD_FILE = path.join(ROOT, 'keys-dead.txt');
const ACCOUNTS_FILE = path.join(ROOT, 'accounts.json');


const API = 'https://api.1min.ai';
const SITEKEY = '0x4AAAAAADlG3pCk8mNqMU5i';
const APP_URL = 'https://app.1min.ai/';
const MAILTRAP = 'https://mailtrap.io/api';
const PANEL_HEADERS = { 'X-App-Version': '1.0.0', 'X-Client-Platform': 'web' };
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36';

// ------------------------------------------------------------------- options
const argv = process.argv.slice(2);
function arg(name, dflt) {
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = argv.indexOf(`--${name}`);
  if (i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  return dflt;
}
const has = (name) => argv.includes(`--${name}`);

if (has('help') || has('h')) {
  console.log(`1min-bulk-apikey — create 1min.AI accounts, one key each, verified by a live chat call.

  node src/cli.js --count 3          mint (Turnstile solved automatically; chat 200 keeps a key)
  node src/cli.js --verify-only      re-check every key in keys.txt
  node src/cli.js --screen           test your proxy list against 1min.AI
  node src/cli.js --help

  --count N       accounts to mint                                        [1]
  --conc N        accounts in flight (max 4)                              [1]
  --model <id>    model used for the live gate             [deepseek-flash]
  --pool <file>   proxy list, one exit per line (env ONEMIN_PROXIES) [optional]
  --mailtrap-token <t> / ONEMIN_MAILTRAP_TOKEN   Mailtrap API token (required)
  --mt-folder <n> Mailtrap folder for the inboxes                 [1min-bulk]
  --auto          solve the Turnstile with the embedded solver (default)
  --no-auto       disable the embedded solver
  --dry           resolve the plan, write nothing (no network, no files)
Advanced solver wiring (env-only) is described in ADVANCED.md; if Chrome is not
found, install it once or point CHROME_PATH at it. Requests go through your
proxy list when one is provided (--pool / env); without a pool the tool connects
directly.`);
  process.exit(0);
}

const COUNT = Math.max(1, parseInt(arg('count', '1'), 10) || 1);
const CONC = Math.min(4, Math.max(1, parseInt(arg('conc', '1'), 10) || 1));
const GAP_MS = Math.max(0, parseInt(arg('gap', '15000'), 10) || 0);
const EXITS = Math.max(1, parseInt(arg('exits', '6'), 10) || 6);
const TIMEOUT_MS = Math.max(5000, parseInt(arg('timeout', '60000'), 10) || 60000);
const MODEL = arg('model', process.env.ONEMIN_MODEL || 'deepseek-flash');
const MT_FOLDER = arg('mt-folder', '1min-bulk');
const MT_TOKEN = arg('mailtrap-token', process.env.ONEMIN_MAILTRAP_TOKEN || null);
const PRESET_EMAIL = arg('email', null);
const TOKEN_CMD = arg('token-cmd', null);
const TOKEN_PAIR = arg('token', null);
const MANUAL = has('manual');
const VERIFY_ONLY = has('verify-only');
const SCREEN = has('screen');
const AUTO = !has('no-auto'); // the embedded solver is the default path (one command)
const DRY = has('dry'); // resolve the plan, write nothing, send nothing
/** Lazy require: a checkout without src/solver.js still runs off --token / --token-cmd. */
let _solver = null;
const solver = () => (_solver && _solver.solveCaptcha ? _solver : (_solver = require('./solver.js')));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
const randName = () => `lane${crypto.randomBytes(4).toString('hex')}`;

// ------------------------------------------------------------------- proxy
function parseProxy(line) {
  const s = String(line || '').trim();
  if (!s || s.startsWith('#')) return null;
  let m = s.match(/^(https?|socks5h?|socks4):\/\/(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)/i);
  if (!m) m = s.match(/^(?:([^:@/]+):([^@/]+)@)?([^:/]+):(\d+)$/);
  if (!m) return null;
  if (m.length === 6) {
    const raw = m[1].toLowerCase();
    if (raw === 'socks4') return null; // socks4 is not supported by this client
    const protocol = raw.startsWith('socks') ? 'socks5' : 'http';
    return { protocol, host: m[4], port: Number(m[5]), auth: m[2] ? `${m[2]}:${m[3]}` : null, line: s };
  }
  return { protocol: 'http', host: m[3], port: Number(m[4]), auth: m[1] ? `${m[1]}:${m[2]}` : null, line: s };
}

/** A raw socket straight to host:port (no proxy) — the direct-mode twin of connectThrough. */
function directConnect(host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`connect timeout (${host}:${port})`)); }, timeoutMs);
    sock.once('error', (e) => { clearTimeout(t); try { sock.destroy(); } catch {} reject(new Error(`connect failed: ${e.message}`)); });
    sock.once('connect', () => { clearTimeout(t); resolve(sock); });
  });
}

function connectThrough(proxy, host, port, timeoutMs) {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host: proxy.host, port: proxy.port });
    const t = setTimeout(() => { sock.destroy(); reject(new Error(`proxy timeout (${proxy.host}:${proxy.port})`)); }, timeoutMs);
    const done = (err, s) => { clearTimeout(t); if (err) { try { sock.destroy(); } catch {} reject(err); } else resolve(s); };
    sock.once('error', (e) => done(new Error(`proxy connect failed: ${e.message}`)));
    sock.once('connect', () => {
      if (proxy.protocol === 'socks5') {
        sock.write(proxy.auth ? Buffer.from([5, 2, 0, 2]) : Buffer.from([5, 1, 0]));
        let stage = 0;
        let buf = Buffer.alloc(0);
        const sendConnect = () => {
          const hb = Buffer.from(host);
          sock.write(Buffer.concat([Buffer.from([5, 1, 0, 3, hb.length]), hb, Buffer.from([port >> 8, port & 0xff])]));
        };
        const onData = (d) => {
          try {
            buf = Buffer.concat([buf, d]);
            for (;;) {
              if (stage === 0) {
                if (buf.length < 2) return;
                const v = buf; buf = buf.slice(2);
                if (v[0] !== 5) return done(new Error('SOCKS5 bad version'));
                if (v[1] === 2) {
                  if (!proxy.auth) return done(new Error('SOCKS5 auth required'));
                  const [u, p] = proxy.auth.split(':');
                  sock.write(Buffer.concat([Buffer.from([1, u.length]), Buffer.from(u), Buffer.from([p.length]), Buffer.from(p)]));
                  stage = 1;
                  continue;
                }
                if (v[1] !== 0) return done(new Error('SOCKS5 no acceptable method'));
                stage = 2; sendConnect(); continue;
              }
              if (stage === 1) {
                if (buf.length < 2) return;
                const v = buf; buf = buf.slice(2);
                if (v[1] !== 0) return done(new Error('SOCKS5 auth failed'));
                stage = 2; sendConnect(); continue;
              }
              if (stage === 2) {
                if (buf.length < 5) return;
                const atyp = buf[3];
                const need = 4 + (atyp === 1 ? 4 : atyp === 3 ? 1 + buf[4] : 16) + 2;
                if (buf.length < need) return;
                const rep = buf[1]; buf = buf.slice(need);
                if (rep !== 0) return done(new Error(`SOCKS5 connect failed (code ${rep})`));
                sock.off('data', onData);
                return done(null, sock);
              }
            }
          } catch (e) { done(e); }
        };
        sock.on('data', onData);
        return;
      }
      const auth = proxy.auth ? `Proxy-Authorization: Basic ${Buffer.from(proxy.auth).toString('base64')}\r\n` : '';
      sock.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n${auth}\r\n`);
      let buf = '';
      const onData = (d) => {
        buf += d;
        if (!buf.includes('\r\n\r\n')) return;
        sock.off('data', onData);
        if (!/^HTTP\/\d(\.\d)? 200/.test(buf)) return done(new Error(`proxy CONNECT refused: ${buf.split('\r\n')[0]}`));
        done(null, sock);
      };
      sock.on('data', onData);
    });
  });
}

/** One HTTPS request through one exit. Returns { status, headers, body }. */
async function exitFetch(proxy, url, { method = 'GET', headers = {}, body = null, timeoutMs = TIMEOUT_MS } = {}) {
  const u = new URL(url);
  const raw = proxy ? await connectThrough(proxy, u.hostname, u.port || 443, timeoutMs) : await directConnect(u.hostname, u.port || 443, timeoutMs);
  const sock = tls.connect({ socket: raw, servername: u.hostname });
  await new Promise((res, rej) => { sock.once('secureConnect', res); sock.once('error', rej); });
  const chunks = [];
  let resolve, reject;
  const p = new Promise((res, rej) => { resolve = res; reject = rej; });
  const req = http.request({
    method,
    path: u.pathname + u.search,
    createConnection: () => sock,
    headers: { host: u.host, 'user-agent': UA, accept: '*/*', ...headers },
  });
  const t = setTimeout(() => { try { req.destroy(); } catch {} reject(new Error('request timeout')); }, timeoutMs);
  req.on('response', (res) => {
    res.on('data', (c) => chunks.push(c));
    res.on('end', () => {
      clearTimeout(t);
      resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') });
    });
  });
  req.on('error', (e) => { clearTimeout(t); reject(e); });
  if (body != null) req.write(Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
  req.end();
  return p;
}

async function exitJson(proxy, url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  const body = opts.body;
  if (body != null && !Buffer.isBuffer(body)) headers['content-type'] = 'application/json';
  const r = await exitFetch(proxy, url, { ...opts, headers });
  let json = null;
  try { json = JSON.parse(r.body); } catch { /* not json */ }
  return { status: r.status, json, text: r.body };
}

// ------------------------------------------------------------------- pool
function loadExits() {
  const poolArg = arg('pool', process.env.ONEMIN_PROXIES || 'proxies.txt');
  const poolFile = fs.existsSync(path.resolve(poolArg)) ? path.resolve(poolArg) : path.resolve(ROOT, poolArg);
  if (!fs.existsSync(poolFile)) {
    // No pool = DIRECT mode: a proxy is recommended at scale (the signup limit is
    // per exit IP) but the tool works without one. `null` is the direct sentinel.
    console.log(`no proxy list at ${poolFile} — running WITHOUT a proxy (direct). Put exits there (or pass --pool) to route through them.`);
    return [null];
  }
  const exits = fs.readFileSync(poolFile, 'utf8').split(/\r?\n/).map(parseProxy).filter(Boolean);
  if (!exits.length) {
    console.log(`${poolFile} has no usable exits — running WITHOUT a proxy (direct).`);
    return [null];
  }
  return exits;
}
/** A dead exit, not a panel verdict — the flow rotates to the next candidate. */
const isExitError = (e) =>
  /proxy connect failed|proxy CONNECT refused|proxy timeout|connect timeout|connect failed|ETIMEDOUT|ECONNREFUSED|ECONNRESET|ECONNABORTED|EPIPE|ENETUNREACH|EHOSTUNREACH|EAI_AGAIN|socket hang up|secureConnect|TLS|handshake/i.test(
    String((e && e.message) || e),
  );

/** `host:port` of the exit in play, or `direct` when the pool is empty. */
const exitLabel = (e) => (e ? `${e.host}:${e.port}` : 'direct');


async function screen(exits) {
  let ok = 0;
  for (const e of exits.slice(0, 64)) {
    try {
      const t0 = Date.now();
      const r = await exitFetch(e, `${API}/openai/v1/models`, { timeoutMs: 20000 });
      // The endpoint is keyless-public: 401 = the exit reached 1min.AI (a key
      // would be needed for 200), anything else means it did not.
      const good = r.status === 401 || r.status === 200;
      if (good) ok++;
      console.log(`  ${good ? '✔' : '✘'} ${e ? `${e.host}:${e.port}` : 'direct'} status=${r.status} ${Date.now() - t0}ms`);
    } catch (err) {
      console.log(`  ✘ ${e ? `${e.host}:${e.port}` : 'direct'} ${String(err.message).slice(0, 80)}`);
    }
  }
  console.log(`screened ${Math.min(exits.length, 64)} exit(s): ${ok} reach ${API}`);
  return ok;
}

// ------------------------------------------------------------------- mail
/** Mailtrap REST: one fresh inbound address per account in the configured folder. */
function mtHeaders() {
  if (!MT_TOKEN) throw new Error('no Mailtrap token: pass --mailtrap-token or set ONEMIN_MAILTRAP_TOKEN');
  return { Authorization: `Bearer ${MT_TOKEN}`, Accept: 'application/json' };
}

async function mtCall(exit, method, endpoint, body) {
  const r = await exitJson(exit, `${MAILTRAP}${endpoint}`, { method, body, headers: mtHeaders() });
  let json = r.json;
  if (json && json.errors) {
    const e = json.errors;
    const msg = Array.isArray(e) ? e[0] : e.base ? [].concat(e.base)[0] : String(e);
    throw new Error(`Mailtrap ${method} ${endpoint} -> ${msg}`);
  }
  if (r.status >= 400) throw new Error(`Mailtrap ${method} ${endpoint} -> HTTP ${r.status}: ${String(r.text).slice(0, 140)}`);
  return json;
}

async function mailbox(exit) {
  const foldersRaw = await mtCall(exit, 'GET', '/inbound/folders');
  const folders = Array.isArray(foldersRaw) ? foldersRaw : foldersRaw.folders || [];
  let folder = folders.find((f) => f.name === MT_FOLDER);
  if (!folder) {
    folder = await mtCall(exit, 'POST', '/inbound/folders', { name: MT_FOLDER });
    if (!folder || !folder.id) throw new Error(`Mailtrap: folder creation returned ${JSON.stringify(folder).slice(0, 120)}`);
  }
  const inboxesRaw = await mtCall(exit, 'GET', `/inbound/folders/${folder.id}/inboxes`);
  const inboxes = Array.isArray(inboxesRaw) ? inboxesRaw : inboxesRaw.inboxes || [];
  if (PRESET_EMAIL) {
    const mine = inboxes.find((i) => i.address === PRESET_EMAIL);
    if (!mine) throw new Error(`Mailtrap: no inbox for ${PRESET_EMAIL} in folder ${MT_FOLDER}`);
    return { address: mine.address, inboxId: mine.id, folderId: folder.id, reused: true };
  }
  // The cap is account-wide (300 inboxes across every folder): when it is full the
  // message says so verbatim and the run stops here rather than half-minting.
  const inbox = await mtCall(exit, 'POST', `/inbound/folders/${folder.id}/inboxes`, { name: `one${crypto.randomBytes(4).toString('hex')}` });
  if (!inbox || !inbox.address) throw new Error(`Mailtrap: inbox creation returned ${JSON.stringify(inbox).slice(0, 140)}`);
  return { address: inbox.address, inboxId: inbox.id, folderId: folder.id, reused: false };
}

function allStrings(v, out = []) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => allStrings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => allStrings(x, out));
  return out;
}

/** 1min mails 6-digit numbers only (the initial password and reset codes). */
function codeFrom(text) {
  const s = String(text || '').replace(/\s+/g, ' ');
  const near = /(?:code|kod|otp|verification|password)[^0-9]{0,120}(\d{6})(?!\d)/i.exec(s);
  if (near) return near[1];
  const any = /\b(\d{6})\b/.exec(s);
  return any ? any[1] : null;
}

async function pollMail(exit, box, { timeoutMs = 180000, pollMs = 6000, filter = null } = {}) {
  const deadline = Date.now() + timeoutMs;
  const seen = [];
  while (Date.now() < deadline) {
    let list = [];
    try {
      const raw = await mtCall(exit, 'GET', `/inbound/inboxes/${box.inboxId}/messages`);
      list = Array.isArray(raw) ? raw : raw.data || [];
    } catch (e) { /* transport: retry until the deadline */ }
    for (const m of list) {
      const id = m.id || m.message_id;
      if (!id) continue;
      const blob = (m.text_body || '') + ' ' + (m.html_body || '') + ' ' + allStrings(m).join(' ');
      const line = `${m.subject || ''} ${blob}`;
      if (filter && !filter(line)) continue;
      seen.push({ id, subject: m.subject || null });
      const code = codeFrom(line);
      if (code) return { code, subject: m.subject || null, seen };
    }
    await sleep(pollMs);
  }
  return { code: null, seen };
}

// ------------------------------------------------------------------- turnstile
const rl = () => readline.createInterface({ input: process.stdin, output: process.stdout });

/** The token for one challenge: a captured pair, a solver command, or a paste. */
async function turnstileToken({ challengeId, action }, exit) {
  if (TOKEN_PAIR) {
    const [cid, tok] = TOKEN_PAIR.split(':');
    if (!cid || !tok) throw new Error('the captured pair must be "<challengeId>:<token>" — advanced solver flags: see ADVANCED.md');
    return { challengeId: cid, token: tok };
  }
  if (TOKEN_CMD) {
    const r = spawnSync(TOKEN_CMD, {
      shell: true,
      encoding: 'utf8',
      timeout: 300000,
      env: {
        ...process.env,
        ONEMIN_CDATA: challengeId,
        ONEMIN_ACTION: action,
        ONEMIN_SITEKEY: SITEKEY,
        ONEMIN_URL: APP_URL,
      },
    });
    // Turnstile tokens are `<digit>.<body>` and 65-4096 chars (measured 752/773/
    // 794/816/837, always a `1.` prefix). Reading the last whitespace run of the
    // whole stdout silently keeps a fragment when the solver labels the token, so
    // the strict shape is tried first and the loose classes follow as a fallback.
    const out = String(r.stdout || '');
    const line = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).pop() || '';
    const m = line.match(/\d\.[A-Za-z0-9._-]{63,}$/) || out.match(/[A-Za-z0-9_.-]{40,}/) || out.match(/[A-Za-z0-9_-]{40,}/);
    const token = m ? m[0] : '';
    if (!token) throw new Error(`an external solver produced no token (status ${r.status}): ${String(r.stderr || '').slice(0, 160)} — advanced solver flags: see ADVANCED.md`);
    return { challengeId, token };
  }
  if (AUTO) {
    const r = await solver().solveCaptcha({ type: 'turnstile', sitekey: SITEKEY, url: APP_URL, proxy: exit ? exit.line : null, cdata: challengeId, action });
    if (r && r.token) return { challengeId, token: r.token };
  }
  if (MANUAL) {
    const iface = rl();
    const answer = await new Promise((res) => {
      console.log(`\n  Turnstile needed (action=${action}).`);
      console.log(`  1. open ${APP_URL} , start a signup with this address, solve the widget`);
      console.log(`  2. copy the hidden input  input[name="cf-turnstile-response"]  (DevTools → Elements)`);
      console.log(`  the challenge this token must carry is ${challengeId}\n`);
      iface.question('  paste the token: ', (a) => { iface.close(); res(a.trim()); });
    });
    if (!answer) throw new Error('no token pasted');
    return { challengeId, token: answer };
  }
  throw new Error('no Turnstile source: the embedded solver (--auto) gave nothing — advanced solver flags: see ADVANCED.md');
}

// ------------------------------------------------------------------- flows
function readKeys() {
  try { return fs.readFileSync(KEYS_FILE, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean); } catch { return []; }
}
function appendKey(key) { fs.appendFileSync(KEYS_FILE, (fs.existsSync(KEYS_FILE) && fs.statSync(KEYS_FILE).size ? '\n' : '') + key + '\n'); }
function loadAccounts() { try { return JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf8')); } catch { return []; } }
function saveAccounts(list) { fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(list, null, 2) + '\n'); }

async function signUp(exit, index) {
  const box = await mailbox(exit);
  const ch = await exitJson(exit, `${API}/auth/signup-challenge`, { method: 'POST', headers: PANEL_HEADERS, body: { email: box.address } });
  const challengeId = ch.json && ch.json.challengeId;
  const action = (ch.json && ch.json.action) || 'signup';
  if (!challengeId) throw new Error(`signup-challenge HTTP ${ch.status}: ${String(ch.text).slice(0, 140)}`);
  const { challengeId: cid, token } = await turnstileToken({ challengeId, action }, exit);
  const su = await exitJson(exit, `${API}/auth/signup`, {
    method: 'POST',
    headers: PANEL_HEADERS,
    body: { email: box.address, userName: randName(), teamName: randName(), cfTurnstileToken: token, cfTurnstileChallengeId: cid },
  });
  const teamUuid = su.json && su.json.teams && su.json.teams[0] && su.json.teams[0].team && su.json.teams[0].team.uuid;
  if (su.status === 429) throw new Error(`signup rate-limited on this exit: ${String(su.text).slice(0, 140)} (rotate the exit)`);
  if (su.status !== 200 || !teamUuid) throw new Error(`signup HTTP ${su.status}: ${String(su.text).slice(0, 200)}`);
  // The signup mail carries the account's initial password: it is the only login
  // credential the account has (no password was chosen at signup).
  const pw = await pollMail(exit, box, { timeoutMs: 150000, filter: (l) => /password to log in|initial access/i.test(l) });
  if (!pw.code) throw new Error(`no initial-password mail in ${box.address} (seen: ${JSON.stringify(pw.seen.slice(0, 3))})`);
  const li = await exitJson(exit, `${API}/auth/login`, { method: 'POST', headers: PANEL_HEADERS, body: { email: box.address, password: pw.code } });
  const user = li.json && li.json.user;
  const token2 = user && user.token;
  if (!token2) throw new Error(`login HTTP ${li.status}: ${String(li.text).slice(0, 160)}`);
  const team = user.teams && user.teams[0] && user.teams[0].team;
  const teamId = (user.teams && user.teams[0] && user.teams[0].teamId) || teamUuid;
  const created = await exitJson(exit, `${API}/api/teams/${teamId}/keys`, { method: 'POST', headers: { ...PANEL_HEADERS, 'X-Auth-Token': `Bearer ${token2}` }, body: {} });
  const keyObj = created.json && created.json.apiKey;
  const key = typeof keyObj === 'string' ? keyObj : (keyObj && (keyObj.key || keyObj.apiKey)) || null;
  if (!key) throw new Error(`key creation HTTP ${created.status}: ${String(created.text).slice(0, 160)}`);
  return {
    email: box.address,
    inboxId: box.inboxId,
    folder: MT_FOLDER,
    teamId,
    password: pw.code,
    creditAtLogin: team ? team.credit : null,
    plan: team ? team.subscription && team.subscription.plan : null,
    key,
    index,
  };
}

async function chatGate(exit, key, model = MODEL) {
  const r = await exitJson(exit, `${API}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}` },
    body: { model, messages: [{ role: 'user', content: 'Reply with the single word: OK' }], max_tokens: 16 },
  });
  // A reasoning model can leave `content` empty and answer in `reasoning_content`.
  const msg = r.json && r.json.choices && r.json.choices[0] && r.json.choices[0].message;
  const ok = r.status === 200 && !!msg && !!(msg.content || msg.reasoning_content);
  return { ok, status: r.status, sample: String(r.text).slice(0, 120) };
}

async function mint() {
  const exits = loadExits();
  if (SCREEN) return void (await screen(exits));
  if (DRY) {
    console.log('dry run — nothing is written and no request is sent.');
    console.log(`  count ${COUNT} · conc ${CONC} · model ${MODEL} · exits ${exits.filter(Boolean).length || 'direct'} · solver ${AUTO ? 'embedded src/solver.js (--auto)' : 'off (--no-auto)'}`);
    return;
  }
  const accounts = loadAccounts();
  const routes = exits[0] === null ? 1 : EXITS;
  log(`1min · ${COUNT} key(s) · conc ${CONC} · exits ${exits.filter(Boolean).length || 'direct'} · up to ${routes} per account · keys land in keys.txt`);
  let made = 0;
  let transportDead = 0;
  for (let round = 0; round < COUNT; round += CONC) {
    const jobs = [];
    for (let k = 0; k < CONC && round + k < COUNT; k++) {
      const i = round + k;
      jobs.push((async () => {
        let lastErr = null;
        let lastWasExit = false;
        for (let a = 0; a < routes; a++) {
          const exit = exits[(i + a) % exits.length];
          lastWasExit = false;
          try {
            const rec = await signUp(exit, i + 1);
            const g = await chatGate(exit, rec.key);
            accounts.push({
              at: new Date().toISOString(),
              email: rec.email,
              inboxId: rec.inboxId,
              folder: rec.folder,
              teamId: rec.teamId,
              password: rec.password,
              plan: rec.plan,
              creditAtLogin: rec.creditAtLogin,
              exit: exit ? `${exit.host}:${exit.port}` : 'direct',
              key_masked: `${rec.key.slice(0, 12)}…`,
              gate: g.status,
            });
            saveAccounts(accounts);
            if (!g.ok) { lastErr = new Error(`chat gate ${g.status}: ${g.sample}`); continue; }
            appendKey(rec.key);
            made++;
            log(`account ${i + 1} ✔ chat-200 ${MODEL} · credit ${rec.creditAtLogin} · ${rec.key.slice(0, 12)}…`);
            return;
          } catch (e) {
            lastErr = e;
            lastWasExit = isExitError(e);
            if (lastWasExit) {
              const where = exit ? `exit ${a + 1}/${routes} ${exitLabel(exit)}` : `direct attempt ${a + 1}/${routes}`;
              log(`account ${i + 1}: ${where} dead (${String(e.message).slice(0, 70)})${exit ? ' → next exit' : ''}`);
            }
          }
        }
        if (lastWasExit) transportDead++;
        log(`account ${i + 1}: ${lastErr ? String(lastErr.message).slice(0, 160) : 'failed'}`);
      })());
    }
    await Promise.all(jobs);
    if (GAP_MS) await sleep(GAP_MS);
  }
  if (!made && transportDead === COUNT) {
    const route = exits[0] === null ? 'direct mode (no proxy list)' : `${exits.length}-exit pool`;
    console.error(`[fatal] no usable route — ${COUNT} account(s) × ${routes} candidate(s) over ${route}: every attempt died at the transport layer.`);
    process.exit(1);
  }
  log(`done — ${made}/${COUNT} key(s) written to ${KEYS_FILE}`);
  console.log(`__MINT_SUMMARY__ ${JSON.stringify({ requested: COUNT, live: made, keysFile: KEYS_FILE, deadFile: DEAD_FILE })}`);
}

async function verifyOnly() {
  const exits = loadExits();
  const keys = readKeys();
  if (!keys.length) { console.log(`no keys in ${KEYS_FILE}`); process.exit(0); }
  let live = 0;
  const dead = [];
  // The pool flaps: keep walking distinct exits until one answers, because a
  // transport error is not a provider verdict (measured 2026-10-21 — two live
  // keys read ✘ on ECONNRESET exits twice in a row before this).
  const attempts = Math.max(EXITS, Math.min(exits.length, 6));
  for (let i = 0; i < keys.length; i++) {
    let g = null;
    let lastErr = null;
    for (let t = 0; t < attempts; t++) {
      try { g = await chatGate(exits[(i + t) % exits.length], keys[i]); break; } catch (e) { lastErr = e; }
    }
    if (!g) { dead.push({ key: keys[i], why: String(lastErr && lastErr.message).slice(0, 60) }); console.log(`  ✘ ${keys[i].slice(0, 12)}… ${String(lastErr && lastErr.message).slice(0, 90)} (${attempts} exits tried)`); continue; }
    if (g.ok) live++;
    else dead.push({ key: keys[i], why: `chat=${g.status}` });
    console.log(`  ${g.ok ? '✔' : '✘'} ${keys[i].slice(0, 12)}… chat=${g.status}`);
  }
  fs.writeFileSync(DEAD_FILE, dead.map((d) => `${d.key}\t# ${d.why}`).join('\n') + (dead.length ? '\n' : ''));
  console.log(`verify: ${live}/${keys.length} keys live — the ${dead.length} dead one(s) are in ${DEAD_FILE}`);
  process.exit(live === keys.length ? 0 : 1);
}

(VERIFY_ONLY ? verifyOnly() : mint()).catch((e) => { console.error('[fatal]', e.message); process.exit(1); });
