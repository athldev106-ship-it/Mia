/**
 * Order pricing rules. These are placeholders pending confirmation from the
 * restaurant -- GST on restaurant service is 5% without input tax credit,
 * but delivery fee and the free-delivery threshold are business decisions.
 */
export const GST_RATE = 0.05;
export const DELIVERY_FEE_PAISE = 4900; // ₹49
export const FREE_DELIVERY_ABOVE_PAISE = 59900; // ₹599

export function priceOrder(subtotalPaise: number, fulfilment: 'takeaway' | 'delivery') {
  const tax_paise = Math.round(subtotalPaise * GST_RATE);
  const delivery_fee_paise =
    fulfilment === 'delivery' && subtotalPaise < FREE_DELIVERY_ABOVE_PAISE
      ? DELIVERY_FEE_PAISE
      : 0;
  return {
    subtotal_paise: subtotalPaise,
    tax_paise,
    delivery_fee_paise,
    total_paise: subtotalPaise + tax_paise + delivery_fee_paise,
  };
}

/** Human-friendly reference a guest can read out over the phone. */
function reference(prefix: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${prefix}-${suffix}`;
}

/** e.g. ORD-8F3K2A */
export const generateOrderNumber = () => reference('ORD');

/** e.g. BUF-9K2M4P */
export const generateBookingNumber = () => reference('BUF');
