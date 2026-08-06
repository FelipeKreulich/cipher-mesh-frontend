/**
 * A recorded CipherMesh session, as frames.
 *
 * Every system, info and error string here is copied verbatim out of
 * `src/client/ChatController.js`; the layout of a chat line — timestamp, avatar,
 * nickname, trust glyph — is the one `UI.js` composes, with your own messages
 * pushed to the right. The randomart and the SAS code are not pasted at all:
 * the player derives them from the same demo keys the verification section
 * uses, so nothing on this page can drift away from the algorithm it claims to
 * show.
 *
 * The point of the section is that the site otherwise only ever *describes* the
 * product. This is the one place it runs.
 */

export type Line =
  /** A command typed at the shell, before the client is running. */
  | { kind: "shell"; text: string }
  /** A command typed into the chat input. */
  | { kind: "input"; text: string }
  | { kind: "system"; text: string }
  | { kind: "info"; text: string }
  | { kind: "error"; text: string }
  | { kind: "event"; text: string }
  | { kind: "tip"; text: string }
  /** A message from the other person. */
  | { kind: "in"; nick: string; text: string; verified?: boolean }
  /** One of yours, which the client right-aligns. */
  | { kind: "out"; nick: string; text: string }
  /** The peer's key as a picture. Computed, never pasted. */
  | { kind: "art" }
  | { kind: "gap" };

export type Frame = Line & {
  /** Milliseconds to wait before this line appears. */
  after: number;
  /** Clock shown at the start of the line, as the client would print it. */
  at?: string;
};

/**
 * `{sas}` is replaced by the player with the code derived from the demo keys.
 */
export const SAS_TOKEN = "{sas}";

export const TRANSCRIPT: Frame[] = [
  { kind: "shell", text: "npx ciphermesh@latest", after: 0 },
  { kind: "gap", after: 700 },
  {
    kind: "system",
    at: "21:04",
    text: "Connected to server with E2E encryption active",
    after: 500,
  },
  { kind: "system", at: "21:04", text: "Online: rita", after: 260 },
  {
    kind: "tip",
    text: "A nickname is not an identity. Verify the key with /verify.",
    after: 700,
  },
  { kind: "gap", after: 500 },
  { kind: "event", at: "21:05", text: "rita joined #general", after: 300 },
  {
    kind: "in",
    at: "21:05",
    nick: "rita",
    text: "ready when you are",
    after: 900,
  },

  // The part that matters: proving who is on the other end before trusting it.
  { kind: "gap", after: 600 },
  { kind: "input", text: "/verify rita", after: 900 },
  {
    kind: "info",
    at: "21:05",
    text: `SAS code for rita: ${SAS_TOKEN}`,
    after: 450,
  },
  { kind: "art", after: 320 },
  {
    kind: "info",
    at: "21:05",
    text: "Compare the code (or the art) with the peer by voice or another channel. If it matches, use /verify-confirm rita",
    after: 300,
  },
  { kind: "gap", after: 900 },
  { kind: "input", text: "/verify-confirm rita", after: 1000 },
  {
    kind: "system",
    at: "21:06",
    text: "rita marked as verified",
    after: 450,
  },

  { kind: "gap", after: 600 },
  {
    kind: "out",
    at: "21:06",
    nick: "you",
    text: "same code here. we are clear",
    after: 800,
  },
  {
    kind: "in",
    at: "21:06",
    nick: "rita",
    text: "the relay never saw a word of this",
    verified: true,
    after: 1100,
  },

  // And the exit: everything on disk, gone, with the confirmation the client
  // really does demand.
  { kind: "gap", after: 900 },
  { kind: "input", text: "/panic", after: 1100 },
  {
    kind: "error",
    at: "21:07",
    text: "PANIC wipes EVERYTHING from disk (session, history, trust, keys) and exits. Confirm with /panic yes",
    after: 450,
  },
  { kind: "input", text: "/panic yes", after: 1200 },
  { kind: "gap", after: 500 },
];
