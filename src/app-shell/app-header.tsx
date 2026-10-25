"use client";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun } from "lucide-react";
import { useNow } from "@/shared/hooks/use-now";
import { useSettings } from "@/modules/settings";
import { NAV_ITEMS } from "./nav-items";

const iconButton =
  "grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 dark:border-slate-800 dark:bg-slate-900";

function greetingFor(hour: number) {
  if (hour < 11) return "pagi";
  if (hour < 15) return "siang";
  if (hour < 18) return "sore";
  return "malam";
}

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const path = usePathname();
  const now = useNow();
  const { settings, updateSettings } = useSettings();

  const title =
    NAV_ITEMS.find((item) => item.href === path)?.label ?? "nugas.in";
  const firstName = settings.name.split(" ")[0];

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f6f7fb]/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden"
          onClick={onOpenMenu}
          aria-label="Buka menu"
        >
          <Menu />
        </button>
        <div>
          <p className="text-sm text-slate-500">
            Selamat {greetingFor(now.getHours())}, {firstName}
          </p>
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
      </div>
      <button
        onClick={() => updateSettings({ dark: !settings.dark })}
        className={iconButton}
        aria-label="Ganti tema"
      >
        {settings.dark ? (
          <Sun className="size-[18px]" />
        ) : (
          <Moon className="size-[18px]" />
        )}
      </button>
    </header>
  );
}
