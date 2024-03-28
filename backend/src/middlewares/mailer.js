const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ismartdev004@gmail.com',
    pass: 'nltd eqfa zzvp zjvo',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = transporter;
