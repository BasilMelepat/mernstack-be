const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "No token provided", authenticated: false });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token", authenticated: false });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", authenticated: false });
    }
};

module.exports = verifyUser;