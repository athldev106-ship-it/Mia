/**
 * Pure formatting helpers, safe to import from client components.
 * Kept apart from lib/data.ts, which reaches for the server-only Supabase
 * admin client and must never end up in the browser bundle.
 */

/** "13:00:00" -> "1 PM", "18:30:00" -> "6:30 PM" */
export function formatTime(time: string) {
  const [hourString, minute] = time.split(':');
  const hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const twelve = hour % 12 === 0 ? 12 : hour % 12;
  return minute && minute !== '00' ? `${twelve}:${minute} ${suffix}` : `${twelve} ${suffix}`;
}

export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
