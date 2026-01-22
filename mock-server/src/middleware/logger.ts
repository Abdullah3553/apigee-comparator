import morgan from 'morgan';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Configure morgan format based on log level
export const loggerMiddleware = morgan(LOG_LEVEL === 'debug' ? 'dev' : 'combined');

// Custom logger function for application logs
export const log = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  debug: (message: string) => {
    if (LOG_LEVEL === 'debug') {
      console.log(`[DEBUG] ${message}`);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`);
    if (error) {
      console.error(error);
    }
  }
};
