const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: 'relay.dnsexit.com',
  port: 587,
  secure: false, // STARTTLS, not SSL
  auth: {
    user: 'conway360',
    pass: 'kim2024K'
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false // disable cert check (good for testing)
  }
});

// Function to send a verification email
async function sendVerificationEmail({ toEmail, username, verifyToken }) {
  const verifyLink = `https://mafia-host-1.onrender.com/verify-signup?token=${verifyToken}`;

  const mailOptions = {
    from: '"HostTalkDrove" <conway360@dnsexit.com>',
    to: toEmail,
    subject: 'Verify your HostTalkDrove account',
    html: `
      <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5">
        <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
          <h2 style="color:#4c00ff">Welcome, ${username}!</h2>
          <p>Thank you for signing up for <strong>HostTalkDrove</strong>.</p>
          <p>Please verify your email address by clicking the button below:</p>
          <a href="${verifyLink}" style="display:inline-block;margin-top:15px;padding:10px 20px;background-color:#4c00ff;color:#fff;border-radius:5px;text-decoration:none;">
            Verify My Account
          </a>
          <p style="margin-top:20px;color:#777;font-size:13px;">If you didn't create this account, you can ignore this email.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error);
    return false;
  }
}

// Example test call (remove in production)
if (require.main === module) {
  sendVerificationEmail({
    toEmail: 'talkdrove@gmail.com',
    username: 'dhvjsz',
    verifyToken: 'abc123testtokengoeshere'
  });
}

module.exports = sendVerificationEmail;
