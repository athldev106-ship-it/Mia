import type { ReactNode } from 'react';

import { CartProvider } from '@/components/cart/CartProvider';

/**
 * The cart has to survive the walk from /order to /order/checkout, so the
 * provider sits above both routes rather than inside either page.
 */
export default function OrderLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
