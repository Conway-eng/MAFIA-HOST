const nodemailer = require('nodemailer');











const transporter = nodemailer.createTransport({
 host: "smtp.ethereal.email",
  port: 465,
  secure: true,
  auth: {
    user: "nicksonkipruto79@gmail.com",
    pass: "unhb guki imki yatw",
    }
});


module.exports = transporter;
