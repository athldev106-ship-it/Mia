'use client';

import { useCallback } from 'react';

import { controlClass } from '@/components/Field';
import { PHONE_HINT, PHONE_PATTERN, describePhoneProblem } from '@/lib/phone';

/**
 * A phone field that says what is wrong with the number.
 *
 * `pattern` is kept as the backstop -- it works with scripting off -- but on
 * its own it only ever produces the browser's "Please match the requested
 * format", which is no use to someone who has fat-fingered their own
 * number. setCustomValidity replaces that with the specific reason, from
 * the same function the server validates with.
 *
 * The message is recomputed on every input so a field cannot stay stuck
 * invalid after the guest has corrected it.
 */
export function PhoneInput({
  id = 'phone',
  name = 'phone',
  required = false,
}: {
  id?: string;
  name?: string;
  required?: boolean;
}) {
  const check = useCallback((el: HTMLInputElement | null) => {
    if (!el) return;
    el.setCustomValidity(describePhoneProblem(el.value) ?? '');
  }, []);

  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder="9XXXXXXXXX"
      pattern={PHONE_PATTERN}
      title={PHONE_HINT}
      required={required}
      className={controlClass}
      // Runs on mount too, so a prefilled or autofilled value is judged
      // by the same rule as a typed one.
      ref={check}
      onInput={(event) => check(event.currentTarget)}
    />
  );
}
