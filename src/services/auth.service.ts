import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../config/config';
import { IUser } from '../models/user.model';
import { findUserByEmail, createUser as createUserRepo } from '../repositories/user.repository';
import ApiError from '../utils/ApiError';

export const loginUserWithEmailAndPassword = async (
  email: string,
  password,
  IUser
): Promise<{ user: IUser; token: string }> => {
  const user = await findUserByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  const token = generateToken(user.id);
  return { user, token };
};

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  if (await findUserByEmail(userData.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return createUserRepo(userData);
};

const generateToken = (userId: string): string => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
  };
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: `${config.jwt.accessExpirationMinutes}m`,
  });
};
