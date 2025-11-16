// Customers Management Component
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import './ManagerStyles.css';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  loyalty_points: number;
  created_at: string;
}

export function CustomersManager({ token, tenantId }: { token: string; tenantId: string }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', tenantId, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({ tenant_id: tenantId });
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await axios.get(
        `/api/customers?${params}`,
        axiosConfig
      );
      return response.data;
    },
    refetchInterval: 20000,
  });

  const { data: customerOrders } = useQuery({
    queryKey: ['customer-orders', selectedCustomer?.email],
    queryFn: async () => {
      if (!selectedCustomer) return null;
      const response = await axios.get(
        `http://orders-service.platform-services.svc.cluster.local/api/orders?tenant_id=${tenantId}&customer_email=${selectedCustomer.email}`,
        axiosConfig
      );
      return response.data;
    },
    enabled: !!selectedCustomer,
  });

  if (isLoading) return <div>Loading customers...</div>;

  return (
    <div className="customers-manager">
      <div className="header">
        <h2>Customers</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {selectedCustomer && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedCustomer.full_name || selectedCustomer.email}</h3>
            <div className="customer-details">
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              {selectedCustomer.phone && <p><strong>Phone:</strong> {selectedCustomer.phone}</p>}
              <p><strong>Loyalty Points:</strong> {selectedCustomer.loyalty_points}</p>
              <p><strong>Member Since:</strong> {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>

              <h4>Order History:</h4>
              {customerOrders?.orders?.length > 0 ? (
                <div className="order-history">
                  {customerOrders.orders.map((order: any) => (
                    <div key={order.id} className="order-item">
                      <span>#{order.order_number}</span>
                      <span className={`status-badge ${order.status}`}>{order.status}</span>
                      <span>${order.total.toFixed(2)}</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No orders yet</p>
              )}
            </div>
            <div className="form-actions">
              <button onClick={() => setSelectedCustomer(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Loyalty Points</th>
              <th>Member Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customersData?.customers?.map((customer: Customer) => (
              <tr key={customer.id}>
                <td><strong>{customer.full_name || 'No name'}</strong></td>
                <td>{customer.email}</td>
                <td>{customer.loyalty_points} points</td>
                <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => setSelectedCustomer(customer)} className="btn-sm">
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customersData?.customers?.length && (
          <div className="empty-state">
            <p>No customers yet. Customers will appear here when they sign up.</p>
          </div>
        )}
      </div>
    </div>
  );
}
