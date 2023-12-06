const bcrypt = require('bcrypt');
const transporter = require('../config/nodemailer');

const comparePassword = async (password, hashedPassword) => {
    try {
      const match = await bcrypt.compare(password, hashedPassword);
      return match;
    } catch (error) {
      throw new Error('Error comparing password');
    }
  };

  const sendVerificationEmail = async (userEmail, verificationCode) => {
    try {
      const mailOptions = {
        from: 'localbite.bangkit@gmail.com',
        to: userEmail,
        subject: 'Verification Code',
        text: `Your verification code is: ${verificationCode}`
      };
  
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ' + info.response);
    } catch (error) {
      throw new Error('Failed to send verification email');
    }
  };

module.exports = {
  comparePassword,
  sendVerificationEmail
};
