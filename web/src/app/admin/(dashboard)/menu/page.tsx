import type { Metadata } from 'next';

import {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  toggleItemAvailability,
  updateCategory,
  updateItem,
} from '@/app/admin/(dashboard)/menu/actions';
import { requireStaffPage } from '@/app/admin/_lib/session';
import { Badge } from '@/components/admin/Badge';
import { MenuCategoryForm } from '@/components/admin/MenuCategoryForm';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { EmptyState, Panel } from '@/components/admin/Panel';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { SPICE_LABELS } from '@/lib/admin';
import { formatINR } from '@/lib/types';

export const metadata: Metadata = { title: 'Menu' };
export const dynamic = 'force-dynamic';

// Safari still paints a disclosure triangle unless the webkit marker is
// hidden too, so both rules travel together.
const noMarker = 'list-none [&::-webkit-details-marker]:hidden';

const summaryClass = `${noMarker} cursor-pointer rounded-full border border-[var(--hairline)] px-3.5 py-1.5 text-xs transition-colors hover:bg-[var(--hairline)]`;

export default async function MenuAdminPage() {
  const { supabase } = await requireStaffPage();

  const [{ data: categoryRows }, { data: itemRows }] = await Promise.all([
    supabase.from('menu_categories').select('*').order('sort_order').order('name'),
    supabase.from('menu_items').select('*').order('sort_order').order('name'),
  ]);

  const categories = categoryRows ?? [];
  const items = itemRows ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Menu
        </h1>
        <p className="text-sm opacity-70">
          {categories.length} categories · {items.length} dishes
        </p>
      </div>

      <Panel
        title="Add a category"
        subtitle="Sections are ordered by sort order, then by name."
      >
        <MenuCategoryForm
          action={createCategory}
          submitLabel="Add category"
          idPrefix="new-category"
        />
      </Panel>

      {categories.length === 0 ? (
        <Panel>
          <EmptyState>No categories yet. Add one above to start building the menu.</EmptyState>
        </Panel>
      ) : (
        categories.map((category) => {
          const categoryItems = items.filter((item) => item.category_id === category.id);

          return (
            <Panel
              key={category.id}
              title={category.name}
              subtitle={`/${category.slug} · ${categoryItems.length} dish${
                categoryItems.length === 1 ? '' : 'es'
              }`}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  {!category.is_active && <Badge label="Hidden" tone="bad" />}
                  <span className="text-xs opacity-70 tabular-nums">#{category.sort_order}</span>
                </div>
              }
            >
              {categoryItems.length === 0 ? (
                <EmptyState>Nothing in this section yet.</EmptyState>
              ) : (
                <ul className="divide-y divide-[var(--hairline)]">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="py-2.5">
                      <details>
                        <summary
                          className={`flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 ${noMarker}`}
                        >
                          <span
                            aria-hidden
                            className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border"
                            style={{ borderColor: item.is_veg ? '#2f7d32' : '#a3271f' }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: item.is_veg ? '#2f7d32' : '#a3271f' }}
                            />
                          </span>
                          <span className="min-w-0 flex-1 text-sm">
                            {item.name}
                            {item.description && (
                              <span className="block text-xs opacity-70">{item.description}</span>
                            )}
                          </span>
                          {item.spice_level > 0 && (
                            <Badge label={SPICE_LABELS[item.spice_level]} tone="neutral" />
                          )}
                          {item.is_featured && <Badge label="Featured" tone="good" />}
                          {!item.is_available && <Badge label="86'd" tone="bad" />}
                          <span className="w-24 shrink-0 text-right text-sm tabular-nums">
                            {formatINR(item.price_paise)}
                          </span>
                          <span className="text-xs opacity-70">Edit</span>
                        </summary>

                        <div className="mt-4 rounded-xl border border-[var(--hairline)] p-4">
                          <MenuItemForm
                            action={updateItem}
                            categories={categories}
                            item={item}
                            submitLabel="Save dish"
                            idPrefix={`item-${item.id}`}
                          />

                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-4">
                            <form action={toggleItemAvailability}>
                              <input type="hidden" name="id" value={item.id} />
                              <input
                                type="hidden"
                                name="is_available"
                                value={item.is_available ? 'false' : 'true'}
                              />
                              <SubmitButton variant="ghost" pendingLabel="Updating…">
                                {item.is_available ? 'Mark unavailable' : 'Mark available'}
                              </SubmitButton>
                            </form>

                            <form action={deleteItem}>
                              <input type="hidden" name="id" value={item.id} />
                              <SubmitButton
                                variant="ghost"
                                pendingLabel="Deleting…"
                                confirm={`Delete "${item.name}" from the menu? This cannot be undone.`}
                              >
                                Delete dish
                              </SubmitButton>
                            </form>
                          </div>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--hairline)] pt-4">
                <details className="w-full">
                  <summary className={`${summaryClass} inline-block`}>Add a dish</summary>
                  <div className="mt-4 rounded-xl border border-[var(--hairline)] p-4">
                    <MenuItemForm
                      action={createItem}
                      categories={categories}
                      defaultCategoryId={category.id}
                      submitLabel="Add dish"
                      idPrefix={`new-item-${category.id}`}
                    />
                  </div>
                </details>

                <details className="w-full">
                  <summary className={`${summaryClass} inline-block`}>Edit this category</summary>
                  <div className="mt-4 rounded-xl border border-[var(--hairline)] p-4">
                    <MenuCategoryForm
                      action={updateCategory}
                      category={category}
                      submitLabel="Save category"
                      idPrefix={`category-${category.id}`}
                    />

                    <form
                      action={deleteCategory}
                      className="mt-4 border-t border-[var(--hairline)] pt-4"
                    >
                      <input type="hidden" name="id" value={category.id} />
                      <SubmitButton
                        variant="ghost"
                        pendingLabel="Deleting…"
                        confirm={`Delete "${category.name}" and all ${categoryItems.length} dish(es) inside it? This cannot be undone.`}
                      >
                        Delete category
                      </SubmitButton>
                    </form>
                  </div>
                </details>
              </div>
            </Panel>
          );
        })
      )}
    </div>
  );
}
