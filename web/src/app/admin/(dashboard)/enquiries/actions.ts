'use server';

import { revalidatePath } from 'next/cache';

import { requireStaffAction } from '@/app/admin/_lib/session';
import { ENQUIRY_STATUSES, pickOption } from '@/lib/admin';

export async function setEnquiryStatus(formData: FormData): Promise<void> {
  const { supabase } = await requireStaffAction();

  const id = String(formData.get('id') ?? '');
  const status = pickOption(ENQUIRY_STATUSES, formData.get('status'));

  const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
  if (error) throw new Error(`Could not update the enquiry: ${error.message}`);

  revalidatePath('/admin/enquiries');
  revalidatePath('/admin');
}
