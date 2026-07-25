import { NextResponse } from 'next/server';

import { sendOrderEmails } from '@/lib/email';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
// The signature is computed over the exact bytes Razorpay sent, so this route
// must never be statically optimised or have its body re-serialised.
export const dynamic = 'force-dynamic';

/** Authoritative payment state, independent of whether the browser came back. */
export async function POST(request: Request) {
  const signature = request.headers.get('x-razorpay-signature');
  const rawBody = await request.text();

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string } } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('razorpay_order_id', payment.order_id)
    .maybeSingle();

  // Always 200 on unknown orders -- retrying will not help Razorpay.
  if (!order) return NextResponse.json({ ok: true, ignored: true });

  if (event.event === 'payment.captured') {
    if (order.payment_status === 'paid') return NextResponse.json({ ok: true, duplicate: true });

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: payment.id ?? null,
        status: order.status === 'placed' ? 'accepted' : order.status,
      })
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
      { ...order, payment_status: 'paid', razorpay_payment_id: payment.id ?? null },
      items ?? [],
      settings?.restaurant_name ?? 'our restaurant',
    );
  } else if (event.event === 'payment.failed') {
    await supabase
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('id', order.id)
      .eq('payment_status', 'pending');
  }

  return NextResponse.json({ ok: true });
}
