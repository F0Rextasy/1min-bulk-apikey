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

**Créez en masse des comptes 1min.AI avec des clés API générées automatiquement — inférence compatible OpenAI + connecteur 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![OmniRoute](https://img.shields.io/badge/OmniRoute-connector-8B5CF6?style=for-the-badge)](#-connect-to-omniroute)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Démarrage rapide](#-quick-start) · [🎁 Offre gratuite](#-free-tier--how-much-you-get) · [🤖 Modèles](#-models--all-53-of-them) · [🧪 Utiliser l'API](#-how-to-use-the-api) · [✅ Vérifié](#-verified-working--every-key-is-tested) · [🧭 Comment ça marche](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Options](#️-cli-options) · [🛰️ Proxys](#️-behind-a-proxy) · [🐞 Problèmes](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Pourquoi cet outil existe

1min.AI offre à chaque nouveau compte une **équipe GRATUITE avec 250 000 crédits** — de quoi générer une clé API fonctionnelle et répondre à un chat, ce que cet outil traite par lots. Toute la barrière se résume à Cloudflare Turnstile plus une boîte mail que le panneau accepte : l'e-mail d'inscription contient le **mot de passe initial à 6 chiffres** du compte, donc l'exécution ne nécessite aucune étape de réinitialisation ni second captcha. L'API est compatible OpenAI à l'adresse `https://api.1min.ai/openai/v1` avec 53 identifiants de modèles.

## 🎁 Offre gratuite — ce que vous obtenez

| Élément | Valeur |
| --- | --- |
| Formule | **FREE** — une équipe par compte (`subscription.plan = "FREE"`) |
| Crédit à l'inscription | `credit: 0` |
| Crédit à la première connexion | **250 000** — mesuré sur chaque compte créé par l'outil |
| Fréquence d'attribution | les 250 000 apparaissent à la première connexion de chaque compte ; leur renouvellement quotidien ou mensuel est **non mesuré au 2026-10-21** (la voie surveille un compte pour le deuxième jour) |
| Coût d'un appel | un appel `deepseek-flash` de 51 tokens a fait passer 250 000 → **249 924** (76 crédits), donc un compte répond à environ 3 000 appels de ce type |
| Clés par compte | un nombre quelconque (`POST /api/teams/{teamId}/keys`) — chaque clé d'un compte puise dans le même solde d'équipe, c'est pourquoi cet outil génère **un compte par clé** |
| Barrière d'inscription | Cloudflare Turnstile `action=signup` avec `cData=<challengeId>` **et** une boîte mail lisible |
| Domaines jetables | refusés — `mail.tm` répond `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"` ; les adresses entrantes Mailtrap passent |
| Limite de débit d'inscription | **par IP de sortie** : 4-5 inscriptions, puis `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — faites tourner les sorties pour générer en masse |
| Identifiant de connexion | l'inscription elle-même envoie `🔮 Password to log in to 1min.AI!` avec un mot de passe à 6 chiffres |

> 💡 L'offre gratuite est définie par 1min.AI et peut changer. Vérifiez les chiffres en direct sur [1min.ai](https://1min.ai) — et laissez la barrière de l'outil décider :

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modèles — les 53

`GET https://api.1min.ai/openai/v1/models` a renvoyé **53 identifiants**. Vérifiés en direct avec un appel de chat (tous 200, contenu réel) :

| Identifiant du modèle | Vérifié |
| --- | --- |
| `deepseek-flash` | **200** — le modèle de barrière par défaut pour chaque clé écrite par cet outil |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | catalogue — même endpoint, même clé |

> ⚠️ Un **522** Cloudflare transitoire a été observé deux fois sur `/openai/v1/*` (08:35-08:37 le 2026-10-21) et a réussi après nouvelle tentative une minute plus tard — considérez un 522 comme « réessayez », pas comme « bloqué ».

## 🧪 Comment utiliser l'API

URL de base **`https://api.1min.ai/openai/v1`** — compatible OpenAI.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Démarrage rapide

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings

# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the
# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

Le rail de boîte mail est **votre propre compte Mailtrap** (le panneau refuse les domaines jetables habituels) : définissez `ONEMIN_MAILTRAP_TOKEN` (ou passez `--mailtrap-token`), et le CLI conserve ses boîtes dans un seul dossier (`--mt-folder`, par défaut `1min-bulk`) afin que la limite de 300 boîtes par compte reste prévisible. Une clé n'atteint `keys.txt` **qu'après** que `/openai/v1/chat/completions` ait répondu 200.

### 🖱️ Le lanceur

Le lanceur demande la liste de proxys (facultative — sans elle, le CLI se connecte directement), le token/dossier Mailtrap et le nombre, les mémorise, puis exécute le CLI — générer, vérifier, tester les sorties, paramètres, aide, Connecter à 9Router.

## ✅ Vérifié fonctionnel — chaque clé est testée

| Vérification | Résultat |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| Widget Turnstile pour ce challenge | s'affiche, se résout en ~25 s et renvoie un **token de 837 caractères** (mesuré le 2026-10-21 via une sortie du pool) |
| `POST /auth/signup` (token + challengeId) | **200** — `teams[0].team.uuid` est renvoyé ; un token avec un mauvais `action` est refusé (`TURNSTILE_ACTION_MISMATCH`) |
| e-mail du mot de passe initial | `Password to log in to 1min.AI!` avec un code à 6 chiffres, lu depuis la même boîte |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — notez l'objet imbriqué, pas une chaîne nue |
| `POST /openai/v1/chat/completions` par clé avant son écriture | **200** — chaque clé de `keys.txt` a été admise par `deepseek-flash` |
| re-vérification indépendante de toute la liste (sorties du pool) | **10/10** clés — `GET /openai/v1/models` **200** + chat `deepseek-flash` **200** avec usage |
| une clé qui échoue à sa vérification | jamais écrite — le compte reste dans `accounts.json` |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> Une sortie instable n'est pas un verdict : `--verify-only` parcourt jusqu'à six sorties de votre pool par clé avant d'en signaler une. `--screen` vous indique quelles sorties atteignent `api.1min.ai` tout court (un `401` sans clé est un succès).

## 🧭 Comment ça marche

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| Étape | Appel | Remarques |
| --- | --- | --- |
| boîte mail | Mailtrap `POST /inbound/folders/{id}/inboxes` | une nouvelle adresse `…@inbound-mailtrap.io` par compte ; `--email` réutilise une boîte existante |
| challenge | `POST /auth/signup-challenge {email}` | le `challengeId` est le `cData` que le token doit porter |
| turnstile | widget `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | solveur `--token-cmd`, une paire `--token <cid>:<tok>` capturée, ou `--manual` |
| inscription | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid` ; 429 = cette sortie est limitée en débit |
| mot de passe | lire l'e-mail d'inscription dans la même boîte | mot de passe initial à 6 chiffres |
| connexion | `POST /auth/login {email,password}` | JWT ; l'équipe porte `credit` |
| clé | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | renvoie `{apiKey:{key}}` |
| preuve | `POST /openai/v1/chat/completions` | 200 avec contenu = la clé est active |

## ⚙️ Options du CLI

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| Env | Défaut | Signification |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | pool de sorties, une ligne par proxy — facultatif : sans pool, le CLI se connecte directement |
| `ONEMIN_MODEL` | `deepseek-flash` | modèle pour la vérification en direct |
| `ONEMIN_MAILTRAP_TOKEN` | — | votre token API Mailtrap (Settings → API Tokens) ; le rail de boîte mail |

| Option | Signification |
| --- | --- |
| `--mt-folder <n>` | dossier Mailtrap pour les boîtes (`1min-bulk`) |
| `--token-cmd <cmd>` | commande du solveur ; par compte elle reçoit `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` et affiche un token |
| `--token <cid:tok>` | une paire challengeId:token capturée (compte unique) |
| `--manual` | coller chaque token à la main |
| `--tries N` / `--gap MS` | sorties essayées par compte (`2`) / pause entre les comptes (`15000`) |

## 🛰️ Derrière un proxy

**Facultatif — recommandé à grande échelle (la limite d'inscription est par IP de sortie).** L'outil fonctionne aussi sans proxy.

- **Avec un pool :** passez `--pool <file>` (ou définissez `ONEMIN_PROXIES`) et chaque requête passe par une sortie de cette liste — une ligne morte fait échouer cette tentative et le CLI réessaie avec la sortie suivante. Gardez si possible une sortie par compte : 4-5 inscriptions depuis une IP, puis le panneau répond `429 … try again after 653 seconds`.
- **Sans pool :** le CLI affiche `running WITHOUT a proxy (direct)` et se connecte directement. L'inscription, la génération de clés, la vérification et la barrière de chat sont inchangées — seul le point de départ des paquets change.
- Lancez `--screen` dans l'un ou l'autre mode : il teste les sorties dont vous disposez (ou la route directe) contre `api.1min.ai` avant une exécution réelle.

## 📄 Fichiers

| Chemin | Contenu |
| --- | --- |
| `keys.txt` | une clé vérifiée en direct par ligne — ignoré par git |
| `accounts.json` | email / id de boîte Mailtrap / teamId / mot de passe / crédit / sortie / statut de barrière — ignoré par git |
| `proxies.txt` | vos sorties — ignoré par git |

## 🔌 Connecter à 9Router

[9Router](https://9router.com) est un routeur auto-hébergé compatible OpenAI :

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Valeurs par défaut : `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Les modèles sont servis sous `1min/<model id>`.

## 🔌 Connecter à OmniRoute

[OmniRoute](https://omniroute.online) est un routeur auto-hébergé compatible OpenAI :

```bash
node src/connect-omniroute.js --base http://localhost:20128 --password 123456
```

Valeurs par défaut : `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Les modèles sont servis sous `1min/<model id>`.
## 🔑 Ce qu'une clé vous apporte

| | |
| --- | --- |
| 🏢 Fournisseur | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 Ce que le fournisseur offre | équipe FREE avec **250 000 crédits** à la première connexion |
| 🔑 Ce qu'une clé vous apporte | une clé sur son propre compte : les 53 identifiants de `https://api.1min.ai/openai/v1`, vérifiés par chat |
| 🌐 Forme de l'API | compatible OpenAI : `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 Vos données | seuls `1min.ai` / `api.1min.ai` et le backend de boîte mail que vous configurez sont contactés |

## 🐞 Problèmes

Si 1min.AI modifie ses endpoints d'inscription, les paramètres Turnstile (`action`/`cData`), l'attribution de crédits ou la politique sur les domaines jetables, l'outil s'arrête là et le signale. **[Ouvrez un ticket](../../issues)** avec la commande et la sortie exacte.

## 📄 Licence

MIT © 2026 — voir [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>