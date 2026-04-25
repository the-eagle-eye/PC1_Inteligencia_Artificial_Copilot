import { ProductService } from '../src/application/services/ProductService';
import { Product } from '../src/domain/entities/Product';
import {
  CreateProductSchema,
  CreateProductDTO,
} from '../src/application/dtos/ProductDTO';
import { NotFoundError } from '../src/domain/errors/AppError';
import { IProductRepository } from '../src/domain/repositories/IProductRepository';

function makeProduct(overrides: Partial<Product> = {}): Product {
  const now = new Date('2026-01-01T00:00:00Z');
  return Product.create({
    id: overrides.id ?? '11111111-1111-1111-1111-111111111111',
    name: overrides.name ?? 'Coffee',
    description: overrides.description ?? 'Premium roast',
    price: overrides.price ?? 12.5,
    stock: overrides.stock ?? 100,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  });
}

function makeRepoMock(): jest.Mocked<IProductRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('ProductService', () => {
  let repo: jest.Mocked<IProductRepository>;
  let service: ProductService;

  beforeEach(() => {
    repo = makeRepoMock();
    service = new ProductService(repo);
  });

  describe('findAll', () => {
    it('returns mapped DTOs from the repository', async () => {
      repo.findAll.mockResolvedValue([makeProduct()]);

      const result = await service.findAll();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: '11111111-1111-1111-1111-111111111111',
          name: 'Coffee',
          price: 12.5,
          stock: 100,
        }),
      );
      expect(typeof result[0].createdAt).toBe('string');
    });

    it('returns an empty array when no products exist', async () => {
      repo.findAll.mockResolvedValue([]);
      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns the product when found', async () => {
      const product = makeProduct();
      repo.findById.mockResolvedValue(product);

      const result = await service.findById(product.id);

      expect(repo.findById).toHaveBeenCalledWith(product.id);
      expect(result.id).toBe(product.id);
    });

    it('throws NotFoundError when product does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.findById).toHaveBeenCalledWith('missing');
    });
  });

  describe('create', () => {
    it('creates a product and returns the DTO', async () => {
      const input: CreateProductDTO = {
        name: 'Tea',
        description: 'Green tea',
        price: 5.99,
        stock: 20,
      };
      const created = makeProduct({
        id: 'new-id',
        name: input.name,
        description: input.description,
        price: input.price,
        stock: input.stock,
      });
      repo.create.mockResolvedValue(created);

      const result = await service.create(input);

      expect(repo.create).toHaveBeenCalledWith({
        name: 'Tea',
        description: 'Green tea',
        price: 5.99,
        stock: 20,
      });
      expect(result).toEqual(
        expect.objectContaining({ id: 'new-id', name: 'Tea', price: 5.99, stock: 20 }),
      );
    });

    it('coerces undefined description to null when calling the repository', async () => {
      const input: CreateProductDTO = {
        name: 'Tea',
        description: null,
        price: 5,
        stock: 1,
      };
      repo.create.mockResolvedValue(makeProduct({ description: null }));

      await service.create(input);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: null }),
      );
    });
  });

  describe('update', () => {
    it('updates an existing product', async () => {
      const existing = makeProduct();
      const updated = makeProduct({ price: 20, stock: 5 });
      repo.findById.mockResolvedValue(existing);
      repo.update.mockResolvedValue(updated);

      const result = await service.update(existing.id, { price: 20, stock: 5 });

      expect(repo.findById).toHaveBeenCalledWith(existing.id);
      expect(repo.update).toHaveBeenCalledWith(existing.id, { price: 20, stock: 5 });
      expect(result.price).toBe(20);
      expect(result.stock).toBe(5);
    });

    it('throws NotFoundError when updating a missing product', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.update('missing', { price: 1 })).rejects.toBeInstanceOf(
        NotFoundError,
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes an existing product', async () => {
      const existing = makeProduct();
      repo.findById.mockResolvedValue(existing);
      repo.delete.mockResolvedValue(undefined);

      await service.delete(existing.id);

      expect(repo.findById).toHaveBeenCalledWith(existing.id);
      expect(repo.delete).toHaveBeenCalledWith(existing.id);
    });

    it('throws NotFoundError when deleting a missing product', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundError);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });

  describe('CreateProductSchema validation', () => {
    it('rejects negative price', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Bad',
        price: -1,
        stock: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path.includes('price'))).toBe(true);
      }
    });

    it('rejects empty name', () => {
      const result = CreateProductSchema.safeParse({
        name: '',
        price: 10,
        stock: 0,
      });
      expect(result.success).toBe(false);
    });

    it('rejects non-integer stock', () => {
      const result = CreateProductSchema.safeParse({
        name: 'Ok',
        price: 10,
        stock: 1.5,
      });
      expect(result.success).toBe(false);
    });
  });
});
