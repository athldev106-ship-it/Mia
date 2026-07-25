'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { NAV, SITE } from '@/lib/site';

/**
 * Floating glass bar. It starts invisible over the hero so the opening
 * frame is uninterrupted, then fuses into a frosted pane once the page
 * scrolls -- the "glide indoors" moment from the walkthrough.
 */
export function Nav() {
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

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto flex max-w-6xl items-center gap-4 rounded-full px-5 py-3 transition-all duration-700 ${
          scrolled || open ? 'glass glass-sheen' : 'border border-transparent'
        }`}
      >
        <Link href="/" className="mr-auto flex items-baseline gap-2">
          <span
            className="text-xl leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {SITE.name}
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] opacity-60 sm:inline">
            Grand Mercure
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    active ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'hover:bg-[var(--hairline)]'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <a
          href={`tel:${SITE.phone}`}
          className="hidden rounded-full border border-[var(--hairline)] px-4 py-2 text-sm transition-colors hover:bg-[var(--hairline)] lg:inline-block"
        >
          {SITE.phoneDisplay}
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-full border border-[var(--hairline)] px-3 py-2 text-sm md:hidden"
        >
          {open ? '✕' : '☰'}
        </button>
      </nav>

      {open && (
        <ul
          id="mobile-nav"
          className="glass glass-sheen mx-auto mt-2 max-w-6xl space-y-1 rounded-3xl p-3 md:hidden"
        >
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm hover:bg-[var(--hairline)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={`tel:${SITE.phone}`}
              className="block rounded-2xl px-4 py-3 text-sm hover:bg-[var(--hairline)]"
            >
              Call {SITE.phoneDisplay}
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
