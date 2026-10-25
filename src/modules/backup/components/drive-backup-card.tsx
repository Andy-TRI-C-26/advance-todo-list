"use client";
import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { card, primaryButton, secondaryButton } from "@/shared/ui/styles";
import { useSettings } from "@/modules/settings";
import { useToast } from "@/modules/notifications";
import { downloadBackup, signIn, uploadBackup } from "../google-drive";
import { useBackupData } from "../use-backup-data";

export function DriveBackupCard() {
  const { settings, updateSettings } = useSettings();
  const { snapshot, restore } = useBackupData();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /** Jalankan aksi sambil menampilkan status "sibuk" dan menangkap error. */
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  const connect = () =>
    run(async () => {
      await signIn();
      updateSettings({ driveConnected: true });
    });

  const backupNow = () =>
    run(async () => {
      await uploadBackup(snapshot);
      updateSettings({ lastBackup: new Date().toISOString() });
      toast("Backup ke Google Drive berhasil.", "success");
    });

  const restoreFromBackup = () =>
    run(async () => {
      const data = await downloadBackup();
      if (!data) throw new Error("Belum ada backup di Google Drive.");
      restore(data);
      toast("Data berhasil dipulihkan dari Google Drive.", "success");
    });

  return (
    <div className={card}>
      <div className="flex items-start gap-4">
        <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          <CloudUpload className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Backup & sinkronisasi Google Drive</p>
          <p className="mt-1 text-sm text-slate-500">
            Status:{" "}
            <b>{settings.driveConnected ? "Terhubung" : "Belum terhubung"}</b>
            {settings.lastBackup &&
              ` · backup terakhir ${new Date(settings.lastBackup).toLocaleString("id-ID")}`}
          </p>
          {settings.driveConnected && (
            <p className="mt-1 text-xs text-slate-400">
              Sesi login berlaku sekitar 1 jam. Jika backup/pulihkan gagal, klik
              &quot;Hubungkan ulang&quot;.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className={secondaryButton}
              disabled={busy}
              onClick={connect}
            >
              {settings.driveConnected
                ? "Hubungkan ulang"
                : "Hubungkan Google Drive"}
            </button>
            <button
              className={primaryButton}
              disabled={busy}
              onClick={backupNow}
            >
              Backup sekarang
            </button>
            <button
              className={secondaryButton}
              disabled={busy}
              onClick={restoreFromBackup}
            >
              Pulihkan dari backup
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
