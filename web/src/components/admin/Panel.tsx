import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Denser cousins of the public site's controls. Same tokens, same glass,
 * tighter padding and smaller radii -- a dashboard is read in rows, not in
 * paragraphs.
 */
export const adminControlClass =
  'w-full rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] px-3 py-2 text-sm outline-none transition-shadow placeholder:opacity-40 focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50';

export const adminButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-ink)] transition-opacity hover:opacity-90 disabled:opacity-50';

export const adminGhostButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)] disabled:opacity-50';

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass glass-sheen p-4 sm:p-5 ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-0.5 text-xs opacity-55">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-[0.16em] opacity-55">{label}</p>
      <p className="mt-2 text-3xl tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs opacity-55">{hint}</p>}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="glass glass-sheen block p-4 transition-transform duration-300 hover:-translate-y-0.5"
    >
      {body}
    </Link>
  ) : (
    <div className="glass glass-sheen p-4">{body}</div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-[var(--hairline)] px-4 py-8 text-center text-sm opacity-55">
      {children}
    </p>
  );
}

/** Horizontal scroll container, so wide tables never push the page sideways. */
export function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[46rem] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`border-b border-[var(--hairline)] px-2 py-2 text-left text-[11px] font-medium uppercase tracking-[0.14em] opacity-55 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <td className={`border-b border-[var(--hairline)] px-2 py-3 align-top ${className}`}>
      {children}
    </td>
  );
}
