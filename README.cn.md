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

**批量创建 1min.AI 账户并自动生成 API 密钥 — 兼容 OpenAI 的推理 + 9Router 连接器。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 快速开始](#-quick-start) · [🎁 免费额度](#-free-tier--how-much-you-get) · [🤖 模型](#-models--all-53-of-them) · [🧪 使用 API](#-how-to-use-the-api) · [✅ 已验证](#-verified-working--every-key-is-tested) · [🧭 工作原理](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 选项](#️-cli-options) · [🛰️ 代理](#️-behind-a-proxy) · [🐞 问题反馈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 为什么会有这个项目

1min.AI 会给每个新账户一个**免费团队，附带 250,000 积分**——足以生成一个可用的 API 密钥并完成聊天应答，而这正是本工具批量执行的操作。整个门槛只有 Cloudflare Turnstile 加上一个面板认可的邮箱：注册邮件里带有该账户的**6 位初始密码**，因此整个流程无需重置步骤，也无需第二次验证码。该 API 在 `https://api.1min.ai/openai/v1` 上兼容 OpenAI，提供 53 个模型 id。

## 🎁 免费额度 — 你能拿到多少

| 项目 | 值 |
| --- | --- |
| 套餐 | **FREE** — 每个账户一个团队（`subscription.plan = "FREE"`） |
| 注册时积分 | `credit: 0` |
| 首次登录时积分 | **250,000** — 在本工具创建的每个账户上均已实测 |
| 发放频率 | 250,000 会在每个账户首次登录时出现；它是每日还是每月滚动发放，**截至 2026-10-21 尚未实测**（该通道正在观察一个账户的第二天情况） |
| 一次调用的开销 | 一次 51 token 的 `deepseek-flash` 调用使 250,000 → **249,924**（76 积分），因此一个账户大约可应答 3,000 次此类调用 |
| 每账户密钥数 | 任意数量（`POST /api/teams/{teamId}/keys`）——一个账户上的每个密钥都消耗同一个团队余额，这就是本工具**每个密钥对应一个账户**的原因 |
| 注册门槛 | Cloudflare Turnstile `action=signup` 且 `cData=<challengeId>` **以及**一个可读的收件箱 |
| 一次性域名 | 会被拒绝——`mail.tm` 返回 `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`；Mailtrap 入站地址可以通过 |
| 注册速率限制 | **按出口 IP**：4-5 次注册后，返回 `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}`——批量创建时需轮换出口 |
| 登录凭据 | 注册本身会发送 `🔮 Password to log in to 1min.AI!` 邮件，内含 6 位密码 |

> 💡 免费额度由 1min.AI 设定，可能会变化。请在 [1min.ai](https://1min.ai) 查看实时数字——并让工具自身的门槛来判定：

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 模型 — 全部 53 个

`GET https://api.1min.ai/openai/v1/models` 返回了 **53 个 id**。已通过聊天调用实时验证（全部 200，真实内容）：

| 模型 ID | 已验证 |
| --- | --- |
| `deepseek-flash` | **200** — 本工具写入的每个密钥的默认门槛模型 |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | 目录 — 相同端点，相同密钥 |

> ⚠️ 在 `/openai/v1/*` 上曾两次看到短暂的 Cloudflare **522**（2026-10-21 的 08:35-08:37），一分钟后重试即恢复正常——请将 522 视为“重试”，而非“被封”。

## 🧪 如何使用 API

基础 URL **`https://api.1min.ai/openai/v1`** — 兼容 OpenAI。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 快速开始

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings

# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the

# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

邮箱通道是**你自己的 Mailtrap 账户**（面板会拒绝常见的一次性域名）：设置 `ONEMIN_MAILTRAP_TOKEN`（或传入 `--mailtrap-token`），CLI 会将其收件箱保存在一个文件夹中（`--mt-folder`，默认 `1min-bulk`），以便账户范围的 300 个收件箱上限保持可预测。一个密钥**只有**在 `/openai/v1/chat/completions` 返回 200 之后才会写入 `keys.txt`。

### 🖱️ 启动器

启动器会询问代理列表（可选——不提供则 CLI 直接运行）、Mailtrap token/文件夹和数量，记住它们，然后运行 CLI——创建、验证、筛选出口、设置、帮助、连接到 9Router。

## ✅ 已验证可用 — 每个密钥都经过测试

| 检查项 | 结果 |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| 该 challenge 的 Turnstile 组件 | 可渲染，约 25 秒内解出并返回一个 **837 字符的 token**（2026-10-21 通过一个池出口实测） |
| `POST /auth/signup`（token + challengeId） | **200** — 返回 `teams[0].team.uuid`；`action` 错误的 token 会被拒绝（`TURNSTILE_ACTION_MISMATCH`） |
| 初始密码邮件 | `Password to log in to 1min.AI!`，含 6 位验证码，从同一收件箱读取 |
| `POST /auth/login` | **200** — JWT，`plan: FREE`，`credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — 注意是嵌套对象，而非裸字符串 |
| 每个密钥在写入前执行 `POST /openai/v1/chat/completions` | **200** — `keys.txt` 中的每个密钥都通过了 `deepseek-flash` 的验证 |
| 对整个列表的独立复查（池出口） | **10/10** 个密钥 — `GET /openai/v1/models` **200** + `deepseek-flash` 聊天 **200** 且带用量 |
| 未通过检查的密钥 | 永不写入 — 该账户保留在 `accounts.json` 中 |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> 出口抖动并非最终判定：`--verify-only` 会为每个密钥最多尝试你池中的六个出口，然后才报告失败。`--screen` 会告诉你哪些出口能连通 `api.1min.ai`（无密钥的 `401` 即为通过）。

## 🧭 工作原理

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| 步骤 | 调用 | 说明 |
| --- | --- | --- |
| 邮箱 | Mailtrap `POST /inbound/folders/{id}/inboxes` | 每个账户一个全新的 `…@inbound-mailtrap.io`；`--email` 可复用现有收件箱 |
| challenge | `POST /auth/signup-challenge {email}` | `challengeId` 就是 token 必须携带的 `cData` |
| turnstile | 组件 `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`，`action=signup` | `--token-cmd` 求解器、捕获的 `--token <cid>:<tok>` 对，或 `--manual` |
| 注册 | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`；429 = 该出口被限速 |
| 密码 | 在同一收件箱中读取注册邮件 | 6 位初始密码 |
| 登录 | `POST /auth/login {email,password}` | JWT；团队带有 `credit` |
| 密钥 | `POST /api/teams/{teamId}/keys`（`X-Auth-Token: Bearer <jwt>`） | 返回 `{apiKey:{key}}` |
| 验证 | `POST /openai/v1/chat/completions` | 200 且带内容 = 该密钥可用 |

## ⚙️ CLI 选项

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | 出口池，每行一个代理 — 可选：没有池时 CLI 直接连接 |
| `ONEMIN_MODEL` | `deepseek-flash` | 用于实时验证的模型 |
| `ONEMIN_MAILTRAP_TOKEN` | — | 你的 Mailtrap API token（Settings → API Tokens）；收件箱通道 |

| 标志 | 含义 |
| --- | --- |
| `--mt-folder <n>` | 用于收件箱的 Mailtrap 文件夹（`1min-bulk`） |
| `--token-cmd <cmd>` | 求解器命令；每个账户会获得 `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` 并打印一个 token |
| `--token <cid:tok>` | 捕获的 challengeId:token 对（单账户） |
| `--manual` | 手动粘贴每个 token |
| `--exits N` / `--gap MS` | 每个账户尝试的出口数（`6`）/ 账户之间的暂停（`15000`） |

## 🛰️ 在代理后面

**可选 — 大规模使用时推荐（注册限制是按出口 IP 计的）。** 本工具在没有代理时也能工作。

- **有池时：** 传入 `--pool <file>`（或设置 `ONEMIN_PROXIES`），每个请求都会经过该列表中的一个出口——一条失效线路会使该次尝试失败，CLI 会用下一个出口重试。尽量保持每个账户一个出口：一个 IP 注册 4-5 次后，面板会返回 `429 … try again after 653 seconds`。
- **无池时：** CLI 会打印 `running WITHOUT a proxy (direct)` 并直接连接。注册、密钥创建、验证和聊天门槛均不变——只是数据包发出的位置不同。
- 对任一模式运行 `--screen`：它会在真实运行前，用你拥有的出口（或直连路由）测试 `api.1min.ai`。

## 📄 文件

| 路径 | 内容 |
| --- | --- |
| `keys.txt` | 每行一个经实时验证的密钥 — 已被 git 忽略 |
| `accounts.json` | 邮箱 / Mailtrap 收件箱 id / teamId / 密码 / 积分 / 出口 / 门槛状态 — 已被 git 忽略 |
| `proxies.txt` | 你的出口 — 已被 git 忽略 |

## 🔌 连接到 9Router

[9Router](https://9router.com) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

默认值：`--prefix 1min`、`--base-url https://api.1min.ai/openai/v1`、`--model deepseek-flash`。模型以 `1min/<model id>` 形式提供。

## 🔌 连接到 OmniRoute

[OmniRoute](https://omniroute.online) 是一个自托管、兼容 OpenAI 的路由器：

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

默认值：`--prefix 1min`、`--base-url https://api.1min.ai/openai/v1`、`--model deepseek-flash`。模型以 `1min/<model id>` 形式提供。
## 🔑 一个密钥能给你什么

| | |
| --- | --- |
| 🏢 提供商 | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 提供商提供什么 | 首次登录时获得带 **250,000 积分**的 FREE 团队 |
| 🔑 一个密钥能给你什么 | 在其独立账户上的一个密钥：`https://api.1min.ai/openai/v1` 的 53 个 id，均经聊天验证 |
| 🌐 API 形态 | 兼容 OpenAI：`POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 你的数据 | 仅会联系 `1min.ai` / `api.1min.ai` 以及你配置的收件箱后端 |

## 🐞 问题反馈

如果 1min.AI 更改其注册端点、Turnstile 参数（`action`/`cData`）、积分发放或一次性域名政策，本工具会在此处停止并说明原因。请**[提交 issue](../../issues)**，附上命令和确切输出。

## 📄 许可证

MIT © 2026 — 见 [LICENSE](LICENSE)。

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>