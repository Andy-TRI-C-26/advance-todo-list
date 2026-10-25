"use client";
import { card, inputClass } from "@/shared/ui/styles";
import { useSettings } from "../settings-provider";

export function ProfileCard() {
  const { settings, updateSettings } = useSettings();
  return (
    <div className={card}>
      <label className="text-sm font-semibold">
        Nama kamu
        <input
          className={inputClass}
          value={settings.name}
          onChange={(e) => updateSettings({ name: e.target.value })}
        />
      </label>
    </div>
  );
}
