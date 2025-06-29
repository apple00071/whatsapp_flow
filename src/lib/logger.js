const fs = require('fs');
const path = require('path');
const util = require('util');

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file paths
const logFile = path.join(logsDir, 'app.log');
const errorFile = path.join(logsDir, 'error.log');

// Simple logger implementation
const logger = {
  info: function(message, ...args) {
    const logMessage = `[${new Date().toISOString()}] [INFO] ${message} ${args.length ? util.inspect(args, { depth: null }) : ''}`;
    console.log(logMessage);
    
    // Append to log file
    fs.appendFileSync(logFile, logMessage + '\n');
  },
  
  error: function(message, ...args) {
    const errorMessage = `[${new Date().toISOString()}] [ERROR] ${message} ${args.length ? util.inspect(args, { depth: null }) : ''}`;
    console.error(errorMessage);
    
    // Append to error log file
    fs.appendFileSync(errorFile, errorMessage + '\n');
    
    // Also append to main log file
    fs.appendFileSync(logFile, errorMessage + '\n');
  },
  
  warn: function(message, ...args) {
    const warnMessage = `[${new Date().toISOString()}] [WARN] ${message} ${args.length ? util.inspect(args, { depth: null }) : ''}`;
    console.warn(warnMessage);
    
    // Append to log file
    fs.appendFileSync(logFile, warnMessage + '\n');
  },
  
  debug: function(message, ...args) {
    if (process.env.DEBUG) {
      const debugMessage = `[${new Date().toISOString()}] [DEBUG] ${message} ${args.length ? util.inspect(args, { depth: null }) : ''}`;
      console.debug(debugMessage);
      
      // Append to log file
      fs.appendFileSync(logFile, debugMessage + '\n');
    }
  }
};

module.exports = logger; 