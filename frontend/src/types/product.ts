export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  imageUrl?: string;
  categoryId: number;
  categoryName: string;
  inStock: boolean;
  active: boolean;
  createdAt: string;
}

export interface PagedProducts {
  content: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  imageUrl?: string;
  categoryId: number;
}

export interface UpdateProductInput {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  categoryId: number;
  active?: boolean;
}
