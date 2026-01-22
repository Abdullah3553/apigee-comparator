import { Request, Response, NextFunction } from 'express';

const VALID_USERNAME = 'mock';
const VALID_PASSWORD = 'mock';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip auth for health check endpoint
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Apigee Mock Server"');
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Apigee Mock Server"');
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  next();
}
