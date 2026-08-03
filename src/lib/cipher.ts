const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Deterministic PRNG. The hero renders the same "ciphertext" on the server and
 * on the client, so nothing here may depend on Math.random or the clock.
 */
function xorshift(seed: number) {
  let x = seed | 0 || 0x9e3779b9;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0x100000000;
  };
}

function hashString(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Base64-looking noise that stands in for a sealed envelope.
 *
 * The length is fixed on purpose: CipherMesh pads every message into the same
 * bucket before sealing it, so a one-word message and a paragraph leave the
 * machine as the same number of bytes. The hero shows that by keeping the
 * right-hand pane exactly the same size no matter what is typed on the left.
 */
export function sealedLines(seed: string, rows: number, cols: number) {
  const rand = xorshift(hashString(seed));
  const lines: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    let line = "";
    for (let c = 0; c < cols; c += 1) {
      line += B64[Math.floor(rand() * B64.length)];
    }
    lines.push(line);
  }
  return lines;
}
