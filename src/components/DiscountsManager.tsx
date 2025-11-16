// Discounts Management Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './ManagerStyles.css';

interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_purchase?: number;
  usage_limit?: number;
  times_used: number;
  expires_at?: string;
  description?: string;
  status: string;
  created_at: string;
}

export function DiscountsManager({ token, tenantId }: { token: string; tenantId: string }) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: discountsData, isLoading } = useQuery({
    queryKey: ['discounts', tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/discounts?tenant_id=${tenantId}`,
        axiosConfig
      );
      return response.data;
    },
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Discount>) => {
      return axios.post(
        '/api/discounts',
        { ...data, tenant_id: tenantId },
        axiosConfig
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      setShowForm(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return axios.put(
        `/api/discounts/${id}`,
        { tenant_id: tenantId, status },
        axiosConfig
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(
        `/api/discounts/${id}?tenant_id=${tenantId}`,
        axiosConfig
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: any = {
      code: formData.get('code'),
      type: formData.get('type'),
      value: parseFloat(formData.get('value') as string),
      description: formData.get('description'),
      status: 'active',
    };

    if (formData.get('minimum_purchase')) {
      data.minimum_purchase = parseFloat(formData.get('minimum_purchase') as string);
    }
    if (formData.get('usage_limit')) {
      data.usage_limit = parseInt(formData.get('usage_limit') as string);
    }
    if (formData.get('expires_at')) {
      data.expires_at = formData.get('expires_at');
    }

    createMutation.mutate(data);
  };

  if (isLoading) return <div>Loading discounts...</div>;

  return (
    <div className="discounts-manager">
      <div className="header">
        <h2>Discount Codes</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          Create Discount
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create Discount Code</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Code*</label>
                <input
                  name="code"
                  required
                  placeholder="SUMMER20"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type*</label>
                  <select name="type" required>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value*</label>
                  <input
                    name="value"
                    type="number"
                    step="0.01"
                    required
                    placeholder="20"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Minimum Purchase</label>
                  <input
                    name="minimum_purchase"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input
                    name="usage_limit"
                    type="number"
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  name="expires_at"
                  type="datetime-local"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Summer sale discount"
                  rows={2}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Discount
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
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discountsData?.discounts?.map((discount: Discount) => (
              <tr key={discount.id}>
                <td><strong>{discount.code}</strong></td>
                <td>{discount.type}</td>
                <td>
                  {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                </td>
                <td>
                  {discount.times_used}
                  {discount.usage_limit ? ` / ${discount.usage_limit}` : ' / ∞'}
                </td>
                <td>
                  <span className={`status-badge ${discount.status}`}>
                    {discount.status}
                  </span>
                </td>
                <td>
                  {discount.expires_at 
                    ? new Date(discount.expires_at).toLocaleDateString()
                    : 'Never'}
                </td>
                <td>
                  <button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: discount.id,
                        status: discount.status === 'active' ? 'inactive' : 'active',
                      });
                    }}
                    className="btn-sm"
                  >
                    {discount.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this discount?')) {
                        deleteMutation.mutate(discount.id);
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
        {!discountsData?.discounts?.length && (
          <div className="empty-state">
            <p>No discount codes yet. Create your first discount to boost sales!</p>
          </div>
        )}
      </div>
    </div>
  );
}
