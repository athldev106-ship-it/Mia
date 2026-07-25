'use client';

import { useId } from 'react';

import { DELIVERY_FEE_PAISE, FREE_DELIVERY_ABOVE_PAISE } from '@/lib/pricing';
import { formatINR, type Fulfilment } from '@/lib/types';

const OPTIONS: { value: Fulfilment; label: string; hint: string }[] = [
  { value: 'takeaway', label: 'Takeaway', hint: 'Collect from the restaurant' },
  {
    value: 'delivery',
    label: 'Delivery',
    hint: `${formatINR(DELIVERY_FEE_PAISE)}, free above ${formatINR(FREE_DELIVERY_ABOVE_PAISE)}`,
  },
];

/**
 * A real radio group rather than two buttons, so arrow keys work and the
 * choice is announced as one control with two options.
 */
export function FulfilmentToggle({
  value,
  onChange,
  legend = 'How would you like it?',
}: {
  value: Fulfilment;
  onChange: (value: Fulfilment) => void;
  legend?: string;
}) {
  const name = useId();

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`cursor-pointer rounded-2xl border p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-[var(--accent)] ${
                selected
                  ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]'
                  : 'border-[var(--hairline)] hover:bg-[var(--hairline)]'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="block font-medium">{option.label}</span>
              <span className="mt-0.5 block text-xs opacity-65">{option.hint}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
