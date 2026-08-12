'use client';

import { useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { adminControlClass } from '@/components/admin/Panel';
import type { Option } from '@/lib/admin';

function Pending() {
  const { pending } = useFormStatus();
  return (
    <span aria-live="polite" className="text-[11px] opacity-70">
      {pending ? 'Saving…' : ''}
    </span>
  );
}

/**
 * One-field status editor. Picking a value submits immediately, which is
 * what a busy pass wants; the explicit button is the no-JavaScript path and
 * hides itself once the document is marked scripted (see globals.css).
 */
export function StatusSelect({
  action,
  id,
  name = 'status',
  value,
  options,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  name?: string;
  value: string;
  options: readonly Option[];
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const selectId = `${name}-${id}`;

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        defaultValue={value}
        onChange={() => formRef.current?.requestSubmit()}
        className={`${adminControlClass} min-w-[8.5rem] py-1.5`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-full border border-[var(--hairline)] px-3 py-1 text-xs [[data-js]_&]:hidden"
      >
        Save
      </button>
      <Pending />
    </form>
  );
}
