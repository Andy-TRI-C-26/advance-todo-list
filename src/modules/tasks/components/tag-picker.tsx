"use client";
import { cn } from "@/shared/lib/utils";
import { TASK_TAGS } from "../types";

/** Deretan tombol tag yang bisa dinyalakan/dimatikan (boleh pilih lebih dari satu). */
export function TagPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (tag: string) =>
    onChange(
      value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag],
    );

  return (
    <div>
      <p className="text-sm font-medium">Tag</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TASK_TAGS.map((tag) => {
          const active = value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(tag)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600",
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
