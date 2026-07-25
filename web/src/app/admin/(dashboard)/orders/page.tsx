import type { Metadata } from 'next';

import { setOrderStatus } from '@/app/admin/(dashboard)/orders/actions';
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
  ORDER_STATUSES,
  PAGE_SIZE,
  PAYMENT_STATUSES,
  formatISTDateTime,
  labelFor,
  pageParam,
  param,
  type SearchParams,
} from '@/lib/admin';
import { formatINR } from '@/lib/types';
import type { OrderItem, OrderStatus, PaymentStatus } from '@/lib/types';

export const metadata: Metadata = { title: 'Orders' };
export const dynamic = 'force-dynamic';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { supabase } = await requireStaffPage();
  const search = await searchParams;

  const statusFilter = param(search, 'status');
  const paymentFilter = param(search, 'payment');
  const fulfilmentFilter = param(search, 'fulfilment');
  const page = pageParam(search);

  let query = supabase.from('orders').select('*', { count: 'exact' });

  if (ORDER_STATUSES.some((option) => option.value === statusFilter)) {
    query = query.eq('status', statusFilter as OrderStatus);
  }
  if (PAYMENT_STATUSES.some((option) => option.value === paymentFilter)) {
    query = query.eq('payment_status', paymentFilter as PaymentStatus);
  }
  if (fulfilmentFilter === 'takeaway' || fulfilmentFilter === 'delivery') {
    query = query.eq('fulfilment', fulfilmentFilter);
  }

  const { data, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const orders = data ?? [];

  // Line items are fetched for the page's orders only. A relational embed
  // would be one round trip fewer, but the hand-written Database type
  // declares no relationships, so this keeps the result properly typed.
  let itemsByOrder = new Map<string, OrderItem[]>();
  if (orders.length > 0) {
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .in(
        'order_id',
        orders.map((order) => order.id),
      );

    itemsByOrder = (items ?? []).reduce((map, item) => {
      const bucket = map.get(item.order_id);
      if (bucket) bucket.push(item);
      else map.set(item.order_id, [item]);
      return map;
    }, new Map<string, OrderItem[]>());
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Orders
        </h1>
        <p className="text-sm opacity-55">{count ?? 0} matching</p>
      </div>

      <Panel>
        <FilterBar action="/admin/orders">
          <FilterField label="Status" htmlFor="filter-status">
            <select
              id="filter-status"
              name="status"
              defaultValue={statusFilter}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              <option value="">Any status</option>
              {ORDER_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Payment" htmlFor="filter-payment">
            <select
              id="filter-payment"
              name="payment"
              defaultValue={paymentFilter}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              <option value="">Any payment</option>
              {PAYMENT_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Fulfilment" htmlFor="filter-fulfilment">
            <select
              id="filter-fulfilment"
              name="fulfilment"
              defaultValue={fulfilmentFilter}
              className={`${adminControlClass} min-w-[9rem]`}
            >
              <option value="">Both</option>
              <option value="takeaway">Takeaway</option>
              <option value="delivery">Delivery</option>
            </select>
          </FilterField>

          <a
            href="/admin/orders"
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)]"
          >
            Reset
          </a>
        </FilterBar>
      </Panel>

      <Panel>
        {orders.length === 0 ? (
          <EmptyState>No orders match these filters.</EmptyState>
        ) : (
          <TableScroll>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th className="text-right">Total</Th>
                <Th>Payment</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const items = itemsByOrder.get(order.id) ?? [];
                return (
                  <tr key={order.id}>
                    <Td className="whitespace-nowrap font-mono text-xs">
                      {order.order_number}
                      <span className="block font-sans opacity-45">
                        {formatISTDateTime(order.created_at)}
                      </span>
                    </Td>
                    <Td>
                      {order.customer_name}
                      <span className="block text-xs opacity-55">
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="underline underline-offset-2"
                        >
                          {order.customer_phone}
                        </a>
                      </span>
                      <span className="mt-1 block text-xs opacity-55">
                        {order.fulfilment === 'delivery'
                          ? [order.address_line, order.address_landmark, order.address_pincode]
                              .filter(Boolean)
                              .join(', ')
                          : 'Takeaway'}
                      </span>
                      {order.notes && (
                        <span className="block text-xs opacity-55">Note: {order.notes}</span>
                      )}
                    </Td>
                    <Td className="min-w-[16rem]">
                      {items.length === 0 ? (
                        <span className="text-xs opacity-50">No line items recorded</span>
                      ) : (
                        <ul className="space-y-0.5 text-xs">
                          {items.map((item) => (
                            <li key={item.id} className="flex justify-between gap-3">
                              <span>
                                <span className="tabular-nums opacity-60">{item.quantity}×</span>{' '}
                                {item.name_snapshot}
                              </span>
                              <span className="tabular-nums opacity-70">
                                {formatINR(item.unit_price_paise * item.quantity)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap text-right tabular-nums">
                      {formatINR(order.total_paise)}
                      <span className="block text-xs opacity-55">
                        {formatINR(order.subtotal_paise)} + {formatINR(order.tax_paise)} tax
                        {order.delivery_fee_paise > 0
                          ? ` + ${formatINR(order.delivery_fee_paise)} delivery`
                          : ''}
                      </span>
                    </Td>
                    <Td>
                      <Badge
                        label={labelFor(PAYMENT_STATUSES, order.payment_status)}
                        value={order.payment_status}
                      />
                      {order.razorpay_payment_id && (
                        <span className="mt-1 block font-mono text-[10px] opacity-45">
                          {order.razorpay_payment_id}
                        </span>
                      )}
                    </Td>
                    <Td>
                      <StatusSelect
                        action={setOrderStatus}
                        id={order.id}
                        value={order.status}
                        options={ORDER_STATUSES}
                        label={`Status for order ${order.order_number}`}
                      />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableScroll>
        )}

        <Pager base="/admin/orders" search={search} page={page} total={count ?? 0} />
      </Panel>
    </div>
  );
}
