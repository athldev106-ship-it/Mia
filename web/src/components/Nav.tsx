'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { LOGO } from '@/lib/media';
import { NAV, ORDER_HREF } from '@/lib/site';

/** Ordering has its own button in the bar, so it is dropped from the links. */
const HEADER_NAV = NAV.filter((item) => item.href !== ORDER_HREF);

/**
 * Floating glass bar. It starts transparent over the hero so the opening
 * frame is uninterrupted, then fuses into a frosted pane once the page
 * scrolls.
 */
export function Nav({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // A route change must never leave the mobile sheet hanging open.
  useEffect(() => setOpen(false), [pathname]);

  // The drawer covers the page, so Escape has to close it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center gap-4 rounded-full px-5 py-3 transition-all duration-700 ${
          scrolled || open ? 'glass glass-sheen' : 'border border-transparent'
        }`}
      >
        <Link href="/" className="mr-auto flex items-center gap-2.5" aria-label={`${name} — home`}>
          {LOGO ? (
            <Image
              src={LOGO.src}
              alt={name}
              width={LOGO.width}
              height={LOGO.height}
              priority
              className="h-8 w-auto"
            />
          ) : (
            <>
              <CupMark />
              <span
                className="text-xl leading-none tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {name}
              </span>
            </>
          )}
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {HEADER_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                      : 'hover:bg-[var(--hairline)]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href={ORDER_HREF}
          className="hidden rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-[var(--accent-ink)] transition-transform duration-300 hover:-translate-y-0.5 sm:inline-block"
        >
          Order Online
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-full border border-[var(--hairline)] p-2.5 lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-nav" className="glass glass-sheen mx-auto mt-2 max-w-6xl p-3 lg:hidden">
          <ul className="space-y-1">
            {HEADER_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-2xl px-4 py-3 text-sm hover:bg-[var(--hairline)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={ORDER_HREF}
            className="mt-2 block rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-[var(--accent-ink)] sm:hidden"
          >
            Order Online
          </Link>
        </div>
      )}
    </header>
  );
}

/** The wordmark's cup, with steam that only shows when motion is welcome. */
function CupMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M4 10h12a3 3 0 0 1 0 6h-1"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 10v5a4 4 0 0 0 4 4h3a4 4 0 0 0 4-4v-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        className="steam"
        d="M8 7c.6-1.1 0-1.8-.4-2.5"
        stroke="var(--accent)"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        className="steam"
        d="M12 7c.6-1.1 0-1.8-.4-2.5"
        stroke="var(--accent)"
        strokeWidth="1.3"
        strokeLinecap="round"
        style={{ animationDelay: '-1.5s' }}
      />
    </svg>
  );
}
