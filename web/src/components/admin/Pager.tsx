import Link from 'next/link';

import { PAGE_SIZE, type SearchParams } from '@/lib/admin';

function hrefFor(base: string, search: SearchParams, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (key === 'page' || value === undefined) continue;
    const single = Array.isArray(value) ? value[0] : value;
    if (single) params.set(key, single);
  }
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

/** Offset pagination. Total comes from Supabase's exact count header. */
export function Pager({
  base,
  search,
  page,
  total,
}: {
  base: string;
  search: SearchParams;
  page: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex items-center justify-between gap-3 text-sm"
    >
      <p className="text-xs opacity-70 tabular-nums">
        {from}–{to} of {total}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={hrefFor(base, search, page - 1)}
            className="rounded-full border border-[var(--hairline)] px-4 py-1.5 transition-colors hover:bg-[var(--hairline)]"
          >
            Previous
          </Link>
        )}
        {page < pages && (
          <Link
            href={hrefFor(base, search, page + 1)}
            className="rounded-full border border-[var(--hairline)] px-4 py-1.5 transition-colors hover:bg-[var(--hairline)]"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
