const ActivityLog = require('../models/ActivityLog');

const SENSITIVE_KEYS = ['password', 'currentPassword', 'newPassword', 'passwordHash', 'token', 'recoveryKey', 'secret', 'jwt'];

const sanitizeMetadata = (meta) => {
  if (!meta || typeof meta !== 'object') return meta;
  const sanitized = { ...meta };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
};

const logActivity = async (req, action, entity = '', entityId = '', metadata = {}) => {
  try {
    const user = req.user;
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Browser/Unknown';

    await ActivityLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : (metadata.email || metadata.username || 'Anonymous'),
      userRole: user ? user.role : 'GUEST',
      action,
      entity,
      entityId,
      metadata: sanitizeMetadata(metadata),
      ipAddress,
      userAgent
    });
  } catch (err) {
    console.error(`[Audit Log Failed]: ${err.message}`);
  }
};

module.exports = { logActivity };
