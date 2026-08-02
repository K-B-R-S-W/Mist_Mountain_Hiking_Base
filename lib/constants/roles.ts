/** Mirrors the `role` check constraint on `admin_users` (0001_init.sql). */
export const ADMIN_ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];
