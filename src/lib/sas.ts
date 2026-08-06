/**
 * The short authentication string, built the way the client builds it.
 *
 * Both sides sort the two public keys, concatenate them with a domain
 * separator, hash, and read the first five bytes as a decimal number padded to
 * thirteen digits and grouped 4-4-5. Sorting is what makes it symmetric: two
 * people who are really talking to each other derive the same code without
 * exchanging anything, so reading it aloud proves there is no third key in the
 * path.
 *
 * One deliberate difference from `src/crypto/TrustStore.js`: the client hashes
 * with BLAKE2b-256 through libsodium, and browsers do not ship BLAKE2b. This
 * uses SHA-256 through SubtleCrypto instead. The construction — sort,
 * concatenate, separate the domain, take five bytes, thirteen digits — is the
 * client's; only the hash function differs, and these are illustrative keys
 * rather than anybody's real ones, so no code shown here is meant to match a
 * real session.
 */

const DOMAIN = "CipherMesh-SAS-v1";

/**
 * Illustrative 32-byte keys, derived from their own labels.
 *
 * They were pasted as hex literals at first, which was a mistake for a reason
 * that has nothing to do with cryptography: three 64-character hex strings, one
 * of them named `you`, look exactly like leaked private keys, and a secret
 * scanner is right to say so. An alert that is always there and always wrong
 * teaches people to close alerts without reading them, which is worse than the
 * thing the scanner was watching for.
 *
 * Deriving them from a readable label leaves nothing high-entropy in the
 * repository, keeps the values fixed so the server and the browser agree, and
 * makes what they are obvious from the code rather than from a comment.
 */
export const DEMO_KEYS = {
  you: demoKey("example key: you"),
  peer: demoKey("example key: rita"),
  /** The key a machine in the middle would present to each side instead. */
  middle: demoKey("example key: interceptor"),
} as const;

/**
 * Thirty-two deterministic bytes from a string, via FNV-1a and xorshift.
 *
 * Not a key derivation function and not trying to be — nothing here protects
 * anything. It exists to produce stable, well-spread bytes for a picture, using
 * arithmetic simple enough to read in one sitting.
 */
function demoKey(label: string): Uint8Array {
  let state = 0x811c9dc5;
  for (let i = 0; i < label.length; i++) {
    state = Math.imul(state ^ label.charCodeAt(i), 0x01000193) >>> 0;
  }

  const bytes = new Uint8Array(32);
  for (let i = 0; i < bytes.length; i++) {
    state ^= (state << 13) >>> 0;
    state ^= state >>> 17;
    state ^= (state << 5) >>> 0;
    state >>>= 0;
    bytes[i] = state & 0xff;
  }
  return bytes;
}

/** Lexicographic, so both ends reach the same order from opposite viewpoints. */
function ordered(a: Uint8Array, b: Uint8Array): [Uint8Array, Uint8Array] {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] < b[i] ? [a, b] : [b, a];
  }
  return a.length <= b.length ? [a, b] : [b, a];
}

export async function computeSas(
  mine: Uint8Array,
  theirs: Uint8Array,
): Promise<string> {
  const [first, second] = ordered(mine, theirs);
  const domain = new TextEncoder().encode(DOMAIN);

  const input = new Uint8Array(first.length + second.length + domain.length);
  input.set(first, 0);
  input.set(second, first.length);
  input.set(domain, first.length + second.length);

  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", input));

  // Five bytes is forty bits, which is at most thirteen decimal digits. The
  // client accumulates this in a BigInt; forty bits fits a double exactly, so
  // multiplying gives identical values without one. Shifting would not — `<<`
  // is a 32-bit operator and would drop the top byte on the floor.
  let value = 0;
  for (let i = 0; i < 5; i++) value = value * 256 + digest[i];

  const digits = String(value).padStart(13, "0");
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`;
}
