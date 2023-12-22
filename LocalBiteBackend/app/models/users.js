const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const { ACCESS_TOKEN_SECRET } = require('../config/token.js');

const hashPassword = async (password) => {
    try {
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return { salt, hashedPassword };
    } catch (error) {
      throw new Error(`Error hashing password : ${error.message}`);
    }
};

const generateUniqueUserId = () => {
    return uuidv4(); // Menggunakan v4 untuk membuat UUID
};

const createUserObject = (name, email, hashedPassword, salt, verificationCode) => {
  return {
    uid: generateUniqueUserId(),
    displayName: name,
    email: email,
    emailVerified: false,
    photoURL: null,
    phoneNumber: null,
    disabled: false,
    metadata: {
      creationTime: new Date().toUTCString(),
      lastSignInTime: null,
      lastRefreshTime: null
    },
    providerData: [
      {
        uid: email,
        displayName: name,
        email: email,
        photoURL: null,
        providerId: 'password',
        phoneNumber: null
      }
    ],
    passwordHash: hashedPassword,
    passwordSalt: salt,
    customClaims: { verificationCode: verificationCode, resetCode: null, resetCodeExpiration : null },
    tokensValidAfterTime: new Date().toUTCString(),
    tenantId: null,
    refreshToken: null,
    userPreferences: {    
      age: null,
      height: null,
      weight: null,
      gender: null,
      activity: null,
      weight_loss: null,
      number_of_meals: null,
      halal: null,
      allergen: null,
      disease: null,
      // user_keywords: null,
    }
  };
};

const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
}

module.exports = {
    createUserObject,
    hashPassword,
    generateUniqueUserId,
    generateAccessToken
};