import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  description: z.string().max(1000).nullable().optional().default(null),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().nonnegative('Stock must be >= 0').default(0),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).nullable().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export const ProductIdSchema = z.object({
  id: z.string().uuid('Invalid product id'),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;
export type UpdateProductDTO = z.infer<typeof UpdateProductSchema>;

export interface ProductResponseDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}
