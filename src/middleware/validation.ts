import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { logger } from '../utils/logger';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation error:', { errors, body: req.body });
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    req.body = value;
    next();
  };
};
