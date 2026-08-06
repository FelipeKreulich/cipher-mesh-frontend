/**
 * The drunken bishop, ported from the client's `src/shared/keyArt.js`.
 *
 * A bishop starts at the centre of a 17x9 board and moves one diagonal step per
 * two bits of the key, incrementing a counter wherever it lands. The finished
 * density map is drawn with coin characters. Same key, same picture — so a key
 * that changed produces a picture that is obviously different at a glance, and
 * that is the whole point of showing it.
 *
 * This is the same algorithm OpenSSH uses for `ssh-keygen -lv`, and the same one
 * running in the terminal client. It is reproduced here rather than approximated
 * because a demo of a verification tool that does not actually verify anything
 * would be teaching the wrong lesson.
 */

const WIDTH = 17;
const HEIGHT = 9;
const COINS = " .o+=*BOX@%&#/^";

export const ART_WIDTH = WIDTH;
export const ART_HEIGHT = HEIGHT;

/**
 * @returns the board as `HEIGHT` strings of `WIDTH` characters, without the
 *   surrounding box — the caller draws the frame, since on the web that is a
 *   border rather than `+---+`.
 */
export function keyArt(bytes: Uint8Array): string[] {
  const field = Array.from({ length: HEIGHT }, () => new Array(WIDTH).fill(0));

  const startX = Math.floor(WIDTH / 2);
  const startY = Math.floor(HEIGHT / 2);
  let x = startX;
  let y = startY;

  for (const byte of bytes) {
    let b = byte;
    for (let i = 0; i < 4; i++) {
      x += b & 0x1 ? 1 : -1; // bit 0 — right or left
      y += b & 0x2 ? 1 : -1; // bit 1 — down or up
      x = Math.max(0, Math.min(WIDTH - 1, x));
      y = Math.max(0, Math.min(HEIGHT - 1, y));
      field[y][x] += 1;
      b >>= 2;
    }
  }

  return field.map((row, j) =>
    row
      .map((visits, i) => {
        if (i === startX && j === startY) return "S";
        if (i === x && j === y) return "E";
        return COINS[Math.min(visits, COINS.length - 1)];
      })
      .join(""),
  );
}

/** The client's border: the title centred in the top rule, sized to the board. */
function border(title: string): string {
  if (!title) return `+${"-".repeat(WIDTH)}+`;
  const label = `[${title.slice(0, WIDTH - 2)}]`;
  const pad = WIDTH - label.length;
  const left = Math.floor(pad / 2);
  return `+${"-".repeat(left)}${label}${"-".repeat(pad - left)}+`;
}

/**
 * The whole box exactly as the terminal prints it, every line the same width.
 * Building the frame here rather than in the markup is what keeps it aligned —
 * the rule has to be measured against the board, not guessed.
 */
export function keyArtBox(bytes: Uint8Array, title = ""): string[] {
  return [border(title), ...keyArt(bytes).map((row) => `|${row}|`), border("")];
}
