const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware function to verify JWT token and authenticate user
const authMiddleware = async (req, res, next) => {
    // Get token from request header
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Log decoded token
        console.log('Decoded Token:', decoded);

        // Check if user exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
        }

        // Log the user object
        console.log('User:', user);

        // Attach user object to request for further use
        req.user = user;

        // Attach userId, role, and email to the request object
        req.userId = user._id;
        req.role = user.role;
        req.email = user.email;

        // Move to next middleware or route handler
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
