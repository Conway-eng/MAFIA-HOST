const nodemailer = require('nodemailer');











const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
    port: 587,
    secure: true,
    auth: {
        user: '929569001@smtp-brevo.com',
        pass: 'IEJ4Qz8M6VkZjcUa'
      }
});


module.exports = transporter;
