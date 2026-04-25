import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  description: z
    .string()
    .max(1000, 'Description is too long')
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v : null))
    .nullable(),
  price: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .pipe(z.number({ invalid_type_error: 'Price is required' }).positive('Price must be positive')),
  stock: z
    .union([z.string(), z.number()])
    .transform((v) => (typeof v === 'string' ? Number(v) : v))
    .pipe(
      z
        .number({ invalid_type_error: 'Stock is required' })
        .int('Stock must be an integer')
        .nonnegative('Stock must be ≥ 0'),
    ),
});

export type ProductFormValues = z.input<typeof productSchema>;
export type ProductFormParsed = z.output<typeof productSchema>;
