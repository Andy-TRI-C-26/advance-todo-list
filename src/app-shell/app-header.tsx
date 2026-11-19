"use client";
import { flushSync } from "react-dom";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun } from "lucide-react";
import { useNow } from "@/shared/hooks/use-now";
import { useSettings } from "@/modules/settings";
import { NAV_ITEMS } from "./nav-items";

const iconButton =
  "grid size-10 place-items-center rounded-xl border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#8dd3c7] hover:text-[#16324f] dark:border-slate-800 dark:bg-slate-900";

type ThemeReveal = {
  id: number;
  x: number;
  y: number;
  radius: number;
  dark: boolean;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    finished: Promise<void>;
  };
};

type ScrollLock = {
  documentOverflow: string;
  bodyOverflow: string;
};

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
  const [themeReveal, setThemeReveal] = useState<ThemeReveal | null>(null);
  const isThemeTransitioning = useRef(false);
  const scrollLock = useRef<ScrollLock | null>(null);

  const title =
    NAV_ITEMS.find((item) => item.href === path)?.label ?? "nugas.in";
  const firstName = settings.name.split(" ")[0];

  function lockScroll() {
    if (scrollLock.current) return;

    scrollLock.current = {
      documentOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
    };
    document.documentElement.dataset.themeScrollLock = "true";
  }

  function unlockScroll() {
    if (!scrollLock.current) return;

    document.documentElement.style.overflow =
      scrollLock.current.documentOverflow;
    document.body.style.overflow = scrollLock.current.bodyOverflow;
    delete document.documentElement.dataset.themeScrollLock;
    scrollLock.current = null;
  }

  function toggleTheme(event: React.MouseEvent<HTMLButtonElement>) {
    if (isThemeTransitioning.current) return;

    const nextDark = !settings.dark;
    isThemeTransitioning.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updateSettings({ dark: nextDark });
      isThemeTransitioning.current = false;
      return;
    }

    const buttonBounds = event.currentTarget.getBoundingClientRect();
    const x = buttonBounds.left + buttonBounds.width / 2;
    const y = buttonBounds.top + buttonBounds.height / 2;
    const radius = Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y),
    );

    const root = document.documentElement;
    const viewTransitionDocument = document as ViewTransitionDocument;
    lockScroll();

    if (viewTransitionDocument.startViewTransition) {
      root.dataset.themeTransition = "reveal";
      root.style.setProperty("--theme-reveal-x", `${x}px`);
      root.style.setProperty("--theme-reveal-y", `${y}px`);
      root.style.setProperty("--theme-reveal-radius", `${radius}px`);

      const cleanup = () => {
        delete root.dataset.themeTransition;
        root.style.removeProperty("--theme-reveal-x");
        root.style.removeProperty("--theme-reveal-y");
        root.style.removeProperty("--theme-reveal-radius");
        unlockScroll();
        isThemeTransitioning.current = false;
      };

      viewTransitionDocument.startViewTransition(() => {
        flushSync(() => updateSettings({ dark: nextDark }));
      }).finished.then(cleanup, cleanup);
      return;
    }

    setThemeReveal({ id: Date.now(), x, y, radius, dark: nextDark });
  }

  return (
    <>
      <header data-theme-header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200/80 bg-[#f4f6f8]/90 px-5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden"
            onClick={onOpenMenu}
            aria-label="Buka menu"
          >
            <Menu />
          </button>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Selamat {greetingFor(now.getHours())}, {firstName}
            </p>
            <h1
              data-page-heading
              tabIndex={-1}
              className="text-lg font-bold outline-none"
            >
              {title}
            </h1>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={iconButton}
          aria-label="Ganti tema"
          disabled={themeReveal !== null}
        >
          {settings.dark ? (
            <Sun className="size-[18px]" />
          ) : (
            <Moon className="size-[18px]" />
          )}
        </button>
      </header>
      {themeReveal && (
        <div
          key={themeReveal.id}
          aria-hidden="true"
          className="theme-reveal fixed inset-0 z-50 pointer-events-none"
          onAnimationEnd={() => {
            updateSettings({ dark: themeReveal.dark });
            setThemeReveal(null);
            unlockScroll();
            isThemeTransitioning.current = false;
          }}
          style={{
            "--theme-reveal-x": `${themeReveal.x}px`,
            "--theme-reveal-y": `${themeReveal.y}px`,
            "--theme-reveal-radius": `${themeReveal.radius}px`,
            backgroundColor: themeReveal.dark ? "#020617" : "#f4f6f8",
          } as React.CSSProperties}
        />
      )}
    </>
  );
}
