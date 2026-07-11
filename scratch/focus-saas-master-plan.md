# Flowstate — Master Plan (A–Z)
**Deep-work music & focus SaaS · `flow.virzyguns.com` · target: global**
*Working title "Flowstate" — swappable (alt: Lock In, Nocturne, Monk Mode, Deep). Part of VGP Universe.*

> Status: planning doc. Tidak ada kata "donasi" di seluruh produk — model = SaaS subscription (legal untuk PT Perorangan).
> Disclaimer: ini bukan nasihat hukum/pajak. Konfirmasi 1x dengan konsultan pajak + notaris sebelum live.

---

## A. Executive Summary & Positioning

**Apa:** Web app (PWA) yang menggabungkan **Pomodoro/deep-work timer + music player (lofi/synthwave/ambient) + ambient sound mixer + scenes + focus analytics**. Musik diproduksi sendiri oleh founder (produser) → katalog eksklusif = moat.

**Untuk siapa (pasar diperluas dari "study"):**
- Programmer / engineer (deep work, "lock in", long coding sessions)
- Knowledge workers / remote workers (focus blocks)
- Pelajar & mahasiswa (study sessions)
- Creator / writer / designer (flow state)

**Positioning statement:** *"The focus environment with a soundtrack you can't get anywhere else — original music by a producer, built for deep work."*

**Kenapa bisa menang:**
1. **Musik orisinal milik sendiri** → tidak ada risiko lisensi, biaya konten ~0, katalog eksklusif (kompetitor harus bayar label/lisensi).
2. Founder = produser → brand artistik + supply musik berkelanjutan (rilis pack baru = retensi).
3. Bagian dari VGP Universe (infra & audiens sudah ada).

---

## B. Market & Kompetitor

| Produk | Harga | Catatan |
|---|---|---|
| Brain.fm | ~$6.99/bln | Klaim "neuroscience", katalog sendiri |
| Endel | ~$5.99/bln | Generative soundscapes |
| Lofi.co / Flocus / Moodist | freemium | Scene + ambient, embed YouTube |
| Noisli / Coffitivity | freemium | Ambient mixer |
| Forest / Pomofocus | freemium | Timer-first, no music |
| Spotify "lofi beats" | bundled | Tanpa timer/tools fokus |

**Celah yang kamu isi:** kombinasi *timer + tools fokus + musik ORISINAL eksklusif + visual*, dengan harga ramah dan PPP global. Mayoritas kompetitor "study" tidak menyasar programmer/deep-work secara eksplisit → ruang positioning terbuka.

---

## C. Product Scope (personas, fitur, free vs premium)

### C.1 MVP definition (yang harus jalan dulu)
Pomodoro/deep-work timer + ambient mixer + music player + to-do + auth + sync. Tanpa ini, bukan produk.

### C.2 Fitur lengkap (free vs premium)

| Fitur | Free | Premium |
|---|---|---|
| Timer: Pomodoro + mode Deep Work (50/10, 90/20, custom, infinite/stopwatch) | ✅ | ✅ |
| Auto-start, long break, sound cue, desktop notification | ✅ | ✅ |
| To-do list + estimasi & hitung pomodoro per task | ✅ (cap, mis. 10 task aktif) | ✅ unlimited |
| Ambient sound mixer (rain, cafe, fire, waves, thunder, keyboard, brown noise) | 3–4 suara | semua + save preset mix |
| Music library (lofi / synthwave / chillhop / ambient / "code mode") | 1 playlist sampler | semua genre + semua track |
| Scenes / animated background (rain window, synthwave city, study room, terminal) | 2 | semua + premium animations |
| Focus analytics (waktu fokus, sesi, streak, heatmap) | 7 hari terakhir | riwayat penuh + export CSV |
| Cross-device sync | – | ✅ |
| No interruptions / clean mode | sebagian | ✅ |
| Offline PWA (track yang diizinkan) | – | ✅ (V2) |
| Study/Focus-together rooms (realtime) | – | ✅ (V2) |
| Keyboard shortcuts & command palette (buat programmer) | ✅ | ✅ |

### C.3 Personas → fitur penarik
- **Programmer:** mode Deep Work 90/20, "code mode" playlist (synthwave/DnB low-vocal), keyboard ambient, command palette, terminal-style scene, dark theme default.
- **Student:** Pomodoro klasik 25/5, study-room scene, streak/gamifikasi.
- **Creator/Writer:** ambient mixer + lofi, scenes tenang, infinite timer.

---

## D. Content / Music Strategy (MOAT) ⭐

**Keunggulan:** founder produser → memiliki hak penuh atas musik orisinal. Boleh stream, gate sebagai premium, bikin katalog eksklusif. **Inilah pembeda utama.**

### D.1 Klasifikasi track (wajib dicatat per lagu)
Setiap track punya metadata sumber & hak:
- `original` — diproduksi sendiri, hak penuh. **Aman 100%.**
- `ai_assisted` — AI sebagai alat, aransemen/produksi oleh kamu. Aman, catat tool.
- `ai_generated` — full AI. **Cek ToS tool-nya.**

### D.2 Caveat AI music (penting, low-risk tapi catat)
- **Lisensi komersial:** pastikan tool AI (Suno/Udio/dll) memberi **hak komersial + redistribusi/streaming** — biasanya hanya di **paid tier**. Track dari free tier sering TIDAK boleh dikomersialkan. Simpan bukti tier berbayar.
- **Copyrightability:** di beberapa yurisdiksi (mis. AS) karya *murni* AI sulit didaftarkan hak cipta → artinya kamu mungkin tak bisa melarang orang lain menyalin track itu. Tidak menghalangi kamu memakainya, tapi untuk **track unggulan/branding pakai yang `original`/`ai_assisted`**.
- **Tabel `licenses`:** simpan per track: source, tool, tier, tanggal, bukti. Ini jejak hukum kalau ada dispute/DMCA palsu.

### D.3 Operasi katalog (retensi)
- Rilis **"pack" baru rutin** (mis. tiap bulan: "Synthwave Vol.2", "Rainy Code Sessions") → alasan user balik & alasan upgrade.
- Branding: *"Original soundtrack by Virzy Guns"* → angle marketing + cross-promo ke karya produser-mu.
- Ambient/nature sounds: pakai CC0/royalty-free (atau rekam sendiri) — risiko ~0.

---

## E. Branding & Naming

- **Nama working:** Flowstate. Alternatif: Lock In, Nocturne, Monk Mode, Deep.
- **Domain:** subdomain `virzyguns.com` (kontrol penuh, gratis, SEO numpang authority domain induk).
- **Tone visual:** dark-first, synthwave/retro + minimal. Programmer-friendly (mono font aksen, terminal motif opsional).
- **Logo/identity:** simple wordmark + 1 ikon (mis. waveform/play di dalam lingkaran fokus).
- **Tagline kandidat:** "Get in the zone." / "Your deep work soundtrack." / "Lock in."

---

## F. Legal & Compliance (paling rawan "mistake")

### F.1 Donasi = JANGAN (UU 9/1961 + PP 29/1980)
Penggalangan donasi/sumbangan publik hanya untuk ormas berizin; **perorangan & PT komersial dilarang**. → Tidak pernah pakai kata "donasi/support". Model = **jual langganan/produk digital** (kegiatan usaha biasa, legal).

### F.2 Payment = Merchant of Record (MoR), bukan Patreon/PayPal mentah
- **Stripe Indonesia** tidak dipakai: akun ID hanya IDR, **tanpa cross-border**. Tidak cocok target global.
- **Lemon Squeezy** (rekomendasi utama; bagian dari Stripe) atau **Paddle** = MoR: jadi penjual resmi, **pungut & setor pajak konsumsi global (VAT/GST/sales tax)**, tanggung chargeback, bayar net ke kamu.
- Verifikasi metode payout ke Indonesia (bank/Wise/Payoneer/PayPal) saat daftar. Cek coverage metode bayar buyer di Asia Tenggara/LATAM (kalau kurang → Paddle).
- PayPal hanya sebagai metode bayar *di dalam* MoR / metode payout.

### F.3 Badan usaha & pajak Indonesia
- **NPWP** wajib. **NIB/KBLI** harus mencakup digital: 62019 / 62015 / 63122.
- **PP 23/2018:** PPh final **0,5% dari peredaran bruto** bila omzet < Rp4,8 M/thn (PT ±3 thn). Setelah itu rezim PPh badan normal.
- Penghasilan = payout dari MoR. Pajak konsumsi negara customer diurus MoR. Simpan laporan payout rapi.
- **Action:** 1x konsultasi konsultan pajak + cek KBLI dengan notaris sebelum live.

### F.4 Privasi & ToS (target global → ada EU/AS)
- Wajib: **Privacy Policy, Terms of Service, Refund Policy, Cookie consent**.
- **GDPR/CCPA:** hak hapus akun + ekspor data. Minimalkan PII (email + display name cukup).
- Data pembayaran tidak pernah menyentuh server-mu (ditangani MoR) → kurangi beban PCI.
- Email transaksional/marketing: consent + unsubscribe (CAN-SPAM/GDPR).

### F.5 Konten musik
- Tabel `licenses` (lihat D.2) = bukti hak tiap track.
- DMCA/contact page + proses takedown (formalitas, melindungi kamu).

---

## G. Monetization & Pricing

### G.1 Tiers
- **Free** — akuisisi + SEO. Cukup berguna (timer penuh + sebagian sound/scene) tapi bikin pengen upgrade.
- **Premium** — **$4.99/bln** atau **$39/thn** (hemat ~35%).
- **Lifetime** — **$79** (early-bird **$49** untuk 100 pembeli pertama) → cash awal + social proof.
- **Regional/PPP pricing** lewat MoR (harga lebih rendah untuk ID/India/LATAM) → konversi global naik.

### G.2 Konversi & dunning
- Free→Premium via paywall kontekstual (klik track premium, scene premium, simpan preset).
- MoR urus dunning (kartu gagal → retry + email) otomatis.
- Trial 7 hari opsional (atau cukup free tier generous).

### G.3 Proyeksi kasar (ilustrasi, bukan janji)
- Asumsi 10.000 user free, konversi 2% → 200 premium.
- 200 × $4.99 ≈ **$998/bln** gross. Net setelah MoR (~5%+$0.5/txn) ≈ ~$840.
- Biaya tetap ~$50/bln → margin sangat sehat (konten ~0 karena musik sendiri).
- Lifetime deals = suntikan kas tambahan di awal.

---

## H. Tech Architecture (full stack)

### H.1 Frontend
- **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui**, deploy **Vercel Pro** (Hobby = non-komersial, WAJIB upgrade saat monetisasi).
- **PWA** (installable, offline shell, add-to-home).
- **Audio engine (dua graf terpisah, digabung di Web Audio API):**
  - *Music player*: 1 track aktif, **HLS.js** (adaptif + lebih sulit di-rip dari mp3 telanjang), crossfade antar track, gapless playlist.
  - *Ambient mixer*: banyak loop simultan, volume per-suara, seamless loop, save preset.
- **State:** Zustand (timer/player/mixer/UI) + TanStack Query (data server).
- **Visual scenes:** CSS/Canvas/looped video (low-bitrate, lazy-load). Respect `prefers-reduced-motion`.
- **A11y & UX:** keyboard shortcuts, command palette (programmer-friendly), dark-first, i18n-ready (EN dulu).

### H.2 Backend
- **Supabase**: Auth (Google + email magic link), Postgres, Storage (cover art/metadata), Edge Functions, Realtime (rooms V2).
- **Next.js Route Handlers** untuk: webhook MoR, signing audio URL, sync stats, account deletion (GDPR).
- **Entitlement service:** webhook MoR → tabel `subscriptions` → fungsi `is_premium(user)` dipakai di RLS + saat sign URL audio premium.

### H.3 Audio delivery (keputusan infra kritikal)
- File audio (HLS segments) di **Cloudflare R2 (egress $0)** + Cloudflare CDN; atau reuse **S3 + CloudFront** (sudah dipakai CADENZ). R2 lebih hemat untuk streaming.
- **Jangan** stream langsung dari Supabase Storage (egress mahal).
- Akses via **signed/tokenized URL umur pendek**; sebelum sign → cek entitlement (track premium tak bisa diambil non-premium).

### H.4 Background jobs
- **pg_cron (Supabase)** atau **Cloudflare Worker cron** (kamu sudah punya worker email) untuk: reset streak harian, agregasi `stats_daily`, cleanup. Jangan andalkan Vercel cron.

### H.5 Diagram alur (teks)
```
Browser (Next.js PWA)
  ├─ Auth ───────────────► Supabase Auth
  ├─ Data (CRUD) ────────► Supabase Postgres (RLS)
  ├─ Music/Ambient ──────► request signed URL ► Next.js Route Handler
  │                             │ cek entitlement (subscriptions)
  │                             ▼ signed URL
  │                        Cloudflare R2 / CloudFront (HLS) ──► stream
  └─ Checkout ───────────► Lemon Squeezy (MoR) ──webhook──► Route Handler ──► subscriptions
Cron: pg_cron / CF Worker ─► agregasi stats, reset streak
```

---

## I. Data Model (skema inti)

```sql
-- profil & langganan
profiles(user_id pk→auth.users, display_name, timezone, plan, settings_jsonb, created_at)
subscriptions(id, user_id, provider, provider_sub_id, status, plan, current_period_end, updated_at)

-- konten
tracks(id, title, artist, genre, mood, duration_s, hls_url, cover_url, is_premium,
       source enum('original','ai_assisted','ai_generated'), license_id, published_at)
ambient_sounds(id, name, file_url, category, is_premium, loop_seamless bool)
playlists(id, title, slug, is_premium, ordering)
playlist_tracks(playlist_id, track_id, position)
scenes(id, name, asset_url, type, is_premium)
licenses(id, track_id, source, tool, tier, evidence_url, acquired_at, notes)

-- pemakaian
focus_sessions(id, user_id, mode, started_at, ended_at, duration_s, completed bool, task_id)
tasks(id, user_id, title, done bool, pomodoros_estimated, pomodoros_done, position, created_at)
mixer_presets(id, user_id, name, config_jsonb)
stats_daily(user_id, date, focus_minutes, sessions, streak, pk(user_id,date))

-- ops
events(id, user_id, name, props_jsonb, created_at)   -- analytics (atau pakai PostHog)
```
**RLS aktif** di semua tabel ber-user; konten dibaca publik tapi `is_premium` gating di app + saat sign URL.

---

## J. Audio Delivery & Anti-Piracy

- Transcode track → **HLS** (beberapa bitrate) saat upload (pipeline: upload → job transcode → R2).
- **Signed URL** per segment/playlist, TTL pendek (mis. 60–300s), per-user.
- Cek entitlement sebelum sign. Watermark opsional (silent) untuk track premium.
- Tidak ada tombol download untuk premium (kecuali fitur offline berlisensi, V2).
- Catatan: tidak ada DRM yang 100% — tujuannya bikin ripping cukup merepotkan, bukan mustahil.

---

## K. Security & Privacy Hardening

- RLS ketat (default deny), service-role key hanya di server.
- Webhook MoR: verifikasi signature, idempotent (anti replay).
- Rate limiting di Route Handlers (sign URL, auth-sensitive).
- CSP + secure cookies + CSRF protection (kamu sudah pengalaman — lihat commit security terakhir di repo VGP).
- Account deletion & data export endpoint (GDPR).
- Secrets di env (Vercel/Supabase), tidak di repo.

---

## L. Analytics & Growth Instrumentation

- **PostHog** (atau Plausible utk privacy-light) untuk funnel: signup → first session → first paywall → upgrade.
- Event kunci: `session_started/completed`, `track_played`, `paywall_viewed`, `upgrade_clicked`, `subscribed`, `churned`.
- Dashboard retensi (D1/D7/D30), konversi free→premium, MRR, churn.

---

## M. SEO & Go-to-Market

### M.1 SEO (organik = mesin akuisisi murah)
- Landing pages per intent: "deep work music", "coding focus music", "pomodoro timer with music", "lofi study", "synthwave focus".
- Free tier = SEO surface + viral loop ("study with me" / "lock in with me" embeds).
- Blog/konten: produktivitas, deep work, playlist showcase.

### M.2 Launch
- **Product Hunt** launch (siapkan aset, hunter, early-bird lifetime).
- Komunitas: r/productivity, r/getdisciplined, r/programming, Hacker News (Show HN), dev Twitter/X, Discord deep-work.
- Cross-promo dari channel produser/VGP Universe (audiens musik = overlap besar).
- Referral: "beri 1 bulan, dapat 1 bulan".

---

## N. Infra & DevOps

- **Repo:** monorepo/single Next.js app. Branch protection di main (kamu sudah disiplin git).
- **Envs:** `local` (Supabase local/branch) → `preview` (Vercel preview + Supabase branch) → `prod`.
- **CI/CD:** Vercel auto-deploy per PR; migrasi DB via Supabase migrations (versioned).
- **Monitoring:** Vercel analytics + Supabase logs + error tracking (Sentry).
- **Biaya tetap awal:** Vercel Pro $20 + Supabase Pro $25 + R2 ~$0–5 + Sentry/PostHog free tier ≈ **$45–50/bln**; MoR per-transaksi (~5%+$0.5), konten ~$0.

---

## O. Build Roadmap (fase, sprint, milestone)

> Estimasi solo dev, paralel dengan urusan legal. Sesuaikan dengan kapasitasmu.

**Fase 0 — Legal & setup (Minggu 1–2, paralel)**
- Cek KBLI/NIB + konsultasi pajak. Daftar Lemon Squeezy. Privacy/Terms/Refund. Kurasi katalog awal (ambient CC0 + 8–12 track orisinal/AI berlisensi) + isi tabel `licenses`. Pilih nama final + setup subdomain + DNS.

**Fase 1 — MVP fungsional (Minggu 2–5)**
- Next.js + Tailwind + shadcn + Supabase Auth.
- Timer (Pomodoro + Deep Work modes) + notif + sound cue.
- Ambient mixer (Web Audio) + music player (HLS) — sumber dari R2/CloudFront, semua gratis dulu.
- To-do + focus_sessions tracking + basic stats.
- Deploy ke `flow.virzyguns.com`. **Goal: terasa enak dipakai.**

**Fase 2 — Monetisasi & gating (Minggu 5–7)**
- Lemon Squeezy checkout + webhook + tabel subscriptions + entitlement.
- Signed audio URL + premium gating (track/scene/preset).
- Free vs Premium aktif. Stats penuh + streak (pg_cron).
- Pricing page + regional pricing.

**Fase 3 — Polish & launch (Minggu 7–10)**
- Scenes/visual, PWA, onboarding, command palette, dark theme, i18n shell.
- SEO landing pages + blog + analytics (PostHog) + Sentry.
- Early-bird lifetime. Product Hunt + komunitas launch.

**Fase 4 — Growth (pasca-launch)**
- Study/Focus-together rooms (Supabase Realtime).
- Offline PWA (track berlisensi), referral, mobile wrapper (Capacitor/PWA).
- Rilis music pack bulanan (retensi). A/B test paywall & pricing.

---

## P. Risks & Mitigations

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Frame "donasi" | Ilegal utk PT/perorangan | Hanya jual langganan; audit copy |
| Stripe ID dipakai utk global | Tak bisa cross-border | Pakai MoR (Lemon Squeezy/Paddle) |
| AI track free-tier dikomersialkan | Pelanggaran ToS | Pakai paid tier; catat di `licenses`; track unggulan = original |
| Vercel Hobby utk produk berbayar | Langgar ToS Vercel | Upgrade ke Pro saat monetisasi |
| Egress audio mahal | Biaya bengkak | R2 (egress $0) / CloudFront + HLS |
| Piracy track premium | Kebocoran konten | Signed URL TTL pendek + HLS + no-download |
| GDPR non-compliance | Denda/keluhan | Privacy/ToS + delete/export + cookie consent |
| Overscope MVP | Tak pernah launch | Patuhi C.1 (MVP minimal) |

---

## Q. KPI & Success Metrics

- **Aktivasi:** % user yang menyelesaikan ≥1 focus session di hari pertama.
- **Retensi:** D7/D30 return rate.
- **Konversi:** free→premium (target awal 1–3%).
- **MRR / churn / LTV.**
- **Engagement:** rata-rata menit fokus/user/minggu; track plays.

---

## R. Open Decisions / Next Actions

**Keputusan yang menunggu kamu:**
1. **Nama final** (default: Flowstate / `flow.virzyguns.com`).
2. **MoR:** Lemon Squeezy (default) vs Paddle — tergantung coverage metode bayar target region.
3. **Trial:** 7 hari trial vs free tier generous tanpa trial.
4. **Lifetime deal** di launch? (rekomendasi: ya, early-bird $49).

**Next actions teknis (saat kamu kasih "go"):**
1. Scaffold Next.js + Supabase + Tailwind + shadcn, struktur folder, migrasi DB awal.
2. Bangun timer + ambient mixer (Web Audio) + music player (HLS) sebagai vertical slice.
3. Pipeline upload→transcode HLS→R2 + signed URL.
4. Integrasi Lemon Squeezy + webhook + entitlement.

---
*Dokumen ini acuan hidup — update seiring keputusan. Disimpan di `scratch/` (pindahkan ke `docs/` saat repo produk dibuat).*
