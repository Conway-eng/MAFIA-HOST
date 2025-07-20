const nodemailer = require('nodemailer');











const transporter = nodemailer.createTransport({
    host: 'mxslurp.click',
    port: 2525, 
    secure: true,
    auth: {
        user: '4Dz4YVEOkx3zd77eZ0ERwqyC3xojor2X',
        pass: 'pa96AaB7ZIHrrxL1qD8GWBOshZnGgEfk'
    }
});


module.exports = transporter;
