import { cn } from "@/shared/lib/utils";
import { card } from "@/shared/ui/styles";

export function StatCard({
  label,
  icon,
  tint,
  value,
  note,
}: {
  label: string;
  icon: React.ReactNode;
  tint: string; // class warna latar ikon
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className={card}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <div className={cn("grid size-9 place-items-center rounded-xl", tint)}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </div>
  );
}
