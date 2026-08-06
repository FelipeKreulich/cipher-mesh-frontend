import { commandReference } from "@/lib/commands";
import { npmVersion } from "@/lib/site";
import { upstream } from "@/lib/upstream";

/**
 * What the site can honestly say about the state of things.
 *
 * Deliberately narrow. This page is only worth having if every line on it is
 * something actually measured from here — a green tick for something nobody
 * checked is worse than no page, because it is the page people open when they
 * already suspect something is wrong.
 *
 * Two things it does not cover, and says so: the WebSocket upgrade itself,
 * which needs a real handshake rather than an HTTP request, and the
 * certificate. Both are watched by `hub-monitor.yml` in the client repository,
 * running from GitHub rather than from the machine it is watching.
 */

export type Verdict = "ok" | "degraded" | "unknown";

export type Check = {
  id: string;
  verdict: Verdict;
  detail: string;
};

async function presence(): Promise<Check> {
  const url = process.env.PRESENCE_URL;
  if (!url) {
    return { id: "relay", verdict: "unknown", detail: "not configured" };
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!res.ok) {
      return { id: "relay", verdict: "degraded", detail: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { online?: string };
    // The relay answering at all is the signal. The range is what it answers
    // with — never an exact count, which would let anyone polling this page
    // watch individual people arrive and leave.
    return {
      id: "relay",
      verdict: "ok",
      detail: data.online ? `${data.online} online` : "responding",
    };
  } catch {
    return { id: "relay", verdict: "degraded", detail: "no answer" };
  }
}

async function published(): Promise<Check> {
  const version = await npmVersion();
  return { id: "npm", verdict: "ok", detail: version };
}

/**
 * Whether the two pages built from the client repository are reading it live.
 *
 * Both fall back to a committed snapshot, which is what keeps a GitHub outage
 * from breaking them — and also exactly what would let them go quietly stale
 * for months. This is the line that makes that visible.
 */
async function sources(): Promise<Check[]> {
  const [reference, changelogRaw] = await Promise.all([
    commandReference(),
    upstream("CHANGELOG.md"),
  ]);

  return [
    {
      id: "commands",
      verdict: reference.live ? "ok" : "degraded",
      detail: reference.live
        ? `${reference.counts.total} commands, live`
        : "using the built-in snapshot",
    },
    {
      id: "changelog",
      verdict: changelogRaw ? "ok" : "degraded",
      detail: changelogRaw ? "live" : "using the built-in fallback",
    },
  ];
}

export async function statusChecks(): Promise<Check[]> {
  const [relay, npm, rest] = await Promise.all([
    presence(),
    published(),
    sources(),
  ]);
  return [relay, npm, ...rest];
}
