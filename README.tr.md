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

**Otomatik oluşturulan API anahtarlarıyla toplu 1min.AI hesabı açın — OpenAI uyumlu çıkarım + 9Router bağlayıcısı.**

[![Node](https://img.shields.io/badge/Node-%E2%89%A518-3DA639?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=for-the-badge)](#)
[![License](https://img.shields.io/badge/license-MIT-6ea8fe?style=for-the-badge)](LICENSE)
[![Models](https://img.shields.io/badge/models-53%20served-412991?style=for-the-badge)](https://1min.ai/pricing)
[![9Router](https://img.shields.io/badge/9Router-connector-8B5CF6?style=for-the-badge)](#-connect-to-9router)
[![X](https://img.shields.io/badge/X-%40bigbullapp-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/bigbullapp)

[🛠 Hızlı başlangıç](#-quick-start) · [🎁 Ücretsiz katman](#-free-tier--how-much-you-get) · [🤖 Modeller](#-models--all-53-of-them) · [🧪 API'yi kullanma](#-how-to-use-the-api) · [✅ Doğrulandı](#-verified-working--every-key-is-tested) · [🧭 Nasıl çalışır](#-how-it-works) · [🔌 9Router](#-connect-to-9router) · [⚙️ Seçenekler](#️-cli-options) · [🛰️ Proxy'ler](#️-behind-a-proxy) · [🐞 Sorunlar](#-issues)

</div>

<div align="center">

**English** · [Türkçe](README.tr.md) · [中文](README.cn.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

</div>

---

## ✨ Bu neden var

1min.AI her yeni hesaba **250.000 kredilik ÜCRETSİZ bir ekip** verir — bu, çalışan bir API anahtarı üretmeye ve sohbeti yanıtlamaya yeter; bu aracın toplu olarak yaptığı da budur. Tüm kapı, Cloudflare Turnstile ve panelin kabul ettiği bir posta kutusundan ibarettir: kayıt e-postası hesabın **6 haneli başlangıç parolasını** taşır, böylece çalıştırma sıfırlama adımına ve ikinci bir captcha'ya ihtiyaç duymaz. API, `https://api.1min.ai/openai/v1` adresinde 53 model kimliğiyle OpenAI uyumludur.

## 🎁 Ücretsiz katman — ne kadar alıyorsunuz

| Ne | Değer |
| --- | --- |
| Plan | **FREE** — hesap başına bir ekip (`subscription.plan = "FREE"`) |
| Kayıt anındaki kredi | `credit: 0` |
| İlk girişteki kredi | **250.000** — aracın oluşturduğu her hesapta ölçüldü |
| Verilme sıklığı | 250.000 her hesabın ilk girişinde görünür; günlük mü yoksa aylık mı yenilendiği **2026-10-21 itibarıyla ölçülmedi** (hat ikinci gün için bir hesabı izliyor) |
| Bir çağrının maliyeti | 51 token'lık bir `deepseek-flash` çağrısı 250.000 → **249.924** yaptı (76 kredi), yani bir hesap bu tür ~3.000 çağrıyı yanıtlar |
| Hesap başına anahtar | herhangi bir sayı (`POST /api/teams/{teamId}/keys`) — bir hesaptaki her anahtar aynı ekip bakiyesinden çeker, bu yüzden bu araç **anahtar başına bir hesap** üretir |
| Kayıt kapısı | Cloudflare Turnstile `action=signup` ve `cData=<challengeId>` **ile** okunabilir bir gelen kutusu |
| Tek kullanımlık alan adları | reddedilir — `mail.tm` `400 UNKNOWN_ERROR "Disposable email can not be used to sign up"` yanıtını verir; Mailtrap gelen adresleri geçer |
| Kayıt hız sınırı | **çıkış IP'si başına**: 4-5 kayıt, ardından `429 {"message":"We couldn't complete your signup right now. Please try again after 653 seconds"}` — toplu üretimde çıkışları döndürün |
| Giriş kimlik bilgisi | kayıt işleminin kendisi 6 haneli parolayla `🔮 Password to log in to 1min.AI!` e-postasını gönderir |

> 💡 Ücretsiz katman 1min.AI tarafından belirlenir ve değişebilir. Güncel sayıları [1min.ai](https://1min.ai) adresinden kontrol edin — ve kararı aracın kendi kapısına bırakın:

```bash
node src/cli.js --verify-only     # every key in keys.txt is re-tested with a real chat call
```

## 🤖 Modeller — 53'ünün tamamı

`GET https://api.1min.ai/openai/v1/models` **53 kimlik** döndürdü. Bir sohbet çağrısıyla canlı olarak doğrulandı (hepsi 200, gerçek içerik):

| Model Kimliği | Doğrulandı |
| --- | --- |
| `deepseek-flash` | **200** — bu aracın yazdığı her anahtar için varsayılan kapı modeli |
| `gpt-4.1-nano`, `gpt-4.1-mini`, `qwen-flash` | **200** |
| `gpt-5*`, `gpt-6*`, `o3`, `o3-mini`, `qwen3.6/3.7-*`, `mistral-*`, `magistral-*`, `ministral-14b-latest`, `open-mistral-nemo`, `glm-5*`, `moonshotai/kimi-k2.6`, `moonshotai/kimi-k2.7-code`, `meta/muse-spark-1.1/1.2/1.3` | katalog — aynı uç nokta, aynı anahtar |

> ⚠️ `/openai/v1/*` üzerinde geçici bir Cloudflare **522** iki kez görüldü (2026-10-21 tarihinde 08:35-08:37) ve bir dakika sonra sorunsuz yeniden denendi — 522'yi "engellendi" değil, "tekrar dene" olarak değerlendirin.

## 🧪 API nasıl kullanılır

Temel URL **`https://api.1min.ai/openai/v1`** — OpenAI uyumlu.

```python
from openai import OpenAI
c = OpenAI(base_url="https://api.1min.ai/openai/v1", api_key="<64-char hex>")
print(c.chat.completions.create(model="deepseek-flash",
      messages=[{"role": "user", "content": "hi"}]).choices[0].message.content)
```

## 🛠 Hızlı başlangıç

```bash
cd 1min-bulk-apikey
printf 'socks5://host:port\n' > proxies.txt   # optional — without it the tool runs direct
node src/launcher.js        # interactive: mint / verify / screen / settings
# or directly — the widget is Turnstile (action=signup, cData=challengeId), so the
# CLI needs one token per account: point it at your solver, or paste by hand
node src/cli.js --count 3 --token-cmd "your-solver"
node src/cli.js --count 1 --manual
```

Posta kutusu hattı **kendi Mailtrap hesabınızdır** (panel olağan tek kullanımlık alan adlarını reddeder): `ONEMIN_MAILTRAP_TOKEN` ayarlayın (veya `--mailtrap-token` geçin) ve CLI gelen kutularını tek bir klasörde tutar (`--mt-folder`, varsayılan `1min-bulk`), böylece hesap genelindeki 300 gelen kutusu sınırı öngörülebilir kalır. Bir anahtar `keys.txt` dosyasına **yalnızca** `/openai/v1/chat/completions` 200 yanıtını verdikten sonra ulaşır.

### 🖱️ Başlatıcı

Başlatıcı proxy listesini (isteğe bağlı — olmadan CLI doğrudan çalışır), Mailtrap token'ını/klasörünü ve sayıyı sorar, bunları hatırlar ve CLI'yi çalıştırır — üret, doğrula, çıkışları tara, ayarlar, yardım, 9Router'a Bağlan.

## ✅ Çalıştığı doğrulandı — her anahtar test edilir

| Kontrol | Sonuç |
| --- | --- |
| `POST /auth/signup-challenge {email}` | **200** `{"action":"signup","challengeId":"…"}` |
| Bu challenge için Turnstile widget'ı | oluşturulur, ~25 sn'de çözülür ve **837 karakterlik bir token** döndürür (2026-10-21 tarihinde bir havuz çıkışı üzerinden ölçüldü) |
| `POST /auth/signup` (token + challengeId) | **200** — `teams[0].team.uuid` geri döner; yanlış `action` içeren bir token reddedilir (`TURNSTILE_ACTION_MISMATCH`) |
| başlangıç parolası e-postası | 6 haneli kodla `Password to log in to 1min.AI!`, aynı gelen kutusundan okunur |
| `POST /auth/login` | **200** — JWT, `plan: FREE`, `credit: 250000` |
| `POST /api/teams/{teamId}/keys` | **200** `{"apiKey":{"key":"…64 hex…"}}` — dikkat: çıplak bir dize değil, iç içe bir nesne |
| Yazılmadan önce her anahtar için `POST /openai/v1/chat/completions` | **200** — `keys.txt` içindeki her anahtar `deepseek-flash` tarafından kabul edildi |
| Tüm listenin bağımsız yeniden kontrolü (havuz çıkışları) | **10/10** anahtar — `GET /openai/v1/models` **200** + kullanımlı `deepseek-flash` sohbeti **200** |
| Kontrolünde başarısız olan bir anahtar | asla yazılmaz — hesap `accounts.json` içinde kalır |

```bash
node src/cli.js --verify-only     # every key in keys.txt re-tested with a live chat call
```

> Kararsız bir çıkış bir hüküm değildir: `--verify-only`, bir anahtarı bildirmeden önce havuzunuzdan altı çıkışa kadar dener. `--screen` hangi çıkışların `api.1min.ai` adresine hiç ulaştığını söyler (anahtarsız bir `401` geçer demektir).

## 🧭 Nasıl çalışır

```
inbox (one address per account)                                  a fresh address per account
   │
   ├─▶ sign-up: 1min.AI page → e-mail address → code / link from the inbox
   ├─▶ session: the account's cookies or access token in hand
   ├─▶ key mint: the account's key endpoint → plaintext key returned once (written to disk immediately)
   └─▶ live proof: POST https://api.1min.ai/openai/v1/chat/completions → real content = the key is live
```

| Adım | Çağrı | Notlar |
| --- | --- | --- |
| posta kutusu | Mailtrap `POST /inbound/folders/{id}/inboxes` | hesap başına yeni bir `…@inbound-mailtrap.io`; `--email` mevcut bir gelen kutusunu yeniden kullanır |
| challenge | `POST /auth/signup-challenge {email}` | `challengeId`, token'ın taşıması gereken `cData`'dır |
| turnstile | widget `sitekey 0x4AAAAAADlG3pCk8mNqMU5i`, `action=signup` | `--token-cmd` çözücü, yakalanmış bir `--token <cid>:<tok>` çifti veya `--manual` |
| kayıt | `POST /auth/signup {email,userName,teamName,cfTurnstileToken,cfTurnstileChallengeId}` | 200 → `teams[0].team.uuid`; 429 = bu çıkış hız sınırına takıldı |
| parola | aynı gelen kutusundaki kayıt e-postasını okuyun | 6 haneli başlangıç parolası |
| giriş | `POST /auth/login {email,password}` | JWT; ekip `credit` taşır |
| anahtar | `POST /api/teams/{teamId}/keys` (`X-Auth-Token: Bearer <jwt>`) | `{apiKey:{key}}` döndürür |
| kanıt | `POST /openai/v1/chat/completions` | içerikle birlikte 200 = anahtar canlı |

## ⚙️ CLI seçenekleri

```bash
node src/cli.js --count N        # mint N keys (stop on the first failed chat gate)
node src/cli.js --count 1 --manual
node src/cli.js --verify-only    # re-verify every key in keys.txt
node src/cli.js --screen         # exit pool self-test against api.1min.ai
node src/cli.js --connect-9router
node src/cli.js --help
```

| Ortam değişkeni | Varsayılan | Anlamı |
| --- | --- | --- |
| `ONEMIN_PROXIES` | `proxies.txt` | çıkış havuzu, satır başına bir proxy — isteğe bağlı: havuz olmadan CLI doğrudan bağlanır |
| `ONEMIN_MODEL` | `deepseek-flash` | canlı doğrulama için model |
| `ONEMIN_MAILTRAP_TOKEN` | — | Mailtrap API token'ınız (Settings → API Tokens); gelen kutusu hattı |

| Bayrak | Anlamı |
| --- | --- |
| `--mt-folder <n>` | Gelen kutuları için Mailtrap klasörü (`1min-bulk`) |
| `--token-cmd <cmd>` | çözücü komutu; hesap başına `ONEMIN_CDATA`/`ONEMIN_ACTION`/`ONEMIN_SITEKEY`/`ONEMIN_URL` alır ve bir token yazdırır |
| `--token <cid:tok>` | yakalanmış bir challengeId:token çifti (tek hesap) |
| `--manual` | her token'ı elle yapıştırın |
| `--tries N` / `--gap MS` | hesap başına denenen çıkış sayısı (`2`) / hesaplar arası bekleme (`15000`) |

## 🛰️ Proxy arkasında

**İsteğe bağlı — ölçekte önerilir (kayıt sınırı çıkış IP'si başınadır).** Araç proxy olmadan da çalışır.

- **Havuzla:** `--pool <file>` geçin (veya `ONEMIN_PROXIES` ayarlayın) ve her istek o listeden bir çıkış üzerinden gider — ölü bir hat o denemeyi başarısız kılar ve CLI bir sonraki çıkışla yeniden dener. Mümkün olduğunca hesap başına bir çıkış tutun: bir IP'den 4-5 kayıt, ardından panel `429 … try again after 653 seconds` yanıtını verir.
- **Havuz olmadan:** CLI `running WITHOUT a proxy (direct)` yazdırır ve doğrudan bağlanır. Kayıt, anahtar üretimi, doğrulama ve sohbet kapısı değişmez — yalnızca paketlerin çıktığı yer değişir.
- Her iki modda da `--screen` çalıştırın: gerçek bir çalıştırmadan önce sahip olduğunuz çıkışları (veya doğrudan rotayı) `api.1min.ai` adresine karşı test eder.

## 📄 Dosyalar

| Yol | İçerik |
| --- | --- |
| `keys.txt` | satır başına bir canlı doğrulanmış anahtar — git tarafından yok sayılır |
| `accounts.json` | e-posta / Mailtrap gelen kutusu kimliği / teamId / parola / kredi / çıkış / kapı durumu — git tarafından yok sayılır |
| `proxies.txt` | çıkışlarınız — git tarafından yok sayılır |

## 🔌 9Router'a bağlan

[9Router](https://9router.com) kendi sunucunuzda barındırılan, OpenAI uyumlu bir yönlendiricidir:

```bash
node src/connect-9router.js --base http://localhost:20128 --password 123456
```

Varsayılanlar: `--prefix 1min`, `--base-url https://api.1min.ai/openai/v1`, `--model deepseek-flash`. Modeller `1min/<model id>` olarak sunulur.

## 🔑 Bir anahtar size ne kazandırır

| | |
| --- | --- |
| 🏢 Sağlayıcı | **1min.AI** — [1min.ai](https://1min.ai) |
| 🎁 Sağlayıcının verdikleri | ilk girişte **250.000 kredilik** FREE ekip |
| 🔑 Bir anahtar size ne kazandırır | kendi hesabında bir anahtar: `https://api.1min.ai/openai/v1` adresinin 53 kimliği, sohbetle doğrulanmış |
| 🌐 API biçimi | OpenAI uyumlu: `POST https://api.1min.ai/openai/v1/chat/completions` |
| 🔒 Verileriniz | yalnızca `1min.ai` / `api.1min.ai` ve yapılandırdığınız gelen kutusu arka ucuyla iletişim kurulur |

## 🐞 Sorunlar

1min.AI kayıt uç noktalarını, Turnstile parametrelerini (`action`/`cData`), kredi tahsisini veya tek kullanımlık alan adı politikasını değiştirirse araç orada durur ve bunu bildirir. Komutla ve tam çıktıyla birlikte **[bir sorun açın](../../issues)**.

## 📄 Lisans

MIT © 2026 — bkz. [LICENSE](LICENSE).

<div align="center">

**[MIT](LICENSE)** © 2026 1min-bulk-apikey katkıda bulunanlar

</div>