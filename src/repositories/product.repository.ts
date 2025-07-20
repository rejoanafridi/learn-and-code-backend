import { IProduct, Product } from '../models/product.model';

export const createProduct = async (productData: Partial<IProduct>): Promise<IProduct> => {
  return Product.create(productData);
};

export const findProductById = async (id: string): Promise<IProduct | null> => {
  return Product.findById(id);
};

export const findProducts = async (
  filter: any,
  options: any
): Promise<IProduct[]> => {
  return Product.find(filter)
    .sort(options.sortBy)
    .skip(options.skip)
    .limit(options.limit);
};

export const updateProductById = async (
  id: string,
  updateData: Partial<IProduct>
): Promise<IProduct | null> => {
  return Product.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProductById = async (id: string): Promise<IProduct | null> => {
  return Product.findByIdAndDelete(id);
};
