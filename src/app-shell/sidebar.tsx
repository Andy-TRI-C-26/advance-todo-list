"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useSettings } from "@/modules/settings";
import { AppLogo } from "./app-logo";
import { FocusCard } from "./focus-card";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean; // hanya berpengaruh di layar kecil
  onClose: () => void;
}) {
  const path = usePathname();
  const { settings } = useSettings();
  const initials =
    settings.name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="mb-10 flex items-center justify-between px-2">
        <AppLogo />
        <button className="lg:hidden" onClick={onClose} aria-label="Tutup menu">
          <X />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors",
              path === href
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        ))}
      </nav>

      <FocusCard />

      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
        <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{settings.name}</p>
          <p className="truncate text-xs text-slate-400">Mahasiswa aktif</p>
        </div>
      </div>
    </aside>
  );
}
