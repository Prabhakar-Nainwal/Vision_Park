const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'vision_park_secret_key';

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(403).json({ success: false, message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
