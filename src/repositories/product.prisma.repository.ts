import { PrismaClient, Product } from '@prisma/client';

const prisma = new PrismaClient();

export const createProduct = async (productData: any): Promise<Product> => {
  return prisma.product.create({ data: productData });
};

export const findProductById = async (id: number): Promise<Product | null> => {
  return prisma.product.findUnique({ where: { id } });
};

export const findProducts = async (
  filter: any,
  options: any
): Promise<Product[]> => {
  return prisma.product.findMany({
    where: filter,
    orderBy: {
      [options.sortBy]: 'asc',
    },
    skip: options.skip,
    take: options.limit,
  });
};

export const updateProductById = async (
  id: number,
  updateData: any
): Promise<Product | null> => {
  return prisma.product.update({ where: { id }, data: updateData });
};

export const deleteProductById = async (id: number): Promise<Product | null> => {
  return prisma.product.delete({ where: { id } });
};
