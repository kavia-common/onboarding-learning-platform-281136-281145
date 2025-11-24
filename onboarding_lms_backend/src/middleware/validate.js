function isEmail(v) {
  return typeof v === 'string' && v.includes('@') && v.length <= 254;
}
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function isUUID(v) {
  return typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);
}

/**
 * PUBLIC_INTERFACE
 * validate
 * Schema-based minimal validator for body or params
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = [];
    for (const [key, rule] of Object.entries(schema)) {
      const value = data[key];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }
      if (value === undefined || value === null) continue;
      switch (rule.type) {
        case 'email':
          if (!isEmail(value)) errors.push(`${key} must be a valid email`);
          break;
        case 'string':
          if (!isNonEmptyString(value)) errors.push(`${key} must be a non-empty string`);
          break;
        case 'uuid':
          if (!isUUID(value)) errors.push(`${key} must be a uuid`);
          break;
        case 'number':
          if (typeof value !== 'number') errors.push(`${key} must be a number`);
          break;
        case 'array':
          if (!Array.isArray(value)) errors.push(`${key} must be an array`);
          break;
        default:
          break;
      }
    }
    if (errors.length) return res.status(400).json({ error: 'ValidationError', details: errors });
    next();
  };
}
