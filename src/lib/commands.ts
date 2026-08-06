import snapshot from "@/lib/commands.snapshot.json";
import { upstream } from "@/lib/upstream";

/**
 * The command reference, read from the client repository.
 *
 * `docs/commands.json` there is generated from the `case '/x':` labels in the
 * two controllers, so it cannot fall behind the code — which is the entire
 * reason this page can exist without becoming a lie six releases from now. The
 * committed snapshot is only there so a GitHub hiccup costs freshness instead
 * of the page.
 */

export type Mode = "relay" | "p2p";

export type Command = {
  name: string;
  args: string;
  summary: string;
  modes: Mode[];
};

export type CommandGroup = {
  id: string;
  name: string;
  commands: Command[];
};

export type Reference = {
  counts: { total: number; relay: number; p2p: number };
  groups: CommandGroup[];
  /** False when the upstream copy could not be read and the snapshot is in use. */
  live: boolean;
};

function shaped(value: unknown): Omit<Reference, "live"> | null {
  const data = value as Partial<Reference>;
  if (!data || typeof data !== "object") return null;
  if (!Array.isArray(data.groups) || data.groups.length === 0) return null;
  if (!data.counts || typeof data.counts.total !== "number") return null;
  return { counts: data.counts, groups: data.groups };
}

export async function commandReference(): Promise<Reference> {
  const raw = await upstream("docs/commands.json");

  if (raw) {
    try {
      const parsed = shaped(JSON.parse(raw));
      if (parsed) return { ...parsed, live: true };
    } catch {
      // Malformed upstream is the same situation as unreachable upstream.
    }
  }

  return { ...(shaped(snapshot) as Omit<Reference, "live">), live: false };
}

/** `/verify` → `verify`, so a command is linkable as `/commands#verify`. */
export const anchor = (name: string) => name.replace(/^\//, "");
