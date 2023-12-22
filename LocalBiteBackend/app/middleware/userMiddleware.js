const { ACCESS_TOKEN_SECRET } = require('../config/token.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const transporter = require('../config/nodemailer.js');

const comparePassword = async (password, hashedPassword) => {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    throw new Error('Error comparing password');
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token === null) return res.sendStatus(401);

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();

  });
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
  authenticateToken,
  comparePassword,
  sendVerificationEmail
};

