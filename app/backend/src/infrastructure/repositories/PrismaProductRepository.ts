import { PrismaClient, Product as PrismaProduct } from '@prisma/client';
import { Product } from '../../domain/entities/Product';
import {
  CreateProductData,
  IProductRepository,
  UpdateProductData,
} from '../../domain/repositories/IProductRepository';

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private toDomain(record: PrismaProduct): Product {
    return Product.create({
      id: record.id,
      name: record.name,
      description: record.description,
      price: Number(record.price),
      stock: record.stock,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async create(data: CreateProductData): Promise<Product> {
    const record = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
      },
    });
    return this.toDomain(record);
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const record = await this.prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.stock !== undefined && { stock: data.stock }),
      },
    });
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } });
  }
}
