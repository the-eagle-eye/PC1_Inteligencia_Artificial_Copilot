import { Product } from '../entities/Product';

export interface CreateProductData {
  name: string;
  description: string | null;
  price: number;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string | null;
  price?: number;
  stock?: number;
}

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product>;
  delete(id: string): Promise<void>;
}
