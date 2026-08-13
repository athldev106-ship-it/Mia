'use client';

import { useFormStatus } from 'react-dom';

import { adminButtonClass, adminGhostButtonClass } from '@/components/admin/Panel';

/**
 * Submit that reports the enclosing form's pending state. Must live inside
 * the <form> it belongs to -- that is how useFormStatus finds it.
 */
export function SubmitButton({
  children,
  pendingLabel = 'Saving…',
  variant = 'solid',
  className = '',
  /** Guards destructive actions behind a browser confirm. */
  confirm,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: 'solid' | 'ghost';
  className?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  const base = variant === 'solid' ? adminButtonClass : adminGhostButtonClass;

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={confirm ? (event) => {
        if (!window.confirm(confirm)) event.preventDefault();
      } : undefined}
      className={`${base} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
