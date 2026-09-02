"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: ReactNode;
}

export function ActionButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  disabled,
  icon,
  ...props
}: ActionButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  const variantClass =
    variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
      ? "btn-danger"
      : variant === "ghost"
      ? "btn-ghost"
      : "btn-primary";

  return (
    <button
      {...props}
      type="submit"
      disabled={isDisabled}
      className={`${variantClass} ${className}`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingLabel || children}
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {icon}
          {children}
        </span>
      )}
    </button>
  );
}
