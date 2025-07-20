import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import httpStatus from 'http-status';
import ApiError from '../utils/ApiError';

const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = error.errors.map((err: any) => err.message).join(', ');
      next(new ApiError(statusCode, message));
    }
  };

export default validate;
