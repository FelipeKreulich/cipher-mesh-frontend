"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavItem = { id: string; label: string };
export type NavGroup = { id: string; label: string; items: NavItem[] };

/**
 * The complete index, grouped, at every width.
 *
 * Twelve sections in a row across the top was unreadable — a wall of 11px
 * links, all weighted the same, that nobody scans. They are the same twelve
 * sections; the grouping is what makes them findable, and it is not decorative:
 * what the thing is, whether to trust it, and how to take part are three
 * different questions, asked in that order by anyone arriving cold.
 *
 * The header keeps a handful of direct links beside this for the ones people
 * reach for first. Everything is in here either way — nothing is reachable from
 * one and not the other.
 */
export function NavMenu({
  groups,
  label,
  title,
}: {
  groups: NavGroup[];
  label: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={label}
        className="flex size-8 items-center justify-center rounded-sm text-faint transition-colors hover:text-ink"
      >
        <Menu className="size-[18px]" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-80 overflow-y-auto border-line bg-panel"
      >
        <SheetHeader>
          <SheetTitle className="font-mono text-xs tracking-wide text-faint uppercase">
            {title}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-7 px-4 pb-8">
          {groups.map((group) => (
            <div key={group.id}>
              <p className="font-mono text-[10px] tracking-[0.16em] text-line-2 uppercase">
                {group.label}
              </p>
              <div className="mt-2 flex flex-col">
                {group.items.map((item) => (
                  <SheetClose key={item.id} asChild>
                    <a
                      href={`#${item.id}`}
                      className="border-b border-line/60 py-2.5 font-mono text-sm text-dim transition-colors last:border-b-0 hover:text-ink"
                    >
                      <span className="text-signal-soft select-none">› </span>
                      {item.label}
                    </a>
                  </SheetClose>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
