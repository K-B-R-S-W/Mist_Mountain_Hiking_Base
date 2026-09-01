function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDatePretty(dateStr?: string | null): string {
  if (!dateStr) return "Not specified";
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3 || parts.some((p) => isNaN(p))) return dateStr;
  const [year, month, day] = parts;
  if (year === undefined || month === undefined || day === undefined) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function computeNights(checkIn?: string | null, checkOut?: string | null): number {
  if (!checkIn || !checkOut) return 0;
  const p1 = checkIn.split("-").map(Number);
  const p2 = checkOut.split("-").map(Number);
  if (p1.length < 3 || p2.length < 3) return 0;
  if (p1[0] === undefined || p1[1] === undefined || p1[2] === undefined) return 0;
  if (p2[0] === undefined || p2[1] === undefined || p2[2] === undefined) return 0;
  const d1 = new Date(p1[0], p1[1] - 1, p1[2]);
  const d2 = new Date(p2[0], p2[1] - 1, p2[2]);
  const diff = d2.getTime() - d1.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function cleanPhoneForWhatsApp(phone?: string | null): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/[^0-9]/g, "");
  return cleaned.length >= 7 ? cleaned : null;
}

export interface InquiryTemplateData {
  guestName: string;
  email: string;
  phone?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: number | null;
  message?: string | null;
  roomName?: string | null;
  hotelName?: string;
  logoUrl?: string | null;
  address?: string | null;
}

export function generateInquiryEmailHtml(data: InquiryTemplateData): string {
  const hotel = data.hotelName || "Mist Mountain Hiking Base";
  const safeName = escapeHtml(data.guestName);
  const safeEmail = escapeHtml(data.email);
  const safePhone = data.phone ? escapeHtml(data.phone) : null;
  const safeRoom = data.roomName ? escapeHtml(data.roomName) : "Any suitable room";
  const safeMessage = data.message ? escapeHtml(data.message).replace(/\n/g, "<br/>") : null;
  const nights = computeNights(data.checkIn, data.checkOut);
  const checkInFormatted = formatDatePretty(data.checkIn);
  const checkOutFormatted = formatDatePretty(data.checkOut);
  const waNumber = cleanPhoneForWhatsApp(data.phone);

  const replySubject = encodeURIComponent(`Re: Inquiry for ${hotel} - ${data.guestName}`);
  const mailtoUrl = `mailto:${safeEmail}?subject=${replySubject}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry — ${safeName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f2ee;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1d1d1d;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f4f2ee;
      padding: 32px 12px;
    }
    .main-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
      border: 1px solid #e7e4de;
    }
    .header-bar {
      background-color: #163126;
      border-top: 4px solid #b06a3c;
      padding: 28px 32px;
      text-align: center;
    }
    .content-body {
      padding: 32px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #b06a3c;
      margin-bottom: 6px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background-color: #eef3f0;
      color: #163126;
    }
    .data-row td {
      padding: 10px 0;
      border-bottom: 1px solid #f0eee9;
      font-size: 14px;
      vertical-align: top;
    }
    .data-label {
      color: #6b6b6b;
      width: 35%;
      font-weight: 500;
    }
    .data-value {
      color: #1d1d1d;
      font-weight: 600;
    }
    .date-card {
      background-color: #f9f8f5;
      border: 1px solid #e9e6df;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    .message-box {
      background-color: #faf9f6;
      border-left: 3px solid #b06a3c;
      padding: 16px;
      border-radius: 4px;
      margin-top: 20px;
      font-size: 14px;
      line-height: 1.6;
      color: #333333;
    }
    .btn-primary {
      display: inline-block;
      background-color: #163126;
      color: #f8f6f2 !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 6px;
      text-align: center;
    }
    .btn-whatsapp {
      display: inline-block;
      background-color: #25D366;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 6px;
      text-align: center;
      margin-left: 8px;
    }
    .footer {
      text-align: center;
      padding: 24px 32px;
      background-color: #f4f2ee;
      font-size: 12px;
      color: #888888;
      line-height: 1.5;
    }
    @media screen and (max-width: 600px) {
      .content-body {
        padding: 20px;
      }
      .header-bar {
        padding: 20px;
      }
      .btn-whatsapp {
        margin-left: 0;
        margin-top: 8px;
        display: block;
      }
      .btn-primary {
        display: block;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-card" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td class="header-bar">
          ${
            data.logoUrl
              ? `<img src="${data.logoUrl}" alt="${hotel}" width="50" height="50" style="display:inline-block; margin-bottom: 10px; border-radius: 6px;" /><br />`
              : ""
          }
          <h1 style="margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: normal; color: #ffffff; letter-spacing: 0.05em;">
            ${hotel}
          </h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #b8ccbf;">
            Website Booking Inquiry
          </p>
        </td>
      </tr>

      <tr>
        <td class="content-body">
          <div style="margin-bottom: 24px;">
            <span class="section-title">NEW RESERVATION INQUIRY</span>
            <h2 style="margin: 4px 0 0 0; font-family: Georgia, serif; font-size: 20px; font-weight: normal; color: #163126;">
              ${safeName}
            </h2>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 16px;">
            <tr class="data-row">
              <td class="data-label">Guest Name</td>
              <td class="data-value">${safeName}</td>
            </tr>
            <tr class="data-row">
              <td class="data-label">Email Address</td>
              <td class="data-value">
                <a href="${mailtoUrl}" style="color: #b06a3c; text-decoration: underline;">
                  ${safeEmail}
                </a>
              </td>
            </tr>
            ${
              safePhone
                ? `<tr class="data-row">
                    <td class="data-label">Phone Number</td>
                    <td class="data-value">
                      <a href="tel:${safePhone}" style="color: #163126; text-decoration: none;">
                        ${safePhone}
                      </a>
                    </td>
                  </tr>`
                : ""
            }
            <tr class="data-row">
              <td class="data-label">Room Selected</td>
              <td class="data-value">
                <span class="badge">${safeRoom}</span>
              </td>
            </tr>
            <tr class="data-row">
              <td class="data-label">Party Size</td>
              <td class="data-value">
                ${data.guests ? `${data.guests} ${data.guests === 1 ? "guest" : "guests"}` : "Not specified"}
              </td>
            </tr>
          </table>

          <div class="date-card">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td width="50%" style="vertical-align: top; padding-right: 8px;">
                  <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6b6b6b; display: block; margin-bottom: 4px;">
                    CHECK-IN
                  </span>
                  <span style="font-size: 15px; font-weight: 600; color: #163126;">
                    ${checkInFormatted}
                  </span>
                </td>
                <td width="50%" style="vertical-align: top; padding-left: 8px; border-left: 1px solid #e0ded8;">
                  <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #6b6b6b; display: block; margin-bottom: 4px;">
                    CHECK-OUT
                  </span>
                  <span style="font-size: 15px; font-weight: 600; color: #163126;">
                    ${checkOutFormatted}
                  </span>
                </td>
              </tr>
              ${
                nights > 0
                  ? `<tr>
                      <td colspan="2" style="padding-top: 12px; border-top: 1px solid #eae7e0; margin-top: 12px;">
                        <span style="font-size: 12px; font-weight: 600; color: #b06a3c;">
                          Duration: ${nights} ${nights === 1 ? "night" : "nights"} stay
                        </span>
                      </td>
                    </tr>`
                  : ""
              }
            </table>
          </div>

          ${
            safeMessage
              ? `<div>
                  <span class="section-title">GUEST MESSAGE / SPECIAL REQUESTS</span>
                  <div class="message-box">
                    ${safeMessage}
                  </div>
                </div>`
              : ""
          }

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f0eee9; text-align: center;">
            <a href="${mailtoUrl}" class="btn-primary">
              Reply to ${safeName}
            </a>
            ${
              waNumber
                ? `<a href="https://wa.me/${waNumber}" target="_blank" class="btn-whatsapp">
                    WhatsApp Guest
                  </a>`
                : ""
            }
          </div>
        </td>
      </tr>

      <tr>
        <td class="footer">
          <p style="margin: 0 0 6px 0; font-weight: 600; color: #666666;">
            ${hotel}
          </p>
          <p style="margin: 0; color: #999999;">
            ${data.address || "Udahawaththa Bungalow, Pimbura, Karavita Road, Pimbura 70470"}<br />
            This inquiry was automatically submitted via the official website.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

export function generateInquiryPlainText(data: InquiryTemplateData): string {
  const hotel = data.hotelName || "Mist Mountain Hiking Base";
  const nights = computeNights(data.checkIn, data.checkOut);

  return [
    `=== NEW BOOKING INQUIRY — ${hotel.toUpperCase()} ===`,
    "",
    `Guest Name: ${data.guestName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone ?? "Not provided"}`,
    `Room: ${data.roomName ?? "Any suitable room"}`,
    `Guests: ${data.guests ?? "Not specified"}`,
    "",
    `Check-in: ${formatDatePretty(data.checkIn)}`,
    `Check-out: ${formatDatePretty(data.checkOut)}`,
    nights > 0 ? `Duration: ${nights} night(s)` : "",
    "",
    data.message ? `Special Requests/Message:\n${data.message}\n` : "",
    "---",
    `Submitted through the ${hotel} website.`,
  ]
    .filter(Boolean)
    .join("\n");
}
