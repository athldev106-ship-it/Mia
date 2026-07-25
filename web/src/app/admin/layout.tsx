import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s — Dashboard' },
  // Nothing behind the staff login should ever reach an index.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Shell shared by the login screen and the dashboard proper. The top
 * padding clears the site's floating nav, which is rendered by the root
 * layout on every route.
 */
export default function AdminShellLayout({ children }: { children: ReactNode }) {
  return <div className="px-4 pt-24 pb-20 sm:px-6">{children}</div>;
}
