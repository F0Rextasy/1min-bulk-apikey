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

**Crie contas 1min.AI em massa com chaves de API geradas automaticamente — inferência compatível com OpenAI + conector 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Início rápido](#-quick-start) · [🎁 Nível gratuito](#-free-tier--how-much-you-get) · [🤖 Modelos](#-models--all-53-of-them) · [🧪 Use a API](#-how-to-use-the-api) · [✅ Verificado](#-verified-working--every-key-is-tested) · [🧭 Como funciona](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Opções](#️-cli-options) · [🛰️ Proxies](#️-behind-a-proxy) · [🐞 Problemas](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Por que isto existe

O 1min.AI dá a cada nova conta uma **equipe GRATUITA com 250.000 créditos** — o suficiente para gerar uma chave de API funcional e responder no chat, que é o que esta ferramenta faz em lote. Todo o portão é o Cloudflare Turnstile mais uma caixa de correio que o painel aceita: o e-mail de cadastro carrega a **senha inicial de 6 dígitos** da conta, então a execução não precisa de etapa de redefinição nem de um segundo captcha. A API é compatível com OpenAI em `https://api.1min.ai/openai/v1` com 53 ids de modelos.

## 🎁 Nível gratuito — quanto você recebe

| O quê | Valor |
| --- | --- |
| Plano | **FREE** — uma equipe por conta (`subscription.plan = "FREE"`) |
| Crédito no cadastro | `credit: 0` |
| Crédito no primeiro login | **250.000** — medido em cada conta que a ferramenta criou |
| Cadência da concessão | os 250.000 aparecem no primeiro login de cada conta; se renovam diariamente ou mensalmente está **não medido em 2026-10-21** (a via observa uma conta pelo segundo dia) |
| Quanto custa uma chamada | uma chamada `deepseek-flash` de 51 tokens moveu 250.000 → **249.924** (76 créditos), então uma conta responde ~3.000 chamadas desse tipo |
| Chaves por conta | qualquer número (`POST /api/teams/{teamId}/keys`) — toda chave de uma conta consome o mesmo saldo da equipe, e é por isso que esta ferramenta gera **uma conta por chave** |
| Portão de cadastro | Cloudflare Turnstile `action=signup` com `cData=<challengeId>` **e** uma caixa de entrada legível |
| Domínios descartáveis | recusados — `mail.tm` responde `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`; endereços de entrada do Mailtrap passam |
| Limite de cadastro | **por IP de saída**: 4-5 cadastros, depois `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — rotacione as saídas ao gerar em massa |
| Credencial de login | o próprio cadastro envia `🔮 Password to log in to 1min.AI!` com uma senha de 6 dígitos |

> 💡 O nível gratuito é definido pelo 1min.AI e pode mudar. Confira os números atuais em [1min.ai](https://1min.ai) — e deixe o próprio portão da ferramenta decidir:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modelos — todos os 53

`GET https://api.1min.ai/openai/v1/models` retornou **53 ids**. Verificados ao vivo com uma chamada de chat (todos 200, conteúdo real):

| ID do modelo | Verificado |
| --- | --- |
| `deepseek-flash` | **200** — o modelo padrão do portão para cada chave que esta ferramenta grava |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | catálogo — mesmo endpoint, mesma chave |

> ⚠️ Um **522** transitório do Cloudflare foi visto duas vezes em `/openai/v1/*` (08:35-08:37 em 2026-10-21) e repetido sem problemas um minuto depois — trate um 522 como "tente novamente", não como "bloqueado".

## 🧪 Como usar a API

URL base **`https://api.1min.ai/openai/v1`** — compatível com OpenAI.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Início rápido

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings

# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the
# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

O trilho da caixa de correio é a **sua própria conta Mailtrap** (o painel recusa os domínios descartáveis usuais): defina `ONEMIN_MAILTRAP_TOKEN` (ou passe `--mailtrap-token`), e a CLI mantém suas caixas de entrada em uma única pasta (`--mt-folder`, padrão `1min-bulk`) para que o limite de 300 caixas de entrada por conta permaneça previsível. Uma chave chega a `keys.txt` **somente** depois que `/openai/v1/chat/completions` responde 200.

### 🖱️ O launcher

O launcher pede a lista de proxies (opcional — sem uma, a CLI roda direto), o token/pasta do Mailtrap e a contagem, memoriza-os e executa a CLI — gerar, verificar, testar saídas, configurações, ajuda, Conectar ao 9Router.

## ✅ Verificado e funcionando — toda chave é testada

| Verificação | Resultado |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| Widget Turnstile para esse desafio | renderiza, resolve em ~25 s e retorna um **token de 837 caracteres** (medido em 2026-10-21 através de uma saída do pool) |
| `POST /auth/signup` (token + challengeId) | **200** — `teams[0].team.uuid` retorna; um token com o `action` errado é recusado (`TURNSTILE_ACTION_MISMATCH`) |
| e-mail de senha inicial | `Password to log in to 1min.AI!` com um código de 6 dígitos, lido da mesma caixa de entrada |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — observe o objeto aninhado, não uma string simples |
| `POST /openai/v1/chat/completions` por chave antes de ser gravada | **200** — toda chave em `keys.txt` foi admitida por `deepseek-flash` |
| reverificação independente de toda a lista (saídas do pool) | **10/10** chaves — `GET /openai/v1/models` **200** + chat `deepseek-flash` **200** com uso |
| uma chave que falha na verificação | nunca gravada — a conta permanece em `accounts.json` |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> Uma saída instável não é um veredito: `--verify-only` percorre até seis saídas do seu pool por chave antes de reportar uma. `--screen` informa quais saídas alcançam `api.1min.ai` (um `401` sem chave é aprovação).

## 🧭 Como funciona

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| Etapa | Chamada | Notas |
| --- | --- | --- |
| caixa de correio | Mailtrap `POST /inbound/folders/{id}/inboxes` | um novo `…@inbound-mailtrap.io` por conta; `--email` reutiliza uma caixa de entrada existente |
| desafio | `POST /auth/signup-challenge {email}` | o `challengeId` é o `cData` que o token deve carregar |
| turnstile | widget `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | solucionador `--token-cmd`, um par `--token <cid>:<tok>` capturado, ou `--manual` |
| cadastro | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = esta saída está com limite de taxa |
| senha | leia o e-mail de cadastro na mesma caixa de entrada | senha inicial de 6 dígitos |
| login | `POST /auth/login {email,password}` | JWT; a equipe carrega `credit` |
| chave | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | retorna `{apiKey:{key}}` |
| prova | `POST /openai/v1/chat/completions` | 200 com conteúdo = a chave está ativa |

## ⚙️ Opções da CLI

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| Env | Padrão | Significado |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | pool de saídas, uma linha por proxy — opcional: sem um pool a CLI conecta diretamente |
| `ONEMIN_MODEL` | `deepseek-flash` | modelo para a verificação ao vivo |
| `ONEMIN_MAILTRAP_TOKEN` | — | seu token de API do Mailtrap (Settings → API Tokens); o trilho da caixa de entrada |

| Flag | Significado |
| --- | --- |
| `--mt-folder <n>` | pasta do Mailtrap para as caixas de entrada (`1min-bulk`) |
| `--token-cmd <cmd>` | comando solucionador; por conta ele recebe `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` e imprime um token |
| `--token <cid:tok>` | um par challengeId:token capturado (conta única) |
| `--manual` | cole cada token manualmente |
| `--tries N` / `--gap MS` | saídas tentadas por conta (`2`) / pausa entre contas (`15000`) |

## 🛰️ Atrás de um proxy

**Opcional — recomendado em escala (o limite de cadastro é por IP de saída).** A ferramenta funciona sem proxy também.

- **Com um pool:** passe `--pool <file>` (ou defina `ONEMIN_PROXIES`) e toda requisição passa por uma saída dessa lista — uma linha morta faz aquela tentativa falhar e a CLI tenta novamente com a próxima saída. Mantenha uma saída por conta quando possível: 4-5 cadastros de um IP, depois o painel responde `429 … try again after 653 seconds`.
- **Sem um pool:** a CLI imprime `running WITHOUT a proxy (direct)` e conecta diretamente. Cadastro, geração de chaves, verificação e o portão de chat permanecem inalterados — só muda de onde os pacotes saem.
- Execute `--screen` em qualquer um dos modos: ele testa as saídas que você tem (ou a rota direta) contra `api.1min.ai` antes de uma execução real.

## 📄 Arquivos

| Caminho | Conteúdo |
| --- | --- |
| `keys.txt` | uma chave verificada ao vivo por linha — ignorado pelo git |
| `accounts.json` | email / id da caixa de entrada Mailtrap / teamId / senha / crédito / saída / status do portão — ignorado pelo git |
| `proxies.txt` | suas saídas — ignorado pelo git |

## 🔌 Conectar ao 9Router

[9Router](https://9router.com) é um roteador auto-hospedado e compatível com OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Padrões: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Os modelos são servidos como `1min/<model id>`.

## 🔌 Conectar ao OmniRoute

[OmniRoute](https://omniroute.online) é um roteador auto-hospedado e compatível com OpenAI:

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Padrões: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Os modelos são servidos como `1min/<model id>`.
## 🔑 O que uma chave oferece

| | |
| --- | --- |
| 🏢 Provedor | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 O que o provedor oferece | equipe FREE com **250.000 créditos** no primeiro login |
| 🔑 O que uma chave oferece | uma chave em sua própria conta: os 53 ids de `https://api.1min.ai/openai/v1`, verificados por chat |
| 🌐 Formato da API | compatível com OpenAI: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 Seus dados | apenas `1min.ai` / `api.1min.ai` e o backend de caixa de entrada que você configurar são contatados |

## 🐞 Problemas

Se o 1min.AI mudar seus endpoints de cadastro, os parâmetros do Turnstile (`action`/`cData`), a concessão de créditos ou a política de domínios descartáveis, a ferramenta para ali e avisa. **[Abra uma issue](../../issues)** com o comando e a saída exata.

## 📄 Licença

MIT © 2026 — veja [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>