// /alternatives/pomofocus — EN + ID.
import type { Locale } from "@/lib/translations/dictionaries";
import type { AlternativeCopy } from "./types";

const en: AlternativeCopy = {
  metaTitle: "Pomofocus Alternative: Flow",
  metaDescription:
    "Looking for a Pomofocus alternative with music built in? Flow keeps the clean Pomodoro workflow and adds original in-house focus tracks and an ambient mixer.",
  h1: "Pomofocus Alternative: Flow",
  intro: [
    "Pomofocus is a genuinely good Pomodoro timer. It's fast, free, uncluttered, the task list is right there, and it does the one thing it promises without ceremony. As a pure timer, there's little to criticize.",
    "But most people don't run a Pomodoro in silence — they open Pomofocus in one tab and a YouTube lofi stream in another, and now the 'simple' setup has ads, unrelated tab audio, and music that keeps playing into the break. Flow is that whole desk in one tab: the same timer-and-tasks workflow, plus original focus music produced in-house and an ambient mixer underneath it.",
  ],
  competitorName: "Pomofocus",
  tableHeading: "Side by side",
  rows: [
    { feature: "Pomodoro timer", them: "Excellent — presets, tasks, estimates", flow: "Same workflow: presets, custom splits, per-session tasks" },
    { feature: "Music", them: "None — bring your own tab", flow: "80+ original tracks produced in-house, synced to the block" },
    { feature: "Ambient sounds", them: "None", flow: "12-layer mixer: rain, café, fire, and more" },
    { feature: "Stats", them: "Reports and streaks", flow: "Streaks, heatmap, records — measured minutes only" },
    { feature: "Price", them: "Free; small yearly premium for reports", flow: "Free tier; Pro at $9.99/mo for the full library" },
  ],
  whenHeading: "When Pomofocus is still the right pick",
  whenParagraphs: [
    "If you work in silence — or your audio setup is already sorted and you truly just need a clean timer with a task list — Pomofocus does that with less product around it, and its free tier will never bother you. There's no shame in the simpler tool when the simpler tool is enough.",
    "Pick Flow when the second tab is the problem: when you want the music, the ambience, and the timer to be one machine that starts and stops together.",
  ],
  faq: [
    {
      q: "Is Flow's timer as good as Pomofocus?",
      a: "It covers the same ground — work/break presets from 25/5 to 90/15, custom lengths, and a per-session task list next to the clock. The difference is everything around the timer, not the timer itself.",
    },
    {
      q: "Do I have to pay for Flow where Pomofocus is free?",
      a: "No. Flow's timer, tasks, ambient sounds, and part of the music library are free. The paid plan adds the full in-house library — the thing Pomofocus doesn't have at any price.",
    },
    {
      q: "Can I use my own music with Flow?",
      a: "You can keep any player running alongside, but Flow's point is the built-in library: instrumental tracks made for focus that start and stop with your block, with ambient layers mixed underneath.",
    },
  ],
};

const id: AlternativeCopy = {
  metaTitle: "Alternatif Pomofocus: Flow",
  metaDescription:
    "Cari alternatif Pomofocus dengan musik bawaan? Flow mempertahankan alur Pomodoro yang bersih dan menambah track fokus original in-house plus ambient mixer.",
  h1: "Alternatif Pomofocus: Flow",
  intro: [
    "Pomofocus itu timer Pomodoro yang benar-benar bagus. Cepat, gratis, rapi, task list-nya langsung di situ, dan dia mengerjakan satu janjinya tanpa upacara. Sebagai timer murni, hampir nggak ada yang bisa dikritik.",
    "Tapi kebanyakan orang nggak menjalankan Pomodoro dalam sunyi — mereka buka Pomofocus di satu tab dan stream lofi YouTube di tab lain, dan setup 'sederhana' itu sekarang punya iklan, audio tab yang nggak nyambung, dan musik yang terus jalan sampai ke break. Flow adalah seluruh meja itu dalam satu tab: alur timer-dan-task yang sama, plus musik fokus original yang diproduksi sendiri dan ambient mixer di bawahnya.",
  ],
  competitorName: "Pomofocus",
  tableHeading: "Perbandingan langsung",
  rows: [
    { feature: "Timer Pomodoro", them: "Bagus — preset, task, estimasi", flow: "Alur sama: preset, split custom, task per sesi" },
    { feature: "Musik", them: "Nggak ada — bawa tab sendiri", flow: "80+ track original in-house, sinkron dengan block" },
    { feature: "Ambient sound", them: "Nggak ada", flow: "Mixer 12 lapis: hujan, café, api, dan lainnya" },
    { feature: "Statistik", them: "Laporan dan streak", flow: "Streak, heatmap, rekor — hanya menit terukur" },
    { feature: "Harga", them: "Gratis; premium tahunan kecil untuk laporan", flow: "Tier gratis; Pro $9.99/bln untuk library penuh" },
  ],
  whenHeading: "Kapan Pomofocus tetap pilihan yang benar",
  whenParagraphs: [
    "Kalau kamu kerja dalam sunyi — atau setup audiomu sudah beres dan kamu benar-benar cuma butuh timer bersih dengan task list — Pomofocus memberikan itu dengan produk yang lebih sedikit di sekelilingnya, dan tier gratisnya nggak akan pernah mengganggumu. Nggak ada salahnya alat yang lebih sederhana kalau yang sederhana memang cukup.",
    "Pilih Flow kalau tab kedua itulah masalahnya: kalau kamu mau musik, ambience, dan timer jadi satu mesin yang mulai dan berhenti bersama.",
  ],
  faq: [
    {
      q: "Timer Flow sebagus Pomofocus?",
      a: "Cakupannya sama — preset kerja/istirahat dari 25/5 sampai 90/15, durasi custom, dan task list per sesi di samping jam. Bedanya ada di semua hal di sekitar timer, bukan timer-nya sendiri.",
    },
    {
      q: "Aku harus bayar Flow padahal Pomofocus gratis?",
      a: "Nggak. Timer, task, ambient sound, dan sebagian library musik Flow gratis. Plan berbayar menambah library in-house penuh — hal yang nggak dimiliki Pomofocus di harga berapa pun.",
    },
    {
      q: "Bisa pakai musikku sendiri di Flow?",
      a: "Player apa pun bisa tetap jalan berdampingan, tapi inti Flow adalah library bawaannya: track instrumental yang dibuat untuk fokus, mulai-berhenti bareng block-mu, dengan lapisan ambient di bawahnya.",
    },
  ],
};

export function getPomofocusCopy(locale: Locale): AlternativeCopy {
  return locale === "id" ? id : en;
}
