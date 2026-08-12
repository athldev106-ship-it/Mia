import type { Metadata } from 'next';

import { setEnquiryStatus } from '@/app/admin/(dashboard)/enquiries/actions';
import { requireStaffPage } from '@/app/admin/_lib/session';
import { Badge } from '@/components/admin/Badge';
import { FilterBar, FilterField } from '@/components/admin/FilterBar';
import { Pager } from '@/components/admin/Pager';
import { EmptyState, Panel, adminControlClass } from '@/components/admin/Panel';
import { StatusSelect } from '@/components/admin/StatusSelect';
import { SubmitButton } from '@/components/admin/SubmitButton';
import {
  ENQUIRY_STATUSES,
  ENQUIRY_TYPE_LABELS,
  PAGE_SIZE,
  formatISTDateTime,
  labelFor,
  pageParam,
  param,
  type SearchParams,
} from '@/lib/admin';
import type { EnquiryStatus, EnquiryType } from '@/lib/types';

export const metadata: Metadata = { title: 'Enquiries' };
export const dynamic = 'force-dynamic';

const TYPES: EnquiryType[] = ['general', 'catering', 'events', 'feedback'];

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { supabase } = await requireStaffPage();
  const search = await searchParams;

  const statusFilter = param(search, 'status');
  const typeFilter = param(search, 'type');
  const page = pageParam(search);

  let query = supabase.from('enquiries').select('*', { count: 'exact' });

  if (ENQUIRY_STATUSES.some((option) => option.value === statusFilter)) {
    query = query.eq('status', statusFilter as EnquiryStatus);
  }
  if (TYPES.includes(typeFilter as EnquiryType)) {
    query = query.eq('type', typeFilter as EnquiryType);
  }

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const enquiries = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Enquiries
        </h1>
        <p className="text-sm opacity-70">{count ?? 0} matching</p>
      </div>

      <Panel>
        <FilterBar action="/admin/enquiries">
          <FilterField label="Status" htmlFor="filter-status">
            <select
              id="filter-status"
              name="status"
              defaultValue={statusFilter}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              <option value="">Any status</option>
              {ENQUIRY_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Type" htmlFor="filter-type">
            <select
              id="filter-type"
              name="type"
              defaultValue={typeFilter}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              <option value="">Any type</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {ENQUIRY_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </FilterField>

          <a
            href="/admin/enquiries?status=new"
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            Unread only
          </a>
          <a
            href="/admin/enquiries"
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            Reset
          </a>
        </FilterBar>
      </Panel>

      {enquiries.length === 0 ? (
        <Panel>
          <EmptyState>No enquiries match these filters.</EmptyState>
        </Panel>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id}>
              <Panel className={enquiry.status === 'closed' ? 'opacity-65' : ''}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-medium">{enquiry.name}</h2>
                      <Badge
                        label={ENQUIRY_TYPE_LABELS[enquiry.type] ?? enquiry.type}
                        tone="neutral"
                      />
                      <Badge
                        label={labelFor(ENQUIRY_STATUSES, enquiry.status)}
                        value={enquiry.status}
                      />
                    </div>
                    <p className="mt-1 text-xs opacity-70">
                      <a
                        href={`mailto:${enquiry.email}`}
                        className="underline underline-offset-2"
                      >
                        {enquiry.email}
                      </a>
                      {enquiry.phone && (
                        <>
                          {' · '}
                          <a href={`tel:${enquiry.phone}`} className="underline underline-offset-2">
                            {enquiry.phone}
                          </a>
                        </>
                      )}
                      {' · '}
                      {formatISTDateTime(enquiry.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {enquiry.status === 'new' && (
                      <form action={setEnquiryStatus}>
                        <input type="hidden" name="id" value={enquiry.id} />
                        <input type="hidden" name="status" value="read" />
                        <SubmitButton variant="ghost" pendingLabel="Marking…">
                          Mark read
                        </SubmitButton>
                      </form>
                    )}
                    {enquiry.status !== 'closed' && (
                      <form action={setEnquiryStatus}>
                        <input type="hidden" name="id" value={enquiry.id} />
                        <input type="hidden" name="status" value="closed" />
                        <SubmitButton variant="ghost" pendingLabel="Closing…">
                          Close
                        </SubmitButton>
                      </form>
                    )}
                    <StatusSelect
                      action={setEnquiryStatus}
                      id={enquiry.id}
                      value={enquiry.status}
                      options={ENQUIRY_STATUSES}
                      label={`Status for enquiry from ${enquiry.name}`}
                    />
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line border-t border-[var(--hairline)] pt-3 text-sm leading-relaxed opacity-80">
                  {enquiry.message}
                </p>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <Pager base="/admin/enquiries" search={search} page={page} total={count ?? 0} />
    </div>
  );
}
