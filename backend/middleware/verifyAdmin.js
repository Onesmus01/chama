
import jwt from 'jsonwebtoken'
export const verifyAdmin = (req, res, next) => {
    const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token." });
    }
};

// // 🔒 Protect an admin-only route
// router.get('/admin/dashboard', verifyAdmin, (req, res) => {
//     res.json({ message: "Welcome, Admin!", admin: req.user });
// });
