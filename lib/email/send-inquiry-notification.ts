import "server-only";
import nodemailer from "nodemailer";

/**
 * Gmail SMTP notification to the owner when a new inquiry/booking request
 * comes in. Requires a Gmail App Password (not the account password) —
 * see README.md "Email setup" for how to generate one.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // mistmountaincb@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendInquiryNotification(inquiry: {
  guestName: string;
  email: string;
  phone?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: number | null;
  message?: string | null;
}) {
  const owner = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!owner || !pass) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD not configured — skipping inquiry email");
    return;
  }

  await transporter.sendMail({
    from: `"Mist Mountain Website" <${process.env.GMAIL_USER}>`,
    to: owner,
    replyTo: inquiry.email,
    subject: `New inquiry — ${inquiry.guestName}`,
    text: [
      `Name: ${inquiry.guestName}`,
      `Email: ${inquiry.email}`,
      `Phone: ${inquiry.phone ?? "-"}`,
      `Check-in: ${inquiry.checkIn ?? "-"}`,
      `Check-out: ${inquiry.checkOut ?? "-"}`,
      `Guests: ${inquiry.guests ?? "-"}`,
      "",
      inquiry.message ?? "",
    ].join("\n"),
  });
}
