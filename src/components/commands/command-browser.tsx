"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

import { anchor, type CommandGroup, type Mode } from "@/lib/commands";
import { inlineMarkdown } from "@/lib/inline-markdown";

/**
 * The whole command set, searchable.
 *
 * Sixty-seven commands is far too many to read down, so the search is the
 * feature and everything else gets out of its way: the field is a shell prompt
 * because that is where these commands are typed, `/` focuses it the way it
 * does in a terminal, and the result count is phrased as grep output rather
 * than as a label.
 *
 * Filtering happens in the browser over a list that is already fully rendered
 * on the server. That keeps every command in the HTML — deep links like
 * `/commands#verify` work before any JavaScript runs, and a crawler sees all
 * sixty-seven — while the search still feels instant.
 */

type Filter = "all" | Mode;

const FILTERS: Filter[] = ["all", "relay", "p2p"];

/** Long enough to read as a wave, short enough not to feel like waiting. */
const STAGGER_MS = 12;
const STAGGER_CAP = 260;

export function CommandBrowser({ groups }: { groups: CommandGroup[] }) {
  const t = useTranslations("commands");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // `/` focuses the search, as it would in less, vim or a browser's own find.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape" && typing) {
        setQuery("");
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const needle = query.trim().toLowerCase();

  const shown = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          commands: group.commands.filter((command) => {
            if (filter !== "all" && !command.modes.includes(filter)) {
              return false;
            }
            if (!needle) return true;
            return (
              command.name.toLowerCase().includes(needle) ||
              command.summary.toLowerCase().includes(needle)
            );
          }),
        }))
        .filter((group) => group.commands.length > 0),
    [groups, filter, needle],
  );

  const total = shown.reduce((sum, group) => sum + group.commands.length, 0);

  const copy = (name: string) => {
    navigator.clipboard?.writeText(name).then(
      () => {
        setCopied(name);
        setTimeout(() => setCopied((c) => (c === name ? null : c)), 1400);
      },
      () => {},
    );
  };

  let index = 0;

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 bg-void/85 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="scanlines relative flex flex-1 items-center gap-2 overflow-hidden rounded-sm border border-line bg-panel px-3.5 py-2.5 focus-within:border-signal/60">
            <span
              aria-hidden="true"
              className="font-mono text-xs whitespace-nowrap text-faint select-none"
            >
              ~/ciphermesh $ grep
            </span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search.placeholder")}
              aria-label={t("search.label")}
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-ink placeholder:text-line-2 focus:outline-none"
            />
            <kbd className="hidden rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] text-line-2 sm:block">
              /
            </kbd>
          </div>

          <div
            role="group"
            aria-label={t("filter.label")}
            className="flex rounded-sm border border-line bg-panel p-1"
          >
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`flex-1 rounded-xs px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                  filter === value
                    ? "bg-signal/15 text-ink"
                    : "text-faint hover:text-dim"
                }`}
              >
                {t(`filter.${value}`)}
              </button>
            ))}
          </div>
        </div>

        <p
          aria-live="polite"
          className="mt-2.5 font-mono text-xs text-faint tabular-nums"
        >
          {t("matches", { count: total })}
        </p>
      </div>

      {total === 0 ? (
        <p className="py-16 text-center font-mono text-sm text-faint">
          {t("empty", { query: query.trim() })}
        </p>
      ) : (
        <div className="mt-4 space-y-12">
          {shown.map((group) => (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2
                id={`group-${group.id}`}
                className="font-mono text-xs tracking-[0.16em] text-faint uppercase"
              >
                {group.name}
              </h2>

              <ul className="mt-4 divide-y divide-line/70 border-y border-line/70">
                {group.commands.map((command) => {
                  const delay = Math.min(index++ * STAGGER_MS, STAGGER_CAP);
                  const id = anchor(command.name);

                  return (
                    <li
                      // Keyed on the mode so switching it remounts the rows and
                      // replays the wave. Typing is deliberately left out: the
                      // rows that survive a keystroke should stay still rather
                      // than re-animate under the reader's eye.
                      key={`${filter}-${command.name}`}
                      id={id}
                      style={{ animationDelay: `${delay}ms` }}
                      className="scroll-mt-32 py-4 target:bg-signal/[0.07] motion-safe:animate-[rise_260ms_ease-out_both]"
                    >
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                        <button
                          type="button"
                          onClick={() => copy(command.name)}
                          title={t("copy")}
                          className="group/name font-mono text-sm font-semibold text-signal-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                        >
                          <Highlight text={command.name} needle={needle} />
                        </button>

                        {command.args ? (
                          <span className="font-mono text-sm text-faint">
                            {command.args}
                          </span>
                        ) : null}

                        {command.modes.includes("p2p") ? (
                          <span className="rounded-sm border border-wire/30 px-1.5 py-px font-mono text-[10px] text-wire">
                            {t("badge.offline")}
                          </span>
                        ) : (
                          <span className="rounded-sm border border-line px-1.5 py-px font-mono text-[10px] text-faint">
                            {t("badge.relayOnly")}
                          </span>
                        )}

                        <a
                          href={`#${id}`}
                          aria-label={t("anchor", { name: command.name })}
                          className="ml-auto font-mono text-xs text-line-2 transition-colors hover:text-signal-soft"
                        >
                          #
                        </a>
                      </div>

                      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-dim">
                        {inlineMarkdown(command.summary)}
                      </p>

                      {copied === command.name ? (
                        <p
                          role="status"
                          className="mt-1.5 font-mono text-xs text-wire"
                        >
                          {t("copied")}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** The matched run, marked in the accent so the eye lands on it immediately. */
function Highlight({ text, needle }: { text: string; needle: string }) {
  if (!needle) return <>{text}</>;
  const at = text.toLowerCase().indexOf(needle);
  if (at === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-signal/25 text-ink">
        {text.slice(at, at + needle.length)}
      </mark>
      {text.slice(at + needle.length)}
    </>
  );
}
