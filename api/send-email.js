require('dotenv').config();
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const {
  buildResponsiveEmailHtml,
  buildTextEmail,
  normalizeInquiry
} = require('../lib/email-template');

const apiKey = process.env.RESEND_API_KEY?.trim();
const resend = apiKey ? new Resend(apiKey) : null;
const smtpHost = process.env.SMTP_HOST?.trim();
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();
const smtpSecure = process.env.SMTP_SECURE === 'true';
const gmailUser = process.env.GMAIL_USER?.trim();
const gmailPass = process.env.GMAIL_PASS?.trim();
const emailFrom = process.env.EMAIL_FROM?.trim() || process.env.GMAIL_FROM?.trim() || process.env.RESEND_FROM;
const emailRecipient = process.env.EMAIL_TO || process.env.RESEND_TO || 'wesongapeter68@yahoo.com';

const smtpTransporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
  : gmailUser && gmailPass
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass
        }
      })
    : null;

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

  if (!resend && !smtpTransporter) {
    return res.status(500).json({ success: false, error: 'Email service is not configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS, GMAIL_USER/GMAIL_PASS, or RESEND_API_KEY.' });
  }

  try {
    const subjectTour = inquiry.tourInterest || 'New Booking Request';
    if (smtpTransporter) {
      const info = await smtpTransporter.sendMail({
        from: emailFrom || `Watamu Wilderness Safaris <${smtpUser || gmailUser}>`,
        to: emailRecipient,
        subject: `Safari Inquiry: ${subjectTour}`,
        text: buildTextEmail(inquiry),
        html: buildResponsiveEmailHtml(inquiry),
        replyTo: inquiry.email
      });

      console.log('SMTP send info:', {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected
      });

      return res.json({ success: true, message: 'Message sent successfully via SMTP.', id: info.messageId, accepted: info.accepted, rejected: info.rejected });
    }

    const email = await resend.emails.send({
      from: emailFrom || 'Watamu Wilderness Safaris <onboarding@resend.dev>',
      to: emailRecipient,
      subject: `Safari Inquiry: ${subjectTour}`,
      text: buildTextEmail(inquiry),
      html: buildResponsiveEmailHtml(inquiry),
      replyTo: inquiry.email
    });

    console.log('Resend response object:', email);

    if (email.error) {
      console.error('Resend rejected safari inquiry:', email.error);
      return res.status(502).json({ success: false, error: email.error.message || 'Email service rejected the message.' });
    }

    return res.json({ success: true, message: 'Message sent successfully via Resend.', id: email?.id });
  } catch (error) {
    console.error('Safari inquiry send failed:', error);
    return res.status(500).json({ success: false, error: 'Unable to send message at this time.' });
  }
};
