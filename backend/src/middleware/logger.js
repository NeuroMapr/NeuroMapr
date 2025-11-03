// Request Logger Middleware
const logger = (req, res, next) => {
  // Capture start time
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override res.end to capture response time
  res.end = function(...args) {
    // Calculate response time
    const duration = Date.now() - startTime;

    // Get current timestamp
    const timestamp = new Date().toISOString();

    // Get client IP (handles proxies)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Build log message
    const logMessage = [
      `[${timestamp}]`,
      `${req.method}`,
      `${req.originalUrl}`,
      `${res.statusCode}`,
      `${duration}ms`,
      `IP: ${ip}`
    ].join(' | ');

    // Color code based on status
    if (res.statusCode >= 500) {
      console.error('❌', logMessage); // Server errors - red
    } else if (res.statusCode >= 400) {
      console.warn('⚠️ ', logMessage); // Client errors - yellow
    } else if (res.statusCode >= 300) {
      console.log('🔄', logMessage); // Redirects - blue
    } else {
      console.log('✅', logMessage); // Success - green
    }

    // Call original end function
    originalEnd.apply(res, args);
  };

  next();
};

module.exports = logger;
