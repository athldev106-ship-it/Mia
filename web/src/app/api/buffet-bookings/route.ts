import { NextResponse } from 'next/server';

import { GST_RATE, generateBookingNumber } from '@/lib/pricing';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { razorpay } from '@/lib/razorpay';
import { createAdminClient } from '@/lib/supabase/admin';
import { buffetBookingSchema } from '@/lib/validation';

/**
 * Creates a buffet/brunch booking and the Razorpay order that pays for it.
 * Capacity and pricing are decided inside create_buffet_booking so two
 * simultaneous checkouts cannot oversell the same sitting.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`buffet:${clientIp(request)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = buffetBookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { company, ...input } = parsed.data;
  if (company) return NextResponse.json({ ok: true });

  const supabase = createAdminClient();

  const { data: booking, error } = await supabase.rpc('create_buffet_booking', {
    p_session_id: input.session_id,
    p_date: input.booking_date,
    p_adults: input.adults,
    p_children: input.children,
    p_name: input.customer_name,
    p_phone: input.customer_phone,
    p_email: input.customer_email || null,
    p_notes: input.notes || null,
    p_booking_number: generateBookingNumber(),
    p_gst_rate: GST_RATE,
  });

  if (error || !booking) {
    const message = error?.message ?? '';

    if (message.includes('sold_out')) {
      const remaining = Number(message.split('sold_out:')[1]?.trim() ?? 0);
      return NextResponse.json(
        {
          error:
            remaining > 0
              ? `Only ${remaining} ${remaining === 1 ? 'cover' : 'covers'} left for this sitting.`
              : 'This sitting is fully booked.',
          remaining,
        },
        { status: 409 },
      );
    }
    if (message.includes('wrong_day')) {
      return NextResponse.json(
        { error: 'That sitting does not run on the date you picked.' },
        { status: 409 },
      );
    }
    if (message.includes('date_in_past')) {
      return NextResponse.json({ error: 'Pick a date in the future.' }, { status: 400 });
    }
    if (message.includes('session_unavailable')) {
      return NextResponse.json({ error: 'That sitting is no longer available.' }, { status: 404 });
    }

    console.error('[buffet-bookings] create failed', error);
    return NextResponse.json({ error: 'Could not create your booking' }, { status: 500 });
  }

  let rzpOrder;
  try {
    rzpOrder = await razorpay().orders.create({
      amount: booking.total_paise,
      currency: 'INR',
      receipt: booking.booking_number,
      notes: { kind: 'buffet', booking_id: booking.id, booking_number: booking.booking_number },
    });
  } catch (rzpError) {
    console.error('[buffet-bookings] razorpay create failed', rzpError);
    // Release the held covers rather than leaving a phantom booking.
    await supabase.from('buffet_bookings').delete().eq('id', booking.id);
    return NextResponse.json({ error: 'Could not start payment' }, { status: 502 });
  }

  await supabase
    .from('buffet_bookings')
    .update({ razorpay_order_id: rzpOrder.id })
    .eq('id', booking.id);

  return NextResponse.json(
    {
      ok: true,
      booking_id: booking.id,
      booking_number: booking.booking_number,
      amount: booking.total_paise,
      currency: 'INR',
      razorpay_order_id: rzpOrder.id,
      razorpay_key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      breakdown: {
        subtotal_paise: booking.subtotal_paise,
        tax_paise: booking.tax_paise,
        total_paise: booking.total_paise,
      },
    },
    { status: 201 },
  );
}

/** Remaining covers for a sitting on a date, for the availability UI. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const date = searchParams.get('date');

  if (!sessionId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'session_id and date are required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: session } = await supabase
    .from('buffet_sessions')
    .select('capacity, day_of_week')
    .eq('id', sessionId)
    .eq('is_active', true)
    .maybeSingle();

  if (!session) return NextResponse.json({ error: 'Sitting not found' }, { status: 404 });

  // ISO weekday: getUTCDay() gives 0 for Sunday, the database expects 7.
  const isoDay = new Date(`${date}T00:00:00Z`).getUTCDay() || 7;
  if (session.day_of_week !== null && session.day_of_week !== isoDay) {
    return NextResponse.json({ available: false, remaining: 0, reason: 'not_running' });
  }

  // capacity 0 means the restaurant is not capping this sitting.
  if (session.capacity === 0) {
    return NextResponse.json({ available: true, remaining: null, unlimited: true });
  }

  const { data: taken } = await supabase.rpc('buffet_covers_taken', {
    p_session_id: sessionId,
    p_date: date,
  });

  const remaining = Math.max(0, session.capacity - (taken ?? 0));
  return NextResponse.json({ available: remaining > 0, remaining, unlimited: false });
}
