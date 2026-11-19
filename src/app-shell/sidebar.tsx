"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
  const router = useRouter();
  const { settings } = useSettings();
  const reduceMotion = useReducedMotion();
  const initials =
    settings.name
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "M";
  const activeIndex = NAV_ITEMS.findIndex((item) => item.href === path);

  function navigate(href: string, event: React.MouseEvent<HTMLAnchorElement>) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      onClose();

      if (href === path) return;

      const currentIndex = NAV_ITEMS.findIndex((item) => item.href === path);
      const targetIndex = NAV_ITEMS.findIndex((item) => item.href === href);
      const direction =
        targetIndex >= currentIndex ? "forward" : "backward";

      const viewTransitionDocument = document as Document & {
        startViewTransition?: (update: () => void) => {
          finished: Promise<void>;
        };
      };

      if (
        !viewTransitionDocument.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        router.push(href);
        return;
      }

      document.documentElement.dataset.viewTransitionDirection = direction;
      const transition = viewTransitionDocument.startViewTransition(() => {
        router.push(href);
      });

      transition.finished.finally(() => {
        delete document.documentElement.dataset.viewTransitionDirection;
        document.querySelector<HTMLElement>("[data-page-heading]")?.focus();
      });
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200/80 bg-[#fbfcfd] px-4 py-6 transition-transform duration-300 ease-[cubic-bezier(.32,.72,0,1)] dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="mb-10 flex items-center justify-between px-2">
        <AppLogo />
        <button className="lg:hidden" onClick={onClose} aria-label="Tutup menu">
          <X />
        </button>
      </div>

      <nav className="relative flex flex-1 flex-col gap-1.5">
        {activeIndex >= 0 && (
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{ y: activeIndex * 50 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 34,
              mass: 0.75,
              duration: reduceMotion ? 0 : undefined,
            }}
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-11 rounded-xl bg-primary shadow-[0_8px_18px_rgba(22,50,79,0.16)]"
          />
        )}
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={(event) => navigate(href, event)}
            className="relative z-10 flex items-center gap-3 overflow-hidden rounded-xl px-3.5 py-3 text-left text-sm font-medium transition-colors duration-200"
          >
            <Icon
              className={cn(
                "relative size-[18px]",
                path === href
                  ? "text-primary-foreground"
                  : "text-slate-500 dark:text-slate-400",
              )}
            />
            <span
              className={cn(
                "relative",
                path === href
                  ? "text-primary-foreground"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {label}
            </span>
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
