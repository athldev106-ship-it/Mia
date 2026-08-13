/**
 * Phone rules, kept deliberately free of dependencies.
 *
 * This lives apart from lib/validation.ts for one reason: PhoneInput is a
 * client component, and a client component importing anything from a
 * module that also imports zod pulls the whole of zod into the browser
 * bundle. It did exactly that -- about 50 KB of validation library on
 * /reserve and /contact, to run a regex. Nothing here may import anything.
 *
 * The Zod schemas in lib/validation.ts import from this file, so the
 * browser and the server still judge a number by the same code.
 */

/**
 * Indian mobile number, with or without a +91 / 0 prefix.
 *
 * Exported as a bare source string so the same rule can go straight into
 * an input's `pattern` attribute: the browser then rejects a bad number
 * as it is typed, instead of the guest waiting on a round trip to find
 * out. HTML anchors `pattern` implicitly, hence no ^ or $ here.
 *
 * Spaces and hyphens are allowed between any two digits, not merely after
 * a country code. People write their number the way it is printed, and
 * the cafe prints its own as "099556 65594" -- a form that rejected the
 * business's own phone format would be indefensible.
 *
 * The hyphen in the character class must be escaped. Browsers compile
 * `pattern` with the `v` flag, under which a bare leading `-` in a class
 * is a syntax error -- and a `pattern` that fails to compile is dropped
 * silently, so the field validates nothing at all while looking correct.
 * `[\-\s]` compiles under `v`, `u` and no flag alike.
 *
 * Server-side validation is still the authority -- `pattern` is a
 * convenience for the person typing, not a check anyone has to pass.
 */
export const PHONE_PATTERN = '(?:(?:\\+?91|0)[\\-\\s]?)?[6-9](?:[\\-\\s]?\\d){9}';

export const PHONE_HINT = 'Enter a valid 10-digit Indian mobile number';

const PHONE_RE = new RegExp(`^${PHONE_PATTERN}$`);

/**
 * Says what is actually wrong with a phone number, or null if nothing is.
 *
 * `pattern` alone only ever gets the browser's "Please match the requested
 * format", which tells someone mistyping their own number nothing at all.
 * The same function runs in the browser and on the server, so a guest is
 * told the same thing either way.
 */
export function describePhoneProblem(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null; // Emptiness is the `required` attribute's business.
  if (PHONE_RE.test(value)) return null;

  const cleaned = value.replace(/[\s-]/g, '');
  if (/[^\d+]/.test(cleaned)) {
    return 'Use digits only — no letters or brackets.';
  }

  // Strip a country or trunk prefix only when doing so leaves exactly ten
  // digits. Otherwise "9187654321" -- a real number that merely starts 91
  // -- would be misread as a prefixed eight-digit one.
  const digits = cleaned.replace(/^\+/, '');
  let national = digits;
  for (const prefix of ['91', '0']) {
    if (digits.startsWith(prefix) && digits.length - prefix.length === 10) {
      national = digits.slice(prefix.length);
      break;
    }
  }

  if (national.length !== 10) {
    return `That is ${national.length} digit${national.length === 1 ? '' : 's'} — an Indian mobile number has 10.`;
  }
  if (!/^[6-9]/.test(national)) {
    return 'Indian mobile numbers start with 6, 7, 8 or 9.';
  }
  return PHONE_HINT;
}
