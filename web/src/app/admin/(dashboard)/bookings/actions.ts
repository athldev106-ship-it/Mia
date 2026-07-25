'use server';

import { revalidatePath } from 'next/cache';

import { requireStaffAction } from '@/app/admin/_lib/session';
import { BOOKING_STATUSES, pickOption } from '@/lib/admin';

/**
 * Payment status is owned by the Razorpay webhook and is never edited here;
 * the pass only moves a booking through booked -> seated -> completed.
 */
export async function setBookingStatus(formData: FormData): Promise<void> {
  const { supabase } = await requireStaffAction();

  const id = String(formData.get('id') ?? '');
  const status = pickOption(BOOKING_STATUSES, formData.get('status'));

  const { error } = await supabase.from('buffet_bookings').update({ status }).eq('id', id);
  if (error) throw new Error(`Could not update the booking: ${error.message}`);

  revalidatePath('/admin/bookings');
  revalidatePath('/admin');
}
