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
  | 'instagram_url'
  | 'swiggy_url'
  | 'zomato_url'
  | 'opening_hours'
  | 'is_open'
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
          <Field label="Phone" htmlFor="phone" hint="As dialled, e.g. +919955665594">
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={settings.phone ?? ''}
              className={adminControlClass}
              maxLength={30}
            />
          </Field>

          <Field label="WhatsApp" htmlFor="whatsapp" hint="Number only, e.g. 919955665594">
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

      <fieldset disabled={!canEdit} className="space-y-4">
        <legend className="mb-2 text-sm font-medium">Ordering & social links</legend>
        <p className="text-xs opacity-70">
          Where the &ldquo;Order Online&rdquo; buttons send people. Leave a field blank to fall back
          to the built-in link.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Swiggy listing" htmlFor="swiggy_url">
            <input
              id="swiggy_url"
              name="swiggy_url"
              type="url"
              defaultValue={settings.swiggy_url ?? ''}
              className={adminControlClass}
              maxLength={500}
            />
          </Field>

          <Field label="Zomato listing" htmlFor="zomato_url">
            <input
              id="zomato_url"
              name="zomato_url"
              type="url"
              defaultValue={settings.zomato_url ?? ''}
              className={adminControlClass}
              maxLength={500}
            />
          </Field>

          <Field label="Instagram profile" htmlFor="instagram_url">
            <input
              id="instagram_url"
              name="instagram_url"
              type="url"
              defaultValue={settings.instagram_url ?? ''}
              className={adminControlClass}
              maxLength={500}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset disabled={!canEdit} className="space-y-3">
        <legend className="mb-2 text-sm font-medium">Opening hours</legend>
        <p className="text-xs opacity-70">
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
        <legend className="sr-only">Trading</legend>
        <label className="flex items-start gap-3 rounded-xl border border-[var(--hairline)] p-4 text-sm">
          <input
            type="checkbox"
            name="is_open"
            defaultChecked={settings.is_open}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            Open for business
            <span className="mt-0.5 block text-xs opacity-70">
              Clear this on a day the cafe is unexpectedly shut, so the site stops inviting people
              over.
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
