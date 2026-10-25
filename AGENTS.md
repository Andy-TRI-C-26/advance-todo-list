# AGENTS.md: Panduan untuk AI yang mengerjakan nugas.in

Baca seluruh file ini sebelum mengubah kode. Proyek ini adalah **modular monolith**
(satu aplikasi Next.js, kode dipecah menjadi modul dengan batas yang ditegakkan skrip).
Tujuan utamanya: kode **mudah dipelajari** dan struktur **tetap konsisten**.
Detail lebih lengkap ada di `ARCHITECTURE.md`.

## 0. ATURAN UTAMA: mengajar, bukan men-generate ulang

Pengguna proyek ini ada yang masih belajar dan **tidak langsung paham** isi kode. Tugasmu bukan
hanya membuat kode jalan, tetapi **membuat pengguna mengerti perubahan yang terjadi**.
Aturan ini **mengalahkan** aturan gaya lain di file ini bila ada benturan.

### Dilarang

- **Menulis ulang / menimpa / mengirim ulang satu file utuh** untuk perubahan di dalam file yang sudah ada.
  Meski cuma 3 baris yang berubah, jangan menempelkan seluruh file.
- Memberi banyak file sekaligus tanpa penjelasan per bagian ("ini hasil akhirnya, salin semua").
- Mengubah hal lain "sekalian" yang tidak diminta, karena itu membuat pengguna tidak bisa melacak apa yang berubah.

### Wajib: sajikan setiap perubahan sebagai LANGKAH dengan format ini

````
**Langkah N: `path/ke/file.ts`**
Lokasi: cari `potongan kode unik di dekatnya` (sekitar baris 42)
Aksi: GANTI / TAMBAHKAN SETELAH / TAMBAHKAN SEBELUM / HAPUS

(kode, hanya bagian yang berubah + 1-3 baris konteks agar mudah ditemukan)

Kenapa: 1-2 kalimat pendek.
````

Penjelasan format:

- **Lokasi: pakai DUA petunjuk.** Teks yang bisa dicari (Ctrl+F) sebagai petunjuk utama, nomor baris sebagai
  perkiraan (nomor bergeser setelah edit sebelumnya). Jika dua langkah di file yang sama, urutkan dari
  **bawah ke atas** atau sebut "nomor baris sudah bergeser" agar tidak menyesatkan.
- **Aksi:** pilih satu kata yang jelas. Untuk GANTI, tampilkan kode **sebelum** (singkat) lalu **sesudah**.
- **Kode:** hanya baris yang berubah ditambah sedikit konteks. Jangan menyalin fungsi/komponen utuh bila
  yang berubah hanya satu bagian di dalamnya.
- **Kenapa: sangat singkat (maks 2 kalimat)**, bahasa sederhana. Jelaskan *tujuan* perubahan, bukan membacakan
  ulang kodenya. Jika ada istilah teknis yang mungkin asing (mis. "context", "provider", "normalize"),
  beri arti dalam setengah kalimat.
- **Jika memperbaiki bug:** sebelum langkah pertama, tulis **penyebabnya dalam 1 kalimat**
  ("Error muncul karena X memanggil Y sebelum datanya siap").

### Mengatur ukuran jawaban

- Maksimal **3-5 langkah per balasan**. Kalau lebih banyak, bagi menjadi tahap dan tulis
  "Tahap 1 dari 3". Di akhir tiap tahap, beri perintah untuk mengecek (`npm run typecheck`,
  `npm run check:architecture`, atau apa yang harus terlihat di browser), lalu tanya apakah lanjut.
- Urutkan langkah **sesuai urutan mengerjakannya**, supaya aplikasi sebisa mungkin tetap bisa dijalankan
  di antara langkah.
- Akhiri dengan **satu kalimat pembelajaran**: tunjuk file contoh di proyek yang memakai pola yang sama
  ("Pola yang sama dipakai di `modules/courses/courses-provider.tsx`, baca untuk perbandingan").

### Jika kamu punya akses mengedit file langsung (Cursor, Claude Code, dsb.)

- Tetap **edit minimal**: ubah hanya bagian yang perlu (setara find-and-replace), **jangan menimpa seluruh file**.
- Setelah selesai, laporkan **setiap perubahan dengan format Langkah di atas**
  (file, lokasi, kode yang berubah, kenapa), seolah pengguna harus melakukannya sendiri.
  Pengguna harus bisa membaca laporanmu dan memahami diff tanpa membuka editor.

### File baru

File baru memang harus dibuat, tetapi **jangan menjatuhkan seluruh isinya sekaligus**:

- Beri tahu path dan **tujuan file** dalam 1 kalimat.
- Bangun **bertahap per bagian** (kerangka dulu: impor + tipe, lalu satu fungsi/blok per langkah), tiap blok
  sekitar 30-40 baris dengan "Kenapa" singkatnya sendiri. Boleh digabung jadi satu blok hanya jika
  file-nya sangat kecil (kurang dari ~25 baris).
- Jelaskan **mengapa file ini ditaruh di modul/folder itu** (merujuk aturan dependensi di bagian 4).

### Pengecualian (sempit)

Boleh membuat/menulis ulang file utuh **hanya jika** pengguna secara eksplisit berkata
"tulis ulang / generate seluruh file". Meski begitu: **konfirmasi sekali dahulu**
("Ini akan menimpa seluruh `X`. Yakin? Atau mau saya tunjukkan bagian yang berubah saja?"), dan sertakan
ringkasan perubahan per bagian setelahnya.

### Contoh

Baik:

````
Penyebab: tugas baru tidak tersimpan karena `hours` masih berupa teks.

**Langkah 1: `src/modules/tasks/types.ts`**
Lokasi: cari `export type Task = {` (sekitar baris 3)
Aksi: TAMBAHKAN SETELAH baris `priority: TaskPriority;`

  notes?: string;

Kenapa: tanda `?` membuat field ini opsional, jadi tugas lama di browser pengguna tetap valid.

**Langkah 2: `src/modules/tasks/components/task-form.tsx`**
Lokasi: cari `<Field label="Prioritas">` (sekitar baris 118)
Aksi: TAMBAHKAN SETELAH blok `</Field>` yang menutupnya

  <Field label="Catatan">
    <input className={inputClass} value={value.notes ?? ""}
      onChange={(e) => set("notes", e.target.value)} />
  </Field>

Kenapa: `set` adalah fungsi bawaan form ini untuk mengubah satu field; `?? ""` mencegah error saat catatan masih kosong.

Cek: jalankan `npm run typecheck`. Pola `set(...)` yang sama dipakai di `modules/courses/components/course-form.tsx`.
````

Buruk (jangan ditiru): menempelkan seluruh `task-form.tsx` (±150 baris) dengan komentar
"berikut versi lengkapnya", tanpa menunjukkan baris mana yang berubah.

---

## 1. Ringkasan proyek

- Aplikasi manajemen tugas & jadwal kuliah untuk mahasiswa (nama: nugas.in).
- Stack: Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, framer-motion, lucide-react.
- Data disimpan di `localStorage` (tanpa database). Backup opsional ke Google Drive.
- Rekomendasi waktu dari AI (Gemini) lewat Server Action.
- Bahasa: **teks UI dan komentar dalam Bahasa Indonesia**, **nama variabel/fungsi/file dalam Bahasa Inggris**.
- URL rute tetap Indonesia: `/`, `/jadwal`, `/pengaturan`, `/rekomendasi`. Jangan diubah.

## 2. Perintah

```bash
npm run typecheck             # tsc --noEmit        (WAJIB hijau)
npm run check:architecture    # penjaga batas modul (WAJIB hijau)
npm run build                 # build produksi
npm run dev                   # server pengembangan
```

Setelah setiap perubahan kode, jalankan `typecheck` dan `check:architecture`.
Jangan menyatakan pekerjaan selesai sebelum keduanya lolos.
`next.config.mjs` memiliki `ignoreBuildErrors`, jadi **`next build` saja tidak cukup** untuk menangkap error tipe.

## 3. Struktur folder

```
src/
├── app/            Rute Next.js. TIPIS: hanya memasang komponen dari modul.
├── app-shell/      Sidebar, header, dan pemasangan semua provider (composition root).
├── modules/
│   ├── tasks/            tugas: data, form, daftar, lencana deadline, pengingat
│   ├── courses/          mata kuliah: data, form, halaman daftar, warna
│   ├── settings/         nama, jam tidur, tema
│   ├── scheduling/       algoritma EDF + kalender mingguan
│   ├── recommendation/   rekomendasi AI (Gemini)
│   ├── backup/           Google Drive + info penyimpanan lokal
│   ├── notifications/    toast
│   └── dashboard/        halaman utama (hanya menyusun tasks + scheduling)
└── shared/         Alat umum tanpa pengetahuan bisnis: ui/, hooks/, lib/
```

Isi standar sebuah modul:

```
modules/<nama>/
├── index.ts               API PUBLIK, satu-satunya pintu masuk bagi modul lain
├── types.ts               tipe data milik modul
├── <nama>-context.ts      (opsional) context + hook, bila perlu dipisah dari provider
├── <nama>-provider.tsx    state + persistensi
└── components/            UI milik modul
```

## 4. Aturan dependensi (DITEGAKKAN OTOMATIS)

Sumber kebenaran: konstanta `ALLOWED` di `scripts/check-architecture.mjs`.

| Modul | Boleh memakai |
|---|---|
| notifications, settings, courses | (tidak ada) |
| tasks | courses, notifications |
| scheduling | tasks, courses, settings, notifications |
| recommendation | tasks, courses, settings |
| backup | tasks, courses, settings, notifications |
| dashboard | tasks, scheduling |

Lapisan: `courses/settings/notifications` (1) → `tasks` (2) → `scheduling` (3) → `dashboard/recommendation/backup` (4). Hanya boleh bergantung **ke bawah**. Tidak boleh ada lingkaran.

### Aturan keras

1. **Import modul lain hanya lewat API publik:** `@/modules/<nama>`.
   DILARANG: `@/modules/tasks/components/task-list`.
2. **Hanya export dari `index.ts` apa yang memang dibutuhkan modul lain.** Yang tidak di-export = privat.
3. **`shared/` tidak boleh mengimpor** `modules/`, `app-shell/`, atau `app/`.
4. **Modul tidak boleh mengimpor** `app-shell/` atau `app/`.
5. **Di dalam modul, pakai import relatif** (`./`, `../`). **Ke luar modul, pakai alias `@/`.** Import relatif tidak boleh keluar dari modulnya.
6. **Data dimiliki modulnya.** Hanya `tasks` yang membaca/menulis `localStorage` tugas, dst. Modul lain meminta lewat hook publik (`useTasks()`, `useCourses()`, `useSettings()`).
7. **Komponen di luar provider tidak boleh menyentuh `localStorage` langsung.** Gunakan `usePersistentState` di dalam provider.
8. `app/` hanya berisi `page.tsx` / `layout.tsx` tipis. **Jangan taruh logika bisnis di sana.**
9. `shared/` tidak memakai barrel (`index.ts`): import langsung per file (`@/shared/ui/modal`).

### Jika butuh sesuatu dari modul yang tidak boleh diimpor

Jangan melonggarkan `ALLOWED` begitu saja. Pilih salah satu, urut dari yang paling disukai:

1. **Props**: komponen induk (mis. `dashboard`) mengambil data dari kedua modul lalu memberikannya lewat props.
   Contoh: `TaskList` menerima `limitedTaskIds` dari `dashboard`, karena `tasks` tidak boleh mengimpor `scheduling`.
2. **Event**: modul pemilik memancarkan event lewat `createEmitter` (`shared/lib/emitter.ts`), modul lain mendengarkan.
   Contoh: `courses` memancarkan `onCourseDeleted`, `tasks` bereaksi.
3. **Tipe struktural**: definisikan tipe minimal sendiri (lihat `SchedulableTask` di `scheduling/schedule.ts`), jangan impor tipe modul lain.
4. **Pindahkan kode ke `shared/`** hanya bila ia benar-benar generik dan bebas logika bisnis.
5. Mengubah `ALLOWED` adalah **keputusan arsitektur**. Lakukan hanya bila diminta, dan jelaskan alasannya.

## 5. Konvensi kode

### Umum
- TypeScript ketat. **Dilarang `any`** (satu-satunya pengecualian yang ada: `window.google` di `backup/google-drive.ts`). Jangan menambah `@ts-ignore`.
- Komponen React: **function component** dengan **named export** (`export function TaskForm`). `default export` hanya untuk `page.tsx` / `layout.tsx`.
- Tambahkan `"use client";` di file yang memakai hook, state, atau event browser. Server Action memakai `"use server";`.
- Nama file: `kebab-case` (`task-form.tsx`). Komponen/tipe: `PascalCase`. Fungsi/variabel: `camelCase`. Konstanta global: `UPPER_SNAKE_CASE`.
- Satu komponen utama per file. Pecah bila file melewati sekitar 150 baris atau mencampur beberapa tanggung jawab.
- Hindari singkatan membingungkan (`mins`, `PH`, `dt`). Tulis `minutesOfDay`, `HOUR_HEIGHT`, `dateTime`.
- Angka/string ajaib dijadikan konstanta bernama di atas file (`const DAYS_TO_PLAN = 14`).
- Komentar menjelaskan **mengapa** atau memberi gambaran besar, dalam Bahasa Indonesia. Jangan mengomentari hal yang sudah jelas dari kode.
- Format: Prettier default (tanda kutip ganda, titik koma, indent 2 spasi).

### State & provider
- Setiap modul berdata punya `<Nama>Provider` + hook `use<Nama>()` yang melempar error bila dipakai di luar provider.
- Persistensi **selalu** lewat `usePersistentState(key, initial, normalize)` dari `shared/hooks/use-persistent-state.ts`.
  `normalize` didefinisikan **di luar komponen** (identitas stabil) dan mengembalikan `undefined` bila data tidak valid.
- Kunci `localStorage` **hanya** didefinisikan di `shared/lib/storage-keys.ts`.
- Provider mengekspos `ready: boolean`. `AppShell` menunggu semua `ready` sebelum merender halaman. Jangan membaca `localStorage` saat render.
- Urutan provider di `app-shell/app-providers.tsx` penting: **sebuah provider hanya boleh memakai provider yang membungkusnya**.
  Urutan saat ini: `Now → Notifications → Settings → Courses → Tasks → Scheduling`.
- Mengubah state memakai bentuk fungsional (`setX(list => ...)`), tidak memutasi array/objek.
- Waktu "sekarang" selalu dari `useNow()` (`shared/hooks/use-now.tsx`). **Jangan** memanggil `new Date()` di komponen untuk logika tampilan, dan jangan membuat `setInterval` sendiri.

### UI
- Style yang berulang diambil dari `shared/ui/styles.ts` (`card`, `inputClass`, `primaryButton`, `secondaryButton`). Jangan menyalin ulang string class panjang.
- Gabungkan class kondisional dengan `cn()` dari `@/shared/lib/utils`.
- Dialog form memakai `Modal`; pasangan label+input memakai `Field`; judul bagian memakai `SectionTitle`.
- Dukung mode gelap: setiap warna latar/teks baru perlu varian `dark:`.
- Tombol berisi ikon saja **wajib** punya `aria-label` (Bahasa Indonesia).
- Ikon dari `lucide-react`. Animasi dari `framer-motion`, kurva dari `EASE` (`shared/ui/motion.ts`).
- Tampilan harus tetap responsif (cek perilaku di layar kecil; sidebar jadi laci di bawah `lg`).

### Server vs klien
- Kode yang menyentuh `GEMINI_API_KEY` **hanya** di `modules/recommendation/server/`. Jangan diimpor dari komponen `"use client"`, kecuali Server Action `get-task-recommendation.ts` (file `"use server"` hanya boleh meng-export fungsi `async`).
- Variabel lingkungan baru wajib dicatat di `.env.example`. Hanya yang berawalan `NEXT_PUBLIC_` yang boleh dibaca di kode klien.
- Jangan pernah menaruh rahasia/API key di kode atau di `NEXT_PUBLIC_*`.

### Algoritma penjadwalan
- `modules/scheduling/schedule.ts` harus tetap **murni**: tanpa React, tanpa `localStorage`, tanpa impor modul lain. Menerima data, mengembalikan hasil.
- Jangan mengubah perilaku algoritma (EDF, jam tidur, pembulatan 15 menit, batas deadline) tanpa diminta. Jika diubah, buktikan dengan pengujian terhadap versi sebelumnya.

## 6. Kompatibilitas data (jangan dirusak)

- Bentuk `Task`, `Course`, `Settings` tersimpan di perangkat pengguna dan di file backup Google Drive. **Mengubah bentuk yang sudah ada dapat merusak data pengguna.**
- Menambah field baru: buat **opsional** (`field?: ...`) atau beri nilai default di `normalize`. Jangan mengganti nama/menghapus field tanpa migrasi.
- Format `BackupData` (`{ tasks, courses, settings }`) harus tetap kompatibel dengan backup lama.
- `app-shell/migrate-legacy-storage.ts` memindahkan kunci lama `nugas-in:v1`. Jangan dihapus selama masih ada kemungkinan pengguna lama.

## 7. Resep tugas umum

### Menambah field pada `Task`
1. Tambahkan ke `modules/tasks/types.ts` (opsional atau dengan default).
2. Tambahkan input di `tasks/components/task-form.tsx` (+ validasi di `submit`).
3. Tampilkan di `tasks/components/task-list.tsx` bila perlu.
4. Jika ikut ke AI: perbarui `RecommendationPayload` dan `build-payload.ts`.
5. `npm run typecheck` dan `npm run check:architecture`.

### Menambah modul baru (contoh: `notes`)
1. Buat `src/modules/notes/` dengan `index.ts`, `types.ts`, provider (+ hook), dan `components/`.
2. Daftarkan di `ALLOWED` pada `scripts/check-architecture.mjs` dengan daftar modul yang dipakainya (seminimal mungkin, tanpa lingkaran).
3. Jika punya state: pasang provider di `app-shell/app-providers.tsx` di posisi yang tepat; tambah kunci di `shared/lib/storage-keys.ts`; sertakan `ready` di gerbang `AppShell`.
4. Tambah rute tipis `src/app/notes/page.tsx` dan item di `app-shell/nav-items.ts`.
5. Jalankan `typecheck` dan `check:architecture`. Perbarui tabel di `ARCHITECTURE.md` dan file ini.

### Menambah halaman baru dari modul yang ada
Buat komponen halaman di modulnya, export lewat `index.ts`, lalu `page.tsx` tipis di `src/app/<rute>/`.

### Mengubah UI bersama (Modal, Field, dsb.)
Ubah di `shared/ui/`, lalu periksa **semua** pemakainya (`grep` nama komponen). Jangan menduplikasi.

## 8. Yang JANGAN dilakukan

- Jangan membuat `DataProvider` global atau satu store raksasa lagi.
- Jangan import lintas modul lewat path dalam (`@/modules/x/...`).
- Jangan menambah dependensi npm tanpa diminta. Bila perlu, jelaskan alasannya dan alternatif tanpa dependensi.
- Jangan menonaktifkan/menghapus `check:architecture` atau melonggarkan aturannya agar "lolos".
- Jangan mematikan `typecheck`, menambah `any`, atau `eslint-disable`/`@ts-ignore` demi lolos kompilasi.
- Jangan menaruh logika bisnis di `src/app/`.
- Jangan memakai `localStorage`/`sessionStorage` langsung di komponen.
- Jangan mengubah teks UI, URL rute, atau perilaku yang tidak berkaitan dengan permintaan.
- Jangan melakukan refactor besar yang tidak diminta saat mengerjakan tugas kecil. Sarankan di akhir jawaban.
- Jangan menghapus komentar penjelas yang masih berlaku.
- **Jangan menulis ulang atau menempelkan satu file utuh** untuk perubahan di file yang sudah ada (lihat bagian 0).
  Berikan Langkah: file, lokasi, kode yang berubah, dan alasan singkat.

## 9. Checklist sebelum menyatakan selesai

- [ ] **Tidak ada file lama yang ditulis ulang utuh**; setiap perubahan disajikan sebagai Langkah (file, lokasi, kode, kenapa) sesuai bagian 0
- [ ] Penyebab bug (jika ada) dijelaskan 1 kalimat; penjelasan tiap langkah maksimal 2 kalimat
- [ ] `npm run typecheck` lolos
- [ ] `npm run check:architecture` lolos
- [ ] Hanya file yang relevan yang diubah; perubahan tidak menyentuh modul lain tanpa alasan
- [ ] Impor lintas modul hanya lewat `@/modules/<nama>`; `index.ts` hanya mengekspos yang perlu
- [ ] Field/tipe data baru bersifat kompatibel dengan data yang sudah tersimpan
- [ ] Teks UI baru dalam Bahasa Indonesia; identifier dalam Bahasa Inggris
- [ ] Mode gelap dan layar kecil tidak rusak; tombol ikon punya `aria-label`
- [ ] Dokumen (`ARCHITECTURE.md`, `AGENTS.md`) diperbarui bila struktur/aturan berubah
- [ ] Jawaban akhir menyebut: apa yang diubah, mengapa, dan apa yang **tidak** bisa diverifikasi (mis. login Google Drive, panggilan Gemini asli, tampilan di browser)

## 10. Bila ragu

Ikuti pola modul yang sudah ada (`courses` adalah contoh paling sederhana, `tasks` contoh dengan
dependensi lintas modul). Bila permintaan bertentangan dengan aturan di atas, **jelaskan konfliknya
dan tawarkan alternatif yang patuh aturan** sebelum menulis kode.
Jika pengguna tampak bingung, perlambat: jelaskan konsepnya dalam beberapa kalimat sederhana,
tunjuk file contoh di proyek, lalu lanjutkan dengan Langkah kecil, bukan dengan kode dalam jumlah besar.
