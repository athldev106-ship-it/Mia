'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  CART_STORAGE_KEY,
  EMPTY_CART,
  MAX_LINES,
  MAX_QUANTITY,
  clearStoredCart,
  parseStoredCart,
  readStoredCart,
  writeStoredCart,
  type CartLine,
  type StoredCart,
} from '@/lib/cart';

import type { Fulfilment } from '@/lib/types';

type CartContextValue = {
  /** False until localStorage has been read, so nothing flashes on load. */
  hydrated: boolean;
  lines: CartLine[];
  fulfilment: Fulfilment;
  quantityOf: (menuItemId: string) => number;
  setQuantity: (menuItemId: string, quantity: number) => void;
  increment: (menuItemId: string) => void;
  decrement: (menuItemId: string) => void;
  remove: (menuItemId: string) => void;
  /** Replaces the lines wholesale, used to write back a reconciled cart. */
  replace: (lines: CartLine[]) => void;
  setFulfilment: (fulfilment: Fulfilment) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(Math.max(Math.trunc(quantity), 0), MAX_QUANTITY);
}

function sameLines(a: CartLine[], b: CartLine[]) {
  return (
    a.length === b.length &&
    a.every((line, index) => {
      const other = b[index];
      return (
        other !== undefined &&
        other.menu_item_id === line.menu_item_id &&
        other.quantity === line.quantity
      );
    })
  );
}

/**
 * Holds the cart for every /order route.
 *
 * The first render is deliberately an empty cart on both server and client;
 * localStorage is read in an effect afterwards. Reading it during render
 * would mismatch the server-rendered HTML and React would throw the markup
 * away.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StoredCart>(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setCart(readStoredCart());
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  // Persist only after hydration, or the empty first render would overwrite
  // a cart the guest actually has.
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (cart.lines.length === 0 && cart.fulfilment === 'takeaway') {
      clearStoredCart();
      return;
    }
    writeStoredCart(cart);
  }, [cart]);

  // A second tab is the same guest with the same cart.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== CART_STORAGE_KEY) return;
      setCart(event.key === null ? readStoredCart() : parseStoredCart(event.newValue));
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setQuantity = useCallback((menuItemId: string, quantity: number) => {
    const next = clampQuantity(quantity);
    setCart((current) => {
      const existing = current.lines.find((line) => line.menu_item_id === menuItemId);

      if (next === 0) {
        if (!existing) return current;
        return {
          ...current,
          lines: current.lines.filter((line) => line.menu_item_id !== menuItemId),
        };
      }

      if (existing) {
        if (existing.quantity === next) return current;
        return {
          ...current,
          lines: current.lines.map((line) =>
            line.menu_item_id === menuItemId ? { ...line, quantity: next } : line,
          ),
        };
      }

      // orderSchema caps an order at 40 distinct lines; stop cleanly at the
      // same place rather than letting the server reject the whole order.
      if (current.lines.length >= MAX_LINES) return current;
      return { ...current, lines: [...current.lines, { menu_item_id: menuItemId, quantity: next }] };
    });
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const quantityOf = (menuItemId: string) =>
      cart.lines.find((line) => line.menu_item_id === menuItemId)?.quantity ?? 0;

    return {
      hydrated,
      lines: cart.lines,
      fulfilment: cart.fulfilment,
      quantityOf,
      setQuantity,
      increment: (menuItemId: string) => setQuantity(menuItemId, quantityOf(menuItemId) + 1),
      decrement: (menuItemId: string) => setQuantity(menuItemId, quantityOf(menuItemId) - 1),
      remove: (menuItemId: string) => setQuantity(menuItemId, 0),
      replace: (lines: CartLine[]) =>
        setCart((current) => (sameLines(current.lines, lines) ? current : { ...current, lines })),
      setFulfilment: (fulfilment: Fulfilment) =>
        setCart((current) => (current.fulfilment === fulfilment ? current : { ...current, fulfilment })),
      clear: () => setCart(EMPTY_CART),
    };
  }, [cart, hydrated, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
}
