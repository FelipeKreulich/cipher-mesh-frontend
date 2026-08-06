import type { ReactNode } from "react";

/**
 * The small slice of Markdown that appears inside a changelog bullet or a
 * command description: code spans, bold, italic and links.
 *
 * Deliberately not a Markdown library and deliberately not
 * `dangerouslySetInnerHTML`. The text comes from another repository over the
 * network, and while that repository is ours today, rendering remote text as
 * HTML is the kind of shortcut that is fine right up until it is not. Producing
 * React nodes means the worst a malformed upstream can do is look wrong.
 */

const TOKEN = /`([^`]+)`|\*\*([^*]+)\*\*|_([^_]+)_|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function inlineMarkdown(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN)) {
    const [whole, code, bold, italic, label, href] = match;
    const at = match.index ?? 0;

    if (at > last) out.push(text.slice(last, at));
    last = at + whole.length;

    if (code !== undefined) {
      out.push(
        <code
          key={key++}
          className="rounded-sm bg-panel-2 px-1 py-px font-mono text-[0.9em] text-wire"
        >
          {code}
        </code>,
      );
    } else if (bold !== undefined) {
      out.push(
        <strong key={key++} className="font-semibold text-ink">
          {bold}
        </strong>,
      );
    } else if (italic !== undefined) {
      out.push(<em key={key++}>{italic}</em>);
    } else if (label !== undefined) {
      // Only http(s) — a link out of remote text should not be able to reach
      // for javascript: or data:.
      const safe = /^https?:\/\//.test(href) ? href : undefined;
      out.push(
        safe ? (
          <a
            key={key++}
            href={safe}
            target="_blank"
            rel="noreferrer noopener"
            className="text-signal-soft underline underline-offset-2 hover:text-ink"
          >
            {label}
          </a>
        ) : (
          <span key={key++}>{label}</span>
        ),
      );
    }
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}
