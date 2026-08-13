/**
 * The three marks that sit above the bowl in the logo — a grain stalk,
 * a flexed arm, and a heart with a leaf — redrawn as line icons so the
 * page repeats the brand's own vocabulary.
 *
 * Each sits in a sage disc, matching how the logo groups them.
 */
export function PillarIcon({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex h-12 w-12 items-center justify-center rounded-full"
      style={{
        background: 'color-mix(in srgb, var(--color-sage) 34%, transparent)',
        color: 'var(--accent)',
      }}
    >
      {name === 'grain' ? <GrainIcon /> : name === 'protein' ? <ArmIcon /> : <HeartLeafIcon />}
    </span>
  );
}

function GrainIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <path
            d={`M12 ${9 + row * 3.4}c-2.6 0-4-1.3-4-3.2 2.6 0 4 1.3 4 3.2Z`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={`M12 ${9 + row * 3.4}c2.6 0 4-1.3 4-3.2-2.6 0-4 1.3-4 3.2Z`}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * The logo uses a flexed arm here. An arm does not survive being drawn at
 * 22px -- it collapses into a blob -- so this is a dumbbell, which reads
 * instantly at icon size and carries the same meaning.
 */
function ArmIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect
        x="4.5"
        y="8.5"
        width="3.5"
        height="7"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="16"
        y="8.5"
        width="3.5"
        height="7"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M2.6 10.6v2.8M21.4 10.6v2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HeartLeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.5s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 8.6a4.1 4.1 0 0 1 7.5 2.5c0 4.8-7.5 9.4-7.5 9.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.5c0-2.5 1.6-4.2 3.8-4.4-.2 2.4-1.7 4-3.8 4.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
