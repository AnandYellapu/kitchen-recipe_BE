const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to login' });
  }
};

const getProfile = (req, res) => {
  res.status(200).json({ user: req.user });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users' });
  }
};

const forgotPassword = async (req, res) => {
  const token = crypto.randomBytes(20).toString("hex");
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).json({ error: "No user with such email!" });
  }

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;

  try {
    await user.save();

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "KITCHEN-RECIPE-MANAGEMENT - Reset Password",
      text: `You are receiving this because you have requested the reset of the password of your account.\n\nToken: ${token}\n\nIf you didn't request this, please ignore this email and your password will remain unchanged.`,
      html: `<p>You are receiving this because you have requested the reset of the password of your account.</p><p><strong>Token: ${token}</strong></p><p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>`,
    });

    return res.json({
      message: `An email has been sent to ${user.email} with further instructions`,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Find the user with the reset token and check the expiration
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.SMTP_USERNAME,
      to: user.email,
      subject: "KITCHEN-RECIPE-MANAGEMENT - Password Reset Successful",
      text: `Your password has been reset successfully. You can now log in with your new password.`,
      html: `<p>Your password has been reset successfully.</p><p>You can now log in with your new password.</p>`,
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
module.exports = { register, login, forgotPassword, resetPassword, getProfile, getUsers };
