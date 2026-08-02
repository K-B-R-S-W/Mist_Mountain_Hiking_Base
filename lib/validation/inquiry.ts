import { z } from "zod";

export const inquirySchema = z.object({
  guestName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  checkIn: z.string().date().optional().or(z.literal("")),
  checkOut: z.string().date().optional().or(z.literal("")),
  guests: z.coerce.number().int().min(1).max(50).optional(),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  roomId: z.string().uuid().optional().or(z.literal("")),
  // Honeypot — real users never fill this in. Bots that auto-fill every
  // field will. Left in the schema deliberately so it round-trips with
  // the form without needing separate wiring.
  website: z.string().max(0, "Bot detected").optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
