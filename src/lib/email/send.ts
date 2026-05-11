// Lightweight email sender.
//
// Reads `RESEND_API_KEY` from the environment. If it's not set, calls
// silently no-op so dev / preview environments don't crash. On Vercel
// the owner adds the key once and bookings start sending confirmation
// emails automatically.
//
// We use Resend's plain HTTPS API (no SDK) so there's no extra dependency.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string; skipped?: boolean };

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No key configured — silently skip. The owner can add the key later
    // without changing any code.
    console.warn(
      "[email] RESEND_API_KEY not set — skipping send to",
      to,
      "subject:",
      subject,
    );
    return { ok: false, error: "no_api_key", skipped: true };
  }

  const sender =
    from ??
    process.env.RESEND_FROM ??
    "Haven Residence <noreply@havenresidences.com>";

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${errText.slice(0, 200)}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id ?? "" };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "email send failed",
    };
  }
}
