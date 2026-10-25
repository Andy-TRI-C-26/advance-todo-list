import { DriveBackupCard, LocalDataCard } from "@/modules/backup";
import { ProfileCard, SleepHoursNotice } from "@/modules/settings";
import { SectionTitle } from "@/shared/ui/section-title";

// Halaman ini menyusun kartu dari dua modul: settings dan backup.
export default function Page() {
  return (
    <section className="max-w-3xl">
      <SectionTitle eyebrow="Preferensi" title="Pengaturan & penyimpanan" />
      <div className="mt-5 flex flex-col gap-4">
        <ProfileCard />
        <LocalDataCard />
        <DriveBackupCard />
        <SleepHoursNotice />
      </div>
    </section>
  );
}
