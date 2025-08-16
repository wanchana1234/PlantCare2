// email.js
const nodemailer = require('nodemailer');

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE,
  SMTP_USER, SMTP_PASS,
  ALERT_FROM = process.env.SMTP_USER
} = process.env;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn('[email] Missing SMTP envs. Please set SMTP_HOST/USER/PASS');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT || 465),
  secure: String(SMTP_SECURE || 'true') === 'true',
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  logger: true,
  debug: true,
});

async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({ from: ALERT_FROM, to, subject, text, html: html || text });
}

module.exports = { sendEmail };
