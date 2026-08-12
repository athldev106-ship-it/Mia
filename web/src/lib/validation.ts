import { z } from 'zod';

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
 * Server-side validation below is still the authority -- `pattern` is a
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

const phone = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    const problem = describePhoneProblem(value);
    if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, message: problem });
  });

const name = z.string().trim().min(2, 'Name is too short').max(80);

export const reservationSchema = z.object({
  name,
  phone,
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  party_size: z.coerce.number().int().min(1).max(40),
  reserved_at: z
    .string()
    .datetime({ offset: true })
    .refine((value) => new Date(value).getTime() > Date.now(), {
      message: 'Pick a time in the future',
    }),
  occasion: z.string().trim().max(60).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  // Honeypot: real users never fill this hidden field.
  company: z.string().max(0).optional(),
});

export const enquirySchema = z.object({
  name,
  email: z.string().trim().email().max(120),
  phone: phone.optional().or(z.literal('')),
  type: z.enum(['general', 'catering', 'events', 'feedback']).default('general'),
  message: z.string().trim().min(10, 'Tell us a bit more').max(2000),
  company: z.string().max(0).optional(),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(120),
  company: z.string().max(0).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
