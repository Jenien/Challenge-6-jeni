import 'dotenv/config';
import jwt from 'jsonwebtoken';


const refreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
  
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const { accessToken, newRefreshToken } = generateTokens(user);
  
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });
  
      return res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: accessToken,
      });
    } catch (error) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token', error: error.message });
    }
  };

  export default refreshToken;