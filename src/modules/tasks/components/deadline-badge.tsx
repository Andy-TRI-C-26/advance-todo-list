import { cn } from "@/shared/lib/utils";
import { daysLeft, hoursLeft } from "../deadline";

/** Lencana sisa waktu: merah (< 24 jam), kuning (<= 3 hari), hijau (aman). */
export function DeadlineBadge({
  deadline,
  now,
}: {
  deadline: string;
  now: Date;
}) {
  const hours = hoursLeft(deadline, now);
  const days = daysLeft(deadline, now);

  const label =
    hours < 0
      ? "Terlewat"
      : hours < 24
        ? `${Math.max(1, Math.ceil(hours))} jam`
        : `H-${days}`;

  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        hours < 24
          ? "bg-red-100 text-red-700"
          : days <= 3
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700",
      )}
    >
      {label}
    </span>
  );
}
