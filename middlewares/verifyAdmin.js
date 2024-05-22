const verifyAuth = (req, res, next) => {
    const { role } = req.user;
  
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        err: 'You are not authorized to access this resource',
        data: null,
      });
    }
  
    next();
  };
  
  export default verifyAuth;
  