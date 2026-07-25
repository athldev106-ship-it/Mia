/**
 * Shared helpers for the staff dashboard.
 *
 * Deliberately client-safe: status vocabularies, money conversion and IST
 * date maths are all needed by both Server Components and the small client
 * widgets, so nothing server-only may be imported here.
 */

import type {
  BuffetBookingStatus,
  EnquiryStatus,
  OrderStatus,
  PaymentStatus,
  ReservationStatus,
} from '@/lib/types';

export type Option<T extends string = string> = { value: T; label: string };

/* ---------------------------------------------------------------------
   Status vocabularies. These mirror the CHECK constraints in
   supabase/schema.sql and schema_buffet.sql -- if one drifts, Postgres
   rejects the update rather than storing something the site cannot read.
   --------------------------------------------------------------------- */

export const RESERVATION_STATUSES: readonly Option<ReservationStatus>[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'seated', label: 'Seated' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No show' },
];

export const BOOKING_STATUSES: readonly Option<BuffetBookingStatus>[] = [
  { value: 'booked', label: 'Booked' },
  { value: 'seated', label: 'Seated' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No show' },
];

export const ORDER_STATUSES: readonly Option<OrderStatus>[] = [
  { value: 'placed', label: 'Placed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const ENQUIRY_STATUSES: readonly Option<EnquiryStatus>[] = [
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'closed', label: 'Closed' },
];

export const PAYMENT_STATUSES: readonly Option<PaymentStatus>[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

export const ENQUIRY_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  catering: 'Catering',
  events: 'Events',
  feedback: 'Feedback',
};

export const SPICE_LABELS = ['None', 'Mild', 'Medium', 'Hot'] as const;

/** Reads back the human label for a stored value, falling back to the value. */
export function labelFor(options: readonly Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Guards a value coming off a FormData against its allowed vocabulary. */
export function pickOption<T extends string>(
  options: readonly Option<T>[],
  value: FormDataEntryValue | null,
): T {
  const text = typeof value === 'string' ? value : '';
  const match = options.find((option) => option.value === text);
  if (!match) throw new AdminInputError('That is not a status we recognise.');
  return match.value;
}

/* ---------------------------------------------------------------------
   Visual tone for badges. Kept as a token name rather than a colour so
   the palette stays in globals.css and light/dark keep working.
   --------------------------------------------------------------------- */
export type Tone = 'neutral' | 'good' | 'warn' | 'bad';

export function toneFor(value: string): Tone {
  switch (value) {
    case 'paid':
    case 'confirmed':
    case 'completed':
    case 'ready':
    case 'closed':
      return 'good';
    case 'pending':
    case 'placed':
    case 'new':
    case 'booked':
    case 'accepted':
    case 'preparing':
    case 'seated':
      return 'warn';
    case 'cancelled':
    case 'no_show':
    case 'failed':
    case 'refunded':
      return 'bad';
    default:
      return 'neutral';
  }
}

/* ---------------------------------------------------------------------
   Money. Postgres stores integer paise; the dashboard talks rupees.
   --------------------------------------------------------------------- */

/** Thrown for anything a staff member typed wrong, and shown back to them. */
export class AdminInputError extends Error {}

/**
 * "249.50" -> 24950.
 *
 * The regex caps the input at two decimal places, so the multiply is exact
 * before Math.round ever sees it -- no float dust can reach the column.
 */
export function rupeesToPaise(input: FormDataEntryValue | null | undefined): number {
  const text = String(input ?? '')
    .trim()
    .replace(/[₹,\s]/g, '');

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new AdminInputError('Enter an amount in rupees, e.g. 249 or 249.50');
  }

  const paise = Math.round(Number(text) * 100);
  if (!Number.isSafeInteger(paise)) throw new AdminInputError('That amount is too large.');
  return paise;
}

/** 24950 -> "249.50", for the value of a rupee input. */
export function paiseToRupeeInput(paise: number): string {
  return (paise / 100).toFixed(2);
}

/* ---------------------------------------------------------------------
   Plain form field readers, each raising a message a human can act on.
   --------------------------------------------------------------------- */

export function requiredText(form: FormData, field: string, label: string, max = 200): string {
  const value = String(form.get(field) ?? '').trim();
  if (!value) throw new AdminInputError(`${label} is required.`);
  if (value.length > max) throw new AdminInputError(`${label} is too long.`);
  return value;
}

export function optionalText(form: FormData, field: string, max = 2000): string | null {
  const value = String(form.get(field) ?? '').trim();
  if (!value) return null;
  if (value.length > max) throw new AdminInputError('That entry is too long.');
  return value;
}

export function integerField(
  form: FormData,
  field: string,
  label: string,
  min: number,
  max: number,
): number {
  const raw = String(form.get(field) ?? '').trim();
  const value = raw === '' ? min : Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new AdminInputError(`${label} must be a whole number between ${min} and ${max}.`);
  }
  return value;
}

export function checkbox(form: FormData, field: string): boolean {
  return form.get(field) !== null;
}

/** "chef's special, gluten free" -> ['chef's special', 'gluten free'] */
export function parseTags(input: FormDataEntryValue | null): string[] {
  return String(input ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** "Salads & Healthy" -> "salads-healthy" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/* ---------------------------------------------------------------------
   Dates. The restaurant works in IST; the database works in UTC.
   IST is a fixed +05:30 with no daylight saving, so the offset can be
   composed by hand exactly as the public booking forms already do.
   --------------------------------------------------------------------- */
export const IST = 'Asia/Kolkata';
export const IST_OFFSET = '+05:30';

/** Today's calendar date in Bengaluru, as YYYY-MM-DD. */
export function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST }).format(new Date());
}

/** Calendar arithmetic on a YYYY-MM-DD string, with no timezone involved. */
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** The half-open [start, end) instants of an IST calendar day. */
export function istDayRange(date: string): { start: string; end: string } {
  return {
    start: `${date}T00:00:00${IST_OFFSET}`,
    end: `${addDays(date, 1)}T00:00:00${IST_OFFSET}`,
  };
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function formatISTDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

export function formatISTDate(value: string): string {
  const iso = value.includes('T') ? value : `${value}T00:00:00${IST_OFFSET}`;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(iso));
}

export function formatISTClock(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

/* ---------------------------------------------------------------------
   Search params and Server Action results.
   --------------------------------------------------------------------- */
export type SearchParams = Record<string, string | string[] | undefined>;

export function param(search: SearchParams, key: string): string {
  const value = search[key];
  return (Array.isArray(value) ? value[0] : value) ?? '';
}

export function pageParam(search: SearchParams): number {
  const value = Number(param(search, 'page'));
  return Number.isInteger(value) && value > 1 ? value : 1;
}

export const PAGE_SIZE = 40;

export type ActionState =
  | { status: 'idle' }
  | { status: 'ok'; message: string }
  | { status: 'error'; message: string };

export const IDLE_ACTION: ActionState = { status: 'idle' };

/**
 * Turns whatever an action threw into something safe to render. Supabase
 * error text can name columns and policies, so only our own input errors
 * are shown verbatim.
 */
export function toActionState(error: unknown): ActionState {
  if (error instanceof AdminInputError) return { status: 'error', message: error.message };
  console.error('[admin] action failed', error);
  return {
    status: 'error',
    message: 'That did not save. Check your access and try again.',
  };
}
