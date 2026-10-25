// Penjaga arsitektur modular monolith. Jalankan: npm run check:architecture
//
// Tanpa dependensi tambahan. Skrip membaca semua import di folder `src/`
// lalu memastikan aturan berikut tidak dilanggar:
//
//   1. Modul hanya boleh import modul lain lewat API publiknya: "@/modules/<nama>"
//      (bukan "@/modules/<nama>/components/..." dsb).
//   2. Modul hanya boleh bergantung pada modul yang tercantum di ALLOWED di bawah.
//   3. `shared` tidak boleh import modul, app-shell, atau app.
//   4. Modul tidak boleh import `app-shell` atau `app`.
//   5. Import relatif ("../x") tidak boleh keluar dari modulnya sendiri.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const SRC = resolve("src");

// Siapa boleh bergantung pada siapa. Edit di sini saat menambah modul baru.
// Daftar ini harus membentuk "tangga" tanpa lingkaran (A -> B -> A dilarang).
const ALLOWED = {
  notifications: [],
  settings: [],
  courses: [],
  tasks: ["courses", "notifications"],
  scheduling: ["tasks", "courses", "settings", "notifications"],
  recommendation: ["tasks", "courses", "settings"],
  backup: ["tasks", "courses", "settings", "notifications"],
  dashboard: ["tasks", "scheduling"],
};

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listFiles(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

/** "src/modules/tasks/x.ts" -> { layer: "module", name: "tasks" } */
function unitOf(absPath) {
  const [top, second] = relative(SRC, absPath).split(sep);
  if (top === "modules") return { layer: "module", name: second };
  return { layer: top, name: top }; // shared | app-shell | app
}

const IMPORT_RE =
  /(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const errors = [];
const fail = (file, spec, why) =>
  errors.push(
    `  ${relative(process.cwd(), file)}\n    import "${spec}"\n    -> ${why}`,
  );

for (const file of listFiles(SRC)) {
  const me = unitOf(file);
  if (me.layer === "module" && !(me.name in ALLOWED)) {
    errors.push(
      `  src/modules/${me.name} belum terdaftar di ALLOWED (scripts/check-architecture.mjs)`,
    );
    continue;
  }

  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(IMPORT_RE)) {
    const spec = match[1] ?? match[2] ?? match[3];

    // Ubah import relatif menjadi alias "@/..." agar diperiksa dengan aturan yang sama
    let target = spec;
    if (spec.startsWith(".")) {
      const abs = resolve(file, "..", spec);
      target = "@/" + relative(SRC, abs).split(sep).join("/");
      const there = unitOf(abs);
      if (there.layer !== me.layer || there.name !== me.name) {
        fail(
          file,
          spec,
          "import relatif tidak boleh keluar dari modul/folder sendiri; pakai alias @/",
        );
        continue;
      }
    }
    if (!target.startsWith("@/")) continue; // paket npm / next / react

    const [, layerName, moduleName, ...rest] = target.split("/"); // "@", "modules", "tasks", ...
    const targetLayer = layerName;

    if (me.layer === "shared") {
      if (["modules", "app-shell", "app"].includes(targetLayer))
        fail(
          file,
          spec,
          "`shared` tidak boleh bergantung pada modul, app-shell, atau app",
        );
      continue;
    }

    if (me.layer === "module") {
      if (["app-shell", "app"].includes(targetLayer)) {
        fail(file, spec, "modul tidak boleh mengimpor app-shell atau app");
        continue;
      }
      if (targetLayer !== "modules" || moduleName === me.name) continue;

      if (!ALLOWED[me.name].includes(moduleName))
        fail(
          file,
          spec,
          `modul "${me.name}" tidak boleh bergantung pada "${moduleName}" (lihat ALLOWED)`,
        );
      else if (rest.length > 0)
        fail(
          file,
          spec,
          `import lewat API publik: "@/modules/${moduleName}" (jangan masuk ke dalam foldernya)`,
        );
      continue;
    }

    // app-shell dan app boleh memakai semua modul, tetapi tetap lewat API publik
    if (targetLayer === "modules" && rest.length > 0)
      fail(file, spec, `import lewat API publik: "@/modules/${moduleName}"`);
  }
}

if (errors.length) {
  console.error(
    `\nArsitektur dilanggar (${errors.length}):\n\n${errors.join("\n\n")}\n`,
  );
  process.exit(1);
}
console.log("Arsitektur OK: semua modul mematuhi aturan dependensi.");
