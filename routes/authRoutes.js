// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

// Define routes for auth
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:resetToken', authController.resetPassword);
module.exports = router;
