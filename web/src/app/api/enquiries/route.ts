import { NextResponse } from 'next/server';

import { sendEnquiryEmail } from '@/lib/email';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { createAdminClient, hasDatabase } from '@/lib/supabase/admin';
import { enquirySchema } from '@/lib/validation';

export async function POST(request: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: 'The contact form is not switched on yet — please call or message us instead.' },
      { status: 503 },
    );
  }

  const limit = rateLimit(`enquiry:${clientIp(request)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const parsed = enquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { company, ...input } = parsed.data;
  if (company) return NextResponse.json({ ok: true });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('enquiries')
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      type: input.type,
      message: input.message,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[enquiries] insert failed', error);
    return NextResponse.json({ error: 'Could not send your message' }, { status: 500 });
  }

  await sendEnquiryEmail(data);

  return NextResponse.json({ ok: true }, { status: 201 });
}
