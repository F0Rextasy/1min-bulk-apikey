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

**自動生成されたAPIキーで1min.AIアカウントを一括作成 — OpenAI互換の推論 + 9Routerコネクタ。**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 クイックスタート](#-quick-start) · [🎁 無料枠](#-free-tier--how-much-you-get) · [🤖 モデル](#-models--all-53-of-them) · [🧪 APIの使い方](#-how-to-use-the-api) · [✅ 検証済み](#-verified-working--every-key-is-tested) · [🧭 仕組み](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ オプション](#️-cli-options) · [🛰️ プロキシ](#️-behind-a-proxy) · [🐞 問題](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ これが存在する理由

1min.AIは新規アカウントごとに**無料チームと250,000クレジット**を付与します — これは動作するAPIキーを発行してチャットに応答するのに十分で、このツールがそれを一括処理します。関門はCloudflare Turnstileと、パネルが受け入れるメールボックスだけです。登録メールにはアカウントの**6桁の初期パスワード**が記載されているため、実行にリセット手順も2回目のキャプチャも不要です。APIは`https://api.1min.ai/openai/v1`でOpenAI互換、53個のモデルIDを備えています。

## 🎁 無料枠 — どれだけ得られるか

| 項目 | 値 |
| --- | --- |
| プラン | **FREE** — アカウントごとに1チーム(`subscription.plan = "FREE"`) |
| 登録時のクレジット | `credit: 0` |
| 初回ログイン時のクレジット | **250,000** — ツールが作成したすべてのアカウントで計測済み |
| 付与の頻度 | 250,000はすべてのアカウントの初回ログイン時に現れます。毎日か毎月の繰り越しかは**2026-10-21時点で未計測**(レーンは2日目に1アカウントを監視中) |
| 呼び出しのコスト | 51トークンの`deepseek-flash`呼び出しで250,000 → **249,924**(76クレジット)、つまり1アカウントでそのような呼び出しに約3,000回応答できます |
| アカウントごとのキー数 | 任意の数(`POST /api/teams/{teamId}/keys`) — アカウント上のすべてのキーは同じチーム残高を消費するため、このツールは**キーごとに1アカウント**を発行します |
| 登録の関門 | Cloudflare Turnstile `action=signup` と `cData=<challengeId>` **および** 読み取り可能な受信トレイ |
| 使い捨てドメイン | 拒否 — `mail.tm`は`400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`を返す。Mailtrapの受信アドレスは通過 |
| 登録レート制限 | **出口IPごと**: 4〜5回の登録後、`429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — 一括発行時は出口をローテーションしてください |
| ログイン資格情報 | 登録自体が`🔮 Password to log in to 1min.AI!`を6桁のパスワードとともにメール送信します |

> 💡 無料枠は1min.AIが設定するもので、変更される可能性があります。最新の数値は[1min.ai](https://1min.ai)で確認してください — そしてツール自身の関門に判断させてください:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 モデル — 全53個

`GET https://api.1min.ai/openai/v1/models`は**53個のID**を返しました。チャット呼び出しでライブ検証済み(すべて200、実際のコンテンツ):

| モデルID | 検証済み |
| --- | --- |
| `deepseek-flash` | **200** — このツールが書き込むすべてのキーのデフォルト関門モデル |
| `gpt-4.1-nano`、`gpt-4.1-mini`、`qwen-flash` | **200** |
| `gpt-5*`、`gpt-6*`、`o3`、`o3-mini`、`qwen3.6/3.7-*`、`mistral-*`、`magistral-*`、`ministral-14b-latest`、`open-mistral-nemo`、`glm-5*`、`moonshotai/kimi-k2.6`、`moonshotai/kimi-k2.7-code`、`meta/muse-spark-1.1/1.2/1.3` | カタログ — 同じエンドポイント、同じキー |

> ⚠️ 一時的なCloudflare **522**が`/openai/v1/*`で2回観測され(2026-10-21の08:35〜08:37)、1分後にクリーンに再試行されました — 522は「ブロック」ではなく「再試行」として扱ってください。

## 🧪 APIの使い方

ベースURL **`https://api.1min.ai/openai/v1`** — OpenAI互換。

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 クイックスタート

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings

# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the

# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

メールボックスのレールは**あなた自身のMailtrapアカウント**です(パネルは通常の使い捨てドメインを拒否します): `ONEMIN_MAILTRAP_TOKEN`を設定する(または`--mailtrap-token`を渡す)と、CLIは受信トレイを1つのフォルダ(`--mt-folder`、デフォルト`1min-bulk`)に保持するため、アカウント全体の300受信トレイ上限が予測可能なままになります。キーは`/openai/v1/chat/completions`が200を返した**後にのみ**`keys.txt`に到達します。

### 🖱️ ランチャー

ランチャーはプロキシリスト(任意 — なしの場合CLIは直接実行)、Mailtrapトークン/フォルダと件数を尋ね、それらを記憶してCLIを実行します — 発行、検証、出口のスクリーニング、設定、ヘルプ、9Routerへの接続。

## ✅ 動作検証済み — すべてのキーがテストされています

| チェック | 結果 |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| そのチャレンジのTurnstileウィジェット | レンダリングし、約25秒で解決して**837文字のトークン**を返す(2026-10-21にプール出口経由で計測) |
| `POST /auth/signup` (token + challengeId) | **200** — `teams[0].team.uuid`が返る。誤った`action`のトークンは拒否される(`TURNSTILE_ACTION_MISMATCH`) |
| 初期パスワードメール | `Password to log in to 1min.AI!`と6桁のコード、同じ受信トレイから読み取り |
| `POST /auth/login` | **200** — JWT、`plan: FREE`、`credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — 裸の文字列ではなくネストされたオブジェクトに注意 |
| 書き込まれる前の各キーの`POST /openai/v1/chat/completions` | **200** — `keys.txt`のすべてのキーが`deepseek-flash`によって承認されました |
| リスト全体の独立した再チェック(プール出口) | **10/10**キー — `GET /openai/v1/models` **200** + `deepseek-flash`チャット**200**と使用量 |
| チェックに失敗したキー | 書き込まれない — アカウントは`accounts.json`に残ります |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> 不安定な出口は判定ではありません: `--verify-only`は報告する前にキーごとにプールから最大6つの出口を試します。`--screen`はどの出口が`api.1min.ai`に到達するかを教えてくれます(キーなしの`401`は合格です)。

## 🧭 仕組み

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| ステップ | 呼び出し | 備考 |
| --- | --- | --- |
| メールボックス | Mailtrap `POST /inbound/folders/{id}/inboxes` | アカウントごとに新しい`…@inbound-mailtrap.io`; `--email`は既存の受信トレイを再利用 |
| チャレンジ | `POST /auth/signup-challenge {email}` | `challengeId`はトークンが持つべき`cData` |
| turnstile | ウィジェット `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`、`action=signup` | `--token-cmd`ソルバー、キャプチャした`--token <cid>:<tok>`ペア、または`--manual` |
| 登録 | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = この出口はレート制限中 |
| パスワード | 同じ受信トレイで登録メールを読む | 6桁の初期パスワード |
| ログイン | `POST /auth/login {email,password}` | JWT; チームが`credit`を持つ |
| キー | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | `{apiKey:{key}}`を返す |
| 証明 | `POST /openai/v1/chat/completions` | コンテンツ付きの200 = キーはライブ |

## ⚙️ CLIオプション

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| 環境変数 | デフォルト | 意味 |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | 出口プール、1行に1プロキシ — 任意: プールなしの場合CLIは直接接続 |
| `ONEMIN_MODEL` | `deepseek-flash` | ライブ検証用のモデル |
| `ONEMIN_MAILTRAP_TOKEN` | — | あなたのMailtrap APIトークン(Settings → API Tokens); 受信トレイのレール |

| フラグ | 意味 |
| --- | --- |
| `--mt-folder <n>` | 受信トレイ用のMailtrapフォルダ(`1min-bulk`) |
| `--token-cmd <cmd>` | ソルバーコマンド; アカウントごとに`ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL`を受け取り、1つのトークンを出力 |
| `--token <cid:tok>` | キャプチャしたchallengeId:tokenペア(単一アカウント) |
| `--manual` | 各トークンを手動で貼り付け |
| `--tries N` / `--gap MS` | アカウントごとに試す出口(`2`) / アカウント間の一時停止(`15000`) |

## 🛰️ プロキシの背後で

**任意 — 大規模時は推奨(登録制限は出口IPごと)。** ツールはプロキシなしでも動作します。

- **プールあり:** `--pool <file>`を渡す(または`ONEMIN_PROXIES`を設定する)と、すべてのリクエストがそのリストの出口を経由します — 死んだ回線はその試行を失敗させ、CLIは次の出口で再試行します。可能な限りアカウントごとに1出口を保ってください: 1つのIPから4〜5回の登録後、パネルは`429 … try again after 653 seconds`を返します。
- **プールなし:** CLIは`running WITHOUT a proxy (direct)`と表示して直接接続します。登録、キー発行、検証、チャット関門は変わりません — パケットが出ていく場所だけが異なります。
- どちらのモードでも`--screen`を実行してください: 実際の実行前に、持っている出口(または直接ルート)を`api.1min.ai`に対してテストします。

## 📄 ファイル

| パス | 内容 |
| --- | --- |
| `keys.txt` | 1行に1つのライブ検証済みキー — git無視 |
| `accounts.json` | email / Mailtrap受信トレイID / teamId / password / credit / exit / gateステータス — git無視 |
| `proxies.txt` | あなたの出口 — git無視 |

## 🔌 9Routerへの接続

[9Router](https://9router.com)はセルフホストのOpenAI互換ルーターです:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

デフォルト: `--prefix 1min`、`--base-url https://api.1min.ai/openai/v1`、`--model deepseek-flash`。モデルは`1min/<model id>`として提供されます。

## 🔌 OmniRouteへの接続

[OmniRoute](https://omniroute.online)はセルフホストのOpenAI互換ルーターです:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

デフォルト: `--prefix 1min`、`--base-url https://api.1min.ai/openai/v1`、`--model deepseek-flash`。モデルは`1min/<model id>`として提供されます。
## 🔑 1つのキーで得られるもの

| | |
| --- | --- |
| 🏢 プロバイダー | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 プロバイダーが提供するもの | 初回ログイン時に**250,000クレジット**付きの無料チーム |
| 🔑 1つのキーで得られるもの | 独自のアカウント上の1つのキー: `https://api.1min.ai/openai/v1`の53個のID、チャット検証済み |
| 🌐 APIの形式 | OpenAI互換: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 あなたのデータ | `1min.ai` / `api.1min.ai`と、設定した受信トレイバックエンドのみが接触されます |

## 🐞 問題

1min.AIが登録エンドポイント、Turnstileパラメータ(`action`/`cData`)、クレジット付与、または使い捨てドメインポリシーを変更した場合、ツールはそこで停止し、その旨を報告します。コマンドと正確な出力を添えて**[issueを開いてください](../../issues)**。

## 📄 ライセンス

MIT © 2026 — [LICENSE](LICENSE)を参照。

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>