import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ProductForm } from '../components/ProductForm';
import { ProductInput, productApi } from '../api/productApi';
import { ApiError } from '../api/httpClient';

export function ProductCreatePage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: ProductInput): Promise<void> => {
    try {
      await productApi.create(data);
      toast.success('Product created');
      navigate('/products');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to create product');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h1 className="h3 mb-3">New product</h1>
        <div className="card shadow-sm">
          <div className="card-body">
            <ProductForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/products')}
              submitLabel="Create"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
