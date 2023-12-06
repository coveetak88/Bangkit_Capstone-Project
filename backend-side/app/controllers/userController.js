const db = require('../config/firestore');
const { sendVerificationEmail, comparePassword } = require('../middleware/authMiddleware')

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
}

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

module.exports = {
    updateEmailUser,
    deleteAccount
}