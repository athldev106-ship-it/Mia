import type { Metadata } from 'next';
import Link from 'next/link';

import { requireStaffPage } from '@/app/admin/_lib/session';
import { Badge } from '@/components/admin/Badge';
import { EmptyState, Panel, Stat, TableScroll, Td, Th } from '@/components/admin/Panel';
import {
  ENQUIRY_TYPE_LABELS,
  RESERVATION_STATUSES,
  formatISTClock,
  formatISTDate,
  formatISTDateTime,
  istDayRange,
  labelFor,
  todayIST,
} from '@/lib/admin';

export const metadata: Metadata = { title: 'Overview' };
export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const { supabase } = await requireStaffPage();

  const today = todayIST();
  const { start, end } = istDayRange(today);

  // RLS restricts every one of these to staff; the anon key alone reads
  // nothing here.
  const [reservations, recentEnquiries, unread, subscribers] = await Promise.all([
    supabase
      .from('reservations')
      .select('*')
      .gte('reserved_at', start)
      .lt('reserved_at', end)
      .order('reserved_at', { ascending: true }),
    supabase.from('enquiries').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('enquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('subscribers').select('*', { count: 'exact', head: true }),
  ]);

  const todaysReservations = reservations.data ?? [];
  const enquiries = recentEnquiries.data ?? [];

  const live = todaysReservations.filter((r) => r.status !== 'cancelled' && r.status !== 'no_show');
  const covers = live.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Today
        </h1>
        <p className="text-sm opacity-70">{formatISTDate(today)} · Asia/Kolkata</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Covers booked"
          value={covers}
          hint={`${live.length} reservation${live.length === 1 ? '' : 's'} today`}
          href="/admin/reservations"
        />
        <Stat
          label="Unread enquiries"
          value={unread.count ?? 0}
          hint="Waiting for a reply"
          href="/admin/enquiries"
        />
        <Stat
          label="Newsletter signups"
          value={subscribers.count ?? 0}
          hint="Total on the list"
        />
      </div>

      <Panel
        title="Reservations today"
        subtitle="In the order they are due to arrive"
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
          <TableScroll>
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Guest</Th>
                <Th className="text-right">Party</Th>
                <Th>Occasion</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {todaysReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <Td className="tabular-nums">{formatISTClock(reservation.reserved_at)}</Td>
                  <Td>
                    {reservation.name}
                    <span className="block text-xs opacity-70">{reservation.phone}</span>
                  </Td>
                  <Td className="text-right tabular-nums">{reservation.party_size}</Td>
                  <Td>{reservation.occasion ?? '—'}</Td>
                  <Td>
                    <Badge
                      label={labelFor(RESERVATION_STATUSES, reservation.status)}
                      value={reservation.status}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableScroll>
        )}
      </Panel>

      <Panel
        title="Latest enquiries"
        actions={
          <Link href="/admin/enquiries" className="text-sm underline underline-offset-4 opacity-70">
            All enquiries
          </Link>
        }
      >
        {enquiries.length === 0 ? (
          <EmptyState>Nothing has come in yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--hairline)]">
            {enquiries.map((enquiry) => (
              <li key={enquiry.id} className="flex items-baseline gap-3 py-2.5">
                <span className="min-w-0 flex-1">
                  {enquiry.name}
                  <span className="block text-xs opacity-70">
                    {ENQUIRY_TYPE_LABELS[enquiry.type] ?? enquiry.type} ·{' '}
                    {formatISTDateTime(enquiry.created_at)}
                  </span>
                </span>
                <Badge label={enquiry.status} value={enquiry.status} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
