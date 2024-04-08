const nodemailer = require('nodemailer');

const createTransporter = async () => {
  try {
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
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error('Error setting up transporter:', error);
    throw error;
  }
};

module.exports = { createTransporter };
