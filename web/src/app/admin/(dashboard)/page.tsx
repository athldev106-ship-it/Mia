import type { Metadata } from 'next';
import Link from 'next/link';

import { requireStaffPage } from '@/app/admin/_lib/session';
import { Badge } from '@/components/admin/Badge';
import { EmptyState, Panel, Stat, TableScroll, Td, Th } from '@/components/admin/Panel';
import {
  BOOKING_STATUSES,
  ORDER_STATUSES,
  RESERVATION_STATUSES,
  formatISTClock,
  formatISTDate,
  istDayRange,
  labelFor,
  todayIST,
} from '@/lib/admin';
import { formatINR } from '@/lib/types';

export const metadata: Metadata = { title: 'Overview' };
export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const { supabase } = await requireStaffPage();

  const today = todayIST();
  const { start, end } = istDayRange(today);

  // RLS restricts every one of these to staff; the anon key alone reads
  // nothing here.
  const [bookings, sessions, reservations, unread, paidOrders] = await Promise.all([
    supabase
      .from('buffet_bookings')
      .select('*')
      .eq('booking_date', today)
      .order('created_at', { ascending: true }),
    supabase.from('buffet_sessions').select('*').order('sort_order'),
    supabase
      .from('reservations')
      .select('*')
      .gte('reserved_at', start)
      .lt('reserved_at', end)
      .order('reserved_at', { ascending: true }),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(8),
  ]);

  const todaysBookings = bookings.data ?? [];
  const sessionName = new Map((sessions.data ?? []).map((s) => [s.id, s]));
  const todaysReservations = reservations.data ?? [];
  const recentPaid = paidOrders.data ?? [];

  const live = todaysBookings.filter((b) => b.status !== 'cancelled');
  const covers = live.reduce((sum, b) => sum + b.adults + b.children, 0);
  const takings = live
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + b.total_paise, 0);
  const seatsBooked = todaysReservations
    .filter((r) => r.status !== 'cancelled' && r.status !== 'no_show')
    .reduce((sum, r) => sum + r.party_size, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Today
        </h1>
        <p className="text-sm opacity-55">{formatISTDate(today)} · Asia/Kolkata</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Buffet covers"
          value={covers}
          hint={`${live.length} booking${live.length === 1 ? '' : 's'}`}
          href="/admin/bookings"
        />
        <Stat
          label="Prepaid today"
          value={formatINR(takings)}
          hint="Paid buffet bookings"
          href="/admin/bookings"
        />
        <Stat
          label="Table covers"
          value={seatsBooked}
          hint={`${todaysReservations.length} reservation${
            todaysReservations.length === 1 ? '' : 's'
          }`}
          href="/admin/reservations"
        />
        <Stat
          label="Unread enquiries"
          value={unread.count ?? 0}
          hint="Waiting for a reply"
          href="/admin/enquiries"
        />
      </div>

      <Panel
        title="Buffet bookings today"
        subtitle="Sorted by the order they came in"
        actions={
          <Link href="/admin/bookings" className="text-sm underline underline-offset-4 opacity-70">
            All bookings
          </Link>
        }
      >
        {todaysBookings.length === 0 ? (
          <EmptyState>No buffet bookings for today.</EmptyState>
        ) : (
          <TableScroll>
            <thead>
              <tr>
                <Th>Booking</Th>
                <Th>Sitting</Th>
                <Th>Guest</Th>
                <Th className="text-right">Covers</Th>
                <Th className="text-right">Total</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {todaysBookings.map((booking) => {
                const sitting = sessionName.get(booking.session_id);
                return (
                  <tr key={booking.id}>
                    <Td className="font-mono text-xs">{booking.booking_number}</Td>
                    <Td>{sitting?.name ?? '—'}</Td>
                    <Td>
                      {booking.customer_name}
                      <span className="block text-xs opacity-55">{booking.customer_phone}</span>
                    </Td>
                    <Td className="text-right tabular-nums">
                      {booking.adults + booking.children}
                      {booking.children > 0 && (
                        <span className="block text-xs opacity-55">{booking.children} child</span>
                      )}
                    </Td>
                    <Td className="text-right tabular-nums">{formatINR(booking.total_paise)}</Td>
                    <Td>
                      <Badge label={booking.payment_status} value={booking.payment_status} />
                    </Td>
                    <Td>
                      <Badge
                        label={labelFor(BOOKING_STATUSES, booking.status)}
                        value={booking.status}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableScroll>
        )}
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="Reservations today"
          actions={
            <Link
              href="/admin/reservations"
              className="text-sm underline underline-offset-4 opacity-70"
            >
              All reservations
            </Link>
          }
        >
          {todaysReservations.length === 0 ? (
            <EmptyState>No tables booked for today.</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {todaysReservations.map((reservation) => (
                <li key={reservation.id} className="flex items-baseline gap-3 py-2.5">
                  <span className="w-20 shrink-0 tabular-nums">
                    {formatISTClock(reservation.reserved_at)}
                  </span>
                  <span className="min-w-0 flex-1">
                    {reservation.name}
                    <span className="block text-xs opacity-55">
                      {reservation.party_size} guest{reservation.party_size === 1 ? '' : 's'} ·{' '}
                      {reservation.phone}
                      {reservation.occasion ? ` · ${reservation.occasion}` : ''}
                    </span>
                  </span>
                  <Badge
                    label={labelFor(RESERVATION_STATUSES, reservation.status)}
                    value={reservation.status}
                  />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent paid orders"
          subtitle="A la carte, most recent first"
          actions={
            <Link href="/admin/orders" className="text-sm underline underline-offset-4 opacity-70">
              All orders
            </Link>
          }
        >
          {recentPaid.length === 0 ? (
            <EmptyState>No paid orders yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--hairline)]">
              {recentPaid.map((order) => (
                <li key={order.id} className="flex items-baseline gap-3 py-2.5">
                  <span className="font-mono text-xs opacity-70">{order.order_number}</span>
                  <span className="min-w-0 flex-1">
                    {order.customer_name}
                    <span className="block text-xs opacity-55">
                      {order.fulfilment} · {formatISTClock(order.created_at)}
                    </span>
                  </span>
                  <span className="tabular-nums">{formatINR(order.total_paise)}</span>
                  <Badge label={labelFor(ORDER_STATUSES, order.status)} value={order.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
