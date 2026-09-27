import crypto from "crypto";

// Short, easy-to-type public verification codes printed on official
// documents (transcripts, graduation certificates/statements of
// completion) and checked against at the public /verify page. This is
// not a security secret -- like a receipt or invoice number, it only
// needs to be practically unguessable and collision-free, not
// cryptographically sealed, so a student can safely read it aloud or
// retype it from a printed page.
//
// Alphabet excludes 0/O and 1/I to avoid transcription mistakes.
// 10 characters from a 32-character alphabet is ~1.1 * 10^15 possible
// codes -- effectively collision-free for this institution's document
// volume.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateVerificationCode() {
  const bytes = crypto.randomBytes(10);
  let code = "";
  for (let i = 0; i < bytes.length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `ULU-${code.slice(0, 5)}-${code.slice(5, 10)}`;
}
