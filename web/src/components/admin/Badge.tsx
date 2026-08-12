import { toneFor, type Tone } from '@/lib/admin';

/**
 * Status pill. Colour is derived from the palette tokens with color-mix so
 * the same markup reads correctly in light and dark without a second set
 * of values.
 */
const TONE_STYLE: Record<Tone, { background: string; color: string; borderColor: string }> = {
  neutral: {
    background: 'color-mix(in srgb, var(--text) 8%, transparent)',
    color: 'var(--text)',
    borderColor: 'var(--hairline)',
  },
  good: {
    background: 'color-mix(in srgb, var(--color-olive) 22%, transparent)',
    color: 'color-mix(in srgb, var(--color-olive) 72%, var(--text))',
    borderColor: 'color-mix(in srgb, var(--color-olive) 34%, transparent)',
  },
  warn: {
    background: 'color-mix(in srgb, var(--color-crema) 30%, transparent)',
    color: 'color-mix(in srgb, var(--color-crema) 55%, var(--text))',
    borderColor: 'color-mix(in srgb, var(--color-crema) 42%, transparent)',
  },
  bad: {
    background: 'color-mix(in srgb, var(--color-alert) 20%, transparent)',
    color: 'color-mix(in srgb, var(--color-alert) 62%, var(--text))',
    borderColor: 'color-mix(in srgb, var(--color-alert) 34%, transparent)',
  },
};

export function Badge({
  label,
  tone,
  value,
}: {
  label: string;
  /** Explicit tone, or derive one from the stored status value. */
  tone?: Tone;
  value?: string;
}) {
  const resolved = tone ?? toneFor(value ?? label.toLowerCase());
  return (
    <span
      className="inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] leading-tight"
      style={TONE_STYLE[resolved]}
    >
      {label}
    </span>
  );
}
