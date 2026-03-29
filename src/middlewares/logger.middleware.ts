import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || 'unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  next();
};
