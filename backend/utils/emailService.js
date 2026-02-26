const nodemailer = require('nodemailer');

/* ─────────────────────────────────────────────
   Create a reusable transporter.
   Credentials come from .env — never hardcode.
   ───────────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,   // Use an App Password for Gmail
  },
});

/* ─────────────────────────────────────────────
   Notification type → readable subject + colour
   ───────────────────────────────────────────── */
const typeConfig = {
  APPLICATION_UPDATE: { subject: '📋 Application Update — SmartHire', accentColor: '#818cf8' },
  INTERVIEW: { subject: '🗓️ Interview Scheduled — SmartHire', accentColor: '#fbbf24' },
  OFFER: { subject: '🎉 Offer Received — SmartHire', accentColor: '#34d399' },
  SYSTEM: { subject: '🔔 SmartHire Notification', accentColor: '#38bdf8' },
};

/* ─────────────────────────────────────────────
   HTML email template
   ───────────────────────────────────────────── */
const buildEmailHtml = (recipientName, message, type) => {
  const { accentColor } = typeConfig[type] || typeConfig.SYSTEM;
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SmartHire Notification</title>
</head>
<body style="margin:0;padding:0;background:#0f1219;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1219;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#141826;border-radius:16px;overflow:hidden;
                      border:1px solid rgba(255,255,255,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);
                       padding:28px 36px;text-align:center;">
              <span style="font-size:1.6rem;font-weight:800;color:#fff;
                           letter-spacing:-0.04em;">Smart<span
                style="color:${accentColor};">Hire</span></span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 8px;font-size:0.82rem;font-weight:600;
                        color:${accentColor};text-transform:uppercase;
                        letter-spacing:0.08em;">Notification</p>
              <h2 style="margin:0 0 20px;font-size:1.35rem;font-weight:700;
                         color:#e2e8f0;line-height:1.4;">
                Hi ${recipientName}! 👋
              </h2>
              <div style="background:rgba(255,255,255,0.04);border-left:3px solid ${accentColor};
                          border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:1rem;color:#cbd5e1;line-height:1.7;">
                  ${message}
                </p>
              </div>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}"
                 style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);
                        color:#fff;font-size:0.92rem;font-weight:700;text-decoration:none;
                        padding:12px 28px;border-radius:8px;
                        box-shadow:0 4px 18px rgba(99,102,241,0.4);">
                Open SmartHire →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 36px 28px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:0.75rem;color:#4a5568;text-align:center;">
                You're receiving this because you have an account on SmartHire.<br/>
                © ${new Date().getFullYear()} SmartHire. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/* ─────────────────────────────────────────────
   Main export — call this wherever you do
   Notification.create() to also send an email.

   @param {string} toEmail       - recipient's registered email
   @param {string} toName        - recipient's name
   @param {string} message       - same message stored in DB
   @param {string} type          - Notification type enum value
   ───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   Verify credentials on server startup so we
   know immediately if Gmail auth works or not.
   ───────────────────────────────────────────── */
const verifyTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EmailService] ⚠️  EMAIL_USER / EMAIL_PASS not set — emails disabled.');
    return;
  }
  transporter.verify((err) => {
    if (err) {
      console.error('[EmailService] ❌ Gmail auth FAILED:', err.message);
      console.error('[EmailService]    → Make sure EMAIL_PASS is a Gmail App Password (not your real password).');
      console.error('[EmailService]    → Guide: https://support.google.com/accounts/answer/185833');
    } else {
      console.log(`[EmailService] ✅ Gmail auth OK — sending from ${process.env.EMAIL_USER}`);
    }
  });
};

const sendNotificationEmail = async (toEmail, toName, message, type = 'SYSTEM') => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not set — skipping email.');
    return;
  }

  const { subject } = typeConfig[type] || typeConfig.SYSTEM;

  const mailOptions = {
    from: `"SmartHire" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: buildEmailHtml(toName, message, type),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Email sent to ${toEmail} — MessageId: ${info.messageId}`);
  } catch (err) {
    // Log but never crash the main flow over a failed email
    console.error(`[EmailService] Failed to send email to ${toEmail}:`, err.message);
  }
};

module.exports = { sendNotificationEmail, verifyTransporter };
