"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center overflow-hidden rounded-sm border border-line font-mono text-[11px]"
    >
      {routing.locales.map((value) => {
        const active = value === locale;
        return (
          <Link
            key={value}
            href={pathname}
            locale={value}
            aria-current={active ? "true" : undefined}
            className={cn(
              "px-2 py-1 uppercase transition-colors",
              active
                ? "bg-panel-2 text-wire"
                : "text-faint hover:bg-panel hover:text-ink",
            )}
          >
            {value}
          </Link>
        );
      })}
    </div>
  );
}
