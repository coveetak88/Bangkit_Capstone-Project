const db = require('../config/firestore');

const getUser = async (req, res) => {
  try {
      const userId = req.user.userId;
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
          return res.status(404).json({ error: 'User not found.' });
      }
      const userData = userDoc.data();
      return res.json({ message: 'User information fetched successfully', user: userData });
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUser
};