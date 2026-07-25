'use client';

import { useActionState } from 'react';

import { FormNotice } from '@/components/admin/FormNotice';
import { adminControlClass } from '@/components/admin/Panel';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { Field } from '@/components/Field';
import { IDLE_ACTION, type ActionState } from '@/lib/admin';
import { WEEKDAYS } from '@/lib/format';
import type { SiteSettings } from '@/lib/types';

type Editable = Pick<
  SiteSettings,
  | 'restaurant_name'
  | 'tagline'
  | 'address'
  | 'google_maps_url'
  | 'phone'
  | 'whatsapp'
  | 'email'
  | 'opening_hours'
  | 'is_accepting_orders'
>;

export function SettingsForm({
  action,
  settings,
  canEdit,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  settings: Editable;
  /** site_settings is admin-write-only; staff see the values read-only. */
  canEdit: boolean;
}) {
  const [state, formAction] = useActionState(action, IDLE_ACTION);

  const weekdayKeys = WEEKDAYS.map((day) => day.toLowerCase());
  // Anything already in the JSON that is not one of the seven weekdays is
  // rendered too, so saving never silently drops it.
  const extraKeys = Object.keys(settings.opening_hours ?? {}).filter(
    (key) => !weekdayKeys.includes(key),
  );

  return (
    <form action={formAction} className="space-y-6">
      <fieldset disabled={!canEdit} className="space-y-4">
        <legend className="sr-only">Restaurant details</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Restaurant name" htmlFor="restaurant_name" required>
            <input
              id="restaurant_name"
              name="restaurant_name"
              defaultValue={settings.restaurant_name}
              className={adminControlClass}
              maxLength={120}
              required
            />
          </Field>

          <Field label="Tagline" htmlFor="tagline">
            <input
              id="tagline"
              name="tagline"
              defaultValue={settings.tagline ?? ''}
              className={adminControlClass}
              maxLength={200}
            />
          </Field>
        </div>

        <Field label="Address" htmlFor="address">
          <textarea
            id="address"
            name="address"
            rows={2}
            defaultValue={settings.address ?? ''}
            className={adminControlClass}
            maxLength={300}
          />
        </Field>

        <Field label="Google Maps link" htmlFor="google_maps_url">
          <input
            id="google_maps_url"
            name="google_maps_url"
            type="url"
            defaultValue={settings.google_maps_url ?? ''}
            className={adminControlClass}
            maxLength={500}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Phone" htmlFor="phone" hint="As dialled, e.g. +918045121212">
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={settings.phone ?? ''}
              className={adminControlClass}
              maxLength={30}
            />
          </Field>

          <Field label="WhatsApp" htmlFor="whatsapp">
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              defaultValue={settings.whatsapp ?? ''}
              className={adminControlClass}
              maxLength={30}
            />
          </Field>

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              defaultValue={settings.email ?? ''}
              className={adminControlClass}
              maxLength={120}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset disabled={!canEdit} className="space-y-3">
        <legend className="mb-2 text-sm font-medium">Opening hours</legend>
        <p className="text-xs opacity-55">
          Free text, shown exactly as typed. Clear a row to drop that day.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {[...weekdayKeys, ...extraKeys].map((key, index) => (
            <Field
              key={key}
              label={index < weekdayKeys.length ? WEEKDAYS[index] : key}
              htmlFor={`hours-${key}`}
            >
              <input
                id={`hours-${key}`}
                name={`hours.${key}`}
                defaultValue={settings.opening_hours?.[key] ?? ''}
                placeholder="6:30 AM - 11:00 PM"
                className={adminControlClass}
                maxLength={120}
              />
            </Field>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={!canEdit}>
        <legend className="sr-only">Ordering</legend>
        <label className="flex items-start gap-3 rounded-xl border border-[var(--hairline)] p-4 text-sm">
          <input
            type="checkbox"
            name="is_accepting_orders"
            defaultChecked={settings.is_accepting_orders}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            Accepting online orders
            <span className="mt-0.5 block text-xs opacity-55">
              Turn this off to stop taking a la carte orders without touching the menu.
            </span>
          </span>
        </label>
      </fieldset>

      {canEdit && (
        <div className="flex items-center justify-end gap-3">
          <FormNotice state={state} />
          <SubmitButton>Save settings</SubmitButton>
        </div>
      )}
    </form>
  );
}
