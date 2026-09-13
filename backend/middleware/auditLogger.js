const ActivityLog = require('../models/ActivityLog');

const logActivity = async (req, action, entity = '', entityId = '', metadata = {}) => {
  try {
    const user = req.user;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Browser/Unknown';

    await ActivityLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : (metadata.email || 'Anonymous'),
      userRole: user ? user.role : 'GUEST',
      action,
      entity,
      entityId,
      metadata,
      ipAddress,
      userAgent
    });
  } catch (err) {
    console.error(`[Audit Log Failed]: ${err.message}`);
  }
};

module.exports = { logActivity };
