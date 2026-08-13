import type { ReactNode } from 'react';

const controlClass =
  'w-full rounded-2xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-4 py-3 text-sm outline-none transition-shadow placeholder:opacity-40 focus:ring-2 focus:ring-[var(--accent)]';

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-[var(--accent)]">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs opacity-70">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-[var(--alert)]">
          {error}
        </p>
      )}
    </div>
  );
}

export { controlClass };

/**
 * Hidden honeypot. Real guests never see or fill it; the server treats a
 * filled value as a bot and silently discards the submission.
 */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
      <label htmlFor="company">Company</label>
      <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
