const auditService = require('../services/auditService');

const auditMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    // Log the action after it completes
    const originalSend = res.json;
    
    res.json = async function (data) {
      // Log the action if successful
      if (data.success !== false) {
        await auditService.log(
          req.userId,
          action,
          entityType,
          req.params.id || null,
          { method: req.method, path: req.path },
          req.ip,
          req.get('user-agent')
        );
      }
      
      // Call original send
      return originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = auditMiddleware;

