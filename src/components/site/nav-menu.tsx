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

/**
 * The full nav needs a wide viewport to fit nine sections, so below that the
 * same list lives here. It is one list either way — no section is reachable
 * from one and not the other.
 */
export function NavMenu({
  items,
  label,
  title,
}: {
  items: NavItem[];
  label: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={label}
        className="flex size-8 items-center justify-center rounded-sm text-faint transition-colors hover:text-ink xl:hidden"
      >
        <Menu className="size-[18px]" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent side="right" className="w-72 border-line bg-panel">
        <SheetHeader>
          <SheetTitle className="font-mono text-xs tracking-wide text-faint uppercase">
            {title}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col px-4 pb-6">
          {items.map((item) => (
            <SheetClose key={item.id} asChild>
              <a
                href={`#${item.id}`}
                className="border-b border-line/60 py-3 font-mono text-sm text-dim transition-colors last:border-b-0 hover:text-ink"
              >
                <span className="text-signal-soft select-none">› </span>
                {item.label}
              </a>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
