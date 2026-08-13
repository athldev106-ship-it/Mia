import type { SiteContent } from '@/lib/types';

/**
 * Off-site ordering. The cafe takes orders through the delivery platforms
 * and over WhatsApp rather than through this site, so these are the real
 * calls to action -- not a decorative row of logos.
 */

type Channel = {
  key: string;
  name: string;
  blurb: string;
  href: (site: SiteContent) => string;
  /** Brand colour, used only for the icon chip. */
  tint: string;
  icon: React.ReactNode;
};

const CHANNELS: Channel[] = [
  {
    key: 'swiggy',
    name: 'Swiggy',
    blurb: 'Delivery across Koramangala and nearby, with live tracking.',
    href: (site) => site.swiggyUrl,
    tint: '#fc8019',
    icon: <ScooterIcon />,
  },
  {
    key: 'zomato',
    name: 'Zomato',
    blurb: 'Delivery and pickup, plus the full listing and photos.',
    href: (site) => site.zomatoUrl,
    tint: '#e23744',
    icon: <BagIcon />,
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    blurb: 'Message us directly for pickup, large orders or catering.',
    href: (site) => site.whatsappUrl,
    tint: '#25d366',
    icon: <ChatIcon />,
  },
  {
    key: 'call',
    name: 'Call the cafe',
    blurb: 'Talk to the counter and we will have it ready for you.',
    href: (site) => `tel:${site.phone}`,
    tint: 'var(--color-olive)',
    icon: <PhoneIcon />,
  },
];

export function OrderLinks({ site }: { site: SiteContent }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {CHANNELS.map((channel) => (
        <li key={channel.key}>
          <a
            href={channel.href(site)}
            {...externalProps(channel.key)}
            className="glass glass-sheen group flex h-full items-start gap-4 p-6 transition-transform duration-300 hover:-translate-y-1"
          >
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ background: `color-mix(in srgb, ${channel.tint} 18%, transparent)`, color: channel.tint }}
            >
              {channel.icon}
            </span>
            <span className="min-w-0">
              <span
                className="block text-lg leading-snug"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {channel.name}
              </span>
              <span className="mt-1 block text-sm leading-relaxed opacity-70">{channel.blurb}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** tel: links must stay in the same tab; the rest open away from the site. */
function externalProps(key: string) {
  return key === 'call' ? {} : { target: '_blank', rel: 'noreferrer noopener' };
}

/* --- Inline icons. Small enough that a dependency would cost more. --- */

function ScooterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="6" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8.5 18h7M18 15.5V9a2 2 0 0 0-2-2h-2M6 15.5 9 6h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 8h14l-1 11.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19.5L5 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21a9 9 0 1 0-8.2-5.3L3 21l5.4-.9A9 9 0 0 0 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
