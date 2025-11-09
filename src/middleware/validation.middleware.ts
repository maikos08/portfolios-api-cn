import { Request, Response, NextFunction } from 'express';
import { validateCreatePayload, validateUpdatePayload, VALIDATION_LIMITS } from '../utils/validation';

export function validateCreateMiddleware(req: Request, res: Response, next: NextFunction) {
  const { valid, error } = validateCreatePayload(req.body);
  if (!valid) return res.status(400).json({ error });
  next();
}

export function validateUpdateMiddleware(req: Request, res: Response, next: NextFunction) {
  const { valid, error } = validateUpdatePayload(req.body);
  if (!valid) return res.status(400).json({ error });
  next();
}

export { VALIDATION_LIMITS };
