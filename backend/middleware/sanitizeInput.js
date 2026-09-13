/**
 * Security Middleware: Sanitize Input
 * Prevents NoSQL Query Injection attacks by recursively stripping keys that start with '$' or contain '.'
 */
const cleanObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip dangerous NoSQL injection operators ($gt, $ne, $where, etc.) and dot-notation paths
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      cleaned[key] = cleanObject(value);
    } else if (typeof value === 'string') {
      // Trim excessive whitespace but keep content
      cleaned[key] = value.trim();
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = cleanObject(req.body);
  }
  if (req.query) {
    req.query = cleanObject(req.query);
  }
  if (req.params) {
    req.params = cleanObject(req.params);
  }
  next();
};

module.exports = sanitizeInput;
