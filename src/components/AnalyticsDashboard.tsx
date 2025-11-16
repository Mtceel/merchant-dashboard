// Analytics Dashboard Component
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import './ManagerStyles.css';

Chart.register(...registerables);

export function AnalyticsDashboard({ token, tenantId }: { token: string; tenantId: string }) {
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const productsChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChart = useRef<Chart | null>(null);
  const productsChart = useRef<Chart | null>(null);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: dashboardData } = useQuery({
    queryKey: ['analytics-dashboard', tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `http://analytics-service.platform-services.svc.cluster.local/api/analytics/dashboard/${tenantId}`,
        axiosConfig
      );
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: revenueData } = useQuery({
    queryKey: ['analytics-revenue', tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `http://analytics-service.platform-services.svc.cluster.local/api/analytics/revenue/${tenantId}?period=30d&interval=day`,
        axiosConfig
      );
      return response.data;
    },
    refetchInterval: 60000,
  });

  const { data: topProductsData } = useQuery({
    queryKey: ['analytics-products', tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `http://analytics-service.platform-services.svc.cluster.local/api/analytics/products/${tenantId}?limit=5`,
        axiosConfig
      );
      return response.data;
    },
    refetchInterval: 60000,
  });

  const { data: customersData } = useQuery({
    queryKey: ['analytics-customers', tenantId],
    queryFn: async () => {
      const response = await axios.get(
        `http://analytics-service.platform-services.svc.cluster.local/api/analytics/customers/${tenantId}?period=30d`,
        axiosConfig
      );
      return response.data;
    },
    refetchInterval: 60000,
  });

  // Revenue Chart
  useEffect(() => {
    if (revenueChartRef.current && revenueData?.revenue) {
      if (revenueChart.current) {
        revenueChart.current.destroy();
      }

      const ctx = revenueChartRef.current.getContext('2d');
      if (ctx) {
        revenueChart.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: revenueData.revenue.map((item: any) => 
              new Date(item.period).toLocaleDateString()
            ),
            datasets: [{
              label: 'Revenue',
              data: revenueData.revenue.map((item: any) => item.revenue),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.4,
              fill: true,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value: string | number) => '$' + value,
                },
              },
            },
          },
        });
      }
    }
  }, [revenueData]);

  // Top Products Chart
  useEffect(() => {
    if (productsChartRef.current && topProductsData?.products) {
      if (productsChart.current) {
        productsChart.current.destroy();
      }

      const ctx = productsChartRef.current.getContext('2d');
      if (ctx) {
        productsChart.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: topProductsData.products.map((item: any) => item.product_title),
            datasets: [{
              label: 'Revenue',
              data: topProductsData.products.map((item: any) => item.total_revenue),
              backgroundColor: 'rgba(54, 162, 235, 0.8)',
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  callback: (value: string | number) => '$' + value,
                },
              },
            },
          },
        });
      }
    }
  }, [topProductsData]);

  return (
    <div className="analytics-dashboard">
      <h2>Analytics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${dashboardData?.revenue?.total?.toFixed(2) || '0.00'}</p>
          <p className="stat-label">{dashboardData?.revenue?.orders || 0} orders</p>
        </div>

        <div className="stat-card">
          <h3>Average Order</h3>
          <p className="stat-value">${dashboardData?.revenue?.average?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{dashboardData?.products || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-value">{dashboardData?.customers || 0}</p>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Revenue Over Time (Last 30 Days)</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={revenueChartRef}></canvas>
          </div>
        </div>

        <div className="chart-container">
          <h3>Top 5 Products by Revenue</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={productsChartRef}></canvas>
          </div>
        </div>
      </div>

      <div className="insights-grid">
        <div className="insight-card">
          <h3>Orders by Status</h3>
          <div className="status-breakdown">
            {dashboardData?.ordersByStatus && Object.entries(dashboardData.ordersByStatus).map(([status, count]) => (
              <div key={status} className="status-row">
                <span className={`status-badge ${status}`}>{status}</span>
                <span className="status-count">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card">
          <h3>Customer Insights</h3>
          <div className="customer-stats">
            <p><strong>New Customers:</strong> {customersData?.newCustomers || 0}</p>
            <p><strong>Returning Customers:</strong> {customersData?.returningCustomers || 0}</p>
            {customersData?.topCustomers?.length > 0 && (
              <>
                <h4>Top Customer:</h4>
                <p>{customersData.topCustomers[0].email}</p>
                <p>${customersData.topCustomers[0].total_spent?.toFixed(2) || '0.00'} spent</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
