const { Resend } = require('resend');
const {
  buildResponsiveEmailHtml,
  buildTextEmail,
  normalizeInquiry
} = require('../lib/email-template');

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const inquiry = normalizeInquiry(getBody(req));
  if (!inquiry.firstName || !inquiry.lastName || !inquiry.email || !inquiry.message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  if (!resend) {
    return res.status(500).json({ success: false, error: 'Email service is not configured.' });
  }

  try {
    const subjectTour = inquiry.tourInterest || 'New Booking Request';
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Watamu Wilderness Safaris <onboarding@resend.dev>',
      to: process.env.RESEND_TO || 'wesongapeter68@yahoo.com',
      subject: `Safari Inquiry: ${subjectTour}`,
      text: buildTextEmail(inquiry),
      html: buildResponsiveEmailHtml(inquiry),
      replyTo: inquiry.email
    });

    if (error) {
      console.error('Resend rejected safari inquiry:', error);
      return res.status(502).json({
        success: false,
        error: error.message || 'Email service rejected the message.'
      });
    }

    return res.json({ success: true, message: 'Message sent successfully.', id: data?.id });
  } catch (error) {
    console.error('Safari inquiry send failed:', error);
    return res.status(500).json({ success: false, error: 'Unable to send message at this time.' });
  }
};
