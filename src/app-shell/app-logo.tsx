import { Sparkles } from "lucide-react";

export function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Sparkles className="size-5" />
      </div>
      <span className="text-xl font-bold tracking-tight">
        nugas<span className="text-primary">.in</span>
      </span>
    </div>
  );
}
