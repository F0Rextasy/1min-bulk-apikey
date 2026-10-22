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

**Crea cuentas de 1min.AI en masa con claves API generadas automáticamente — inferencia compatible con OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Inicio rápido](#-quick-start) · [🎁 Nivel gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-53-of-them) · [🧪 Usar la API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Cómo funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opciones](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por qué existe esto

1min.AI le entrega a cada cuenta nueva un **equipo GRATUITO con 250.000 créditos** — suficiente para acuñar una clave API funcional y responder chat, que es lo que esta herramienta procesa en lotes. Toda la barrera es Cloudflare Turnstile más un buzón que el panel acepte: el correo de registro lleva la **contraseña inicial de 6 dígitos** de la cuenta, así que la ejecución no necesita paso de restablecimiento ni un segundo captcha. La API es compatible con OpenAI en `https://api.1min.ai/openai/v1` con 53 ids de modelos.

## 🎁 Nivel gratuito — cuánto obtienes

| Qué | Valor |
| --- | --- |
| Plan | **FREE** — un equipo por cuenta (`subscription.plan = "FREE"`) |
| Crédito al registrarse | `credit: 0` |
| Crédito en el primer inicio de sesión | **250.000** — medido en cada cuenta que creó la herramienta |
| Cadencia de la concesión | los 250.000 aparecen en el primer inicio de sesión de cada cuenta; si se renuevan a diario o mensualmente está **sin medir a fecha de 2026-10-21** (el carril vigila una cuenta durante el segundo día) |
| Cuánto cuesta una llamada | una llamada de 51 tokens a `deepseek-flash` movió 250.000 → **249.924** (76 créditos), así que una cuenta responde ~3.000 llamadas de ese tipo |
| Claves por cuenta | cualquier número (`POST /api/teams/{teamId}/keys`) — cada clave de una cuenta consume el mismo saldo del equipo, por eso esta herramienta acuña **una cuenta por clave** |
| Barrera de registro | Cloudflare Turnstile `action=signup` con `cData=<challengeId>` **y** una bandeja de entrada legible |
| Dominios desechables | rechazados — `mail.tm` responde `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`; las direcciones entrantes de Mailtrap pasan |
| Límite de registro | **por IP de salida**: 4-5 registros, luego `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — rota las salidas al acuñar en masa |
| Credencial de inicio de sesión | el propio registro envía por correo `🔮 Password to log in to 1min.AI!` con una contraseña de 6 dígitos |

> 💡 El nivel gratuito lo define 1min.AI y puede cambiar. Consulta las cifras en vivo en [1min.ai](https://1min.ai) — y deja que la propia barrera de la herramienta decida:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — los 53

`GET https://api.1min.ai/openai/v1/models` devolvió **53 ids**. Verificados en vivo con una llamada de chat (todos 200, contenido real):

| ID del modelo | Verificado |
| --- | --- |
| `deepseek-flash` | **200** — el modelo de barrera predeterminado para cada clave que escribe esta herramienta |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | catálogo — mismo endpoint, misma clave |

> ⚠️ Se observó un **522** transitorio de Cloudflare dos veces en `/openai/v1/*` (08:35-08:37 el 2026-10-21) y se reintentó sin problemas un minuto después — trata un 522 como "inténtalo de nuevo", no como "bloqueado".

## 🧪 Cómo usar la API

URL base **`https://api.1min.ai/openai/v1`** — compatible con OpenAI.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Inicio rápido

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings

# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the
# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

El carril del buzón es **tu propia cuenta de Mailtrap** (el panel rechaza los dominios desechables habituales): configura `ONEMIN_MAILTRAP_TOKEN` (o pasa `--mailtrap-token`), y la CLI guarda sus bandejas de entrada en una sola carpeta (`--mt-folder`, por defecto `1min-bulk`) para que el límite de 300 bandejas por cuenta siga siendo predecible. Una clave llega a `keys.txt` **solo** después de que `/openai/v1/chat/completions` responda 200.

### 🖱️ El lanzador

El lanzador pide la lista de proxies (opcional — sin una, la CLI se ejecuta directa), el token/carpeta de Mailtrap y la cantidad, los recuerda, y ejecuta la CLI — acuñar, verificar, cribar salidas, ajustes, ayuda, Conectar a 9Router.

## ✅ Verificado y funcionando — cada clave se prueba

| Comprobación | Resultado |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| Widget de Turnstile para ese desafío | se renderiza, se resuelve en ~25 s y devuelve un **token de 837 caracteres** (medido el 2026-10-21 a través de una salida del pool) |
| `POST /auth/signup` (token + challengeId) | **200** — vuelve `teams[0].team.uuid`; un token con el `action` incorrecto se rechaza (`TURNSTILE_ACTION_MISMATCH`) |
| correo de contraseña inicial | `Password to log in to 1min.AI!` con un código de 6 dígitos, leído de la misma bandeja de entrada |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — nota el objeto anidado, no una cadena simple |
| `POST /openai/v1/chat/completions` por clave antes de escribirse | **200** — cada clave en `keys.txt` fue admitida por `deepseek-flash` |
| reverificación independiente de toda la lista (salidas del pool) | **10/10** claves — `GET /openai/v1/models` **200** + chat `deepseek-flash` **200** con uso |
| una clave que falla su comprobación | nunca se escribe — la cuenta permanece en `accounts.json` |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> Una salida inestable no es un veredicto: `--verify-only` recorre hasta seis salidas de tu pool por clave antes de reportar una. `--screen` te dice qué salidas llegan a `api.1min.ai` (un `401` sin clave es un aprobado).

## 🧭 Cómo funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| Paso | Llamada | Notas |
| --- | --- | --- |
| buzón | Mailtrap `POST /inbound/folders/{id}/inboxes` | una dirección nueva `…@inbound-mailtrap.io` por cuenta; `--email` reutiliza una bandeja existente |
| desafío | `POST /auth/signup-challenge {email}` | el `challengeId` es el `cData` que debe llevar el token |
| turnstile | widget `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | solucionador `--token-cmd`, un par `--token <cid>:<tok>` capturado, o `--manual` |
| registro | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = esta salida está limitada por tasa |
| contraseña | leer el correo de registro en la misma bandeja | contraseña inicial de 6 dígitos |
| inicio de sesión | `POST /auth/login {email,password}` | JWT; el equipo lleva `credit` |
| clave | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | devuelve `{apiKey:{key}}` |
| prueba | `POST /openai/v1/chat/completions` | 200 con contenido = la clave está viva |

## ⚙️ Opciones de la CLI

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| Variable de entorno | Predeterminado | Significado |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | pool de salidas, una línea por proxy — opcional: sin un pool la CLI se conecta directamente |
| `ONEMIN_MODEL` | `deepseek-flash` | modelo para la verificación en vivo |
| `ONEMIN_MAILTRAP_TOKEN` | — | tu token de API de Mailtrap (Settings → API Tokens); el carril del buzón |

| Opción | Significado |
| --- | --- |
| `--mt-folder <n>` | carpeta de Mailtrap para las bandejas de entrada (`1min-bulk`) |
| `--token-cmd <cmd>` | comando solucionador; por cuenta recibe `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` e imprime un token |
| `--token <cid:tok>` | un par challengeId:token capturado (cuenta única) |
| `--manual` | pegar cada token a mano |
| `--tries N` / `--gap MS` | salidas probadas por cuenta (`2`) / pausa entre cuentas (`15000`) |

## 🛰️ Detrás de un proxy

**Opcional — recomendado a escala (el límite de registro es por IP de salida).** La herramienta también funciona sin proxy.

- **Con un pool:** pasa `--pool <file>` (o configura `ONEMIN_PROXIES`) y cada solicitud pasa por una salida de esa lista — una línea muerta hace fallar ese intento y la CLI reintenta con la siguiente salida. Mantén una salida por cuenta cuando puedas: 4-5 registros desde una IP, luego el panel responde `429 … try again after 653 seconds`.
- **Sin un pool:** la CLI imprime `running WITHOUT a proxy (direct)` y se conecta directamente. El registro, la acuñación de claves, la verificación y la barrera de chat no cambian — solo desde dónde salen los paquetes.
- Ejecuta `--screen` contra cualquiera de los dos modos: prueba las salidas que tengas (o la ruta directa) contra `api.1min.ai` antes de una ejecución real.

## 📄 Archivos

| Ruta | Contenido |
| --- | --- |
| `keys.txt` | una clave verificada en vivo por línea — ignorada por git |
| `accounts.json` | email / id de bandeja de Mailtrap / teamId / contraseña / crédito / salida / estado de la barrera — ignorado por git |
| `proxies.txt` | tus salidas — ignorado por git |

## 🔌 Conectar a 9Router

[9Router](https://9router.com) es un router autoalojado y compatible con OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Predeterminados: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Los modelos se sirven como `1min/<model id>`.

## 🔑 Qué te da una clave

| | |
| --- | --- |
| 🏢 Proveedor | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 Qué da el proveedor | equipo FREE con **250.000 créditos** en el primer inicio de sesión |
| 🔑 Qué te da una clave | una clave en su propia cuenta: los 53 ids de `https://api.1min.ai/openai/v1`, verificados por chat |
| 🌐 Forma de la API | compatible con OpenAI: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 Tus datos | solo se contacta con `1min.ai` / `api.1min.ai` y el backend de buzón que configures |

## 🐞 Problemas

Si 1min.AI cambia sus endpoints de registro, los parámetros de Turnstile (`action`/`cData`), la concesión de créditos o la política de dominios desechables, la herramienta se detiene ahí y lo indica. **[Abre un issue](../../issues)** con el comando y la salida exacta.

## 📄 Licencia

MIT © 2026 — consulta [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>