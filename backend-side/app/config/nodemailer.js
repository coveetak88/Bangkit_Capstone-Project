const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'xxxxx',
    pass: 'xxxxxx'
  }
});

module.exports = transporter;
