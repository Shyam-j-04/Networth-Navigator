const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        console.log('Authorization Header:', req.header('Authorization'));

        const token = req.header('Authorization')?.split(' ')[1]; // Extract the token after "Bearer "
        if (!token) return res.status(401).json({ error: 'Access Denied: No token provided' });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded JWT:', verified); // Log the decoded JWT

        req.user = verified; // Attach user data to the request
        next(); // Move to the next middleware/controller

    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({ error: 'Token expired' });
        }
        res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
