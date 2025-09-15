import { EMAIL_BASE_STYLES } from "./email-style";

interface EmailLayoutProps {
  orgName: string;
  children: string;
}

export function EmailLayout({ orgName, children }: EmailLayoutProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${EMAIL_BASE_STYLES}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${orgName}</h1>
          </div>
          <div class="content">
            ${children}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
