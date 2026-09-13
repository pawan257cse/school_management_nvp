const checkPermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // HEAD super admin always has all permissions
    if (req.user.role === 'HEAD') {
      return next();
    }

    const permissions = req.user.permissions;
    const hasPerm = permissions && (
      typeof permissions.get === 'function' 
        ? permissions.get(permissionKey) 
        : permissions[permissionKey]
    );

    if (!hasPerm) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: Missing permission '${permissionKey}'`
      });
    }

    next();
  };
};

module.exports = checkPermission;
