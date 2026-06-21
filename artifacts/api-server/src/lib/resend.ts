import { Resend } from "resend";

// Resend is configured via environment secrets: RESEND_API_KEY and
// RESEND_FROM_EMAIL. Sending fails loudly (ResendNotConfiguredError) when
// either is missing rather than silently dropping mail.

export class ResendNotConfiguredError extends Error {
  constructor(message = "Email delivery is not configured yet.") {
    super(message);
    this.name = "ResendNotConfiguredError";
  }
}

function getCredentials(): { apiKey: string; fromEmail: string } {
  const apiKey = process.env["RESEND_API_KEY"];
  const fromEmail = process.env["RESEND_FROM_EMAIL"];

  if (!apiKey || !fromEmail) {
    throw new ResendNotConfiguredError();
  }

  return { apiKey, fromEmail };
}

export function getResendClient(): {
  client: Resend;
  fromEmail: string;
} {
  const { apiKey, fromEmail } = getCredentials();
  return { client: new Resend(apiKey), fromEmail };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Send the confirmation email containing the verification link. Throws
// ResendNotConfiguredError when the secrets are not set, or a generic
// Error when delivery fails.
export async function sendVerificationEmail(
  to: string,
  link: string,
): Promise<void> {
  const { client, fromEmail } = getResendClient();
  const safeLink = escapeHtml(link);

  const { error } = await client.emails.send({
    from: fromEmail,
    to,
    subject: "Confirm your email for Bimboy Studios",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <h2 style="margin: 0 0 16px;">Confirm your email</h2>
        <p>Thanks for joining Bimboy Studios. Please confirm this is your email
        address by clicking the button below.</p>
        <p style="margin: 24px 0;">
          <a href="${safeLink}"
             style="background:#e11d48;color:#fff;text-decoration:none;
                    padding:12px 20px;border-radius:8px;display:inline-block;">
            Confirm email
          </a>
        </p>
        <p style="font-size:13px;color:#555;">Or paste this link into your
        browser:<br /><a href="${safeLink}">${safeLink}</a></p>
        <p style="font-size:13px;color:#555;">This link expires in 24 hours.
        If you didn't request this, you can ignore this email.</p>
      </div>
    `,
    text:
      `Confirm your email for Bimboy Studios by opening this link ` +
      `(expires in 24 hours):\n\n${link}\n\n` +
      `If you didn't request this, you can ignore this email.`,
  });

  if (error) {
    throw new Error(`Resend delivery failed: ${error.message}`);
  }
}
