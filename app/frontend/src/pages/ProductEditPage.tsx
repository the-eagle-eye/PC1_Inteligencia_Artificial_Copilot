import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProductForm } from '../components/ProductForm';
import { Product, ProductInput, productApi } from '../api/productApi';
import { ApiError } from '../api/httpClient';

export function ProductEditPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await productApi.get(id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Failed to load product');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (data: ProductInput): Promise<void> => {
    try {
      await productApi.update(id, data);
      toast.success('Product updated');
      navigate('/products');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="alert alert-danger">
        {error ?? 'Product not found'}
        <div className="mt-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/products')}>
            Back to list
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h1 className="h3 mb-3">Edit product</h1>
        <div className="card shadow-sm">
          <div className="card-body">
            <ProductForm
              initial={{
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/products')}
              submitLabel="Update"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
