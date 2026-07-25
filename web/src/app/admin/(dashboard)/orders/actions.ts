'use server';

import { revalidatePath } from 'next/cache';

import { requireStaffAction } from '@/app/admin/_lib/session';
import { ORDER_STATUSES, pickOption } from '@/lib/admin';

export async function setOrderStatus(formData: FormData): Promise<void> {
  const { supabase } = await requireStaffAction();

  const id = String(formData.get('id') ?? '');
  const status = pickOption(ORDER_STATUSES, formData.get('status'));

  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw new Error(`Could not update the order: ${error.message}`);

  revalidatePath('/admin/orders');
  revalidatePath('/admin');
}
