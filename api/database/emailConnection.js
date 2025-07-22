const nodemailer = require('nodemailer');
// Please make sure these settings are enable.....


const transporter = nodemailer.createTransport({
  host: 'relay.dnsexit.com',
  port: 587,  // Port 587 for secure STARTTLS communication
  secure: false,  // false for STARTTLS
  auth: {
    user: 'conway360',
        pass: 'kim2024K'
  }
});

// Email details
const mailOptions = {
  from: 'conway360@dnsexit.com', // From address (use your verified domain or email)
  to: 'talkdrove@gmail.com',  // Recipient email
  subject: 'Test Email from Nodemailer', // Subject
  text: 'This is a test email sent from Nodemailer using DNSExit SMTP relay.',  // Plain text content
  html: '<p>This is a <strong>test email</strong> sent from Nodemailer using DNSExit SMTP relay.</p>' // HTML content (optional)
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
