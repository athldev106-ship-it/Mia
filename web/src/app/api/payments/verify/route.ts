import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sendOrderEmails } from '@/lib/email';
import { verifyCheckoutSignature } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * Called by the browser from Razorpay Checkout's success handler. The webhook
 * is the authoritative record; this exists so the customer sees a confirmed
 * page immediately instead of waiting on webhook delivery.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', razorpay_order_id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // The webhook may have landed first; don't double-send confirmation email.
  const alreadyPaid = order.payment_status === 'paid';

  if (!alreadyPaid) {
    await supabase
      .from('orders')
      .update({ payment_status: 'paid', razorpay_payment_id, status: 'accepted' })
      .eq('id', order.id);

    const { data: items } = await supabase
      .from('order_items')
      .select('name_snapshot, quantity, unit_price_paise')
      .eq('order_id', order.id);

    const { data: settings } = await supabase
      .from('site_settings')
      .select('restaurant_name')
      .eq('id', 1)
      .maybeSingle();

    await sendOrderEmails(
      { ...order, payment_status: 'paid', razorpay_payment_id },
      items ?? [],
      settings?.restaurant_name ?? 'our restaurant',
    );
  }

  return NextResponse.json({ ok: true, order_number: order.order_number });
}
