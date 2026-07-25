import 'server-only';

import { sendBuffetBookingEmails, sendOrderEmails } from '@/lib/email';
import { createAdminClient } from '@/lib/supabase/admin';

type Settlement =
  | { found: false }
  | { found: true; kind: 'order' | 'buffet'; reference: string; alreadyPaid: boolean };

/**
 * Marks whatever a Razorpay order paid for as paid, and sends confirmation
 * once. Both the browser callback and the webhook route through here, and
 * either may arrive first, so this must stay idempotent.
 */
export async function settlePayment(
  razorpayOrderId: string,
  razorpayPaymentId: string | null,
): Promise<Settlement> {
  const supabase = createAdminClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('restaurant_name')
    .eq('id', 1)
    .maybeSingle();
  const restaurantName = settings?.restaurant_name ?? 'our restaurant';

  // A la carte order?
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();

  if (order) {
    if (order.payment_status === 'paid') {
      return { found: true, kind: 'order', reference: order.order_number, alreadyPaid: true };
    }

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        status: order.status === 'placed' ? 'accepted' : order.status,
      })
      .eq('id', order.id);

    const { data: items } = await supabase
      .from('order_items')
      .select('name_snapshot, quantity, unit_price_paise')
      .eq('order_id', order.id);

    await sendOrderEmails(
      { ...order, payment_status: 'paid', razorpay_payment_id: razorpayPaymentId },
      items ?? [],
      restaurantName,
    );

    return { found: true, kind: 'order', reference: order.order_number, alreadyPaid: false };
  }

  // Buffet or brunch booking?
  const { data: booking } = await supabase
    .from('buffet_bookings')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();

  if (booking) {
    if (booking.payment_status === 'paid') {
      return { found: true, kind: 'buffet', reference: booking.booking_number, alreadyPaid: true };
    }

    await supabase
      .from('buffet_bookings')
      .update({ payment_status: 'paid', razorpay_payment_id: razorpayPaymentId })
      .eq('id', booking.id);

    const { data: session } = await supabase
      .from('buffet_sessions')
      .select('name, start_time, end_time')
      .eq('id', booking.session_id)
      .maybeSingle();

    await sendBuffetBookingEmails(
      { ...booking, payment_status: 'paid', razorpay_payment_id: razorpayPaymentId },
      session ?? { name: 'Buffet', start_time: '', end_time: '' },
      restaurantName,
    );

    return { found: true, kind: 'buffet', reference: booking.booking_number, alreadyPaid: false };
  }

  return { found: false };
}

/** Marks a failed payment without touching anything already settled. */
export async function markPaymentFailed(razorpayOrderId: string) {
  const supabase = createAdminClient();

  await supabase
    .from('orders')
    .update({ payment_status: 'failed' })
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('payment_status', 'pending');

  await supabase
    .from('buffet_bookings')
    .update({ payment_status: 'failed' })
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('payment_status', 'pending');
}
