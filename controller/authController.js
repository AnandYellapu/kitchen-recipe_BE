
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); // Import the crypto module

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
});

// Controller function for user registration
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        user = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save the user to the database
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};





const login = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await User.findOne({ email: identifier });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password.' });
        }

        // Generate token with role and email included in the payload
        const tokenPayload = {
            userId: user._id,
            role: user.role,
            email: user.email
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};



// Controller function for forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Generate password reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        console.log("Generated reset token:", resetToken);

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found for email:", email);
            return res.status(404).json({ message: 'User not found.' });
        }

        // Save reset token and expiry time to the user object
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        console.log("Reset token saved to user:", user);

        const mailOptions = {
            from: process.env.SMTP_USERNAME,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #333;">Password Reset Request</h2>
                        <p style="font-size: 16px; color: #555;">You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>
                        <p style="font-size: 16px; color: #555;">Please click on the following link, or paste this into your browser to complete the process:</p>
                        <a href="https://kitchen-recipe-management1.netlify.app/reset-password/${resetToken}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                        <p style="font-size: 16px; color: #555;">If you have trouble clicking the button, you can also <a href="https://kitchen-recipe-management1.netlify.app/reset-password/${resetToken}" style="color: #007bff; text-decoration: underline;">click here</a>.</p>
                        <p style="font-size: 16px; color: #555;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
                    </div>
                    <p style="font-size: 12px; color: #999; margin-top: 20px;">This email was sent automatically. Please do not reply.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log("Password reset email sent.");
        res.status(200).json({ message: 'Password reset email sent.', resetToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Controller function for reset password
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        console.log("Received reset token:", resetToken);

        // Find user by reset token and check expiry
        const user = await User.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            console.log("Invalid or expired token.");
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        console.log("User found for reset token:", user);

        // Update user's password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const mailOptions = {
            from: process.env.SMTP_USERNAME,
            to: user.email,
            subject: 'Your password has been changed',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Your Password Has Been Changed</h2>
                    <p style="font-size: 16px; color: #555; margin-bottom: 20px;">Hello,</p>
                    <p style="font-size: 16px; color: #555; margin-bottom: 20px;">This is a confirmation that the password for your account <strong>${user.email}</strong> has just been changed.</p>
                    <p style="font-size: 16px; color: #555; margin-bottom: 20px;">If you didn't make this change, please <a href="https://kitchen-recipe-management1.netlify.app/contact-us" style="color: #007bff; text-decoration: none;">contact us</a> immediately.</p>
                    <p style="font-size: 16px; color: #555;">Best regards,</p>
                    <p style="font-size: 16px; color: #555;">Kitchen Recipe Management</p>
                </div>
            `
        };
        

        await transporter.sendMail(mailOptions);

        console.log("Password reset successful.");
        res.status(200).json({ message: 'Password reset successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports = { 
    register,
    login,
    forgotPassword,
    resetPassword
};
