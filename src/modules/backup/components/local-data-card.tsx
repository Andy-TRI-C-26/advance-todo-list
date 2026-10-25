"use client";
import { Cloud } from "lucide-react";
import { card } from "@/shared/ui/styles";
import { useBackupData } from "../use-backup-data";

export function LocalDataCard() {
  const { snapshot, clearAll } = useBackupData();
  const sizeKb = (new Blob([JSON.stringify(snapshot)]).size / 1024).toFixed(1);

  return (
    <div className={card}>
      <div className="flex items-start gap-4">
        <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <Cloud className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">Penyimpanan lokal</p>
          <p className="mt-1 text-sm text-slate-500">
            Data tersimpan otomatis di browser ini ({snapshot.tasks.length}{" "}
            tugas, {snapshot.courses.length} jadwal, {sizeKb} KB).
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Aktif ·
            Offline mode
          </span>
          <div className="mt-3">
            <button
              className="text-xs text-red-500 underline"
              onClick={() =>
                confirm("Hapus semua tugas dan jadwal?") && clearAll()
              }
            >
              Hapus semua data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
