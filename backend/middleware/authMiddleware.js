const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes: Verify if the user is logged in
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get token from header
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

            req.user = await User.findById(decoded.id).select('-password'); // Get user data without password
            next(); // Move to the next function
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Grant access to specific roles (e.g., only 'recruiter')
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }
        next();
    };
};