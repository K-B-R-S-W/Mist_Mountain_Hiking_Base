"use client";

import Image from "next/image";

export function MistMountainLogo({
  className = "h-5 w-5",
  sizes = "36px",
}: {
  className?: string;
  sizes?: string;
}) {
  return (
    <span className={`relative inline-block overflow-hidden rounded-full ${className}`}>
      <Image
        src="/icon.png"
        alt="Mist Mountain"
        fill
        sizes={sizes}
        className="object-contain"
        priority
      />
    </span>
  );
}
