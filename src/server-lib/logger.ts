import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logDir: string;
  private errorLogPath: string;
  private combinedLogPath: string;
  private whatsappLogPath: string;
  
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.errorLogPath = path.join(this.logDir, 'error.log');
    this.combinedLogPath = path.join(this.logDir, 'combined.log');
    this.whatsappLogPath = path.join(this.logDir, 'whatsapp.log');
    
    // Ensure log directory exists
    this.ensureLogDir();
  }
  
  private ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  private formatLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }
  
  private writeLog(entry: LogEntry, logPath: string) {
    const logLine = JSON.stringify(entry) + '\n';
    
    fs.appendFile(logPath, logLine, (err) => {
      if (err) {
        console.error(`Failed to write to log file ${logPath}:`, err);
      }
    });
  }
  
  // Log methods
  debug(message: string, data?: any) {
    const entry = this.formatLogEntry('debug', message, data);
    console.debug(`[DEBUG] ${message}`, data || '');
    this.writeLog(entry, this.combinedLogPath);
  }
  
  info(message: string, data?: any) {
    const entry = this.formatLogEntry('info', message, data);
    console.info(`[INFO] ${message}`, data || '');
    this.writeLog(entry, this.combinedLogPath);
  }
  
  warn(message: string, data?: any) {
    const entry = this.formatLogEntry('warn', message, data);
    console.warn(`[WARN] ${message}`, data || '');
    this.writeLog(entry, this.combinedLogPath);
  }
  
  error(message: string, data?: any) {
    const entry = this.formatLogEntry('error', message, data);
    console.error(`[ERROR] ${message}`, data || '');
    this.writeLog(entry, this.combinedLogPath);
    this.writeLog(entry, this.errorLogPath);
  }
  
  // WhatsApp specific logging
  whatsapp(message: string, data?: any) {
    const entry = this.formatLogEntry('info', message, data);
    console.info(`[WHATSAPP] ${message}`, data || '');
    this.writeLog(entry, this.whatsappLogPath);
    this.writeLog(entry, this.combinedLogPath);
  }
  
  whatsappError(message: string, data?: any) {
    const entry = this.formatLogEntry('error', message, data);
    console.error(`[WHATSAPP ERROR] ${message}`, data || '');
    this.writeLog(entry, this.whatsappLogPath);
    this.writeLog(entry, this.errorLogPath);
    this.writeLog(entry, this.combinedLogPath);
  }
  
  // Rotate logs daily to prevent them from growing too large
  rotateLogs() {
    const date = format(new Date(), 'yyyy-MM-dd');
    
    const rotateLog = (logPath: string) => {
      if (fs.existsSync(logPath)) {
        const fileStats = fs.statSync(logPath);
        // Rotate if file is larger than 10MB
        if (fileStats.size > 10 * 1024 * 1024) {
          const newPath = logPath.replace('.log', `-${date}.log`);
          fs.renameSync(logPath, newPath);
        }
      }
    };
    
    rotateLog(this.errorLogPath);
    rotateLog(this.combinedLogPath);
    rotateLog(this.whatsappLogPath);
  }
}

// Create a singleton instance
const logger = new Logger();

// Set up log rotation once per day
setInterval(() => {
  logger.rotateLogs();
}, 24 * 60 * 60 * 1000); // 24 hours

export default logger; 