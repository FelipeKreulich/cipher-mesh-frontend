"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const PATHS = ["hub", "lan", "internet", "selfhost"] as const;

export function SetupGuide() {
  const t = useTranslations("setup.guide");
  const [selected, setSelected] = useState<(typeof PATHS)[number]>("hub");

  return (
    <div className="mt-10 rounded-sm border border-line bg-panel p-5 sm:p-6">
      <p className="font-mono text-[11px] tracking-wide text-faint uppercase">
        {t("label")}
      </p>
      <div
        className="mt-4 flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("label")}
      >
        {PATHS.map((path) => (
          <button
            key={path}
            type="button"
            role="tab"
            aria-selected={selected === path}
            onClick={() => setSelected(path)}
            className={`rounded-sm border px-3 py-2 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${selected === path ? "border-signal-soft bg-signal/15 text-ink" : "border-line text-faint hover:text-dim"}`}
          >
            {t(`paths.${path}.name`)}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm leading-relaxed text-dim">
        {t(`paths.${selected}.body`)}
      </p>
      <code className="mt-4 block overflow-x-auto rounded-sm border border-line bg-void px-4 py-3 font-mono text-sm whitespace-nowrap text-wire">
        <span className="text-signal-soft select-none">$ </span>
        {t(`paths.${selected}.command`)}
      </code>
    </div>
  );
}
