'use client';

import { useId } from 'react';

import { MAX_QUANTITY } from '@/lib/cart';

const stepButton =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--hairline)] text-base leading-none transition-colors hover:bg-[var(--hairline)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

/**
 * Minus / number / plus. The middle control is a real number input with a
 * visually hidden label, so the quantity can be typed as well as stepped and
 * every control is reachable and operable from the keyboard.
 */
export function QuantityStepper({
  label,
  quantity,
  onChange,
}: {
  /** The dish name, used to make each control's accessible name unique. */
  label: string;
  quantity: number;
  onChange: (quantity: number) => void;
}) {
  const inputId = useId();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity <= 1 ? `Remove ${label} from your order` : `One fewer ${label}`}
        className={stepButton}
      >
        <span aria-hidden>−</span>
      </button>

      <label htmlFor={inputId} className="sr-only">
        Quantity of {label}
      </label>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={1}
        max={MAX_QUANTITY}
        step={1}
        value={quantity}
        onChange={(event) => {
          const next = Number(event.target.value);
          // An emptied field reads as NaN mid-edit; hold the current value
          // rather than silently dropping the line.
          if (Number.isNaN(next)) return;
          onChange(next);
        }}
        className="h-9 w-12 rounded-xl border border-[var(--hairline)] bg-[var(--surface-raised)] text-center text-sm tabular-nums outline-none transition-shadow focus:ring-2 focus:ring-[var(--accent)]"
      />

      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= MAX_QUANTITY}
        aria-label={
          quantity >= MAX_QUANTITY ? `Maximum ${MAX_QUANTITY} of ${label}` : `One more ${label}`
        }
        className={stepButton}
      >
        <span aria-hidden>+</span>
      </button>
    </div>
  );
}
