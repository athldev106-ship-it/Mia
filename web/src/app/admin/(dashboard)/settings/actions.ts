'use server';

import { revalidatePath } from 'next/cache';

import { requireStaffAction } from '@/app/admin/_lib/session';
import {
  AdminInputError,
  checkbox,
  optionalText,
  requiredText,
  toActionState,
  type ActionState,
} from '@/lib/admin';

/**
 * Opening hours are stored as a flat {day: "6:30 AM - 11:00 PM"} object.
 * The form posts one `hours.<key>` field per row, so any key already in the
 * JSON survives an edit even though the UI leads with the seven weekdays.
 */
function readOpeningHours(formData: FormData): Record<string, string> {
  const hours: Record<string, string> = {};

  for (const [field, value] of formData.entries()) {
    if (!field.startsWith('hours.')) continue;
    const key = field.slice('hours.'.length).trim();
    const text = String(value).trim();
    if (!key) continue;
    if (text.length > 120) throw new AdminInputError(`Hours for ${key} are too long.`);
    if (text) hours[key] = text;
  }

  return hours;
}

export async function updateSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase, profile } = await requireStaffAction();

    // site_settings_admin_write is admin-only. Saying so up front beats a
    // policy rejection that reads like a bug.
    if (profile.role !== 'admin') {
      throw new AdminInputError('Only an administrator can change the site settings.');
    }

    const { error } = await supabase.from('site_settings').upsert({
      id: 1,
      restaurant_name: requiredText(formData, 'restaurant_name', 'Restaurant name', 120),
      tagline: optionalText(formData, 'tagline', 200),
      address: optionalText(formData, 'address', 300),
      google_maps_url: optionalText(formData, 'google_maps_url', 500),
      phone: optionalText(formData, 'phone', 30),
      whatsapp: optionalText(formData, 'whatsapp', 30),
      email: optionalText(formData, 'email', 120),
      instagram_url: optionalText(formData, 'instagram_url', 500),
      swiggy_url: optionalText(formData, 'swiggy_url', 500),
      zomato_url: optionalText(formData, 'zomato_url', 500),
      opening_hours: readOpeningHours(formData),
      is_open: checkbox(formData, 'is_open'),
    });

    if (error) throw new AdminInputError('Could not save the settings.');

    revalidatePath('/admin/settings');
    revalidatePath('/', 'layout');

    return { status: 'ok', message: 'Settings saved.' };
  } catch (error) {
    return toActionState(error);
  }
}
