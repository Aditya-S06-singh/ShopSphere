import { apiClient } from './client';
import { Category, Product, PagedProducts, CreateProductInput, UpdateProductInput } from '../types/product';

export interface ProductQueryParams {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
};

export const fetchProducts = async (params?: ProductQueryParams): Promise<PagedProducts> => {
  const response = await apiClient.get<PagedProducts>('/products', { params });
  return response.data;
};

export const fetchProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
};

// Admin Endpoints
export const createAdminProduct = async (data: CreateProductInput): Promise<Product> => {
  const response = await apiClient.post<Product>('/admin/products', data);
  return response.data;
};

export const updateAdminProduct = async (id: number, data: UpdateProductInput): Promise<Product> => {
  const response = await apiClient.put<Product>(`/admin/products/${id}`, data);
  return response.data;
};

export const updateAdminStock = async (id: number, stockQuantity: number): Promise<Product> => {
  const response = await apiClient.patch<Product>(`/admin/products/${id}/stock`, { stockQuantity });
  return response.data;
};

export const deleteAdminProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/products/${id}`);
};
