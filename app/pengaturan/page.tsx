"use client";
import { useState } from "react";
import { Cloud, CloudUpload, Moon } from "lucide-react";
import { useData } from "@/lib/store";
import { backup, masuk, pulihkan } from "@/lib/drive";
import { SectionTitle, inp } from "@/components/common";

const card =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900";
const btn =
  "rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60";
const btn2 =
  "rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold dark:border-slate-700";

export default function SettingsPage() {
  const { data, setSettings, replaceAll, reset, toast } = useData();
  const [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  const s = data.settings;
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  }
  const connect = () =>
    run(async () => {
      await masuk();
      setSettings({ driveConnected: true });
    });
  const up = () =>
    run(async () => {
      await backup(data);
      setSettings({ lastBackup: new Date().toISOString() });
      toast("Backup ke Google Drive berhasil.", "success");
    });
  const down = () =>
    run(async () => {
      const d = await pulihkan();
      if (!d) throw new Error("Belum ada backup di Google Drive.");
      replaceAll(d);
      toast("Data berhasil dipulihkan dari Google Drive.", "success");
    });
  return (
    <section className="max-w-3xl">
      <SectionTitle eyebrow="Preferensi" title="Pengaturan & penyimpanan" />
      <div className="mt-5 flex flex-col gap-4">
        <div className={card}>
          <label className="text-sm font-semibold">
            Nama kamu
            <input
              className={inp}
              value={s.name}
              onChange={(e) => setSettings({ name: e.target.value })}
            />
          </label>
        </div>
        <div className={card}>
          <div className="flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <Cloud className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Penyimpanan lokal</p>
              <p className="mt-1 text-sm text-slate-500">
                Data tersimpan otomatis di browser ini ({data.tasks.length}{" "}
                tugas, {data.courses.length} jadwal,{" "}
                {(new Blob([JSON.stringify(data)]).size / 1024).toFixed(1)} KB).
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500" /> Aktif
                · Offline mode
              </span>
              <div className="mt-3">
                <button
                  className="text-xs text-red-500 underline"
                  onClick={() =>
                    confirm("Hapus semua tugas dan jadwal?") && reset()
                  }
                >
                  Hapus semua data
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={card}>
          <div className="flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <CloudUpload className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                Backup & sinkronisasi Google Drive
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Status:{" "}
                <b>{s.driveConnected ? "Terhubung" : "Belum terhubung"}</b>
                {s.lastBackup &&
                  ` · backup terakhir ${new Date(s.lastBackup).toLocaleString("id-ID")}`}
              </p>
              {s.driveConnected && (
                <p className="mt-1 text-xs text-slate-400">
                  Sesi login berlaku sekitar 1 jam. Jika backup/pulihkan gagal,
                  klik &quot;Hubungkan ulang&quot;.
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className={btn2} disabled={busy} onClick={connect}>
                  {s.driveConnected
                    ? "Hubungkan ulang"
                    : "Hubungkan Google Drive"}
                </button>
                <button className={btn} disabled={busy} onClick={up}>
                  Backup sekarang
                </button>
                <button className={btn2} disabled={busy} onClick={down}>
                  Pulihkan dari backup
                </button>
              </div>
              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Moon className="size-4" /> Jam tidur wajib
          </p>
          <p className="mt-2 text-sm text-amber-800/80 dark:text-amber-200/70">
            Auto-scheduler tidak mengalokasikan tugas pada pukul{" "}
            <strong>
              {s.sleepStart.replace(":", ".")} – {s.sleepEnd.replace(":", ".")}
            </strong>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
