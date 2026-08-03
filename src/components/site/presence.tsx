"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/**
 * Shows roughly how busy the hub is.
 *
 * Renders nothing at all until it has an answer, and nothing ever if the relay
 * is unreachable — an empty space reads as "no information", which is true,
 * while an error or a zero would read as "this project is dead", which is not
 * what a failed fetch means.
 */
export function Presence() {
  const t = useTranslations("community.presence");
  const [online, setOnline] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const read = async () => {
      try {
        const res = await fetch("/api/presence");
        const data = await res.json();
        if (!cancelled) setOnline(data?.online ?? null);
      } catch {
        // Offline, blocked, whatever — the section reads fine without it.
      }
    };

    read();
    // Slower than the range can meaningfully change. Polling harder would not
    // reveal more: the relay publishes a range precisely so it cannot.
    const timer = window.setInterval(read, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  if (online === null) return null;

  const empty = online === "0";

  return (
    <p className="flex items-center gap-2.5 font-mono text-sm">
      <span className="relative flex size-2">
        {!empty && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-wire opacity-60" />
        )}
        <span
          className={`relative inline-flex size-2 rounded-full ${empty ? "bg-line-2" : "bg-wire"}`}
        />
      </span>
      <span className={empty ? "text-faint" : "text-ink"}>
        {empty ? t("empty") : t("online", { range: online })}
      </span>
    </p>
  );
}
