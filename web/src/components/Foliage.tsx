/**
 * The biophilic backdrop: layered green washes with a slow dappled drift,
 * standing in for light falling through the verandah's ferns and palms.
 *
 * Pure CSS gradients rather than imagery, so it costs nothing to load and
 * sits behind the glass panels without competing with real food photography
 * once that arrives.
 */
export function Foliage({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        // Without this the layer stops dead at the section edge and reads
        // as a band across the page.
        maskImage:
          'linear-gradient(to bottom, transparent, black 12%, black 85%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent, black 12%, black 85%, transparent)',
      }}
    >
      <div
        className="dapple absolute -top-1/4 left-[-10%] h-[70vh] w-[70vw] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-fern) 62%, transparent), transparent 65%)',
        }}
      />
      <div
        className="dapple absolute right-[-15%] top-[10%] h-[60vh] w-[60vw] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 60% 40%, color-mix(in srgb, var(--color-rattan) 40%, transparent), transparent 68%)',
          animationDelay: '-6s',
        }}
      />
      <div
        className="dapple absolute bottom-[-20%] left-[20%] h-[55vh] w-[65vw] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-terracotta) 34%, transparent), transparent 70%)',
          animationDelay: '-12s',
        }}
      />
    </div>
  );
}
