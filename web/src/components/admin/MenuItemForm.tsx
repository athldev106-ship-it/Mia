'use client';

import { useActionState, useEffect, useRef } from 'react';

import { FormNotice } from '@/components/admin/FormNotice';
import { adminControlClass } from '@/components/admin/Panel';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Field } from '@/components/Field';
import { IDLE_ACTION, SPICE_LABELS, paiseToRupeeInput, type ActionState } from '@/lib/admin';
import type { MenuCategory, MenuItem } from '@/lib/types';

export function MenuItemForm({
  action,
  categories,
  item,
  defaultCategoryId,
  submitLabel,
  idPrefix,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  categories: MenuCategory[];
  item?: MenuItem;
  defaultCategoryId?: string;
  submitLabel: string;
  idPrefix: string;
}) {
  const [state, formAction] = useActionState(action, IDLE_ACTION);
  const formRef = useRef<HTMLFormElement>(null);
  const isCreate = !item;

  useEffect(() => {
    if (isCreate && state.status === 'ok') formRef.current?.reset();
  }, [isCreate, state]);

  const field = (name: string) => `${idPrefix}-${name}`;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <Field label="Dish name" htmlFor={field('name')} required>
          <input
            id={field('name')}
            name="name"
            defaultValue={item?.name ?? ''}
            className={adminControlClass}
            maxLength={120}
            required
          />
        </Field>

        <Field label="Price (₹)" htmlFor={field('price')} required hint="Rupees, e.g. 249.50">
          <input
            id={field('price')}
            name="price_rupees"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            defaultValue={item ? paiseToRupeeInput(item.price_paise) : ''}
            className={adminControlClass}
            required
          />
        </Field>

        <Field label="Category" htmlFor={field('category')} required>
          <select
            id={field('category')}
            name="category_id"
            defaultValue={item?.category_id ?? defaultCategoryId ?? ''}
            className={adminControlClass}
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description" htmlFor={field('description')}>
        <textarea
          id={field('description')}
          name="description"
          rows={2}
          defaultValue={item?.description ?? ''}
          className={adminControlClass}
          maxLength={400}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Spice level" htmlFor={field('spice')}>
          <select
            id={field('spice')}
            name="spice_level"
            defaultValue={String(item?.spice_level ?? 0)}
            className={adminControlClass}
          >
            {SPICE_LABELS.map((label, level) => (
              <option key={label} value={level}>
                {level} — {label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tags" htmlFor={field('tags')} hint="Comma separated.">
          <input
            id={field('tags')}
            name="tags"
            defaultValue={item?.tags.join(', ') ?? ''}
            placeholder="chef's special, gluten free"
            className={adminControlClass}
          />
        </Field>

        <Field label="Sort order" htmlFor={field('sort_order')}>
          <input
            id={field('sort_order')}
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={item?.sort_order ?? 0}
            className={adminControlClass}
          />
        </Field>
      </div>

      <Field label="Image URL" htmlFor={field('image')} hint="Optional, from Supabase Storage.">
        <input
          id={field('image')}
          name="image_url"
          type="url"
          defaultValue={item?.image_url ?? ''}
          className={adminControlClass}
          maxLength={500}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_veg"
            defaultChecked={item ? item.is_veg : true}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Vegetarian
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_available"
            defaultChecked={item ? item.is_available : true}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Available
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={item ? item.is_featured : false}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Featured
        </label>

        <div className="ml-auto flex items-center gap-3">
          <FormNotice state={state} />
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </div>
    </form>
  );
}
