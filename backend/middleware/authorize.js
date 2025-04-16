import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authorize = (roles = []) => {
  return (req, res, next) => {
    // Get token from cookie or Authorization header
    const cookieToken = req.cookies?.authToken;
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    const token = cookieToken || headerToken;

    if (process.env.NODE_ENV === 'development') {
      console.log("🔍 Cookie Token:", cookieToken);
      console.log("🔍 Header Token:", headerToken);
      console.log("🔍 Final Token Used:", token);
    }

    // If no token is found, deny access
    if (!token) {
      return res.status(403).json({
        success: false,
        msg: '🚫 No token provided. Access denied.'
      });
    }

    try {
      // Verify the token and decode it
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      if (process.env.NODE_ENV === 'development') {
        console.log("✅ Decoded Token:", decoded);
      }

      req.member = decoded; // Attach user info to the request

      // If roles are specified, check if the decoded role matches
      if (roles.length && !roles.includes(decoded.role)) {
        console.warn(`⚠️ Access denied. Required roles: ${roles}. Found: ${decoded.role}`);
        return res.status(403).json({
          success: false,
          msg: '🚫 You do not have permission to access this resource.'
        });
      }

      console.log(`🔓 Access granted to ${decoded.email || decoded.id} with role: ${decoded.role}`);
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      // Token verification failed (either expired or invalid)
      console.error("❌ Token Verification Failed:", err.message);
      return res.status(401).json({
        success: false,
        msg: '❌ Invalid or expired token.'
      });
    }
  };
};
