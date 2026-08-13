'use server';

import { revalidatePath } from 'next/cache';

import { requireStaffAction } from '@/app/admin/_lib/session';
import { RESERVATION_STATUSES, pickOption } from '@/lib/admin';

/**
 * Runs on the staff member's own session, so the reservations_staff policy
 * is what authorises the write. The service-role client is deliberately not
 * used anywhere in the dashboard.
 */
export async function setReservationStatus(formData: FormData): Promise<void> {
  const { supabase } = await requireStaffAction();

  const id = String(formData.get('id') ?? '');
  const status = pickOption(RESERVATION_STATUSES, formData.get('status'));

  const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
  if (error) throw new Error(`Could not update the reservation: ${error.message}`);

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');
}
