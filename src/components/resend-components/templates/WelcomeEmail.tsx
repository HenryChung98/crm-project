import { EmailLayout } from "../email-layout";
import { renderContactInfo } from "../contact-info";

interface WelcomeEmailProps {
  name: string;
  orgName: string;
  orgEmail?: string;
  orgPhone?: string;
}

export function WelcomeEmail({ name, orgName, orgEmail, orgPhone }: WelcomeEmailProps): string {
  const content = `
    <h2>Welcome to ${orgName}!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for contacting ${orgName}! We're excited to have you on board.</p>
    <p>Get ready to experience amazing features and excellent support.</p>
    
    ${renderContactInfo(orgEmail, orgPhone)}
    
    <p>Welcome aboard!</p>
    <p>Best regards,<br>The ${orgName} Team</p>
  `;

  return EmailLayout({ orgName, children: content });
}
