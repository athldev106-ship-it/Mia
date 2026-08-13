'use client';

import { useActionState, useEffect, useRef } from 'react';

import { FormNotice } from '@/components/admin/FormNotice';
import { adminControlClass } from '@/components/admin/Panel';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Field } from '@/components/Field';
import { IDLE_ACTION, type ActionState } from '@/lib/admin';
import type { MenuCategory } from '@/lib/types';

export function MenuCategoryForm({
  action,
  category,
  submitLabel,
  idPrefix,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  category?: MenuCategory;
  submitLabel: string;
  /** Keeps label/input ids unique when several of these share a page. */
  idPrefix: string;
}) {
  const [state, formAction] = useActionState(action, IDLE_ACTION);
  const formRef = useRef<HTMLFormElement>(null);
  const isCreate = !category;

  // A create form that keeps its last entry invites duplicate rows.
  useEffect(() => {
    if (isCreate && state.status === 'ok') formRef.current?.reset();
  }, [isCreate, state]);

  const field = (name: string) => `${idPrefix}-${name}`;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={field('name')} required>
          <input
            id={field('name')}
            name="name"
            defaultValue={category?.name ?? ''}
            className={adminControlClass}
            maxLength={80}
            required
          />
        </Field>

        <Field
          label="Web address"
          htmlFor={field('slug')}
          hint="Leave blank to build one from the name."
        >
          <input
            id={field('slug')}
            name="slug"
            defaultValue={category?.slug ?? ''}
            placeholder="south-indian"
            className={adminControlClass}
            maxLength={60}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor={field('description')}>
        <textarea
          id={field('description')}
          name="description"
          rows={2}
          defaultValue={category?.description ?? ''}
          className={adminControlClass}
          maxLength={300}
        />
      </Field>

      <div className="flex flex-wrap items-end gap-4">
        <Field label="Sort order" htmlFor={field('sort_order')}>
          <input
            id={field('sort_order')}
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={category?.sort_order ?? 0}
            className={`${adminControlClass} w-28`}
          />
        </Field>

        <label className="flex items-center gap-2 pb-2.5 text-sm">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={category ? category.is_active : true}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Show on the public menu
        </label>

        <div className="ml-auto flex items-center gap-3 pb-1">
          <FormNotice state={state} />
          <SubmitButton>{submitLabel}</SubmitButton>
        </div>
      </div>
    </form>
  );
}
