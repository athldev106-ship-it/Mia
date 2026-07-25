import { Reveal } from '@/components/Reveal';
import { AGGREGATE, REVIEWS } from '@/lib/reviews';
import { SITE } from '@/lib/site';

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="text-[var(--color-rattan)]"
      aria-label={`${rating} out of 5 stars`}
      role="img"
    >
      <span aria-hidden>{'★'.repeat(rating)}</span>
      <span aria-hidden className="opacity-25">
        {'★'.repeat(5 - rating)}
      </span>
    </span>
  );
}

export function Reviews() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] opacity-50">In their words</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h2
              className="max-w-md text-4xl leading-tight sm:text-5xl"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              What our guests say
            </h2>

            <div className="glass glass-sheen flex items-center gap-4 px-5 py-4">
              <span className="text-3xl font-medium">{AGGREGATE.value}</span>
              <span className="text-sm leading-tight opacity-70">
                <Stars rating={4} />
                <br />
                {AGGREGATE.count} {AGGREGATE.source} reviews
                <br />
                <span className="opacity-70">
                  {AGGREGATE.alternate.value} across {AGGREGATE.alternate.count} on{' '}
                  {AGGREGATE.alternate.source}
                </span>
              </span>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {REVIEWS.map((review, i) => (
            <Reveal key={review.quote} delay={i * 90}>
              <figure className="glass glass-sheen flex h-full flex-col gap-4 p-7">
                <Stars rating={review.rating} />
                <blockquote
                  className="text-lg leading-relaxed"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  “{review.quote}”
                </blockquote>
                <figcaption className="mt-auto text-sm opacity-60">
                  {review.author} · {review.source}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm opacity-60">
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4"
            >
              Read all reviews on Google
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
