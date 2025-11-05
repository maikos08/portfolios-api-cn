import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  // Ensure CORS headers are present even on 404 responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.status(404).json({ message: 'Endpoint not found' });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const message = err?.message || 'Internal Server Error';
  const status = err?.status || 500;
  console.error(err);
  // Ensure CORS headers are present on error responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.status(status).json({ message });
};
