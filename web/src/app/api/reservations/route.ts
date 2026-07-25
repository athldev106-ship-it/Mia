import { NextResponse } from 'next/server';

import { sendReservationEmails } from '@/lib/email';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import { reservationSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const limit = rateLimit(`reservation:${clientIp(request)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = reservationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Honeypot filled means a bot. Answer 200 so it learns nothing.
  const { company, ...input } = parsed.data;
  if (company) return NextResponse.json({ ok: true });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      party_size: input.party_size,
      reserved_at: input.reserved_at,
      occasion: input.occasion || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[reservations] insert failed', error);
    return NextResponse.json({ error: 'Could not save your booking' }, { status: 500 });
  }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('restaurant_name')
    .eq('id', 1)
    .maybeSingle();

  await sendReservationEmails(data, settings?.restaurant_name ?? 'our restaurant');

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
