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

**자동 생성된 API 키로 1min.AI 계정을 대량 생성 — OpenAI 호환 추론 + 9Router 커넥터.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 빠른 시작](#-quick-start) · [🎁 무료 티어](#-free-tier--how-much-you-get) · [🤖 모델](#-models--all-53-of-them) · [🧪 API 사용하기](#-how-to-use-the-api) · [✅ 검증됨](#-verified-working--every-key-is-tested) · [🧭 작동 방식](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [🔌 OmniRoute](#-connect-to-omniroute) · [⚙️ 옵션](#️-cli-options) · [🛰️ 프록시](#️-behind-a-proxy) · [🐞 이슈](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ 이 도구가 존재하는 이유

1min.AI는 모든 신규 계정에 **250,000 크레딧이 있는 무료 팀**을 부여합니다 — 이는 작동하는 API 키를 발급하고 채팅에 응답하기에 충분하며, 이 도구가 일괄 처리하는 것이 바로 그것입니다. 전체 관문은 Cloudflare Turnstile과 패널이 허용하는 메일함뿐입니다: 가입 메일에는 계정의 **6자리 초기 비밀번호**가 담겨 있으므로, 실행에 재설정 단계도 두 번째 캡차도 필요하지 않습니다. API는 `https://api.1min.ai/openai/v1`에서 OpenAI 호환이며 53개의 모델 id를 제공합니다.

## 🎁 무료 티어 — 얼마나 받을 수 있나

| 항목 | 값 |
| --- | --- |
| 플랜 | **FREE** — 계정당 하나의 팀 (`subscription.plan = "FREE"`) |
| 가입 시 크레딧 | `credit: 0` |
| 첫 로그인 시 크레딧 | **250,000** — 도구가 생성한 모든 계정에서 측정됨 |
| 지급 주기 | 250,000은 모든 계정의 첫 로그인 시 나타납니다; 매일 또는 매월 롤오버되는지는 **2026-10-21 기준으로 미측정**입니다 (해당 레인이 둘째 날 한 계정을 관찰 중) |
| 호출 비용 | 51토큰 `deepseek-flash` 호출이 250,000 → **249,924**로 이동 (76 크레딧), 따라서 한 계정으로 그러한 호출을 약 3,000회 응답할 수 있습니다 |
| 계정당 키 수 | 임의 개수 (`POST /api/teams/{teamId}/keys`) — 한 계정의 모든 키가 동일한 팀 잔액을 소모하므로, 이 도구는 **키당 하나의 계정**을 발급합니다 |
| 가입 관문 | Cloudflare Turnstile `action=signup`과 `cData=<challengeId>` **그리고** 읽을 수 있는 받은편지함 |
| 일회용 도메인 | 거부됨 — `mail.tm`은 `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`을 반환; Mailtrap 인바운드 주소는 통과 |
| 가입 속도 제한 | **출구 IP당**: 가입 4-5회 후 `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — 대량 발급 시 출구를 교체하세요 |
| 로그인 자격 증명 | 가입 자체가 `🔮 Password to log in to 1min.AI!`를 6자리 비밀번호와 함께 메일로 보냅니다 |

> 💡 무료 티어는 1min.AI가 설정하며 변경될 수 있습니다. 실시간 수치는 [1min.ai](https://1min.ai)에서 확인하세요 — 그리고 도구 자체의 관문이 판단하게 하세요:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 모델 — 53개 전부

`GET https://api.1min.ai/openai/v1/models`는 **53개의 id**를 반환했습니다. 채팅 호출로 실시간 검증됨 (모두 200, 실제 콘텐츠):

| 모델 ID | 검증됨 |
| --- | --- |
| `deepseek-flash` | **200** — 이 도구가 작성하는 모든 키의 기본 관문 모델 |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | 카탈로그 — 동일 엔드포인트, 동일 키 |

> ⚠️ 일시적인 Cloudflare **522**가 `/openai/v1/*`에서 두 번 관찰되었으며 (2026-10-21 08:35-08:37) 1분 후 정상 재시도되었습니다 — 522는 "차단됨"이 아니라 "다시 시도"로 취급하세요.

## 🧪 API 사용 방법

Base URL **`https://api.1min.ai/openai/v1`** — OpenAI 호환.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 빠른 시작

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings

# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the

# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

메일함 레일은 **당신의 Mailtrap 계정**입니다 (패널이 일반적인 일회용 도메인을 거부합니다): `ONEMIN_MAILTRAP_TOKEN`을 설정하거나 (`--mailtrap-token` 전달), CLI는 받은편지함을 하나의 폴더에 유지합니다 (`--mt-folder`, 기본값 `1min-bulk`) 그래서 계정 전체의 300개 받은편지함 상한이 예측 가능하게 유지됩니다. 키는 `/openai/v1/chat/completions`가 200을 응답한 **후에만** `keys.txt`에 도달합니다.

### 🖱️ 런처

런처는 프록시 목록 (선택 사항 — 없으면 CLI는 직접 실행), Mailtrap 토큰/폴더와 개수를 묻고, 이를 기억한 뒤 CLI를 실행합니다 — 발급, 검증, 출구 스크리닝, 설정, 도움말, 9Router 연결.

## ✅ 작동 검증됨 — 모든 키가 테스트됩니다

| 검사 | 결과 |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| 해당 챌린지의 Turnstile 위젯 | 렌더링되고 약 25초에 해결되어 **837자 토큰**을 반환 (2026-10-21 풀 출구를 통해 측정) |
| `POST /auth/signup` (token + challengeId) | **200** — `teams[0].team.uuid`가 반환됨; 잘못된 `action`의 토큰은 거부됨 (`TURNSTILE_ACTION_MISMATCH`) |
| 초기 비밀번호 메일 | `Password to log in to 1min.AI!` 6자리 코드와 함께, 동일한 받은편지함에서 읽음 |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — 문자열이 아닌 중첩 객체임에 주의 |
| 작성 전 각 키에 대한 `POST /openai/v1/chat/completions` | **200** — `keys.txt`의 모든 키가 `deepseek-flash`에 의해 허용됨 |
| 전체 목록의 독립적 재확인 (풀 출구) | **10/10** 키 — `GET /openai/v1/models` **200** + `deepseek-flash` 채팅 **200** (사용량 포함) |
| 검사에 실패한 키 | 절대 작성되지 않음 — 계정은 `accounts.json`에 남음 |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> 불안정한 출구는 판정이 아닙니다: `--verify-only`는 하나를 보고하기 전에 키당 풀에서 최대 여섯 개의 출구를 순회합니다. `--screen`은 어떤 출구가 `api.1min.ai`에 도달하는지 알려줍니다 (키 없는 `401`은 통과입니다).

## 🧭 작동 방식

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| 단계 | 호출 | 비고 |
| --- | --- | --- |
| 메일함 | Mailtrap `POST /inbound/folders/{id}/inboxes` | 계정당 새로운 `…@inbound-mailtrap.io`; `--email`은 기존 받은편지함을 재사용 |
| 챌린지 | `POST /auth/signup-challenge {email}` | `challengeId`는 토큰이 담아야 하는 `cData` |
| turnstile | 위젯 `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | `--token-cmd` 솔버, 캡처된 `--token <cid>:<tok>` 쌍, 또는 `--manual` |
| 가입 | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = 이 출구는 속도 제한됨 |
| 비밀번호 | 동일한 받은편지함에서 가입 메일 읽기 | 6자리 초기 비밀번호 |
| 로그인 | `POST /auth/login {email,password}` | JWT; 팀이 `credit`을 가짐 |
| 키 | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | `{apiKey:{key}}` 반환 |
| 증명 | `POST /openai/v1/chat/completions` | 콘텐츠와 함께 200 = 키가 살아 있음 |

## ⚙️ CLI 옵션

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| 환경 변수 | 기본값 | 의미 |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | 출구 풀, 프록시당 한 줄 — 선택 사항: 풀이 없으면 CLI는 직접 연결 |
| `ONEMIN_MODEL` | `deepseek-flash` | 실시간 검증용 모델 |
| `ONEMIN_MAILTRAP_TOKEN` | — | 당신의 Mailtrap API 토큰 (Settings → API Tokens); 받은편지함 레일 |

| 플래그 | 의미 |
| --- | --- |
| `--mt-folder <n>` | 받은편지함용 Mailtrap 폴더 (`1min-bulk`) |
| `--token-cmd <cmd>` | 솔버 명령; 계정당 `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL`을 받고 하나의 토큰을 출력 |
| `--token <cid:tok>` | 캡처된 challengeId:token 쌍 (단일 계정) |
| `--manual` | 각 토큰을 수동으로 붙여넣기 |
| `--tries N` / `--gap MS` | 계정당 시도할 출구 (`2`) / 계정 간 일시정지 (`15000`) |

## 🛰️ 프록시 뒤에서

**선택 사항 — 대규모에서는 권장됨 (가입 제한은 출구 IP당입니다).** 이 도구는 프록시 없이도 작동합니다.

- **풀이 있는 경우:** `--pool <file>`을 전달하거나 (`ONEMIN_PROXIES` 설정) 모든 요청이 해당 목록의 출구를 통해 나갑니다 — 죽은 회선은 해당 시도를 실패시키고 CLI는 다음 출구로 재시도합니다. 가능하면 계정당 하나의 출구를 유지하세요: 하나의 IP에서 가입 4-5회 후 패널이 `429 … try again after 653 seconds`를 응답합니다.
- **풀이 없는 경우:** CLI는 `running WITHOUT a proxy (direct)`를 출력하고 직접 연결합니다. 가입, 키 발급, 검증 및 채팅 관문은 변경되지 않습니다 — 패킷이 나가는 위치만 다를 뿐입니다.
- 어느 모드에서든 `--screen`을 실행하세요: 실제 실행 전에 보유한 출구 (또는 직접 경로)를 `api.1min.ai`에 대해 테스트합니다.

## 📄 파일

| 경로 | 내용 |
| --- | --- |
| `keys.txt` | 한 줄에 하나의 실시간 검증된 키 — git-ignored |
| `accounts.json` | email / Mailtrap inbox id / teamId / password / credit / exit / gate status — git-ignored |
| `proxies.txt` | 당신의 출구 — git-ignored |

## 🔌 9Router에 연결

[9Router](https://9router.com)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

기본값: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. 모델은 `1min/<model id>`로 제공됩니다.

## 🔌 OmniRoute에 연결

[OmniRoute](https://omniroute.online)는 자체 호스팅, OpenAI 호환 라우터입니다:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

기본값: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. 모델은 `1min/<model id>`로 제공됩니다.
## 🔑 하나의 키로 얻는 것

| | |
| --- | --- |
| 🏢 제공자 | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 제공자가 주는 것 | 첫 로그인 시 **250,000 크레딧**이 있는 FREE 팀 |
| 🔑 하나의 키로 얻는 것 | 자체 계정의 하나의 키: `https://api.1min.ai/openai/v1`의 53개 id, 채팅 검증됨 |
| 🌐 API 형태 | OpenAI 호환: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 당신의 데이터 | `1min.ai` / `api.1min.ai`와 당신이 구성한 받은편지함 백엔드만 접촉됨 |

## 🐞 이슈

1min.AI가 가입 엔드포인트, Turnstile 매개변수 (`action`/`cData`), 크레딧 지급 또는 일회용 도메인 정책을 변경하면, 도구는 그 지점에서 멈추고 그렇게 알립니다. 명령과 정확한 출력을 포함하여 **[이슈를 열어주세요](../../issues)**.

## 📄 라이선스

MIT © 2026 — [LICENSE](LICENSE) 참조.

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>