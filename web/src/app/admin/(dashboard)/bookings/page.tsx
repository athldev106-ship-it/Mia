import type { Metadata } from 'next';

import { setBookingStatus } from '@/app/admin/(dashboard)/bookings/actions';
import { requireStaffPage } from '@/app/admin/_lib/session';
import { Badge } from '@/components/admin/Badge';
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
  BOOKING_STATUSES,
  PAGE_SIZE,
  PAYMENT_STATUSES,
  formatISTDate,
  formatISTDateTime,
  isValidDate,
  labelFor,
  pageParam,
  param,
  todayIST,
  type SearchParams,
} from '@/lib/admin';
import { formatTime } from '@/lib/format';
import { formatINR } from '@/lib/types';
import type { BuffetBookingStatus } from '@/lib/types';

export const metadata: Metadata = { title: 'Buffet bookings' };
export const dynamic = 'force-dynamic';

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { supabase } = await requireStaffPage();
  const search = await searchParams;

  // No date in the URL means "today" -- the view the pass wants by default.
  // `date=all` is the explicit escape hatch.
  const rawDate = param(search, 'date');
  const dateFilter = rawDate === '' ? todayIST() : rawDate;
  const sittingFilter = param(search, 'session');
  const statusFilter = param(search, 'status');
  const page = pageParam(search);

  const { data: sessions } = await supabase
    .from('buffet_sessions')
    .select('*')
    .order('sort_order');
  const sittings = sessions ?? [];
  const sittingById = new Map(sittings.map((sitting) => [sitting.id, sitting]));

  let query = supabase.from('buffet_bookings').select('*', { count: 'exact' });

  if (isValidDate(dateFilter)) query = query.eq('booking_date', dateFilter);
  if (sittingById.has(sittingFilter)) query = query.eq('session_id', sittingFilter);
  if (BOOKING_STATUSES.some((option) => option.value === statusFilter)) {
    query = query.eq('status', statusFilter as BuffetBookingStatus);
  }

  const { data, count } = await query
    .order('booking_date', { ascending: false })
    .order('created_at', { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const bookings = data ?? [];
  const live = bookings.filter((booking) => booking.status !== 'cancelled');
  const covers = live.reduce((sum, booking) => sum + booking.adults + booking.children, 0);
  const prepaid = live
    .filter((booking) => booking.payment_status === 'paid')
    .reduce((sum, booking) => sum + booking.total_paise, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Buffet &amp; brunch
        </h1>
        <p className="text-sm opacity-55 tabular-nums">
          {count ?? 0} booking{(count ?? 0) === 1 ? '' : 's'} · {covers} covers on this page ·{' '}
          {formatINR(prepaid)} prepaid
        </p>
      </div>

      <Panel>
        <FilterBar action="/admin/bookings">
          <FilterField label="Date" htmlFor="filter-date">
            <input
              id="filter-date"
              name="date"
              type="date"
              defaultValue={isValidDate(dateFilter) ? dateFilter : ''}
              className={adminControlClass}
            />
          </FilterField>

          <FilterField label="Sitting" htmlFor="filter-session">
            <select
              id="filter-session"
              name="session"
              defaultValue={sittingFilter}
              className={`${adminControlClass} min-w-[12rem]`}
            >
              <option value="">Every sitting</option>
              {sittings.map((sitting) => (
                <option key={sitting.id} value={sitting.id}>
                  {sitting.name}
                  {sitting.is_active ? '' : ' (inactive)'}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Status" htmlFor="filter-status">
            <select
              id="filter-status"
              name="status"
              defaultValue={statusFilter}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              <option value="">Any status</option>
              {BOOKING_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <a
            href="/admin/bookings?date=all"
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            All dates
          </a>
          <a
            href="/admin/bookings"
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            Today
          </a>
        </FilterBar>
      </Panel>

      <Panel>
        {bookings.length === 0 ? (
          <EmptyState>
            {isValidDate(dateFilter)
              ? `No buffet bookings for ${formatISTDate(dateFilter)}.`
              : 'No buffet bookings match these filters.'}
          </EmptyState>
        ) : (
          <TableScroll>
            <thead>
              <tr>
                <Th>Booking</Th>
                <Th>Date</Th>
                <Th>Sitting</Th>
                <Th>Guest</Th>
                <Th className="text-right">Covers</Th>
                <Th className="text-right">Total</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const sitting = sittingById.get(booking.session_id);
                return (
                  <tr key={booking.id}>
                    <Td className="whitespace-nowrap font-mono text-xs">
                      {booking.booking_number}
                      <span className="block font-sans opacity-45">
                        {formatISTDateTime(booking.created_at)}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap">{formatISTDate(booking.booking_date)}</Td>
                    <Td>
                      {sitting?.name ?? 'Removed sitting'}
                      {sitting && (
                        <span className="block text-xs opacity-55">
                          {formatTime(sitting.start_time)} – {formatTime(sitting.end_time)}
                        </span>
                      )}
                    </Td>
                    <Td>
                      {booking.customer_name}
                      <span className="block text-xs opacity-55">
                        <a
                          href={`tel:${booking.customer_phone}`}
                          className="underline underline-offset-2"
                        >
                          {booking.customer_phone}
                        </a>
                        {booking.customer_email ? ` · ${booking.customer_email}` : ''}
                      </span>
                      {booking.notes && (
                        <span className="block text-xs opacity-55">{booking.notes}</span>
                      )}
                    </Td>
                    <Td className="text-right tabular-nums">
                      {booking.adults + booking.children}
                      <span className="block text-xs opacity-55">
                        {booking.adults}a
                        {booking.children > 0 ? ` · ${booking.children}c` : ''}
                      </span>
                    </Td>
                    <Td className="text-right tabular-nums">
                      {formatINR(booking.total_paise)}
                      <span className="block text-xs opacity-55">
                        incl. {formatINR(booking.tax_paise)} tax
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        label={labelFor(PAYMENT_STATUSES, booking.payment_status)}
                        value={booking.payment_status}
                      />
                      {booking.razorpay_payment_id && (
                        <span className="mt-1 block font-mono text-[10px] opacity-45">
                          {booking.razorpay_payment_id}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusSelect
                        action={setBookingStatus}
                        id={booking.id}
                        value={booking.status}
                        options={BOOKING_STATUSES}
                        label={`Status for booking ${booking.booking_number}`}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableScroll>
        )}

        <Pager base="/admin/bookings" search={search} page={page} total={count ?? 0} />
      </Panel>
    </div>
  );
}
