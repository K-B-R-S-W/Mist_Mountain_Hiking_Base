type IconProps = { className?: string };

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.29-.15-1.71-.85-1.98-.94-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.13-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.06 3.15 5 4.42.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.71-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.27-.2-.56-.34Z" />
      <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.51 3.58 1.38 5.06L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.55 22 22.02 17.52 22.02 12S17.55 2 12.02 2Zm0 18.2c-1.7 0-3.28-.47-4.63-1.28l-.33-.2-3.02.79.8-2.94-.21-.34a8.18 8.18 0 0 1-1.25-4.33c0-4.53 3.68-8.2 8.2-8.2s8.2 3.67 8.2 8.2-3.67 8.3-8.19 8.3Z" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7.5h2.52l.38-2.93h-2.9V8.7c0-.85.24-1.43 1.46-1.43h1.55V4.65C15.94 4.5 15.06 4.4 14.03 4.4c-2.24 0-3.78 1.37-3.78 3.87v2.3H7.72v2.93h2.53V21h3.25Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.6 5.82c-.9-.62-1.5-1.65-1.6-2.82h-3.02v13.02c0 1.4-1.14 2.53-2.55 2.53a2.55 2.55 0 0 1-2.55-2.55c0-1.4 1.14-2.54 2.55-2.54.28 0 .54.05.79.13v-3.06a5.6 5.6 0 0 0-.79-.06 5.58 5.58 0 0 0-5.58 5.58A5.58 5.58 0 0 0 9.43 21.6a5.58 5.58 0 0 0 5.58-5.58V9.4a8.4 8.4 0 0 0 4.9 1.57V7.95a5.4 5.4 0 0 1-3.31-2.13Z" />
    </svg>
  );
}
