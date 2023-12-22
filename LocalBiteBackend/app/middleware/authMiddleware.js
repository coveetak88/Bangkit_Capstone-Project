const bcrypt = require('bcrypt');

const comparePassword = async (password, hashedPassword) => {
    try {
      const match = await bcrypt.compare(password, hashedPassword);
      return match;
    } catch (error) {
      throw new Error('Error comparing password');
    }
  };

module.exports = {
  comparePassword
};
