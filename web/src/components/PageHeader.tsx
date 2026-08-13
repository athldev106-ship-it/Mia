import { Foliage } from '@/components/Foliage';

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="tinted relative overflow-hidden px-6 pt-36 pb-14">
      <Foliage className="opacity-70" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent, color-mix(in srgb, var(--surface) 88%, transparent))',
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.28em] opacity-70">{eyebrow}</p>
        <h1
          className="mt-4 max-w-3xl text-5xl leading-[1.05] tracking-tight sm:text-6xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-xl leading-relaxed opacity-80">{intro}</p>}
      </div>
    </section>
  );
}
