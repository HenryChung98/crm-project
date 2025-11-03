import { EmailLayout } from "../email-layout";
import { renderContactInfo } from "../contact-info";

interface InvitationEmailProps {
  orgId: string;
  orgName: string;
  orgEmail?: string;
}

export function InvitationEmail({
  orgId,
  orgName,
  orgEmail,
}: InvitationEmailProps): string {
  const content = `
    <h2>You have been invited to join ${orgName}</h2>
    <p>Click the button below to accept the invitation and create your account.</p>
    <a class="button" href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/signup?org_id=${orgId}&org_name=${orgName}">Accept Invitation</a>
    <p class="footer">
      If you don't recognize this invitation, you can safely ignore this email.<br>
      This invitation link will expire in 7 days.
    </p>
    ${renderContactInfo(orgEmail)}
  `;

  return EmailLayout({ orgName, children: content });
}
