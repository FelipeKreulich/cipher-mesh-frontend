import { getTranslations } from "next-intl/server";

import type { PaletteData } from "@/components/site/command-palette";
import { changelog, releaseAnchor } from "@/lib/changelog";
import { anchor, commandReference } from "@/lib/commands";

/**
 * Everything the palette can jump to, assembled on the server.
 *
 * Built here rather than fetched by the palette so opening it costs nothing and
 * works identically on every page — including `/status`, which fetches none of
 * this for itself. Both sources are already revalidated hourly, so this adds no
 * real work to a render.
 */

/**
 * Where each section actually lives.
 *
 * These twelve were once anchors on one long home page and the palette linked
 * them as `/#<id>`. Most have since moved onto routes of their own, so those
 * fragments match nothing: the browser lands on home, finds no such id, and
 * leaves you at the top of the wrong page. Nothing errors, which is why it
 * survived a redesign.
 *
 * So the destination is written out rather than derived from the id: the page
 * that renders the section, plus that section's own anchor. Move a section
 * between pages and this is the line to move with it — `palette.test.ts` fails
 * if you don't.
 *
 * `security` and `start` still appear on home too. The dedicated page wins:
 * somebody who went looking for the section by name wants the full treatment,
 * not the summary home keeps.
 */
export const paletteSections = [
  { id: "replay", href: "/#replay" },
  { id: "what", href: "/features#what" },
  { id: "security", href: "/security#security" },
  { id: "verify", href: "/security#verify" },
  { id: "limits", href: "/security#limits" },
  { id: "versus", href: "/security#versus" },
  { id: "start", href: "/getting-started#start" },
  { id: "community", href: "/getting-started#community" },
  { id: "controls", href: "/features#controls" },
  { id: "plugins", href: "/features#plugins" },
  { id: "open", href: "/features#open" },
  { id: "support", href: "/support#support" },
] as const;

export async function paletteData(): Promise<PaletteData> {
  const t = await getTranslations("nav");
  const [reference, { releases }] = await Promise.all([
    commandReference(),
    changelog(),
  ]);

  return {
    sections: paletteSections.map(({ id, href }) => ({
      id,
      label: t(id),
      href,
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
        href: `/changelog#${releaseAnchor(release.version)}`,
      })),
  };
}
