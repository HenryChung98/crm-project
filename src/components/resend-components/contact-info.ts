export function renderContactInfo(orgEmail?: string, orgPhone?: string): string {
  const contactMethods = [];

  if (orgEmail) {
    contactMethods.push(`<strong>Email:</strong> <a href="mailto:${orgEmail}">${orgEmail}</a>`);
  }

  if (orgPhone) {
    contactMethods.push(`<strong>Phone:</strong> <a href="tel:${orgPhone}">${orgPhone}</a>`);
  }

  if (contactMethods.length === 0) {
    return `
        <div class="contact-info">
          <p>If you have any questions, please contact our support team.</p>
          <a href="mailto:${process.env.NEXT_PUBLIC_SUPPORT_TEAM_EMAIL}">${process.env.NEXT_PUBLIC_SUPPORT_TEAM_EMAIL}</a>
        </div>
      `;
  }

  return `
      <div class="contact-info">
        <p><strong>Need help?</strong> Contact us:</p>
        <p>${contactMethods.join("<br>")}</p>
      </div>
    `;
}
