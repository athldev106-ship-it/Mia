import { NextResponse } from 'next/server';

import { generateOrderNumber, priceOrder } from '@/lib/pricing';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { razorpay } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';
import { orderSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const limit = rateLimit(`order:${clientIp(request)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check your order', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { company, items, ...input } = parsed.data;
  if (company) return NextResponse.json({ ok: true });

  const supabase = createAdminClient();

  const { data: settings } = await supabase
    .from('site_settings')
    .select('is_accepting_orders')
    .eq('id', 1)
    .maybeSingle();

  if (settings && !settings.is_accepting_orders) {
    return NextResponse.json(
      { error: 'We are not taking online orders right now.' },
      { status: 409 },
    );
  }

  // Prices come from the database, never from the browser -- a tampered cart
  // cannot change what the customer is charged.
  const ids = [...new Set(items.map((item) => item.menu_item_id))];
  const { data: menuItems, error: menuError } = await supabase
    .from('menu_items')
    .select('id, name, price_paise, is_available')
    .in('id', ids);

  if (menuError || !menuItems) {
    console.error('[orders] menu lookup failed', menuError);
    return NextResponse.json({ error: 'Could not price your order' }, { status: 500 });
  }

  const byId = new Map(menuItems.map((item) => [item.id, item]));
  const unavailable = ids.filter((id) => !byId.get(id)?.is_available);
  if (unavailable.length > 0) {
    return NextResponse.json(
      {
        error: 'Some items are no longer available',
        unavailable: unavailable.map((id) => byId.get(id)?.name ?? id),
      },
      { status: 409 },
    );
  }

  const lineItems = items.map((item) => {
    const menuItem = byId.get(item.menu_item_id)!;
    return {
      menu_item_id: menuItem.id,
      name_snapshot: menuItem.name,
      unit_price_paise: menuItem.price_paise,
      quantity: item.quantity,
    };
  });

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.unit_price_paise * item.quantity,
    0,
  );
  const totals = priceOrder(subtotal, input.fulfilment);

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email || null,
      fulfilment: input.fulfilment,
      address_line: input.address_line || null,
      address_landmark: input.address_landmark || null,
      address_pincode: input.address_pincode || null,
      notes: input.notes || null,
      ...totals,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('[orders] insert failed', orderError);
    return NextResponse.json({ error: 'Could not create your order' }, { status: 500 });
  }

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(lineItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    console.error('[orders] items insert failed', itemsError);
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'Could not create your order' }, { status: 500 });
  }

  let rzpOrder;
  try {
    rzpOrder = await razorpay().orders.create({
      amount: order.total_paise,
      currency: 'INR',
      receipt: order.order_number,
      notes: { order_id: order.id, order_number: order.order_number },
    });
  } catch (error) {
    console.error('[orders] razorpay create failed', error);
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'Could not start payment' }, { status: 502 });
  }

  await supabase.from('orders').update({ razorpay_order_id: rzpOrder.id }).eq('id', order.id);

  return NextResponse.json(
    {
      ok: true,
      order_id: order.id,
      order_number: order.order_number,
      amount: order.total_paise,
      currency: 'INR',
      razorpay_order_id: rzpOrder.id,
      razorpay_key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      breakdown: totals,
    },
    { status: 201 },
  );
}
