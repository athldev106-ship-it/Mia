import { z } from 'zod';

/** Indian mobile number, with or without +91 / 0 prefix. */
const phone = z
  .string()
  .trim()
  .regex(/^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

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

export const orderSchema = z.object({
  customer_name: name,
  customer_phone: phone,
  customer_email: z.string().trim().email().max(120).optional().or(z.literal('')),
  fulfilment: z.enum(['takeaway', 'delivery']),
  address_line: z.string().trim().max(300).optional().or(z.literal('')),
  address_landmark: z.string().trim().max(120).optional().or(z.literal('')),
  address_pincode: z.string().trim().regex(/^\d{6}$/).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  // Only ids and quantities -- prices are always re-read from the database.
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(20),
      }),
    )
    .min(1, 'Your cart is empty')
    .max(40),
  company: z.string().max(0).optional(),
}).refine(
  (order) => order.fulfilment !== 'delivery' || (!!order.address_line && !!order.address_pincode),
  { message: 'Delivery orders need an address and pincode', path: ['address_line'] },
);

export type ReservationInput = z.infer<typeof reservationSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
