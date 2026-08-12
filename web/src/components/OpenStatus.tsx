'use client';

import { useEffect, useState } from 'react';

import { OPENING_HOURS } from '@/lib/site';

/**
 * Live "open now" badge with a running IST clock.
 *
 * The cafe's hours are a fact about Bengaluru, not about the visitor's
 * device, so everything here is computed in Asia/Kolkata regardless of
 * where the page is being read.
 */

const IST_PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const IST_CLOCK = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const ISO_WEEKDAY: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

type Status = { open: boolean; label: string; clock: string };

function readStatus(now: Date): Status {
  const parts = IST_PARTS.formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  const weekday = ISO_WEEKDAY[get('weekday')];
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  const clock = IST_CLOCK.format(now);

  const today = OPENING_HOURS[weekday];
  if (!today) return { open: false, label: 'Closed today', clock };

  const opensAt = toMinutes(today.open);
  const closesAt = toMinutes(today.close);

  if (minutes < opensAt) {
    return { open: false, label: `Opens at ${format12h(today.open)}`, clock };
  }
  if (minutes >= closesAt) {
    return { open: false, label: 'Closed for the day', clock };
  }

  // Worth flagging: someone deciding where to go at 10:45 PM should know.
  const minutesLeft = closesAt - minutes;
  if (minutesLeft <= 60) {
    return { open: true, label: `Closing at ${format12h(today.close)}`, clock };
  }
  return { open: true, label: `Open until ${format12h(today.close)}`, clock };
}

function format12h(time: string): string {
  const [hourString, minute] = time.split(':');
  const hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return minute === '00' ? `${twelve} ${suffix}` : `${twelve}:${minute} ${suffix}`;
}

export function OpenStatus({ className = '' }: { className?: string }) {
  // Rendering the live time on the server would ship a timestamp that is
  // stale the moment it is cached, and mismatch on hydration. The badge
  // starts empty and fills in on the client, which is also the only place
  // a ticking clock means anything.
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const tick = () => setStatus(readStatus(new Date()));
    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!status) {
    // Holds the badge's height so the hero does not jump on hydration.
    return <span aria-hidden className={`inline-block h-6 ${className}`} />;
  }

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm ${className}`}
      // The clock changes on its own; let a screen reader hear it settle
      // rather than announcing every tick.
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-1.5 font-medium">
        <span
          aria-hidden
          className={`pulse-dot h-2 w-2 rounded-full ${
            status.open ? 'bg-[var(--color-leaf)]' : 'bg-[var(--color-crema)]'
          }`}
        />
        {status.open ? 'Open now' : 'Closed'}
      </span>
      <span className="opacity-70">{status.label}</span>
      <span aria-hidden className="opacity-45">
        ·
      </span>
      <span className="tabular-nums opacity-70">{status.clock}</span>
    </span>
  );
}
