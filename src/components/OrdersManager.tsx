// Orders Management Component
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './ManagerStyles.css';

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  status: string;
  total: number;
  items: any[];
  created_at: string;
  tracking_number?: string;
}

export function OrdersManager({ token, tenantId }: { token: string; tenantId: string }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', tenantId, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ tenant_id: tenantId });
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await axios.get(
        `/api/orders?${params}`,
        axiosConfig
      );
      return response.data;
    },
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, tracking_number }: { id: string; status: string; tracking_number?: string }) => {
      return axios.put(
        `/api/orders/${id}`,
        { tenant_id: tenantId, status, tracking_number },
        axiosConfig
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrder(null);
    },
  });

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div className="orders-manager">
      <div className="header">
        <h2>Orders</h2>
        <div className="filters">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal">
          <div className="modal-content">
            <h3>Order #{selectedOrder.order_number}</h3>
            <div className="order-details">
              <p><strong>Customer:</strong> {selectedOrder.customer_email}</p>
              <p><strong>Status:</strong> <span className={`status-badge ${selectedOrder.status}`}>{selectedOrder.status}</span></p>
              <p><strong>Total:</strong> ${selectedOrder.total.toFixed(2)}</p>
              <p><strong>Created:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              
              <h4>Items:</h4>
              <ul>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <li key={idx}>
                    {item.title} - Qty: {item.quantity} - ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Update Status</label>
                <select
                  defaultValue={selectedOrder.status}
                  onChange={(e) => {
                    updateStatusMutation.mutate({
                      id: selectedOrder.id,
                      status: e.target.value,
                    });
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {selectedOrder.status === 'shipped' && (
                <div className="form-group">
                  <label>Tracking Number</label>
                  <input
                    type="text"
                    defaultValue={selectedOrder.tracking_number}
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.tracking_number) {
                        updateStatusMutation.mutate({
                          id: selectedOrder.id,
                          status: selectedOrder.status,
                          tracking_number: e.target.value,
                        });
                      }
                    }}
                    placeholder="Enter tracking number"
                  />
                </div>
              )}
            </div>
            <div className="form-actions">
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
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
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersData?.orders?.map((order: Order) => (
              <tr key={order.id}>
                <td><strong>#{order.order_number}</strong></td>
                <td>{order.customer_email}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>${order.total.toFixed(2)}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => setSelectedOrder(order)} className="btn-sm">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!ordersData?.orders?.length && (
          <div className="empty-state">
            <p>No orders found. Orders will appear here when customers make purchases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
