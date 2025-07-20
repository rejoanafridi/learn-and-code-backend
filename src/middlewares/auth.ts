import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../config/config';
import ApiError from '../utils/ApiError';
import { User } from '../models/user.model';

export const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById((decoded as any).sub);

      if (!user) {
        return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      }

      if (requiredRights.length) {
        const userRights = Object.keys(user.roles);
        const hasRequiredRights = requiredRights.every((requiredRight) =>
          userRights.includes(requiredRight)
        );
        if (!hasRequiredRights) {
          return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        }
      }

      (req as any).user = user;
      next();
    } catch (error) {
      next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }
  };
