import type { ActionState } from '@/lib/admin';

/** Renders whatever a Server Action returned, in the right tone. */
export function FormNotice({ state }: { state: ActionState }) {
  if (state.status === 'idle') return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={`text-xs ${state.status === 'error' ? 'text-[var(--alert)]' : 'opacity-70'}`}
    >
      {state.message}
    </p>
  );
}
