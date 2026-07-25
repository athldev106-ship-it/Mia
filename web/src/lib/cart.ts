/**
 * The a la carte cart: pure, framework-free logic shared by the ordering
 * page, the cart panel and checkout.
 *
 * Two rules govern everything here:
 *
 * 1. The cart only ever holds ids and quantities. Prices are read from the
 *    menu we were served, and the totals below are an ESTIMATE for the
 *    guest's benefit only -- /api/orders re-prices every line from the
 *    database and that figure is what Razorpay charges. A tampered or stale
 *    cart therefore cannot change what anyone pays.
 * 2. localStorage is untrusted input. It can be hand-edited, left over from
 *    an older build, or written by a different tab, so everything read back
 *    is validated before it is used and anything unrecognised is dropped.
 */

import { priceOrder } from '@/lib/pricing';

import type { Fulfilment, MenuItem } from '@/lib/types';

export const CART_STORAGE_KEY = 'verandah.order.cart.v1';

/** Mirrors orderSchema: quantity is an integer 1..20, at most 40 lines. */
export const MAX_QUANTITY = 20;
export const MAX_LINES = 40;

export type CartLine = { menu_item_id: string; quantity: number };
export type StoredCart = { lines: CartLine[]; fulfilment: Fulfilment };

export const EMPTY_CART: StoredCart = { lines: [], fulfilment: 'takeaway' };

/** Menu ids are uuids in Postgres, and orderSchema rejects anything else. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Turns whatever was in localStorage into a cart we are willing to act on.
 * Never throws: corrupt JSON, a renamed shape from an older release, or a
 * hand-edited array all degrade to an empty cart rather than a broken page.
 */
export function parseStoredCart(raw: string | null): StoredCart {
  if (!raw) return EMPTY_CART;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return EMPTY_CART;
  }

  if (!isRecord(data)) return EMPTY_CART;

  const rawLines = Array.isArray(data.lines) ? data.lines : [];
  const lines: CartLine[] = [];
  const seen = new Set<string>();

  for (const entry of rawLines) {
    if (lines.length >= MAX_LINES) break;
    if (!isRecord(entry)) continue;

    const id = entry.menu_item_id;
    const quantity = entry.quantity;

    if (typeof id !== 'string' || !UUID.test(id) || seen.has(id)) continue;
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue;

    seen.add(id);
    lines.push({ menu_item_id: id, quantity: Math.min(quantity, MAX_QUANTITY) });
  }

  return { lines, fulfilment: data.fulfilment === 'delivery' ? 'delivery' : 'takeaway' };
}

/** Reads the cart from localStorage. Safe to call in any browser state. */
export function readStoredCart(): StoredCart {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    // Storage can be disabled outright (Safari private browsing, some
    // embedded webviews). An unsaveable cart is still a usable one.
    return EMPTY_CART;
  }
}

export function writeStoredCart(cart: StoredCart): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* Quota or disabled storage: the cart simply will not survive a reload. */
  }
}

export function clearStoredCart(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    /* See writeStoredCart. */
  }
}

export type CartEntry = {
  item: MenuItem;
  quantity: number;
  lineTotalPaise: number;
};

export type ResolvedCart = {
  entries: CartEntry[];
  /** The lines that survived, ready to be written back over the stored ones. */
  lines: CartLine[];
  /** Lines dropped because the item left the menu or sold out. */
  droppedCount: number;
  itemCount: number;
  subtotalPaise: number;
};

/**
 * Joins stored lines to the menu we were actually served, dropping anything
 * that no longer exists or is unavailable today -- a cart from last week
 * must not be able to put a delisted dish in front of a guest.
 *
 * Callers must only persist the returned `lines` when they know the menu
 * loaded; reconciling against an empty menu would wipe a perfectly good cart.
 */
export function resolveCart(lines: CartLine[], items: MenuItem[]): ResolvedCart {
  const byId = new Map(items.map((item) => [item.id, item]));
  const entries: CartEntry[] = [];
  let dropped = 0;

  for (const line of lines) {
    const item = byId.get(line.menu_item_id);
    if (!item || !item.is_available) {
      dropped += 1;
      continue;
    }
    const quantity = Math.min(Math.max(Math.trunc(line.quantity), 1), MAX_QUANTITY);
    entries.push({ item, quantity, lineTotalPaise: item.price_paise * quantity });
  }

  return {
    entries,
    lines: entries.map((entry) => ({ menu_item_id: entry.item.id, quantity: entry.quantity })),
    droppedCount: dropped,
    itemCount: entries.reduce((sum, entry) => sum + entry.quantity, 0),
    subtotalPaise: entries.reduce((sum, entry) => sum + entry.lineTotalPaise, 0),
  };
}

export type CartTotals = ReturnType<typeof priceOrder>;

/**
 * The on-screen estimate. Deliberately the same function the server uses, so
 * the two agree -- but the server's run against database prices is the only
 * one that decides the charge.
 */
export function estimateTotals(subtotalPaise: number, fulfilment: Fulfilment): CartTotals {
  return priceOrder(subtotalPaise, fulfilment);
}

/* ------------------------------------------------------------------ *
 * Client-side mirror of orderSchema, for friendly errors before we ask
 * the server. The server re-validates every one of these; nothing here
 * is a security control.
 * ------------------------------------------------------------------ */

const PHONE = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE = /^\d{6}$/;

export type CheckoutValues = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  fulfilment: Fulfilment;
  address_line: string;
  address_landmark: string;
  address_pincode: string;
  notes: string;
};

export type CheckoutField = keyof CheckoutValues;
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

export function validateCheckout(values: CheckoutValues): CheckoutErrors {
  const errors: CheckoutErrors = {};
  const name = values.customer_name.trim();
  const phone = values.customer_phone.trim();
  const email = values.customer_email.trim();

  if (name.length < 2) errors.customer_name = 'Please tell us your name';
  else if (name.length > 80) errors.customer_name = 'That name is a little too long';

  if (!PHONE.test(phone)) errors.customer_phone = 'Enter a valid 10-digit Indian mobile number';

  if (email && (!EMAIL.test(email) || email.length > 120)) {
    errors.customer_email = 'Enter a valid email address, or leave it blank';
  }

  if (values.fulfilment === 'delivery') {
    const address = values.address_line.trim();
    if (!address) errors.address_line = 'We need an address to deliver to';
    else if (address.length > 300) errors.address_line = 'Please shorten the address a little';

    if (!PINCODE.test(values.address_pincode.trim())) {
      errors.address_pincode = 'Enter your 6-digit pincode';
    }
  }

  if (values.address_landmark.trim().length > 120) {
    errors.address_landmark = 'Please shorten the landmark a little';
  }

  if (values.notes.trim().length > 500) errors.notes = 'Please keep notes under 500 characters';

  return errors;
}
