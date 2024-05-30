import 'dotenv/config';
import jwt from 'jsonwebtoken';

// Middleware 
const ensureSuperAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied,no token provded' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'BUKAN SUPER ADMIN' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'BUKAN SUPER ADMIN' });
  }
};

export default ensureSuperAdmin;