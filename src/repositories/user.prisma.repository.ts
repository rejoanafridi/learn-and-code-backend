import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const createUser = async (userData: any): Promise<User> => {
  return prisma.user.create({ data: userData });
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUserById = async (
  id: number,
  updateData: any
): Promise<User | null> => {
  return prisma.user.update({ where: { id }, data: updateData });
};

export const deleteUserById = async (id: number): Promise<User | null> => {
  return prisma.user.delete({ where: { id } });
};
