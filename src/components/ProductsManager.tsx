// Products Management Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './ManagerStyles.css';

interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku?: string;
  inventory_qty: number;
  status: string;
  created_at: string;
  featured?: boolean;
}

export function ProductsManager({ token }: { token: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get('/api/products', axiosConfig);
      return response.data;
    },
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      return axios.post('/api/products', data, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: string }) => {
      return axios.put(`/api/products/${id}`, data, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`/api/products/${id}`, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      return axios.patch(
        `/api/products/${id}`,
        { featured },
        axiosConfig
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      handle: (formData.get('title') as string).toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      inventory_qty: parseInt(formData.get('inventory_qty') as string),
      status: formData.get('status') as string,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div className="products-manager">
      <div className="header">
        <h2>Products</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Add Product
        </button>
      </div>

      {(showForm || editingProduct) && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title*</label>
                <input
                  name="title"
                  required
                  defaultValue={editingProduct?.title}
                  placeholder="Product name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description}
                  placeholder="Product description"
                  rows={4}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price*</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={editingProduct?.price}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Inventory*</label>
                  <input
                    name="inventory_qty"
                    type="number"
                    required
                    defaultValue={editingProduct?.inventory_qty}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status*</label>
                <select name="status" defaultValue={editingProduct?.status || 'active'}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Price</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {productsData?.products?.map((product: Product) => (
              <tr key={product.id}>
                <td>
                  <div><strong>{product.title}</strong></div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>{product.handle}</div>
                </td>
                <td>
                  <span className={`status-badge ${product.status}`}>
                    {product.status}
                  </span>
                </td>
                <td>{product.inventory_qty} in stock</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <button
                    className={`featured-toggle ${product.featured ? 'active' : ''}`}
                    onClick={() => toggleFeaturedMutation.mutate({ id: product.id, featured: !product.featured })}
                    title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {product.featured ? '⭐' : '☆'}
                  </button>
                </td>
                <td>
                  <button onClick={() => setEditingProduct(product)} className="btn-sm">
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this product?')) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                    className="btn-danger-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!productsData?.products?.length && (
          <div className="empty-state">
            <p>No products yet. Add your first product to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
