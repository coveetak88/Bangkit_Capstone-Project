const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const hashPassword = async (password) => {
    try {
      const saltRounds = 10; // Tingkat keamanan salt
  
      // Generate salt
      const salt = await bcrypt.genSalt(saltRounds);
  
      // Hash password dengan salt
      const hashedPassword = await bcrypt.hash(password, salt);
  
      return { salt, hashedPassword };
    } catch (error) {
      throw new Error(`Error hashing password : ${error.message}`);
    }
};

const generateUniqueUserId = () => {
    return uuidv4(); // Menggunakan v4 untuk membuat UUID
};

const createUserObject = (email, hashedPassword, salt, verificationCode) => {
  return {
    uid: generateUniqueUserId(),
    email: email,
    emailVerified: false,
    displayName: null,
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
        displayName: null,
        email: email,
        photoURL: null,
        providerId: 'password',
        phoneNumber: null
      }
    ],
    passwordHash: hashedPassword,
    passwordSalt: salt,
    customClaims: { verificationCode: verificationCode },
    tokensValidAfterTime: new Date().toUTCString(),
    tenantId: null,
    refreshToken: null
  };
};

module.exports = {
    createUserObject,
    hashPassword,
    generateUniqueUserId
  };