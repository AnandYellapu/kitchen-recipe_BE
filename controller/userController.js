const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const generateResetToken = require('../utils/generateResetToken');

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    user = new User({ username, email, password });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user to the database
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.isAdmin ? 'admin' : 'user', // Use 'admin' or 'user' based on the 'admin' field
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token
    const resetToken = await generateResetToken();

    // Set token and expiration in the user model
    user.resetToken = resetToken;
    user.resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    await user.save();

    // Send reset email
    sendResetEmail(user.email, resetToken);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

function sendResetEmail(email, resetToken) {
  try {
    // Configure Nodemailer transport
    const transporter = nodemailer.createTransport({
      // Configure your email provider here
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Create email content
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: 'Password Reset',
      text: `Click the following link to reset your password: https://kitchen-recipe-management1.netlify.app/reset-password/${resetToken}`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error) {
    console.error('Error sending reset email:', error.message);
  }
}

const resetPassword = async (req, res) => {
  const resetToken = req.params.resetToken;
  const { newPassword } = req.body;

  try {
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: 'Invalid request. Missing resetToken or newPassword.' });
    }

    
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: { $gt: new Date() },
    });
  

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetToken = null;
    user.resetTokenExpiration = null;

    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};