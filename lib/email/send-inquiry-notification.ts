import "server-only";
import nodemailer from "nodemailer";
import {
  generateInquiryEmailHtml,
  generateInquiryPlainText,
  type InquiryTemplateData,
} from "./inquiry-email-template";
import { getSiteBranding, getSiteSettings } from "@/lib/repositories/site";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
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
  roomName?: string | null;
}) {
  const owner = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!owner || !pass) {
    console.warn("GMAIL_USER or GMAIL_APP_PASSWORD not configured — skipping inquiry email");
    return;
  }

  let hotelName = "Mist Mountain Hiking Base";
  let logoUrl: string | null = null;
  let address: string | null = null;

  try {
    const [settings, branding] = await Promise.all([getSiteSettings(), getSiteBranding()]);
    hotelName = settings.hotelName;
    address = settings.address;
    logoUrl = branding.logoUrl;
  } catch (e) {
    console.error("Failed to load branding/settings for inquiry email:", e);
  }

  const templateData: InquiryTemplateData = {
    ...inquiry,
    hotelName,
    logoUrl,
    address,
  };

  const html = generateInquiryEmailHtml(templateData);
  const text = generateInquiryPlainText(templateData);

  const recipient = process.env.INQUIRY_NOTIFICATION_EMAIL || owner;

  await transporter.sendMail({
    from: `"${hotelName}" <${owner}>`,
    to: recipient,
    replyTo: inquiry.email,
    subject: `New inquiry — ${inquiry.guestName}${inquiry.roomName ? ` (${inquiry.roomName})` : ""}`,
    text,
    html,
  });
}

