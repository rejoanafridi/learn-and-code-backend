import { IUser, User } from '../models/user.model';

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  return User.create(userData);
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return User.findOne({ email });
};

export const findUserById = async (id: string): Promise<IUser | null> => {
  return User.findById(id);
};

export const updateUserById = async (
  id: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return User.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUserById = async (id: string): Promise<IUser | null> => {
  return User.findByIdAndDelete(id);
};
