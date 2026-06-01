function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeInquiry(input = {}) {
  return {
    firstName: clean(input.firstName || input.first_name),
    lastName: clean(input.lastName || input.last_name),
    email: clean(input.email),
    phone: clean(input.phone),
    tourInterest: clean(input.tourInterest || input.tour_interest),
    groupSize: clean(input.groupSize || input.group_size),
    travelDate: clean(input.travelDate || input.travel_date),
    budget: clean(input.budget),
    message: clean(input.message),
    newsletter: Boolean(input.newsletter)
  };
}

function buildTextEmail(input) {
  const data = normalizeInquiry(input);
  return [
    `Name: ${data.firstName} ${data.lastName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || 'Not provided'}`,
    `Tour Interest: ${data.tourInterest || 'Not specified'}`,
    `Group Size: ${data.groupSize || 'Not specified'}`,
    `Travel Date: ${data.travelDate || 'Flexible'}`,
    `Budget: ${data.budget || 'Not specified'}`,
    `Newsletter: ${data.newsletter ? 'Yes' : 'No'}`,
    '',
    'Message:',
    data.message
  ].join('\n');
}

function buildResponsiveEmailHtml(input) {
  const data = normalizeInquiry(input);
  const fullName = escapeHtml(`${data.firstName} ${data.lastName}`.trim());
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone || 'Not provided');
  const safeTour = escapeHtml(data.tourInterest || 'Safari inquiry');
  const safeGroup = escapeHtml(data.groupSize || 'Not specified');
  const safeDate = escapeHtml(data.travelDate || 'Flexible');
  const safeBudget = escapeHtml(data.budget || 'Not specified');
  const safeNewsletter = data.newsletter ? 'Yes' : 'No';
  const safeMessage = escapeHtml(data.message).replace(/\r?\n/g, '<br>');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>New Safari Inquiry</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .email-pad { padding: 24px !important; }
        .email-heading { font-size: 26px !important; line-height: 1.2 !important; }
        .email-cell { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f4efe7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe7;">
      <tr>
        <td align="center" style="padding:32px 14px;">
          <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #eadfce;">
            <tr>
              <td class="email-pad" style="padding:30px 34px;background:#2d5a27;color:#ffffff;">
                <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#f4c95d;margin-bottom:10px;">Watamu Wilderness Safaris</div>
                <h1 class="email-heading" style="margin:0;font-size:32px;line-height:1.15;color:#ffffff;">New Safari Inquiry</h1>
                <p style="margin:10px 0 0;color:#e8f0e5;font-size:16px;line-height:1.5;">${safeTour}</p>
              </td>
            </tr>
            <tr>
              <td class="email-pad" style="padding:30px 34px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="email-cell" width="50%" style="width:50%;padding:0 10px 18px 0;">
                      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7a6a54;margin-bottom:7px;">Name</div>
                      <div style="font-size:16px;line-height:1.45;color:#1d1d1d;">${fullName}</div>
                    </td>
                    <td class="email-cell" width="50%" style="width:50%;padding:0 0 18px 10px;">
                      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7a6a54;margin-bottom:7px;">Email</div>
                      <a href="mailto:${safeEmail}" style="font-size:16px;line-height:1.45;color:#2d5a27;text-decoration:none;word-break:break-word;">${safeEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-cell" width="50%" style="width:50%;padding:0 10px 18px 0;">
                      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7a6a54;margin-bottom:7px;">Phone / WhatsApp</div>
                      <div style="font-size:16px;line-height:1.45;color:#1d1d1d;">${safePhone}</div>
                    </td>
                    <td class="email-cell" width="50%" style="width:50%;padding:0 0 18px 10px;">
                      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7a6a54;margin-bottom:7px;">Travel Date</div>
                      <div style="font-size:16px;line-height:1.45;color:#1d1d1d;">${safeDate}</div>
                    </td>
                  </tr>
                  <tr>
                    <td class="email-cell" width="50%" style="width:50%;padding:0 10px 18px 0;">
                      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7a6a54;margin-bottom:7px;">Group Size</div>
                      <div style="font-size:16px;line-height:1.45;color:#1d1d1d;">${safeGroup}</div>
                    </td>
                    <td class="email-cell" width="50%" style="width:50%;padding:0 0 18px 10px;">
                      <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7a6a54;margin-bottom:7px;">Budget</div>
                      <div style="font-size:16px;line-height:1.45;color:#1d1d1d;">${safeBudget}</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:6px;padding:18px;background:#f8f3eb;border-left:4px solid #f4c95d;border-radius:4px;">
                  <div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7a6a54;margin-bottom:9px;">Message</div>
                  <div style="font-size:16px;line-height:1.65;color:#1d1d1d;word-break:break-word;">${safeMessage}</div>
                </div>
                <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#7a6a54;">Newsletter signup: ${safeNewsletter}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

module.exports = {
  buildResponsiveEmailHtml,
  buildTextEmail,
  normalizeInquiry
};
