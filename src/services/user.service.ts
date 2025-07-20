import httpStatus from 'http-status';
import { IUser } from '../models/user.model';
import {
  createUser as createUserRepo,
  findUserById,
  updateUserById as updateUserRepo,
  deleteUserById as deleteUserRepo,
} from '../repositories/user.repository';
import ApiError from '../utils/ApiError';

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  return createUserRepo(userData);
};

export const getUserById = async (id: string): Promise<IUser> => {
  const user = await findUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

export const updateUserById = async (
  id: string,
  updateData: Partial<IUser>
): Promise<IUser> => {
  const user = await updateUserRepo(id, updateData);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

export const deleteUserById = async (id: string): Promise<IUser> => {
  const user = await deleteUserRepo(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};
