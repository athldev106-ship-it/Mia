'use client';

import { useRef, type ReactNode } from 'react';

/**
 * A plain GET form, so every filtered view is a shareable URL and works
 * with the browser's back button. Changing a control submits it; the Apply
 * button is the no-JavaScript path.
 */
export function FilterBar({ action, children }: { action: string; children: ReactNode }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      method="get"
      action={action}
      onChange={() => formRef.current?.requestSubmit()}
      className="flex flex-wrap items-end gap-3"
    >
      {children}
      <button
        type="submit"
        className="rounded-full border border-[var(--hairline)] px-4 py-2 text-sm [[data-js]_&]:hidden"
      >
        Apply
      </button>
    </form>
  );
}

export function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[11px] uppercase tracking-[0.14em] opacity-70"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
