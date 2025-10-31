import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: 'Endpoint not found' });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const message = err?.message || 'Internal Server Error';
  const status = err?.status || 500;
  console.error(err);
  res.status(status).json({ message });
};
