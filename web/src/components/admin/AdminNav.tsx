'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ADMIN_NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/bookings', label: 'Buffet' },
  { href: '/admin/reservations', label: 'Reservations' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/enquiries', label: 'Enquiries' },
  { href: '/admin/menu', label: 'Menu' },
  { href: '/admin/settings', label: 'Settings' },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard sections">
      <ul className="flex flex-wrap gap-1">
        {ADMIN_NAV.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                    : 'hover:bg-[var(--hairline)]'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
