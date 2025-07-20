import httpStatus from 'http-status';
import { IProduct } from '../models/product.model';
import {
  createProduct as createProductRepo,
  findProductById,
  findProducts,
  updateProductById as updateProductRepo,
  deleteProductById as deleteProductRepo,
} from '../repositories/product.repository';
import ApiError from '../utils/ApiError';

export const createProduct = async (productData: Partial<IProduct>): Promise<IProduct> => {
  return createProductRepo(productData);
};

export const getProductById = async (id: string): Promise<IProduct> => {
  const product = await findProductById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

export const getProducts = async (
  filter: any,
  options: any
): Promise<IProduct[]> => {
  return findProducts(filter, options);
};

export const updateProductById = async (
  id: string,
  updateData: Partial<IProduct>
): Promise<IProduct> => {
  const product = await updateProductRepo(id, updateData);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

export const deleteProductById = async (id: string): Promise<IProduct> => {
  const product = await deleteProductRepo(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};
