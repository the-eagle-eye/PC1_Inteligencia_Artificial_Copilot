import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductFormValues, productSchema } from '../validation/productSchema';
import { ProductInput } from '../api/productApi';

interface Props {
  initial?: ProductInput;
  onSubmit: (data: ProductInput) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ProductForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      stock: initial?.stock ?? 0,
    },
  });

  const submit = handleSubmit(async (raw) => {
    const parsed = productSchema.parse(raw);
    await onSubmit({
      name: parsed.name,
      description: parsed.description,
      price: parsed.price,
      stock: parsed.stock,
    });
  });

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          {...register('name')}
        />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          rows={3}
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          {...register('description')}
        />
        {errors.description && (
          <div className="invalid-feedback">{errors.description.message}</div>
        )}
      </div>

      <div className="row">
        <div className="col-sm-6 mb-3">
          <label className="form-label">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
            {...register('price')}
          />
          {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
        </div>
        <div className="col-sm-6 mb-3">
          <label className="form-label">Stock</label>
          <input
            type="number"
            min="0"
            className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
            {...register('stock')}
          />
          {errors.stock && <div className="invalid-feedback">{errors.stock.message}</div>}
        </div>
      </div>

      <div className="d-flex gap-2 mt-2">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
