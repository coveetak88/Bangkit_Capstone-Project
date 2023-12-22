const {
  hashPassword,
  generateUniqueUserId,
  createUserObject,
  generateAccessToken,
} = require("../models/users");
const db = require("../config/firestore");
const transporter = require("../config/nodemailer");
const { comparePassword } = require("../middleware/authMiddleware");

const { REFRESH_TOKEN_SECRET } = require("../config/token.js");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const sendVerificationEmail = async (userEmail, verificationCode) => {
  try {
    const mailOptions = {
      from: "localbite.bangkit@gmail.com",
      to: userEmail,
      subject: "Verification Code",
      text: `Your verification code is: ${verificationCode}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    throw new Error("Failed to send verification email");
  }
};

const sendPasswordResetEmail = async (userEmail, resetCode) => {
  try {
    const mailOptions = {
      from: "localbite.bangkit@gmail.com",
      to: userEmail,
      subject: "Password Reset Code",
      text: `Your reset code is: ${resetCode}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    throw new Error("Failed to send verification email");
  }
};

const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const { salt, hashedPassword } = await hashPassword(password);

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    await sendVerificationEmail(email, verificationCode);

    const newUser = createUserObject(
      name,
      email,
      hashedPassword,
      salt,
      verificationCode,
    );

    await db.collection("users").doc(newUser.uid).set(newUser);

    return res
      .status(201)
      .json({ message: "User created successfully", userId: newUser.uid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const usersRef = db.collection("users");
    const query = usersRef.where("email", "==", email);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "User not found." });
    }

    let isValidCode = false;
    let userIdToUpdate = null;

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const verificationCode = userData.customClaims
        ? userData.customClaims.verificationCode
        : null;

      if (verificationCode === parseInt(code)) {
        isValidCode = true;
        userIdToUpdate = doc.id;
      }
    });

    if (isValidCode && userIdToUpdate) {
      await db
        .collection("users")
        .doc(userIdToUpdate)
        .update({ emailVerified: true });
      return res.json({ message: "Email verified successfully." });
    } else {
      return res.status(400).json({ error: "Invalid verification code." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersRef = db.collection("users");
    const query = usersRef.where("email", "==", email);
    const querySnapshot = await query.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "User not found." });
    }

    let userId = null;
    let isEmailVerified = false;
    let hashedPassword = null;
    let dataUser = null;

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      dataUser = userData.providerData[0];
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

        await db.collection("users").doc(userId).update({
          refreshToken: refreshToken,
          "metadata.lastSignInTime": new Date().toUTCString(),
        });

        return res.json({
          message: "Login successful.",
          accessToken: accessToken,
          refreshToken: refreshToken,
          userData: dataUser,
        });
      } else {
        return res.status(401).json({ error: "Invalid credentials." });
      }
    } else {
      return res.status(401).json({ error: "Email is not verified yet." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken === null) return res.sendStatus(401);
  try {
    const querySnapshot = await db
      .collection("users")
      .where("refreshToken", "==", refreshToken)
      .get();
    if (querySnapshot.empty) return res.sendStatus(403);
    const userData = querySnapshot.docs[0].data();

    let userId;

    querySnapshot.forEach((doc) => {
      userId = doc.id;
    });

    await db.collection("users").doc(userId).update({
      "metadata.lastRefreshTime": new Date().toUTCString(),
      tokensValidAfterTime: new Date().toUTCString(),
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
};

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.body.token;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: "Token is missing in the request body." });
    }

    const querySnapshot = await db
      .collection("users")
      .where("refreshToken", "==", refreshToken)
      .get();

    if (!querySnapshot.empty) {
      const userId = querySnapshot.docs[0].id;
      await db.collection("users").doc(userId).update({ refreshToken: null });
      return res.status(200).json({ message: "Logout successful." });
    } else {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userQuery.empty) {
      return res.status(404).json({ error: "Email not found" });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
    await userDoc.ref.update({
      "customClaims.verificationCode": newVerificationCode,
    });

    await sendVerificationEmail(email, newVerificationCode);

    return res
      .status(200)
      .json({ message: "Verification code resent successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userQuery.empty) {
      return res.status(404).json({ error: "Email not found" });
    }

    const userDoc = userQuery.docs[0];

    const resetCode = Math.floor(100000 + Math.random() * 900000);

    const resetExpiration = new Date();
    resetExpiration.setHours(resetExpiration.getHours() + 1); // Reset link expires in 1 hour

    await userDoc.ref.update({
      "customClaims.resetCode": resetCode,
      "customClaims.resetCodeExpiration": resetExpiration.toISOString(),
    });

    await sendPasswordResetEmail(email, resetCode);
    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    const userQuery = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userQuery.empty) {
      return res.status(404).json({ error: "Email not found" });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    const storedResetCode = userData.customClaims.resetCode;
    const resetCodeExpiration = new Date(
      userData.customClaims.resetCodeExpiration,
    );

    if (
      parseInt(resetCode) !== storedResetCode ||
      Date.now() > resetCodeExpiration
    ) {
      return res.status(401).json({ error: "Invalid or expired reset token" });
    }

    const { salt, hashedPassword } = await hashPassword(newPassword);
    await userDoc.ref.update({
      passwordHash: hashedPassword,
      passwordSalt: salt,
      "customClaims.resetCode": null, // Clear the reset token after successful reset
      "customClaims.resetCodeExpiration": null,
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  verifyEmail,
  refreshToken,
  logoutUser,
  resendVerification,
  resetPassword,
  forgotPassword,
};
