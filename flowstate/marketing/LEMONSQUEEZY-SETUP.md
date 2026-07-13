# Lemon Squeezy Setup — A sampai Z

Panduan klik-per-klik buat dua produk Flowstate Pro. Semua teks customer-facing
udah ditulis final (bahasa jualan, jujur, tanpa klaim palsu) — tinggal copy-paste.

**Prinsip harga:** floor $5 dijaga di kode (server-side), jadi harga di Lemon Squeezy
adalah harga langganan yang benar ($9.99 / $59.99). Tampilan aplikasi mencoret $99 sebagai
pembanding harga, lalu menampilkan $59.99 sebagai harga tahunan aktif.
Pembanding: Brain.fm $9.99/bln, Endel $14.99/bln, Freedom $8.99/bln — masing-masing
cuma satu fungsi. Flowstate = musik + timer + analytics.

---

## 0. Sebelum mulai

- [ ] Nyalakan **Test mode** (toggle kiri bawah) — bikin & test dulu di test mode,
      baru nanti recreate di live. Variant ID test ≠ live.
- [ ] Siapkan gambar produk: `marketing/lemonsqueezy-product-image.png` (1600×1200, sudah dibuat).

---

## 1. Produk #1 — Flowstate Pro (Monthly)

### General
| Field | Isi |
|---|---|
| **Name** | `Flowstate Pro — Monthly` |
| **Description** | lihat blok di bawah |

**Description** (SEO-friendly, ~155 karakter):
```
Unlock every premium ambient sound and visual scene in Flowstate, and fund new original focus music every month. Name your price, cancel anytime.
```

### Pricing
| Field | Isi |
|---|---|
| Type | **Subscription** (BUKAN "Pay what you want" — itu sekali-bayar) |
| Pricing model | **Standard pricing** |
| Price per unit | **$9.99** |
| Repeat payment every | **1 Month** |
| Usage is metered | OFF |
| Setup fee | OFF |
| **Free trial** | **OFF** (core app sudah gratis; trial-lalu-ketagih = undangan chargeback) |
| Tax category | **Software as a service (SaaS) — personal use** (pembeli = individu) |

### Media
- [ ] Upload `marketing/lemonsqueezy-product-image.png`

### Files & Links
- Kosongkan (akses diberikan lewat app via webhook, bukan file download).

### Variants
- Tidak perlu — satu produk satu interval. Yearly = produk terpisah (bagian 2).

### Settings
| Field | Isi |
|---|---|
| Generate license keys | OFF |
| Display on storefront | ON |

### Confirmation modal
| Field | Isi |
|---|---|
| **Title** | `Welcome to Flowstate Pro` |
| **Message** | lihat blok |
| **Button text** | `Start focusing` |
| **Button link** | `https://flow.virzyguns.com` |

**Message:**
```
You're in. Every premium ambient sound and visual scene is now unlocked, and you're directly funding new original focus music every month. One tab, zero excuses — go lock in.
```

### Email receipt
| Field | Isi |
|---|---|
| **Thank you note** | lihat blok |
| **Button text** | `Open Flowstate` |
| **Button link** | `https://flow.virzyguns.com` |

**Thank you note:**
```
Thank you for backing an independent producer. Your subscription pays for new original music, made for deep work and released every month. You'll hear it first.
```

- [ ] **Publish product**

---

## 2. Produk #2 — Flowstate Pro (Yearly)

Ulangi persis bagian 1, bedanya:

| Field | Isi |
|---|---|
| **Name** | `Flowstate Pro — Yearly` |
| **Description** | blok di bawah |
| Price per unit | **$59.99** |
| Repeat payment every | **1 Year** |

**Description:**
```
A full year of every premium ambient sound and visual scene in Flowstate. Save 50% compared with paying monthly. Cancel anytime.
```

Confirmation modal & email receipt: sama dengan Monthly.

- [ ] **Publish product**

---

## 3. Ambil credential → `.env.local` (dev) & env hosting (prod)

- [ ] **Settings → API** → buat API key
- [ ] **Settings → Stores** → catat store ID (angka)
- [ ] Buka masing-masing produk → catat **variant ID**-nya
      (Products → klik produk → variant ID ada di panel/URL)

```env
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_VARIANT_MONTHLY=...   # variant ID produk Monthly
LEMONSQUEEZY_VARIANT_YEARLY=...    # variant ID produk Yearly
LEMONSQUEEZY_WEBHOOK_SECRET=...    # dari langkah 4
NEXT_PUBLIC_APP_URL=https://flow.virzyguns.com
```

> Jangan pernah commit nilai-nilai ini. `.env.local` sudah di-gitignore.

---

## 4. Webhook

- [ ] **Settings → Webhooks → Add webhook**
- [ ] URL: `https://flow.virzyguns.com/api/webhooks/lemonsqueezy`
- [ ] Signing secret: generate → simpan ke `LEMONSQUEEZY_WEBHOOK_SECRET`
- [ ] Events: centang semua **`subscription_*`**
      (created, updated, cancelled, resumed, expired, paused, unpaused, payment_success, payment_failed)

Webhook kita fail-closed: tanpa secret yang benar, request ditolak.

---

## 5. Test (masih di Test mode)

- [ ] Login ke app → `/pricing` → pilih jumlah → Continue
- [ ] Checkout pakai kartu test: `4242 4242 4242 4242`, exp bebas masa depan, CVC bebas
- [ ] Cek: baris baru muncul di `flowstate_subscriptions` (Supabase)
- [ ] Cek: badge akun di app berubah **Pro**
- [ ] Cancel subscription test → cek status di DB berubah

## 6. Go live

- [ ] Matikan Test mode → **recreate kedua produk di live mode** (ID beda!)
- [ ] Ganti semua env dengan nilai live
- [ ] Satu pembelian bulanan beneran ($9.99) sebagai smoke test → refund sendiri
- [ ] Pastikan env Vercel `NEXT_PUBLIC_PREMIUM_PROMO=0` atau tidak disetel
      (source dan Worker sudah memakai `0`)
- [ ] Update perks/marketing kalau ada perubahan gate

---

## Copy cadangan (kalau butuh di tempat lain)

**Tagline pendek:** `Get in the zone.`

**Elevator (Twitter/IG bio):**
```
Deep work app with 290+ original lofi & synthwave tracks, a focus timer, and analytics that never lie to you. Free to use. Pro from $5 — you name the price.
```

**Yang BOLEH diklaim sebagai Pro:** premium ambient sounds, premium scenes/themes,
new music monthly, support the producer.
**Yang TIDAK BOLEH diklaim sebagai Pro** (karena gratis): library musik/genre,
focus analytics & history, sync riwayat antar device.
