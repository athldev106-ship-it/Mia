import { NextResponse } from 'next/server';

import { clientIp, rateLimit } from '@/lib/rate-limit';
import { createAdminClient, hasDatabase } from '@/lib/supabase/admin';
import { newsletterSchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: 'Signups are not switched on yet — ask us at the counter for your discount.' },
      { status: 503 },
    );
  }

  const limit = rateLimit(`newsletter:${clientIp(request)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  }

  const { company, email } = parsed.data;
  if (company) return NextResponse.json({ ok: true });

  const supabase = createAdminClient();
  // Signing up twice is not an error worth showing anyone -- onConflict
  // makes the second attempt a no-op that still reports success.
  const { error } = await supabase
    .from('subscribers')
    .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });

  if (error) {
    console.error('[newsletter] upsert failed', error);
    return NextResponse.json({ error: 'Could not sign you up' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
