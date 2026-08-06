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
 * Illustrative 32-byte keys. Fixed rather than random so the page renders the
 * same for everyone, and so the server and the browser agree.
 */
export const DEMO_KEYS = {
  you: hex("3a7f21c95e08b4d6112f8a03cd47e95b6208fa71d3c40e8b95a6172ce03d84f9"),
  peer: hex("c14b90e7f2a3586d0be49172c8f5a0347d61b28ef903c45a17e6208b3fd7c951"),
  /** The key a machine in the middle would present to each side instead. */
  middle: hex(
    "82e5f13ac07b9d4628fa5061c3e7942bd05a86f371c2408e9b6d5137af204ce8",
  ),
} as const;

function hex(value: string): Uint8Array {
  const bytes = new Uint8Array(value.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16);
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
