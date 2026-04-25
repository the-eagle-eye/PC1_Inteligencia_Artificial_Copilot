import { Product } from '../../domain/entities/Product';
import { ProductResponseDTO } from '../dtos/ProductDTO';

export class ProductMapper {
  static toResponse(product: Product): ProductResponseDTO {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  static toResponseList(products: Product[]): ProductResponseDTO[] {
    return products.map((p) => ProductMapper.toResponse(p));
  }
}
