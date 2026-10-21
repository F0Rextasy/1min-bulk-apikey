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

**1min.AI-Konten in großen Mengen erstellen mit automatisch generierten API-Schlüsseln — OpenAI-kompatible Inferenz + 9Router-Connector.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Schnellstart](#-quick-start) · [🎁 Kostenloser Tarif](#-free-tier--how-much-you-get) · [🤖 Modelle](#-models--all-53-of-them) · [🧪 Die API verwenden](#-how-to-use-the-api) · [✅ Verifiziert](#-verified-working--every-key-is-tested) · [🧭 So funktioniert es](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Optionen](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Probleme](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Warum es das gibt

1min.AI gibt jedem neuen Konto ein **KOSTENLOSES Team mit 250.000 Credits** — genug, um einen funktionierenden API-Schlüssel zu erzeugen und Chat-Anfragen zu beantworten, was dieses Tool in Stapeln erledigt. Das gesamte Hindernis besteht aus Cloudflare Turnstile plus einem Postfach, das das Panel akzeptiert: Die Registrierungs-E-Mail enthält das **6-stellige Anfangspasswort** des Kontos, sodass der Durchlauf keinen Zurücksetzungsschritt und kein zweites Captcha benötigt. Die API ist OpenAI-kompatibel unter `https://api.1min.ai/openai/v1` mit 53 Modell-IDs.

## 🎁 Kostenloser Tarif — wie viel du bekommst

| Was | Wert |
| --- | --- |
| Tarif | **FREE** — ein Team pro Konto (`subscription.plan = "FREE"`) |
| Credits bei der Registrierung | `credit: 0` |
| Credits beim ersten Login | **250.000** — bei jedem vom Tool erstellten Konto gemessen |
| Vergabe-Rhythmus | die 250.000 erscheinen beim ersten Login jedes Kontos; ob sie täglich oder monatlich übertragen werden, ist **Stand 2026-10-21 ungemessen** (die Spur beobachtet ein Konto für den zweiten Tag) |
| Was ein Aufruf kostet | ein `deepseek-flash`-Aufruf mit 51 Tokens bewegte 250.000 → **249.924** (76 Credits), ein Konto beantwortet also etwa 3.000 solcher Aufrufe |
| Schlüssel pro Konto | beliebig viele (`POST /api/teams/{teamId}/keys`) — jeder Schlüssel eines Kontos zieht vom selben Team-Guthaben ab, weshalb dieses Tool **ein Konto pro Schlüssel** erzeugt |
| Registrierungshürde | Cloudflare Turnstile `action=signup` mit `cData=<challengeId>` **und** einem lesbaren Posteingang |
| Wegwerf-Domains | abgelehnt — `mail.tm` antwortet mit `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`; Mailtrap-Inbound-Adressen werden akzeptiert |
| Registrierungs-Ratenlimit | **pro Exit-IP**: 4-5 Registrierungen, dann `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — rotiere Exits beim Massen-Erstellen |
| Login-Anmeldedaten | die Registrierung selbst verschickt `🔮 Password to log in to 1min.AI!` mit einem 6-stelligen Passwort |

> 💡 Der kostenlose Tarif wird von 1min.AI festgelegt und kann sich ändern. Prüfe die aktuellen Zahlen auf [1min.ai](https://1min.ai) — und lass das Gate des Tools selbst entscheiden:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelle — alle 53 davon

`GET https://api.1min.ai/openai/v1/models` gab **53 IDs** zurück. Live mit einem Chat-Aufruf verifiziert (alle 200, echte Inhalte):

| Modell-ID | Verifiziert |
| --- | --- |
| `deepseek-flash` | **200** — das Standard-Gate-Modell für jeden Schlüssel, den dieses Tool schreibt |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | Katalog — derselbe Endpunkt, derselbe Schlüssel |

> ⚠️ Ein vorübergehender Cloudflare **522** wurde zweimal auf `/openai/v1/*` beobachtet (08:35-08:37 am 2026-10-21) und eine Minute später sauber wiederholt — behandle einen 522 als „versuche es erneut", nicht als „blockiert".

## 🧪 Die API verwenden

Basis-URL **`https://api.1min.ai/openai/v1`** — OpenAI-kompatibel.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Schnellstart

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings
# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the
# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

Die Postfach-Schiene ist **dein eigenes Mailtrap-Konto** (das Panel lehnt die üblichen Wegwerf-Domains ab): Setze `ONEMIN_MAILTRAP_TOKEN` (oder übergib `--mailtrap-token`), und die CLI hält ihre Posteingänge in einem Ordner (`--mt-folder`, Standard `1min-bulk`), damit die kontoweite Obergrenze von 300 Posteingängen vorhersehbar bleibt. Ein Schlüssel erreicht `keys.txt` **nur**, nachdem `/openai/v1/chat/completions` mit 200 antwortet.

### 🖱️ Der Launcher

Der Launcher fragt nach der Proxy-Liste (optional — ohne eine läuft die CLI direkt), dem Mailtrap-Token/-Ordner und der Anzahl, merkt sie sich und führt die CLI aus — mint, verify, screen exits, settings, help, Connect to 9Router.

## ✅ Verifiziert funktionierend — jeder Schlüssel wird getestet

| Prüfung | Ergebnis |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| Turnstile-Widget für diese Challenge | rendert, löst in ~25 s und gibt ein **837-Zeichen-Token** zurück (gemessen am 2026-10-21 über einen Pool-Exit) |
| `POST /auth/signup` (Token + challengeId) | **200** — `teams[0].team.uuid` kommt zurück; ein Token mit falscher `action` wird abgelehnt (`TURNSTILE_ACTION_MISMATCH`) |
| E-Mail mit Anfangspasswort | `Password to log in to 1min.AI!` mit einem 6-stelligen Code, gelesen aus demselben Posteingang |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — beachte das verschachtelte Objekt, keinen bloßen String |
| `POST /openai/v1/chat/completions` pro Schlüssel, bevor er geschrieben wird | **200** — jeder Schlüssel in `keys.txt` wurde von `deepseek-flash` zugelassen |
| unabhängige Nachprüfung der gesamten Liste (Pool-Exits) | **10/10** Schlüssel — `GET /openai/v1/models` **200** + `deepseek-flash`-Chat **200** mit Nutzung |
| ein Schlüssel, der seine Prüfung nicht besteht | wird nie geschrieben — das Konto bleibt in `accounts.json` |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> Ein flatternder Exit ist kein Urteil: `--verify-only` geht pro Schlüssel bis zu sechs Exits aus deinem Pool durch, bevor es einen meldet. `--screen` sagt dir, welche Exits `api.1min.ai` überhaupt erreichen (ein schlüsselloser `401` ist ein Bestehen).

## 🧭 So funktioniert es

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| Schritt | Aufruf | Hinweise |
| --- | --- | --- |
| Postfach | Mailtrap `POST /inbound/folders/{id}/inboxes` | eine frische `…@inbound-mailtrap.io` pro Konto; `--email` verwendet einen vorhandenen Posteingang wieder |
| Challenge | `POST /auth/signup-challenge {email}` | die `challengeId` ist das `cData`, das das Token tragen muss |
| Turnstile | Widget `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | `--token-cmd`-Solver, ein erfasstes `--token <cid>:<tok>`-Paar oder `--manual` |
| Registrierung | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = dieser Exit ist ratenlimitiert |
| Passwort | die Registrierungs-E-Mail im selben Posteingang lesen | 6-stelliges Anfangspasswort |
| Login | `POST /auth/login {email,password}` | JWT; das Team trägt `credit` |
| Schlüssel | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | gibt `{apiKey:{key}}` zurück |
| Nachweis | `POST /openai/v1/chat/completions` | 200 mit Inhalt = der Schlüssel ist live |

## ⚙️ CLI-Optionen

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| Env | Standard | Bedeutung |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | Exit-Pool, eine Zeile pro Proxy — optional: ohne einen Pool verbindet sich die CLI direkt |
| `ONEMIN_MODEL` | `deepseek-flash` | Modell für die Live-Verifizierung |
| `ONEMIN_MAILTRAP_TOKEN` | — | dein Mailtrap-API-Token (Settings → API Tokens); die Posteingangs-Schiene |

| Flag | Bedeutung |
| --- | --- |
| `--mt-folder <n>` | Mailtrap-Ordner für die Posteingänge (`1min-bulk`) |
| `--token-cmd <cmd>` | Solver-Befehl; pro Konto erhält er `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` und gibt ein Token aus |
| `--token <cid:tok>` | ein erfasstes challengeId:token-Paar (einzelnes Konto) |
| `--manual` | jedes Token von Hand einfügen |
| `--tries N` / `--gap MS` | pro Konto versuchte Exits (`2`) / Pause zwischen Konten (`15000`) |

## 🛰️ Hinter einem Proxy

**Optional — bei Skalierung empfohlen (das Registrierungslimit gilt pro Exit-IP).** Das Tool funktioniert auch ohne Proxy.

- **Mit einem Pool:** übergib `--pool <file>` (oder setze `ONEMIN_PROXIES`), und jede Anfrage geht durch einen Exit aus dieser Liste — eine tote Leitung lässt diesen Versuch scheitern, und die CLI versucht es mit dem nächsten Exit erneut. Halte es nach Möglichkeit bei einem Exit pro Konto: 4-5 Registrierungen von einer IP, dann antwortet das Panel mit `429 … try again after 653 seconds`.
- **Ohne einen Pool:** die CLI gibt `running WITHOUT a proxy (direct)` aus und verbindet sich direkt. Registrierung, Schlüsselerzeugung, Verifizierung und das Chat-Gate bleiben unverändert — nur der Ort, von dem die Pakete ausgehen, ändert sich.
- Führe `--screen` gegen beide Modi aus: Es testet die Exits, die du hast (oder die direkte Route), gegen `api.1min.ai`, bevor ein echter Durchlauf startet.

## 📄 Dateien

| Pfad | Inhalt |
| --- | --- |
| `keys.txt` | ein live-verifizierter Schlüssel pro Zeile — von Git ignoriert |
| `accounts.json` | E-Mail / Mailtrap-Posteingangs-ID / teamId / Passwort / Credit / Exit / Gate-Status — von Git ignoriert |
| `proxies.txt` | deine Exits — von Git ignoriert |

## 🔌 Mit 9Router verbinden

[9Router](https://9router.com) ist ein selbst gehosteter, OpenAI-kompatibler Router:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Standardwerte: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Modelle werden als `1min/<model id>` bereitgestellt.

## 🔑 Was ein Schlüssel dir bringt

| | |
| --- | --- |
| 🏢 Anbieter | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 Was der Anbieter gibt | FREE-Team mit **250.000 Credits** beim ersten Login |
| 🔑 Was ein Schlüssel dir bringt | ein Schlüssel auf seinem eigenen Konto: die 53 IDs von `https://api.1min.ai/openai/v1`, chat-verifiziert |
| 🌐 API-Form | OpenAI-kompatibel: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 Deine Daten | nur `1min.ai` / `api.1min.ai` und das von dir konfigurierte Posteingangs-Backend werden kontaktiert |

## 🐞 Probleme

Wenn 1min.AI seine Registrierungs-Endpunkte, die Turnstile-Parameter (`action`/`cData`), die Credit-Vergabe oder die Wegwerf-Domain-Richtlinie ändert, stoppt das Tool dort und sagt es dir. **[Öffne ein Issue](../../issues)** mit dem Befehl und der exakten Ausgabe.

## 📄 Lizenz

MIT © 2026 — siehe [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>