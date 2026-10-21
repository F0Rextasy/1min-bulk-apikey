<div align="center">

```
 ██╗███╗   ███╗██╗███╗   ██╗
███║████╗ ████║██║████╗  ██║
╚██║██╔████╔██║██║██╔██╗ ██║
 ██║██║╚██╔╝██║██║██║╚██╗██║
 ██║██║ ╚═╝ ██║██║██║ ╚████║
 ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝
```

# 1min-bulk-apikey

**Bulk-create 1min.AI accounts with auto-generated API keys — OpenAI-compatible inference + 9Router connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Quick start](#-quick-start) · [🎁 Free tier](#-free-tier--how-much-you-get) · [🤖 Models](#-models--all-53-of-them) · [🧪 Use the API](#-how-to-use-the-api) · [✅ Verified](#-verified-working--every-key-is-tested) · [🧭 How it works](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Issues](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Why this exists

1min.AI hands every new account a **FREE team with 250,000 credits** — enough to mint a working API key and answer chat, which is what this tool batches. The whole gate is Cloudflare Turnstile plus a mailbox the panel accepts: the signup mail carries the account's **6-digit initial password**, so the run needs no reset step and no second captcha. The API is OpenAI-compatible at `https://api.1min.ai/openai/v1` with 53 model ids.

## 🎁 Free tier — how much you get

| What | Value |
| --- | --- |
| Plan | **FREE** — one team per account (`subscription.plan = "FREE"`) |
| Credit at signup | `credit: 0` |
| Credit at first login | **250,000** — measured on every account the tool created |
| Grant cadence | the 250,000 appears on the first login of every account; whether it rolls over daily or monthly is **unmeasured as of 2026-10-21** (the lane watches one account for the second day) |
| What a call costs | a 51-token `deepseek-flash` call moved 250,000 → **249,924** (76 credits), so one account answers ~3,000 such calls |
| Keys per account | any number (`POST /api/teams/{teamId}/keys`) — every key on an account draws the same team balance, which is why this tool mints **one account per key** |
| Signup gate | Cloudflare Turnstile `action=signup` with `cData=<challengeId>` **and** a readable inbox |
| Disposable domains | refused — `mail.tm` answers `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`; Mailtrap inbound addresses pass |
| Signup rate limit | **per exit IP**: 4-5 signups, then `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — rotate exits when minting in bulk |
| Login credential | the signup itself mails `🔮 Password to log in to 1min.AI!` with a 6-digit password |

> 💡 The free tier is set by 1min.AI and can change. Check the live numbers at [1min.ai](https://1min.ai) — and let the tool's own gate decide:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Models — all 53 of them

`GET https://api.1min.ai/openai/v1/models` returned **53 ids**. Verified live with a chat call (all 200, real content):

| Model ID | Verified |
| --- | --- |
| `deepseek-flash` | **200** — the default gate model for every key this tool writes |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | catalogue — same endpoint, same key |

> ⚠️ A transient Cloudflare **522** was seen twice on `/openai/v1/*` (08:35-08:37 on 2026-10-21) and retried clean a minute later — treat a 522 as "try again", not "blocked".

## 🧪 How to use the API

Base URL **`https://api.1min.ai/openai/v1`** — OpenAI-compatible.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Quick start

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings
# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the
# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

The mailbox rail is **your own Mailtrap account** (the panel refuses the usual disposable domains): set `ONEMIN_MAILTRAP_TOKEN` (or pass `--mailtrap-token`), and the CLI keeps its inboxes in one folder (`--mt-folder`, default `1min-bulk`) so the account-wide 300-inbox cap stays predictable. A key reaches `keys.txt` **only** after `/openai/v1/chat/completions` answers 200.

### 🖱️ The launcher

The launcher asks for the proxy list (optional — without one the CLI runs direct), the Mailtrap token/folder and the count, remembers them, and runs the CLI — mint, verify, screen exits, settings, help, Connect to 9Router.

## ✅ Verified working — every key is tested

| Check | Result |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| Turnstile widget for that challenge | renders, solves in ~25 s and returns an **837-char token** (measured 2026-10-21 through a pool exit) |
| `POST /auth/signup` (token + challengeId) | **200** — `teams[0].team.uuid` comes back; a token with the wrong `action` is refused (`TURNSTILE_ACTION_MISMATCH`) |
| initial-password mail | `Password to log in to 1min.AI!` with a 6-digit code, read from the same inbox |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — note the nested object, not a bare string |
| `POST /openai/v1/chat/completions` per key before it is written | **200** — every key in `keys.txt` was admitted by `deepseek-flash` |
| independent re-check of the whole list (pool exits) | **10/10** keys — `GET /openai/v1/models` **200** + `deepseek-flash` chat **200** with usage |
| a key that fails its check | never written — the account stays in `accounts.json` |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> A flapping exit is not a verdict: `--verify-only` walks up to six exits from your pool per key before it reports one. `--screen` tells you which exits reach `api.1min.ai` at all (a keyless `401` is a pass).

## 🧭 How it works

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| Step | Call | Notes |
| --- | --- | --- |
| mailbox | Mailtrap `POST /inbound/folders/{id}/inboxes` | a fresh `…@inbound-mailtrap.io` per account; `--email` reuses an existing inbox |
| challenge | `POST /auth/signup-challenge {email}` | the `challengeId` is the `cData` the token must carry |
| turnstile | widget `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | `--token-cmd` solver, a captured `--token <cid>:<tok>` pair, or `--manual` |
| signup | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = this exit is rate-limited |
| password | read the signup mail in the same inbox | 6-digit initial password |
| login | `POST /auth/login {email,password}` | JWT; the team carries `credit` |
| key | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | returns `{apiKey:{key}}` |
| proof | `POST /openai/v1/chat/completions` | 200 with content = the key is live |

## ⚙️ CLI options

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| Env | Default | Meaning |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | exit pool, one line per proxy — optional: without a pool the CLI connects directly |
| `ONEMIN_MODEL` | `deepseek-flash` | model for the live verification |
| `ONEMIN_MAILTRAP_TOKEN` | — | your Mailtrap API token (Settings → API Tokens); the inbox rail |

| Flag | Meaning |
| --- | --- |
| `--mt-folder <n>` | Mailtrap folder for the inboxes (`1min-bulk`) |
| `--token-cmd <cmd>` | solver command; per account it gets `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` and prints one token |
| `--token <cid:tok>` | a captured challengeId:token pair (single account) |
| `--manual` | paste each token by hand |
| `--tries N` / `--gap MS` | exits tried per account (`2`) / pause between accounts (`15000`) |

## 🛰️ Behind a proxy

**Optional — recommended at scale (the signup limit is per exit IP).** The tool works without a proxy too.

- **With a pool:** pass `--pool <file>` (or set `ONEMIN_PROXIES`) and every request goes through an exit from that list — a dead line fails that attempt and the CLI retries with the next exit. Keep it one exit per account where you can: 4-5 signups from one IP, then the panel answers `429 … try again after 653 seconds`.
- **Without a pool:** the CLI prints `running WITHOUT a proxy (direct)` and connects directly. Sign-up, key minting, verification and the chat gate are unchanged — only where the packets leave from.
- Run `--screen` against either mode: it tests the exits you have (or the direct route) against `api.1min.ai` before a real run.

## 📄 Files

| Path | Contents |
| --- | --- |
| `keys.txt` | one live-verified key per line — git-ignored |
| `accounts.json` | email / Mailtrap inbox id / teamId / password / credit / exit / gate status — git-ignored |
| `proxies.txt` | your exits — git-ignored |

## 🔌 Connect to 9Router

[9Router](https://9router.com) is a self-hosted, OpenAI-compatible router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Defaults: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Models are served as `1min/<model id>`.

## 🔑 What one key gets you

| | |
| --- | --- |
| 🏢 Provider | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 What the provider gives | FREE team with **250,000 credits** on first login |
| 🔑 What one key gets you | one key on its own account: the 53 ids of `https://api.1min.ai/openai/v1`, chat-verified |
| 🌐 API shape | OpenAI-compatible: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 Your data | only `1min.ai` / `api.1min.ai` and the inbox backend you configure are contacted |

## 🐞 Issues

If 1min.AI changes its signup endpoints, the Turnstile parameters (`action`/`cData`), the credit grant or the disposable-domain policy, the tool stops there and says so. **[Open an issue](../../issues)** with the command and the exact output.

## 📄 License

MIT © 2026 — see [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>
