import 'dotenv/config';
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {

  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.split(' ')[1] : null;

  const cookieToken = req.cookies?.refreshToken;

  if (!token && !cookieToken) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized, need Token',
      err: 'No token provided',
      data: null,
    });
  }
  const jwtToken = token || cookieToken;

  jwt.verify(jwtToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        err: err.message,
        data: null,
      });
    } else {
      req.user = decoded;
      next();
    }
  });
};

export default verifyToken;
