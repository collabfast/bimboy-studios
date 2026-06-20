import { Resend } from "resend";

// Resend is reached through Replit's connector proxy. The access token is
// short-lived, so we must never cache the client — fetch fresh credentials on
// every send and construct a new client.

export class ResendNotConfiguredError extends Error {
  constructor(message = "Email delivery is not configured yet.") {
    super(message);
    this.name = "ResendNotConfiguredError";
  }
}

type ResendConnectionSettings = {
  api_key?: string;
  from_email?: string;
};

function getAuthToken(): string | null {
  const replIdentity = process.env["REPL_IDENTITY"];
  if (replIdentity) return `repl ${replIdentity}`;
  const renewal = process.env["WEB_REPL_RENEWAL"];
  if (renewal) return `depl ${renewal}`;
  return null;
}

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const xReplitToken = getAuthToken();
  if (!hostname || !xReplitToken) {
    throw new ResendNotConfiguredError();
  }

  const res = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=resend`,
    {
      headers: {
        Accept: "application/json",
        X_REPLIT_TOKEN: xReplitToken,
      },
    },
  );

  if (!res.ok) {
    throw new ResendNotConfiguredError(
      `Could not load Resend connection (HTTP ${res.status}).`,
    );
  }

  const data = (await res.json()) as {
    items?: Array<{ settings?: ResendConnectionSettings }>;
  };
  const settings = data.items?.[0]?.settings;
  const apiKey = settings?.api_key;
  const fromEmail = settings?.from_email;

  if (!apiKey || !fromEmail) {
    throw new ResendNotConfiguredError();
  }

  return { apiKey, fromEmail };
}

// Never cache the returned client — credentials are short-lived.
export async function getUncachableResendClient(): Promise<{
  client: Resend;
  fromEmail: string;
}> {
  const { apiKey, fromEmail } = await getCredentials();
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
// ResendNotConfiguredError when the connector is not set up, or a generic
// Error when delivery fails.
export async function sendVerificationEmail(
  to: string,
  link: string,
): Promise<void> {
  const { client, fromEmail } = await getUncachableResendClient();
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
