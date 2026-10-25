# Arsitektur nugas.in: Modular Monolith

Satu aplikasi Next.js (satu deploy), tetapi kodenya dipecah menjadi **modul** yang
masing-masing punya satu tanggung jawab dan batas yang jelas.

## Peta folder

```
src/
├── app/                  Rute Next.js. Tipis: hanya memasang komponen dari modul.
├── app-shell/            Kerangka halaman (sidebar, header) + pemasangan semua provider.
├── modules/
│   ├── tasks/            Tugas: data, form, daftar, lencana deadline, pengingat.
│   ├── courses/          Mata kuliah: data, form, halaman daftar, warna.
│   ├── settings/         Pengaturan (nama, jam tidur, tema).
│   ├── scheduling/       Algoritma EDF + kalender mingguan.
│   ├── recommendation/   Rekomendasi waktu dari AI (Gemini).
│   ├── backup/           Backup Google Drive + info penyimpanan lokal.
│   ├── notifications/    Toast.
│   └── dashboard/        Halaman utama; hanya menyusun tasks + scheduling.
└── shared/               Alat umum tanpa pengetahuan bisnis (UI, tanggal, hook).
```

Isi tipikal sebuah modul:

```
modules/tasks/
├── index.ts              <- API PUBLIK: satu-satunya pintu masuk bagi modul lain
├── types.ts              tipe data
├── tasks-context.ts      context + hook useTasks()
├── tasks-provider.tsx    state + localStorage
└── components/           UI milik modul
```

## Siapa boleh bergantung pada siapa

```
Lapisan 4   dashboard      recommendation      backup
               │               │                 │
Lapisan 3   scheduling ────────┼─────────────────┤      panah turun = "boleh memakai"
               │               │                 │
Lapisan 2    tasks ────────────┴─────────────────┘
               │
Lapisan 1   courses    settings    notifications
               │          │             │
Dasar       ──────────────  shared  ──────────────
```

Ringkasnya: modul di lapisan atas boleh memakai lapisan di bawahnya, tidak pernah sebaliknya.
Contoh: `tasks` memakai `courses` (untuk menampilkan nama kuliah), tetapi `courses` tidak tahu `tasks` ada.

Versi tabelnya ada di `scripts/check-architecture.mjs` (konstanta `ALLOWED`):

| Modul | Boleh memakai |
|---|---|
| notifications, settings, courses | (tidak ada) |
| tasks | courses, notifications |
| scheduling | tasks, courses, settings, notifications |
| recommendation | tasks, courses, settings |
| backup | tasks, courses, settings, notifications |
| dashboard | tasks, scheduling |

Tidak ada lingkaran (tasks → courses, tetapi courses tidak pernah → tasks).

## Lima aturan

1. **Lewat pintu depan.** Modul lain hanya import `@/modules/<nama>`, tidak boleh
   `@/modules/<nama>/components/...`. Yang tidak ada di `index.ts` berarti privat.
2. **Hanya ke bawah.** Ikuti tabel di atas. `shared` tidak tahu modul sama sekali.
3. **Modul tidak mengimpor `app-shell` atau `app`.**
4. **Import relatif (`../`) hanya di dalam modul sendiri.** Ke luar, pakai `@/`.
5. **Data milik modulnya.** Tugas disimpan dan diubah hanya oleh `tasks`; modul
   lain meminta lewat hook publik (`useTasks()`), tidak menyentuh `localStorage` miliknya.

Aturan ini **diperiksa otomatis**: `npm run check:architecture` (gagal jika dilanggar).

## Pola yang dipakai (dan alasannya)

**Provider per modul.** Dulu satu `DataProvider` raksasa memegang semuanya. Sekarang
tiap modul memegang state-nya sendiri (`TasksProvider`, `CoursesProvider`, ...),
dipasang berurutan di `app-shell/app-providers.tsx`.

**Event untuk menghindari saling-tahu.** Menghapus mata kuliah harus melepas tugasnya,
tetapi `courses` tidak boleh mengimpor `tasks`. Jadi `courses` memancarkan event
`onCourseDeleted`, dan `tasks` mendengarkannya (`shared/lib/emitter.ts`).

**Props sebagai jembatan.** `TaskList` perlu tahu tugas mana yang kekurangan waktu
(hitungan `scheduling`), tetapi `tasks` tidak boleh mengimpor `scheduling`. Jadi
`dashboard` yang mengambil hasilnya dan memberikannya lewat props.

**Algoritma murni.** `scheduling/schedule.ts` tidak memakai React/localStorage/modul lain.
Ia hanya menerima data dan mengembalikan hasil, jadi mudah dibaca dan diuji sendiri.

**Server dan klien dipisah.** Semua yang menyentuh `GEMINI_API_KEY` ada di
`modules/recommendation/server/` dan tidak boleh diimpor komponen `"use client"`
(kecuali server action `get-task-recommendation.ts`).

## Cara menambah fitur

**Fitur kecil di modul yang ada**: tambahkan file di foldernya; kalau perlu dipakai
modul lain, export lewat `index.ts`.

**Modul baru** (contoh: `notes`):
1. Buat `src/modules/notes/` dengan `index.ts`, `types.ts`, provider, dan `components/`.
2. Daftarkan di `ALLOWED` pada `scripts/check-architecture.mjs` (tulis modul apa saja yang ia pakai).
3. Pasang providernya di `app-shell/app-providers.tsx` (di dalam provider yang ia butuhkan).
4. Tambah rute tipis di `src/app/notes/page.tsx` dan item di `app-shell/nav-items.ts`.
5. `npm run check:architecture` harus tetap hijau.

## Untuk yang baru membaca kode ini

Urutan baca yang disarankan: `shared/lib/date-time.ts` → `modules/courses` (modul paling
sederhana) → `modules/tasks` → `modules/scheduling/schedule.ts` → `app-shell/app-providers.tsx`
→ `modules/dashboard`.

## Peta dari struktur lama

| Lama | Baru |
|---|---|
| `lib/store.tsx` | dipecah: `tasks-provider`, `courses-provider`, `settings-provider`, `notifications-provider`, `use-now` |
| `lib/schedule.ts` | `shared/lib/date-time.ts` (tanggal) + `modules/scheduling/schedule.ts` (algoritma) |
| `lib/drive.ts` | `modules/backup/google-drive.ts` |
| `lib/types.ts` | `types.ts` di masing-masing modul |
| `app/actions/recommendation.ts` | `modules/recommendation/server/` |
| `components/forms.tsx` | `tasks/components/task-form.tsx` + `courses/components/course-form.tsx` |
| `components/common.tsx` | `shared/ui/*` (Modal, Field, ...) + `tasks/components/deadline-badge.tsx` + `courses/course-colors.ts` |
| `components/week-calendar.tsx` | `modules/scheduling/components/` |
| `components/app-shell.tsx` | `app-shell/` (dipecah: sidebar, header, focus-card) |
| `components/deadlinePicker.tsx` | `shared/ui/date-time-picker.tsx` |

## Data lama

Versi lama menyimpan semua di satu kunci `localStorage` (`nugas-in:v1`). Saat dibuka,
`app-shell/migrate-legacy-storage.ts` memindahkannya ke kunci per-modul sekali saja.
Format backup Google Drive tidak berubah, jadi backup lama tetap bisa dipulihkan.
