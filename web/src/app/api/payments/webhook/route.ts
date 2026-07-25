import { NextResponse } from 'next/server';

import { markPaymentFailed, settlePayment } from '@/lib/payments';
import { verifyWebhookSignature } from '@/lib/razorpay';

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
  if (!payment?.order_id) return NextResponse.json({ ok: true, ignored: true });

  if (event.event === 'payment.captured') {
    // Always 200, even for unknown records -- a retry would not help Razorpay.
    const result = await settlePayment(payment.order_id, payment.id ?? null);
    return NextResponse.json({
      ok: true,
      ...(result.found ? { kind: result.kind, duplicate: result.alreadyPaid } : { ignored: true }),
    });
  }

  if (event.event === 'payment.failed') {
    await markPaymentFailed(payment.order_id);
  }

  return NextResponse.json({ ok: true });
}
