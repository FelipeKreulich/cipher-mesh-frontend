"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/navigation";

/**
 * Ctrl+K, the same way the client has it.
 *
 * The product opens a fuzzy command palette on Ctrl+K; so does the site. That
 * is the whole argument for it — a page about a terminal tool that behaves like
 * one is making its case by being it, rather than by describing it in another
 * paragraph.
 *
 * It searches three things a visitor might be after: a section of the landing
 * page, one of the sixty-seven commands, or a release. Everything it knows is
 * passed in from the server, so opening it costs no request and it works on
 * every page including the ones that never fetch anything.
 */

export type PaletteEntry = {
  id: string;
  label: string;
  hint?: string;
  href: string;
};

export type PaletteData = {
  sections: PaletteEntry[];
  commands: PaletteEntry[];
  releases: PaletteEntry[];
};

export function CommandPalette({ data }: { data: PaletteData }) {
  const t = useTranslations("palette");
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      // Ctrl+K is a readline binding (kill to end of line) and a Firefox search
      // shortcut. Taking it is the point, but it has to be taken deliberately.
      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const groups: Array<[string, PaletteEntry[]]> = [
    ["sections", data.sections],
    ["commands", data.commands],
    ["releases", data.releases],
  ];

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("title")}
      description={t("description")}
      className="border-line bg-panel"
    >
      {/* This CommandDialog only renders a Dialog — it does not wrap its
          children in cmdk's provider, so the store every CommandItem
          subscribes to has to come from here. */}
      <Command className="bg-transparent">
        <CommandInput placeholder={t("placeholder")} />
        <CommandList>
          <CommandEmpty>{t("empty")}</CommandEmpty>
          {groups.map(([key, entries]) =>
            entries.length === 0 ? null : (
              <CommandGroup key={key} heading={t(`groups.${key}`)}>
                {entries.map((entry) => (
                  <CommandItem
                    key={`${key}:${entry.id}`}
                    // cmdk matches on this rather than on the rendered node, so
                    // the hint is searchable too — typing "wipe" should find
                    // /panic even though the word is only in its description.
                    value={`${entry.label} ${entry.hint ?? ""}`}
                    onSelect={() => go(entry.href)}
                  >
                    <span className="font-mono">{entry.label}</span>
                    {entry.hint ? (
                      <span className="truncate text-faint">{entry.hint}</span>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ),
          )}
        </CommandList>
        <div className="flex items-center justify-between border-t border-line px-3 py-2 font-mono text-[10px] text-line-2">
          <span>{t("footer")}</span>
          <CommandShortcut>esc</CommandShortcut>
        </div>
      </Command>
    </CommandDialog>
  );
}
