import type { Metadata } from 'next';

import { setReservationStatus } from '@/app/admin/(dashboard)/reservations/actions';
import { requireStaffPage } from '@/app/admin/_lib/session';
import { FilterBar, FilterField } from '@/components/admin/FilterBar';
import { Pager } from '@/components/admin/Pager';
import {
  EmptyState,
  Panel,
  TableScroll,
  Td,
  Th,
  adminControlClass,
} from '@/components/admin/Panel';
import { StatusSelect } from '@/components/admin/StatusSelect';
import {
  PAGE_SIZE,
  RESERVATION_STATUSES,
  formatISTDateTime,
  isValidDate,
  istDayRange,
  pageParam,
  param,
  type SearchParams,
} from '@/lib/admin';
import type { ReservationStatus } from '@/lib/types';

export const metadata: Metadata = { title: 'Reservations' };
export const dynamic = 'force-dynamic';

const WHEN_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All dates' },
] as const;

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { supabase } = await requireStaffPage();
  const search = await searchParams;

  const statusFilter = param(search, 'status');
  const dateFilter = param(search, 'date');
  const when = param(search, 'when') || 'upcoming';
  const page = pageParam(search);

  let query = supabase.from('reservations').select('*', { count: 'exact' });

  if (RESERVATION_STATUSES.some((option) => option.value === statusFilter)) {
    query = query.eq('status', statusFilter as ReservationStatus);
  }

  // A specific day always wins over the coarse upcoming/past switch.
  if (isValidDate(dateFilter)) {
    const { start, end } = istDayRange(dateFilter);
    query = query.gte('reserved_at', start).lt('reserved_at', end);
  } else if (when === 'upcoming') {
    query = query.gte('reserved_at', new Date().toISOString());
  } else if (when === 'past') {
    query = query.lt('reserved_at', new Date().toISOString());
  }

  const ascending = !isValidDate(dateFilter) && when === 'upcoming';

  const { data, count } = await query
    .order('reserved_at', { ascending })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const reservations = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Reservations
        </h1>
        <p className="text-sm opacity-70">{count ?? 0} matching</p>
      </div>

      <Panel>
        <FilterBar action="/admin/reservations">
          <FilterField label="Status" htmlFor="filter-status">
            <select
              id="filter-status"
              name="status"
              defaultValue={statusFilter}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              <option value="">Any status</option>
              {RESERVATION_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="When" htmlFor="filter-when">
            <select
              id="filter-when"
              name="when"
              defaultValue={when}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              {WHEN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="On date" htmlFor="filter-date">
            <input
              id="filter-date"
              name="date"
              type="date"
              defaultValue={isValidDate(dateFilter) ? dateFilter : ''}
              className={adminControlClass}
            />
          </FilterField>

          <a
            href="/admin/reservations"
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            Reset
          </a>
        </FilterBar>
      </Panel>

      <Panel>
        {reservations.length === 0 ? (
          <EmptyState>Nothing matches these filters.</EmptyState>
        ) : (
          <TableScroll>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Guest</Th>
                <Th className="text-right">Party</Th>
                <Th>Occasion &amp; notes</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <Td className="whitespace-nowrap">
                    {formatISTDateTime(reservation.reserved_at)}
                    <span className="block text-xs opacity-70">
                      booked {formatISTDateTime(reservation.created_at)}
                    </span>
                  </Td>
                  <Td>
                    {reservation.name}
                    <span className="block text-xs opacity-70">
                      <a href={`tel:${reservation.phone}`} className="underline underline-offset-2">
                        {reservation.phone}
                      </a>
                      {reservation.email ? ` · ${reservation.email}` : ''}
                    </span>
                  </Td>
                  <Td className="text-right tabular-nums">{reservation.party_size}</Td>
                  <Td className="max-w-[20rem] text-xs opacity-70">
                    {reservation.occasion && <span className="block">{reservation.occasion}</span>}
                    {reservation.notes && <span className="block">{reservation.notes}</span>}
                    {!reservation.occasion && !reservation.notes && <span className="opacity-70">—</span>}
                  </Td>
                  <Td>
                    <StatusSelect
                      action={setReservationStatus}
                      id={reservation.id}
                      value={reservation.status}
                      options={RESERVATION_STATUSES}
                      label={`Status for ${reservation.name}`}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableScroll>
        )}

        <Pager base="/admin/reservations" search={search} page={page} total={count ?? 0} />
      </Panel>
    </div>
  );
}
