const { hashPassword, generateAccessToken } = require('../models/users');
const db = require('../config/firestore');
const { comparePassword, sendVerificationEmail } = require('../middleware/userMiddleware');

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userData = userDoc.data();
    const hashedPassword = userData.passwordHash;

    const isPasswordMatch = await comparePassword(currentPassword, hashedPassword);
    if (isPasswordMatch) {
      const { salt, hashedPassword: newHashedPassword } = await hashPassword(newPassword);

      await userDoc.ref.update({
        passwordHash: newHashedPassword,
        passwordSalt: salt,
      });

      const updatedUser = {
        userId: userId,
      };

      const newAccessToken = generateAccessToken(updatedUser);

      res.json({ message: 'Password changed successfully.', accessToken: newAccessToken });
    } else {
      res.status(401).json({ error: 'Current password is incorrect.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEmailUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const email = req.body.email;

    const existingUser = await db.collection('users').where('email', '==', email).get();

    if (!existingUser.empty) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let newProviderData = [];

    existingUser.forEach((doc) => {
      const userData = doc.data();
      newProviderData = userData.providerData;
    });

    if (newProviderData.displayName === undefined) {
      newProviderData.displayName = null
    }

    if (newProviderData.photoURL === undefined) {
      newProviderData.photoURL = null
    }

    if (newProviderData.phoneNumber === undefined) {
      newProviderData.phoneNumber = null
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    await sendVerificationEmail(email, verificationCode);

    await db.collection('users').doc(userId).update({
      emailVerified: false,
      email: email,
      customClaims: { verificationCode: verificationCode },
      providerData: [
        {
          uid: email,
          displayName: newProviderData.displayName,
          email: email,
          photoURL: newProviderData.photoURL,
          providerId: 'password',
          phoneNumber: newProviderData.phoneNumber
        }
      ]
    });

    return res.status(200).json({ message: 'Email verification and verification code updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const password = req.body.password;

    const usersRef = db.collection('users');
    const query = usersRef.where('uid', '==', userId);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let hashedPassword = null;

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      hashedPassword = userData.passwordHash;
    });

    const isPasswordValid = await comparePassword(password, hashedPassword);

    if (isPasswordValid) {
      await db.collection('users').doc(userId).delete();
      return res.status(200).json({ message: 'User account deleted successfully.' });
    } else {
      return res.status(401).json({ error: 'Invalid password. Account deletion failed.' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: error.message });
  }
}

const changeDisplayName = async (req, res) => {
  const userId = req.user.userId;
  const name = req.body.name;

  try {
    const existingUser = await db.collection('users').where('uid', '==', userId).get();

    if (existingUser.empty) {
      return res.status(400).json({ error: 'User not found.' });
    }

    let newProviderData = [];

    existingUser.forEach((doc) => {
      const userData = doc.data();
      newProviderData = userData.providerData;
    });


    if (newProviderData.displayName === undefined) {
      newProviderData.displayName = null
    }

    if (name === undefined) {
      return res.status(400).json({ error: 'Name can not be empty.' });
    }

    if (newProviderData.photoURL === undefined) {
      newProviderData.photoURL = null
    }

    if (newProviderData.phoneNumber === undefined) {
      newProviderData.phoneNumber = null
    }

    await db.collection('users').doc(userId).update({
      displayName: name,
      providerData: [
        {
          uid: newProviderData[0].uid,
          displayName: name,
          email: newProviderData[0].email,
          photoURL: newProviderData[0].photoURL,
          providerId: 'password',
          phoneNumber: newProviderData[0].phoneNumber
        }
      ]
    });
    res.json({ message: 'Display name changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserPreferences = async (req,res) => {
  try {
    const userId = req.user.userId;
    const preferences = req.body.preferences;

    if (preferences.gender != "Female") {
      if (preferences.gender != "Male") {
        return res.status(400).json({ error: 'User gender must be "Female" or "Male"' });
      }
    }

    const validActivities = ['Little/no exercise', 'Light exercise', 'Moderate exercise (3-5 days/wk)', 'Very active (6-7 days/wk)', 'Extra active (very active & physical job)'];

    if (!validActivities.includes(preferences.activity)) {
      return res.status(400).json({ error: "User activity must be 'Little/no exercise','Light exercise','Moderate exercise (3-5 days/wk)','Very active (6-7 days/wk)' or 'Extra active (very active & physical job)'" });
    }

    const validWeightLoss = ['Maintain weight','Mild weight loss','Weight loss','Extreme weight loss']

    if (!validWeightLoss.includes(preferences.weight_loss)) {
      return res.status(400).json({ error: "User disease must be 'Maintain weight','Mild weight loss','Weight loss', or 'Extreme weight loss'" });
    }

    if (![3, 4, 5].includes(preferences.number_of_meals)) {
      return res.status(400).json({ error: 'Number of meals should be 3, 4, or 5' });
    }

    const validDisease = ['heart_disease','hypertension','kidney_disease','obesity','diabetes','healthy' ];

    if (!validDisease.includes(preferences.disease)) {
      return res.status(400).json({ error: "User disease must be 'heart_disease','hypertension','kidney_disease','obesity','diabetes', or 'healthy'" });
    }

    if (!Array.isArray(preferences.allergen)) {
      return res.status(400).json({ error: 'Restriction food should be an array' });
    }

    const userPreferences = {
      age: preferences.age,
      height: preferences.height,
      weight: preferences.weight,
      gender: preferences.gender,
      activity: preferences.activity,
      weight_loss: preferences.weight_loss,
      number_of_meals: preferences.number_of_meals,
      halal: preferences.halal,
      allergen: preferences.allergen || null,
      disease: preferences.disease || null,
    };

    const existingUser = await db.collection('users').where('uid', '==', userId).get();

    if (existingUser.empty) {
      return res.status(400).json({ error: 'User not found.' });
    }

    await db.collection('users').doc(userId).update({
      userPreferences: userPreferences
    });

    return res.status(200).json({ message: 'User health preferences updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUserData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const usersRef = db.collection("users");
    const query = usersRef.where("uid", "==", userId);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "User not found." });
    }

    let userData = querySnapshot.docs[0].data();

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  changePassword,
  updateEmailUser,
  deleteAccount,
  changeDisplayName,
  updateUserPreferences,
  getUserData
};