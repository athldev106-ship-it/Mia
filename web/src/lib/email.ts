import 'server-only';

import { Resend } from 'resend';

import type { Enquiry, Reservation } from '@/lib/types';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? '';
const RESTAURANT_INBOX = process.env.EMAIL_TO_RESTAURANT ?? '';

const IST = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
});

/**
 * Email is a side effect, never a reason to fail the customer's request --
 * a booking that saved but failed to notify is still a booking. Callers
 * fire and forget; failures land in the server logs.
 */
async function send(to: string | string[], subject: string, html: string) {
  if (!resend || !FROM) {
    console.warn('[email] Resend not configured; skipping:', subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    console.error('[email] send failed:', subject, error);
  }
}

const shell = (title: string, body: string) => `
<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h2 style="margin:0 0 16px;font-size:20px;font-weight:600">${title}</h2>
  ${body}
</div>`;

const row = (label: string, value: string | number | null | undefined) =>
  value === null || value === undefined || value === ''
    ? ''
    : `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${label}</td><td style="padding:6px 0;font-weight:500">${value}</td></tr>`;

const table = (rows: string) =>
  `<table style="border-collapse:collapse;font-size:14px;width:100%">${rows}</table>`;

export async function sendReservationEmails(reservation: Reservation, restaurantName: string) {
  const when = IST.format(new Date(reservation.reserved_at));
  const details = table(
    row('Name', reservation.name) +
      row('Phone', reservation.phone) +
      row('Guests', reservation.party_size) +
      row('When', when) +
      row('Occasion', reservation.occasion) +
      row('Notes', reservation.notes),
  );

  const tasks: Promise<void>[] = [];

  if (RESTAURANT_INBOX) {
    tasks.push(
      send(
        RESTAURANT_INBOX,
        `New reservation — ${reservation.name}, ${reservation.party_size} guests`,
        shell('New table reservation', details),
      ),
    );
  }

  if (reservation.email) {
    tasks.push(
      send(
        reservation.email,
        `We've got your request — ${restaurantName}`,
        shell(
          `Thanks, ${reservation.name}!`,
          `<p style="font-size:14px;line-height:1.6">We've received your request for <strong>${reservation.party_size} guests</strong> on <strong>${when}</strong>. Our team will call you shortly to confirm.</p>${details}`,
        ),
      ),
    );
  }

  await Promise.all(tasks);
}

export async function sendEnquiryEmail(enquiry: Enquiry) {
  if (!RESTAURANT_INBOX) return;
  await send(
    RESTAURANT_INBOX,
    `New ${enquiry.type} enquiry — ${enquiry.name}`,
    shell(
      'New enquiry',
      table(
        row('Name', enquiry.name) +
          row('Email', enquiry.email) +
          row('Phone', enquiry.phone) +
          row('Type', enquiry.type) +
          row('Message', enquiry.message.replace(/\n/g, '<br>')),
      ),
    ),
  );
}
