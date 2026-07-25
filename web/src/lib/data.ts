import { createAdminClient } from '@/lib/supabase/admin';

import type { BuffetSession, MenuCategory, MenuItem } from '@/lib/types';

/**
 * Read helpers for public pages.
 *
 * Every one of these degrades to empty rather than throwing: before
 * Supabase is wired up, and if it is ever briefly unreachable, the site
 * should still render its copy, hours and contact details instead of
 * showing an error page to a hungry guest.
 */
function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export type MenuCategoryWithItems = MenuCategory & { items: MenuItem[] };

export async function getMenu(): Promise<MenuCategoryWithItems[]> {
  if (!configured()) return [];

  try {
    const supabase = createAdminClient();

    const [{ data: categories }, { data: items }] = await Promise.all([
      supabase
        .from('menu_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      supabase.from('menu_items').select('*').order('sort_order'),
    ]);

    if (!categories) return [];

    return categories.map((category) => ({
      ...category,
      items: (items ?? []).filter((item) => item.category_id === category.id),
    }));
  } catch (error) {
    console.error('[data] getMenu failed', error);
    return [];
  }
}

export async function getBuffetSessions(): Promise<BuffetSession[]> {
  if (!configured()) return [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('buffet_sessions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    return data ?? [];
  } catch (error) {
    console.error('[data] getBuffetSessions failed', error);
    return [];
  }
}
