import { formatEur } from "@/lib/format";

/**
 * Guest booking-confirmation email. Plain HTML, no images — looks fine in
 * every mail client.
 */
export function bookingConfirmationEmail({
  guestName,
  reference,
  propertyName,
  city,
  address,
  checkIn,
  checkOut,
  numGuests,
  total,
  brandName,
  contactEmail,
  whatsappNumber,
  siteUrl,
}: {
  guestName: string;
  reference: string;
  propertyName: string;
  city: string | null;
  address: string | null;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  numGuests: number;
  total: number;
  brandName: string;
  contactEmail: string | null;
  whatsappNumber: string | null;
  siteUrl: string;
}): { subject: string; html: string; text: string } {
  const fmtDate = (s: string) =>
    new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const checkInFmt = fmtDate(checkIn);
  const checkOutFmt = fmtDate(checkOut);
  const totalFmt = formatEur(total);

  const subject = `Booking confirmed — ${propertyName} · ${reference}`;

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f6f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0b0b0b;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f7f6f2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:32px 32px 0;">
                <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#525252;">Booking confirmed</p>
                <h1 style="margin:8px 0 0;font-size:28px;line-height:1.15;font-weight:700;color:#0b0b0b;">Welcome, ${escapeHtml(guestName)}.</h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#525252;">
                  Your stay at <strong style="color:#0b0b0b;">${escapeHtml(propertyName)}</strong>${city ? ` in ${escapeHtml(city)}` : ""} is confirmed.
                  Below are the details — keep this email handy for your arrival.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f2efe8;border-radius:16px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#525252;">Reference</p>
                      <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0b0b0b;letter-spacing:0.05em;">${escapeHtml(reference)}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  ${row("Property", escapeHtml(propertyName))}
                  ${address ? row("Address", escapeHtml(address)) : ""}
                  ${row("Check-in", checkInFmt)}
                  ${row("Check-out", checkOutFmt)}
                  ${row("Guests", String(numGuests))}
                  ${row("Total", totalFmt)}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px 8px;">
                <p style="margin:0;font-size:14px;line-height:1.55;color:#525252;">
                  Questions before you arrive? Just reply to this email${contactEmail ? ` or write to <a href="mailto:${escapeHtml(contactEmail)}" style="color:#1f6bf0;text-decoration:none;">${escapeHtml(contactEmail)}</a>` : ""}${whatsappNumber ? ` — or message us on WhatsApp at <a href="https://wa.me/${escapeHtml(whatsappNumber.replace(/\D/g, ""))}" style="color:#1f6bf0;text-decoration:none;">${escapeHtml(whatsappNumber)}</a>` : ""}.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:8px 32px 32px;">
                <a href="${escapeHtml(siteUrl)}/account" style="display:inline-block;background:#0b0b0b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:12px 20px;border-radius:999px;">View my bookings</a>
              </td>
            </tr>

            <tr>
              <td style="padding:24px 32px;background:#f7f6f2;border-top:1px solid rgba(0,0,0,0.06);font-size:12px;color:#525252;text-align:center;">
                © ${new Date().getFullYear()} ${escapeHtml(brandName)} · Curaçao
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Booking confirmed — ${propertyName}`,
    "",
    `Welcome, ${guestName}.`,
    "",
    `Reference: ${reference}`,
    `Property: ${propertyName}`,
    address ? `Address: ${address}` : null,
    `Check-in: ${checkInFmt}`,
    `Check-out: ${checkOutFmt}`,
    `Guests: ${numGuests}`,
    `Total: ${totalFmt}`,
    "",
    `Questions? Reply to this email${contactEmail ? ` or write to ${contactEmail}` : ""}${whatsappNumber ? ` — or message us on WhatsApp at ${whatsappNumber}` : ""}.`,
    "",
    `View your bookings: ${siteUrl}/account`,
    "",
    `© ${new Date().getFullYear()} ${brandName} · Curaçao`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#525252;width:120px;vertical-align:top;">${escapeHtml(label)}</td>
            <td style="font-size:15px;color:#0b0b0b;text-align:right;">${value}</td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
