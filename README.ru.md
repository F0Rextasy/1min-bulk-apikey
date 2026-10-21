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

**Массовое создание аккаунтов 1min.AI с автоматически сгенерированными API-ключами — вывод, совместимый с OpenAI, + коннектор 9Router.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Быстрый старт](#-quick-start) · [🎁 Бесплатный тариф](#-free-tier--how-much-you-get) · [🤖 Модели](#-models--all-53-of-them) · [🧪 Использование API](#-how-to-use-the-api) · [✅ Проверено](#-verified-working--every-key-is-tested) · [🧭 Как это работает](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Опции](#️-cli-options) · [🛰️ Прокси](#️-behind-a-proxy) · [🐞 Проблемы](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Зачем это нужно

1min.AI выдаёт каждому новому аккаунту **БЕСПЛАТНУЮ команду с 250 000 кредитов** — этого достаточно, чтобы создать рабочий API-ключ и получить ответ в чате, что этот инструмент и делает массово. Вся защита — это Cloudflare Turnstile плюс почтовый ящик, который принимает панель: письмо о регистрации содержит **6-значный первоначальный пароль** аккаунта, поэтому запуску не нужен шаг сброса пароля и вторая капча. API совместим с OpenAI по адресу `https://api.1min.ai/openai/v1` и поддерживает 53 идентификатора моделей.

## 🎁 Бесплатный тариф — сколько вы получаете

| Что | Значение |
| --- | --- |
| Тариф | **FREE** — одна команда на аккаунт (`subscription.plan = "FREE"`) |
| Кредиты при регистрации | `credit: 0` |
| Кредиты при первом входе | **250 000** — измерено на каждом аккаунте, созданном инструментом |
| Периодичность начисления | 250 000 появляются при первом входе в каждый аккаунт; переносятся ли они ежедневно или ежемесячно — **не измерено по состоянию на 2026-10-21** (наблюдение ведётся за одним аккаунтом на второй день) |
| Стоимость вызова | вызов `deepseek-flash` на 51 токен изменил баланс с 250 000 → **249 924** (76 кредитов), значит одного аккаунта хватает примерно на 3 000 таких вызовов |
| Ключей на аккаунт | любое количество (`POST /api/teams/{teamId}/keys`) — каждый ключ аккаунта расходует баланс одной и той же команды, поэтому этот инструмент создаёт **один аккаунт на ключ** |
| Защита при регистрации | Cloudflare Turnstile `action=signup` с `cData=<challengeId>` **и** доступный для чтения почтовый ящик |
| Одноразовые домены | отклоняются — `mail.tm` отвечает `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"`; входящие адреса Mailtrap проходят |
| Лимит регистраций | **на выходной IP**: 4-5 регистраций, затем `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — при массовом создании меняйте выходные узлы |
| Учётные данные для входа | сама регистрация отправляет письмо `🔮 Password to log in to 1min.AI!` с 6-значным паролем |

> 💡 Бесплатный тариф устанавливается 1min.AI и может измениться. Проверяйте актуальные цифры на [1min.ai](https://1min.ai) — и пусть решение принимает собственная проверка инструмента:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Модели — все 53

`GET https://api.1min.ai/openai/v1/models` вернул **53 идентификатора**. Проверено вживую вызовом чата (все 200, реальный контент):

| ID модели | Проверено |
| --- | --- |
| `deepseek-flash` | **200** — модель по умолчанию для проверки каждого ключа, создаваемого этим инструментом |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | каталог — тот же эндпоинт, тот же ключ |

> ⚠️ Временная ошибка Cloudflare **522** наблюдалась дважды на `/openai/v1/*` (08:35-08:37 2026-10-21) и успешно повторилась через минуту — воспринимайте 522 как «попробуйте снова», а не «заблокировано».

## 🧪 Как использовать API

Базовый URL **`https://api.1min.ai/openai/v1`** — совместим с OpenAI.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Быстрый старт

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings
# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the
# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

Почтовый канал — это **ваш собственный аккаунт Mailtrap** (панель отклоняет обычные одноразовые домены): задайте `ONEMIN_MAILTRAP_TOKEN` (или передайте `--mailtrap-token`), и CLI хранит свои ящики в одной папке (`--mt-folder`, по умолчанию `1min-bulk`), чтобы общий лимит в 300 ящиков на аккаунт оставался предсказуемым. Ключ попадает в `keys.txt` **только** после того, как `/openai/v1/chat/completions` ответит 200.

### 🖱️ Лаунчер

Лаунчер запрашивает список прокси (необязательно — без него CLI работает напрямую), токен/папку Mailtrap и количество, запоминает их и запускает CLI — создание, проверка, тестирование выходных узлов, настройки, справка, подключение к 9Router.

## ✅ Проверено в работе — каждый ключ протестирован

| Проверка | Результат |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| Виджет Turnstile для этого challenge | отображается, решается за ~25 с и возвращает **токен из 837 символов** (измерено 2026-10-21 через выходной узел пула) |
| `POST /auth/signup` (token + challengeId) | **200** — возвращается `teams[0].team.uuid`; токен с неправильным `action` отклоняется (`TURNSTILE_ACTION_MISMATCH`) |
| письмо с первоначальным паролем | `Password to log in to 1min.AI!` с 6-значным кодом, прочитано из того же ящика |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — обратите внимание на вложенный объект, а не простую строку |
| `POST /openai/v1/chat/completions` для каждого ключа перед записью | **200** — каждый ключ в `keys.txt` был допущен `deepseek-flash` |
| независимая перепроверка всего списка (выходные узлы пула) | **10/10** ключей — `GET /openai/v1/models` **200** + чат `deepseek-flash` **200** с usage |
| ключ, не прошедший проверку | никогда не записывается — аккаунт остаётся в `accounts.json` |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> Нестабильный выходной узел — это не приговор: `--verify-only` перебирает до шести узлов из вашего пула на каждый ключ, прежде чем сообщить о результате. `--screen` показывает, какие узлы вообще достигают `api.1min.ai` (безключевой `401` — это успех).

## 🧭 Как это работает

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| Шаг | Вызов | Примечания |
| --- | --- | --- |
| почтовый ящик | Mailtrap `POST /inbound/folders/{id}/inboxes` | новый `…@inbound-mailtrap.io` на каждый аккаунт; `--email` переиспользует существующий ящик |
| challenge | `POST /auth/signup-challenge {email}` | `challengeId` — это `cData`, который должен нести токен |
| turnstile | виджет `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | решатель `--token-cmd`, захваченная пара `--token <cid>:<tok>` или `--manual` |
| регистрация | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = этот выходной узел ограничен по частоте |
| пароль | прочитать письмо о регистрации в том же ящике | 6-значный первоначальный пароль |
| вход | `POST /auth/login {email,password}` | JWT; команда несёт `credit` |
| ключ | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | возвращает `{apiKey:{key}}` |
| проверка | `POST /openai/v1/chat/completions` | 200 с контентом = ключ рабочий |

## ⚙️ Опции CLI

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| Переменная окружения | По умолчанию | Значение |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | пул выходных узлов, по одному на строку — необязательно: без пула CLI подключается напрямую |
| `ONEMIN_MODEL` | `deepseek-flash` | модель для живой проверки |
| `ONEMIN_MAILTRAP_TOKEN` | — | ваш API-токен Mailtrap (Settings → API Tokens); почтовый канал |

| Флаг | Значение |
| --- | --- |
| `--mt-folder <n>` | папка Mailtrap для ящиков (`1min-bulk`) |
| `--token-cmd <cmd>` | команда решателя; на каждый аккаунт она получает `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` и выводит один токен |
| `--token <cid:tok>` | захваченная пара challengeId:token (один аккаунт) |
| `--manual` | вставлять каждый токен вручную |
| `--tries N` / `--gap MS` | число перебираемых узлов на аккаунт (`2`) / пауза между аккаунтами (`15000`) |

## 🛰️ За прокси

**Необязательно — рекомендуется при масштабе (лимит регистраций на выходной IP).** Инструмент работает и без прокси.

- **С пулом:** передайте `--pool <file>` (или задайте `ONEMIN_PROXIES`), и каждый запрос пойдёт через выходной узел из этого списка — мёртвая линия проваливает попытку, и CLI повторяет с следующим узлом. По возможности используйте один узел на аккаунт: 4-5 регистраций с одного IP, затем панель отвечает `429 … try again after 653 seconds`.
- **Без пула:** CLI выводит `running WITHOUT a proxy (direct)` и подключается напрямую. Регистрация, создание ключей, проверка и чат-тест не меняются — меняется только то, откуда уходят пакеты.
- Запустите `--screen` в любом режиме: он тестирует имеющиеся у вас узлы (или прямое подключение) против `api.1min.ai` перед реальным запуском.

## 📄 Файлы

| Путь | Содержимое |
| --- | --- |
| `keys.txt` | один проверенный вживую ключ на строку — игнорируется git |
| `accounts.json` | email / id ящика Mailtrap / teamId / пароль / кредиты / выходной узел / статус проверки — игнорируется git |
| `proxies.txt` | ваши выходные узлы — игнорируется git |

## 🔌 Подключение к 9Router

[9Router](https://9router.com) — это самостоятельно размещаемый роутер, совместимый с OpenAI:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

По умолчанию: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Модели доступны как `1min/<model id>`.

## 🔑 Что даёт один ключ

| | |
| --- | --- |
| 🏢 Провайдер | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 Что даёт провайдер | БЕСПЛАТНАЯ команда с **250 000 кредитов** при первом входе |
| 🔑 Что даёт один ключ | один ключ на собственном аккаунте: 53 идентификатора `https://api.1min.ai/openai/v1`, проверенные чатом |
| 🌐 Формат API | Совместим с OpenAI: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 Ваши данные | Связь только с `1min.ai` / `api.1min.ai` и настроенным вами почтовым бэкендом |

## 🐞 Проблемы

Если 1min.AI изменит эндпоинты регистрации, параметры Turnstile (`action`/`cData`), начисление кредитов или политику одноразовых доменов, инструмент остановится и сообщит об этом. **[Откройте issue](../../issues)** с командой и точным выводом.

## 📄 Лицензия

MIT © 2026 — см. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey contributors

</div>