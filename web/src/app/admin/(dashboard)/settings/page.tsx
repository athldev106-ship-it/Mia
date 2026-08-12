import type { Metadata } from 'next';

import { updateSettings } from '@/app/admin/(dashboard)/settings/actions';
import { requireStaffPage } from '@/app/admin/_lib/session';
import { Panel } from '@/components/admin/Panel';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { formatISTDateTime } from '@/lib/admin';

export const metadata: Metadata = { title: 'Settings' };
export const dynamic = 'force-dynamic';

const BLANK = {
  restaurant_name: '',
  tagline: null,
  address: null,
  google_maps_url: null,
  phone: null,
  whatsapp: null,
  email: null,
  instagram_url: null,
  swiggy_url: null,
  zomato_url: null,
  opening_hours: {},
  is_open: true,
};

export default async function SettingsPage() {
  const { supabase, profile } = await requireStaffPage();

  const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();

  const canEdit = profile.role === 'admin';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Site settings
        </h1>
        {data && (
          <p className="text-sm opacity-70">Last saved {formatISTDateTime(data.updated_at)}</p>
        )}
      </div>

      {!canEdit && (
        <p
          role="status"
          className="rounded-xl border border-[var(--hairline)] px-4 py-3 text-sm leading-relaxed opacity-75"
        >
          These values are shown read-only: the database restricts site settings to administrator
          accounts.
        </p>
      )}

      <Panel
        title="What the public site shows"
        subtitle="Name, contact details and hours are read from this single row."
      >
        <SettingsForm action={updateSettings} settings={data ?? BLANK} canEdit={canEdit} />
      </Panel>
    </div>
  );
}
