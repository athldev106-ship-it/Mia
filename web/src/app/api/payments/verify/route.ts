import { NextResponse } from 'next/server';
import { z } from 'zod';

import { settlePayment } from '@/lib/payments';
import { verifyCheckoutSignature } from '@/lib/razorpay';

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * Called by the browser from Razorpay Checkout's success handler. The webhook
 * is the authoritative record; this exists so the guest sees a confirmed page
 * immediately instead of waiting on webhook delivery.
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

  const result = await settlePayment(razorpay_order_id, razorpay_payment_id);

  if (!result.found) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, kind: result.kind, reference: result.reference });
}
