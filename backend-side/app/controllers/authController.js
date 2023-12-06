const { hashPassword, generateUniqueUserId, createUserObject } = require('../models/users');
const db = require('../config/firestore');
const { comparePassword, sendVerificationEmail } = require('../middleware/authMiddleware');

const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = require('../config/token.js');

const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config();

function generateAccessToken(user) {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
}

const signupUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await db.collection('users').where('email', '==', email).get();

    if (!existingUser.empty) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const { salt, hashedPassword } = await hashPassword(password);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    await sendVerificationEmail(email, verificationCode);

    const newUser = createUserObject(email, hashedPassword, salt, verificationCode);

    await db.collection('users').doc(newUser.uid).set(newUser);

    return res.status(201).json({ message: 'User created successfully', userId: newUser.uid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// const SignInGoogle = async(req, res) => {
//   const oauth2Client = new.goole.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID, 
//     process.env.GOOGLE_CLIENT_ID, 
//     'directlink',
//   );

//   const scopes = [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//   ]

//   const authorization = oauth2Client.generateAuthUrl({
//     acces_type: "offline",
//     scope: scopes,
//     include_granted_scopes: true
//   })

// }

const verifyEmail = async (req, res) => {
    const { email, code } = req.body;
  
    try {
      const usersRef = db.collection('users');
      const query = usersRef.where('email', '==', email);
      const querySnapshot = await query.get();
  
      if (querySnapshot.empty) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      let isValidCode = false;
      let userIdToUpdate = null;
  
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const verificationCode = userData.customClaims ? userData.customClaims.verificationCode : null;
  
        if (verificationCode === parseInt(code)) {
          isValidCode = true;
          userIdToUpdate = doc.id;
        }
      });
  
      if (isValidCode && userIdToUpdate) {
        await db.collection('users').doc(userIdToUpdate).update({ emailVerified: true });
        return res.json({ message: 'Email verified successfully.' });
      } else {
        return res.status(400).json({ error: 'Invalid verification code.' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const usersRef = db.collection('users');
      const query = usersRef.where('email', '==', email);
      const querySnapshot = await query.get();
  
      if (querySnapshot.empty) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      let userId = null;
      let isEmailVerified = false;
      let hashedPassword = null;
  
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        userId = doc.id;
        isEmailVerified = userData.emailVerified || false;
        hashedPassword = userData.passwordHash;
      });

      user = {
          userId: userId,
      };
  
      if (isEmailVerified && userId) {
        const isPasswordMatch = await comparePassword(password, hashedPassword);
        if (isPasswordMatch) {
          
          const accessToken = generateAccessToken(user);
          const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET);

          await db.collection('users').doc(userId).update({ 
            refreshToken: refreshToken,
              'metadata.lastSignInTime': new Date().toUTCString()
          });
          
          return res.json({ message: 'Login successful.', accessToken: accessToken, refreshToken: refreshToken });
        } else {
          return res.status(401).json({ error: 'Invalid credentials.' });
        }
      } else {
        return res.status(401).json({ error: 'Email is not verified yet.' });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

const refreshToken = async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken === null) return res.sendStatus(401);
  try {
      const querySnapshot = await db.collection('users').where('refreshToken', '==', refreshToken).get();
      if (querySnapshot.empty) return res.sendStatus(403);
      const userData = querySnapshot.docs[0].data();
      
      let userId;

      querySnapshot.forEach((doc) => {
        userId = doc.id;
      });

      await db.collection('users').doc(userId).update({ 
        'metadata.lastRefreshTime': new Date().toUTCString(),
        tokensValidAfterTime: new Date().toUTCString()
      });
      
      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
          if (err) return res.sendStatus(403);
          const accessToken = generateAccessToken({
              userId: userData.uid, 
          });

          return res.json({ accessToken });
      });
  } catch (error) {
      console.error(error);
      return res.sendStatus(500);
  }
}

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.body.token;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Token is missing in the request body.' });
    }

    const querySnapshot = await db.collection('users').where('refreshToken', '==', refreshToken).get();

    if (!querySnapshot.empty) {
      const userId = querySnapshot.docs[0].id;
      await db.collection('users').doc(userId).update({ refreshToken: null });
      return res.status(204).json({ message: 'Logout successful.' });
    } else {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
};

  module.exports = {
    signupUser,
    loginUser,
    verifyEmail,
    refreshToken,
    logoutUser
  };