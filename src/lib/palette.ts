import { getTranslations } from "next-intl/server";

import type { PaletteData } from "@/components/site/command-palette";
import { changelog } from "@/lib/changelog";
import { anchor, commandReference } from "@/lib/commands";

/**
 * Everything the palette can jump to, assembled on the server.
 *
 * Built here rather than fetched by the palette so opening it costs nothing and
 * works identically on every page — including `/status`, which fetches none of
 * this for itself. Both sources are already revalidated hourly, so this adds no
 * real work to a render.
 */

const SECTIONS = [
  "replay",
  "what",
  "security",
  "verify",
  "limits",
  "versus",
  "start",
  "community",
  "controls",
  "plugins",
  "open",
  "support",
] as const;

export async function paletteData(): Promise<PaletteData> {
  const t = await getTranslations("nav");
  const [reference, { releases }] = await Promise.all([
    commandReference(),
    changelog(),
  ]);

  return {
    sections: SECTIONS.map((key) => ({
      id: key,
      label: t(key),
      href: `/#${key}`,
    })),

    commands: reference.groups.flatMap((group) =>
      group.commands.map((command) => ({
        id: command.name,
        label: command.name,
        // Trimmed hard: the palette is a list of one-line rows, and a long
        // description pushes the command itself off a narrow screen.
        hint: command.summary.replace(/[`*_]/g, "").slice(0, 70),
        href: `/commands#${anchor(command.name)}`,
      })),
    ),

    releases: releases
      .filter((release) => !release.summary)
      .slice(0, 12)
      .map((release) => ({
        id: release.version,
        label: release.version,
        hint: release.changes[0]?.kind ?? "",
        href: "/changelog",
      })),
  };
}
