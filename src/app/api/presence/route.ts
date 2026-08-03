import { NextResponse } from "next/server";

/**
 * How busy the hub is, as a range.
 *
 * The browser never talks to the relay: this runs on the server, reads the
 * relay's presence listener over the internal Docker network, and passes on
 * only what the relay already decided to publish — a coarse range, never a
 * count, a room name or a nickname.
 *
 * When the relay is unreachable this answers `null` rather than an error. A
 * missing number is a detail the page can hide; a failing request would be an
 * error banner about something the visitor cannot act on.
 */
export const revalidate = 30;

const RANGES = new Set(["0", "1-5", "6-20", "21-50", "50+"]);

export async function GET() {
  const url = process.env.PRESENCE_URL;
  if (!url) return NextResponse.json({ online: null });

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(2000),
      next: { revalidate },
    });
    if (!res.ok) return NextResponse.json({ online: null });

    const data = await res.json();
    // Only pass through a shape we recognise, so a compromised or misconfigured
    // relay cannot put arbitrary text on the page.
    const online = RANGES.has(data?.online) ? data.online : null;

    return NextResponse.json({ online });
  } catch {
    return NextResponse.json({ online: null });
  }
}
