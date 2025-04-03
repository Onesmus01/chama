import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const authorize = (roles) => {
    return (req, res, next) => {
        const token = req.cookies.authToken;
        if (!token) return res.status(403).json({ error: 'Access denied' });

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            req.user = decoded;
            next();
        } catch (err) {
            res.status(401).json({ error: 'Invalid token' });
        }
    };
};
