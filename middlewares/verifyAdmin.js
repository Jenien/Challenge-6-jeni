const verifyAuth = (req, res, next) => {
    const { role } = req.user;
  
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'BUKAN ADMIN ATAU SUPER ADMIN',
        err: 'unauthorized',
        data: null,
      });
    }
  
    next();
  };
  
  export default verifyAuth;
  