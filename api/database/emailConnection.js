const nodemailer = require('nodemailer');











const transporter = nodemailer.createTransport({
    host: 'relay.dnsexit.com',
    port: 587,
    secure: false,
    auth: {
       user: 'conway360',
    pass: 'kim2024K'
      }
});


module.exports = transporter;
