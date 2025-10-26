const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  },

  error: (error) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${error.message}`);
    if (error.stack) {
      console.error(`[STACK] ${error.stack}`);
    }
  },

  warn: (message) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  },

  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    }
  }
};

module.exports = logger;

