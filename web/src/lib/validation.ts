import { z } from 'zod';

import { describePhoneProblem } from '@/lib/phone';

/**
 * Request schemas for the API routes.
 *
 * The phone rules live in lib/phone.ts rather than here, because the
 * client-side PhoneInput needs them and importing anything from this
 * module would drag zod into the browser bundle with it.
 */

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
