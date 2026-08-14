"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { keyArtBox } from "@/lib/key-art";
import { computeSas, DEMO_KEYS } from "@/lib/sas";
import { type Frame, SAS_TOKEN, TRANSCRIPT } from "@/lib/transcript";

/** Per character, for the lines that are typed rather than printed. */
const TYPE_MS = 45;
/** A beat after a command finishes typing, before the client answers. */
const SUBMIT_MS = 240;

const PROMPT = "~/ciphermesh $ ";

function plain(frame: Frame, sas: string): string {
  const text = "text" in frame ? frame.text.replace(SAS_TOKEN, sas) : "";
  const at = frame.at ? `[${frame.at}] ` : "";

  switch (frame.kind) {
    case "shell":
      return `${PROMPT}${text}`;
    case "input":
      return `> ${text}`;
    case "system":
      return `${at}* ${text}`;
    case "error":
      return `${at}! ${text}`;
    case "event":
      return `${at}✦ ${text}`;
    case "tip":
      return `💡 ${text}`;
    case "info":
      return `${at}${text}`;
    case "in":
      return `${at}${frame.nick}${frame.verified ? " ✓" : ""}: ${frame.text}`;
    case "out":
      return `${frame.nick}: ${frame.text} [${frame.at}]`;
    default:
      return "";
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The motion preference as a subscription rather than a one-off read in an
 * effect. Reading it into state would mean writing state during the first
 * effect, which cascades a render; subscribing lets the whole transcript simply
 * be derived, and it also picks up the preference changing mid-visit.
 */
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const motionNow = () => window.matchMedia(REDUCED).matches;
/** The server cannot know, and assuming motion is fine — the effect decides. */
const motionOnServer = () => false;

export function TranscriptPlayer({ replayLabel }: { replayLabel: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);

  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [sas, setSas] = useState("0000 0000 00000");

  const reduce = useSyncExternalStore(
    subscribeMotion,
    motionNow,
    motionOnServer,
  );

  const art = keyArtBox(DEMO_KEYS.peer, "rita");

  useEffect(() => {
    // The same code the verification section derives, so the two agree.
    computeSas(DEMO_KEYS.you, DEMO_KEYS.peer)
      .then(setSas)
      .catch(() => {});
  }, []);

  /**
   * Abandon whatever is playing. Every step of `play` checks that its run is
   * still the current one, so bumping the counter is what stops a loop that is
   * sitting in a timeout — there is nothing to clear, and a run that wakes up
   * after unmount simply returns instead of setting state on a dead component.
   */
  const abandon = useCallback(() => {
    runRef.current += 1;
  }, []);

  const play = useCallback(async () => {
    const run = ++runRef.current;
    setShown(0);
    setTyped("");
    setDone(false);

    for (let i = 0; i < TRANSCRIPT.length; i++) {
      const frame = TRANSCRIPT[i];
      await wait(frame.after);
      if (runRef.current !== run) return;

      if (frame.kind === "shell" || frame.kind === "input") {
        for (let c = 1; c <= frame.text.length; c++) {
          await wait(TYPE_MS);
          if (runRef.current !== run) return;
          setTyped(frame.text.slice(0, c));
        }
        await wait(SUBMIT_MS);
        if (runRef.current !== run) return;
      }

      setTyped("");
      setShown(i + 1);
    }
    setDone(true);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    // Nothing to schedule when motion is unwanted: the whole transcript is
    // already on screen, because it is derived rather than played.
    if (!host || reduce) return;

    // Start when it is actually on screen. A session playing to nobody is both
    // a waste and a worse first impression, since most of it is over by the
    // time the visitor scrolls down.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void play();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      abandon();
    };
  }, [play, reduce, abandon]);

  const visible = TRANSCRIPT.slice(0, reduce ? TRANSCRIPT.length : shown);
  const pending = !reduce && typed ? TRANSCRIPT[shown] : null;
  const settled = reduce || done;

  // A transcript gets much taller once its terminal rows wrap on a phone. Keep
  // the active line in view while it plays, but leave the completed reduced-
  // motion version at the top so it can be read like ordinary scrollback.
  useEffect(() => {
    if (reduce) return;
    const viewport = viewportRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [shown, typed, reduce]);

  return (
    <div ref={hostRef} className="not-prose">
      <div className="overflow-hidden rounded-lg border border-line bg-panel">
        <div className="flex min-w-0 items-center gap-2 border-b border-line bg-panel-2 px-3 py-2.5 sm:px-4">
          <span className="size-2.5 rounded-full bg-line-2" />
          <span className="size-2.5 rounded-full bg-line-2" />
          <span className="size-2.5 rounded-full bg-line-2" />
          <span className="ml-2 truncate font-mono text-xs text-faint">
            ciphermesh — #general
          </span>
        </div>

        <div
          aria-hidden="true"
          ref={viewportRef}
          data-slot="transcript-viewport"
          className="h-[26rem] touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3 font-mono text-[0.72rem] leading-[1.65] sm:h-[27rem] sm:px-4 sm:text-[0.8rem]"
        >
          <div className="flex min-h-full min-w-0 flex-col justify-end">
            {visible.map((frame, i) => (
              <Row key={i} frame={frame} sas={sas} art={art} />
            ))}
            {pending ? (
              <Row frame={pending} sas={sas} art={art} partial={typed} />
            ) : null}
            {!settled ? (
              <span className="inline-block h-4 w-[0.55rem] animate-pulse bg-signal-soft align-middle" />
            ) : null}
          </div>
        </div>
      </div>

      {/* The transcript as text: readable by a screen reader, indexable, and
          available to anyone who never sees the animation run. */}
      <pre className="sr-only">
        {TRANSCRIPT.map((frame) => plain(frame, sas))
          .filter(Boolean)
          .join("\n")}
      </pre>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => void play()}
          className="rounded-md border border-line px-3 py-1.5 font-mono text-xs text-dim transition-colors hover:border-line-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          {replayLabel}
        </button>
      </div>
    </div>
  );
}

function Row({
  frame,
  sas,
  art,
  partial,
}: {
  frame: Frame;
  sas: string;
  art: string[];
  partial?: string;
}) {
  const at = frame.at ? (
    <span className="text-faint">[{frame.at}] </span>
  ) : null;
  const body = "text" in frame ? (partial ?? frame.text) : "";

  switch (frame.kind) {
    case "gap":
      return <div className="h-2" />;

    case "shell":
      return (
        <div className="break-words whitespace-pre-wrap text-ink sm:whitespace-pre">
          <span className="text-faint">{PROMPT}</span>
          {body}
        </div>
      );

    case "input":
      return (
        <div className="break-words whitespace-pre-wrap text-signal-soft sm:whitespace-pre">
          <span className="text-faint">&gt; </span>
          {body}
        </div>
      );

    case "system":
      return (
        <div className="break-words whitespace-pre-wrap text-ink sm:whitespace-pre">
          {at}
          <span className="text-faint">* </span>
          {body}
        </div>
      );

    case "error":
      return (
        <div className="whitespace-pre-wrap text-danger">
          {at}! {body}
        </div>
      );

    case "event":
      return (
        <div className="font-semibold break-words whitespace-pre-wrap text-signal-soft sm:whitespace-pre">
          {at}✦ {body}
        </div>
      );

    case "tip":
      return (
        <div className="whitespace-pre-wrap text-warn">
          <span aria-hidden="true">💡 </span>
          {body}
        </div>
      );

    case "info":
      return (
        <div className="whitespace-pre-wrap text-wire">
          {at}
          {body.replace(SAS_TOKEN, sas)}
        </div>
      );

    case "in":
      return (
        <div className="break-words whitespace-pre-wrap text-ink sm:whitespace-pre">
          {at}
          <span className="text-wire">{frame.nick}</span>
          {frame.verified ? <span className="text-[#4ade80]"> ✓</span> : null}
          <span className="text-faint">: </span>
          {frame.text}
        </div>
      );

    case "out":
      // The client pushes your own messages to the right edge of the pane.
      return (
        <div className="text-left break-words whitespace-pre-wrap text-ink sm:text-right sm:whitespace-pre">
          <span className="font-semibold">{frame.nick}</span>
          <span className="text-faint">: </span>
          {frame.text} <span className="text-faint">[{frame.at}]</span>
        </div>
      );

    case "art":
      return (
        <div className="overflow-x-auto py-1 text-[0.68rem] whitespace-pre text-faint sm:text-inherit">
          {art.join("\n")}
        </div>
      );

    default:
      return null;
  }
}
