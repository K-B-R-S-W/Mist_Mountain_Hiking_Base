import type { SiteSettings } from "@/lib/types/domain";
import { WhatsAppIcon, FacebookIcon, InstagramIcon, TikTokIcon } from "@/components/site/social-icons";

function toWhatsAppLink(number: string) {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

/**
 * Renders only the links an admin has actually filled in — no dead
 * icons pointing nowhere. Each icon gets a real accessible label since
 * they carry no visible text.
 */
export function QuickLinks({
  settings,
  className,
  iconClassName = "h-5 w-5",
}: {
  settings: Pick<SiteSettings, "whatsapp" | "facebook" | "instagram" | "tiktok">;
  className?: string;
  iconClassName?: string;
}) {
  const links = [
    settings.whatsapp
      ? { href: toWhatsAppLink(settings.whatsapp), label: "Chat on WhatsApp", Icon: WhatsAppIcon }
      : null,
    settings.facebook ? { href: settings.facebook, label: "Facebook", Icon: FacebookIcon } : null,
    settings.instagram ? { href: settings.instagram, label: "Instagram", Icon: InstagramIcon } : null,
    settings.tiktok ? { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon } : null,
  ].filter((link): link is { href: string; label: string; Icon: typeof WhatsAppIcon } => link !== null);

  if (links.length === 0) return null;

  return (
    <div className={className}>
      {links.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-current/15 transition-transform hover:scale-105 active:scale-95"
        >
          <Icon className={iconClassName} />
        </a>
      ))}
    </div>
  );
}
