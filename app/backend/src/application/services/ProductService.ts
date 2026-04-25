import { IProductRepository } from '../../domain/repositories/IProductRepository';
import { NotFoundError } from '../../domain/errors/AppError';
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductResponseDTO,
} from '../dtos/ProductDTO';
import { ProductMapper } from '../mappers/ProductMapper';

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async findAll(): Promise<ProductResponseDTO[]> {
    const products = await this.productRepository.findAll();
    return ProductMapper.toResponseList(products);
  }

  async findById(id: string): Promise<ProductResponseDTO> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product');
    }
    return ProductMapper.toResponse(product);
  }

  async create(data: CreateProductDTO): Promise<ProductResponseDTO> {
    const product = await this.productRepository.create({
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock,
    });
    return ProductMapper.toResponse(product);
  }

  async update(id: string, data: UpdateProductDTO): Promise<ProductResponseDTO> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product');
    }
    const product = await this.productRepository.update(id, data);
    return ProductMapper.toResponse(product);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product');
    }
    await this.productRepository.delete(id);
  }
}
