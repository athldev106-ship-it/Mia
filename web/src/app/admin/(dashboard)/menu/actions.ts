'use server';

import { revalidatePath } from 'next/cache';

import { requireStaffAction } from '@/app/admin/_lib/session';
import {
  AdminInputError,
  checkbox,
  integerField,
  optionalText,
  parseTags,
  requiredText,
  rupeesToPaise,
  slugify,
  toActionState,
  type ActionState,
} from '@/lib/admin';

/** Menu edits change a cached public page, so both are revalidated. */
function revalidateMenu() {
  revalidatePath('/admin/menu');
  revalidatePath('/menu');
  revalidatePath('/');
}

function requiredId(formData: FormData): string {
  const id = String(formData.get('id') ?? '').trim();
  if (!id) throw new AdminInputError('Nothing was selected to change.');
  return id;
}

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

function readCategory(formData: FormData) {
  const name = requiredText(formData, 'name', 'Category name', 80);
  // An empty slug is the common case: derive it rather than making staff
  // hand-write URL fragments.
  const slug = slugify(String(formData.get('slug') ?? '').trim() || name);
  if (!slug) throw new AdminInputError('That name cannot be turned into a web address.');

  return {
    name,
    slug,
    description: optionalText(formData, 'description', 300),
    sort_order: integerField(formData, 'sort_order', 'Sort order', 0, 9999),
    is_active: checkbox(formData, 'is_active'),
  };
}

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireStaffAction();
    const values = readCategory(formData);

    const { error } = await supabase.from('menu_categories').insert(values);
    if (error) {
      throw new AdminInputError(
        error.code === '23505'
          ? `The web address "${values.slug}" is already used by another category.`
          : 'Could not add that category.',
      );
    }

    revalidateMenu();
    return { status: 'ok', message: `Added ${values.name}.` };
  } catch (error) {
    return toActionState(error);
  }
}

export async function updateCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const { supabase } = await requireStaffAction();
    const id = requiredId(formData);
    const values = readCategory(formData);

    const { error } = await supabase.from('menu_categories').update(values).eq('id', id);
    if (error) {
      throw new AdminInputError(
        error.code === '23505'
          ? `The web address "${values.slug}" is already used by another category.`
          : 'Could not save that category.',
      );
    }

    revalidateMenu();
    return { status: 'ok', message: 'Saved.' };
  } catch (error) {
    return toActionState(error);
  }
}

/** Cascades to the category's items -- schema.sql deletes them on delete. */
export async function deleteCategory(formData: FormData): Promise<void> {
  const { supabase } = await requireStaffAction();
  const id = requiredId(formData);

  const { error } = await supabase.from('menu_categories').delete().eq('id', id);
  if (error) throw new Error(`Could not delete that category: ${error.message}`);

  revalidateMenu();
}

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

function readItem(formData: FormData) {
  const categoryId = String(formData.get('category_id') ?? '').trim();
  if (!categoryId) throw new AdminInputError('Choose a category for this dish.');

  return {
    category_id: categoryId,
    name: requiredText(formData, 'name', 'Dish name', 120),
    description: optionalText(formData, 'description', 400),
    // Staff type rupees; the column is integer paise.
    price_paise: rupeesToPaise(formData.get('price_rupees')),
    image_url: optionalText(formData, 'image_url', 500),
    is_veg: checkbox(formData, 'is_veg'),
    spice_level: integerField(formData, 'spice_level', 'Spice level', 0, 3),
    tags: parseTags(formData.get('tags')),
    is_available: checkbox(formData, 'is_available'),
    is_featured: checkbox(formData, 'is_featured'),
    sort_order: integerField(formData, 'sort_order', 'Sort order', 0, 9999),
  };
}

export async function createItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireStaffAction();
    const values = readItem(formData);

    const { error } = await supabase.from('menu_items').insert(values);
    if (error) throw new AdminInputError('Could not add that dish.');

    revalidateMenu();
    return { status: 'ok', message: `Added ${values.name}.` };
  } catch (error) {
    return toActionState(error);
  }
}

export async function updateItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const { supabase } = await requireStaffAction();
    const id = requiredId(formData);
    const values = readItem(formData);

    const { error } = await supabase.from('menu_items').update(values).eq('id', id);
    if (error) throw new AdminInputError('Could not save that dish.');

    revalidateMenu();
    return { status: 'ok', message: 'Saved.' };
  } catch (error) {
    return toActionState(error);
  }
}

export async function deleteItem(formData: FormData): Promise<void> {
  const { supabase } = await requireStaffAction();
  const id = requiredId(formData);

  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(`Could not delete that dish: ${error.message}`);

  revalidateMenu();
}

/** One-tap 86 button for the pass. */
export async function toggleItemAvailability(formData: FormData): Promise<void> {
  const { supabase } = await requireStaffAction();
  const id = requiredId(formData);
  const next = formData.get('is_available') === 'true';

  const { error } = await supabase.from('menu_items').update({ is_available: next }).eq('id', id);
  if (error) throw new Error(`Could not change availability: ${error.message}`);

  revalidateMenu();
}
