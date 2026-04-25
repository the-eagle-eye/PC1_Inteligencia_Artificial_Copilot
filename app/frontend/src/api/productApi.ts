import { apiRequest } from './httpClient';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name: string;
  description: string | null;
  price: number;
  stock: number;
}

const BASE = '/api/products';

export const productApi = {
  list: (): Promise<Product[]> => apiRequest<Product[]>(BASE),
  get: (id: string): Promise<Product> => apiRequest<Product>(`${BASE}/${id}`),
  create: (data: ProductInput): Promise<Product> =>
    apiRequest<Product>(BASE, { method: 'POST', body: data }),
  update: (id: string, data: Partial<ProductInput>): Promise<Product> =>
    apiRequest<Product>(`${BASE}/${id}`, { method: 'PUT', body: data }),
  remove: (id: string): Promise<void> =>
    apiRequest<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
