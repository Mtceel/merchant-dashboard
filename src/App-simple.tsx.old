import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ThemeEditor from './ThemeEditor';
import './App.css';

const queryClient = new QueryClient();
const API_URL = '/api'; // Proxy via nginx naar internal platform-api

interface AuthResponse {
  token: string;
  user: { id: number; email: string; role: string };
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  featured?: boolean;
}

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/login`, { email, password });
      localStorage.setItem('merchant_token', response.data.token);
      localStorage.setItem('merchant_login_data', JSON.stringify(response.data));
      onLogin(response.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🏪 Merchant Dashboard</h1>
        <p className="subtitle">fv-company.com</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'theme-editor'>('dashboard');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/dashboard/stats`, axiosConfig);
      return response.data;
    },
    refetchInterval: 15000,
  });

  const { data: products, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/products`, axiosConfig);
      return response.data;
    },
  });

  const toggleFeatured = async (productId: number, currentFeatured: boolean) => {
    try {
      await axios.patch(
        `${API_URL}/products/${productId}`,
        { featured: !currentFeatured },
        axiosConfig
      );
      refetchProducts();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  if (currentView === 'theme-editor') {
    return <ThemeEditor token={token} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>🏪 Merchant Dashboard</h1>
          <p>Manage your store</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setCurrentView('theme-editor')} className="btn-primary">
            🎨 Online Store
          </button>
          <button onClick={onLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <main className="content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats?.totalProducts || 0}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalOrders || 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">${stats?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">Monthly Revenue</div>
          </div>
        </div>

        <section className="products-section">
          <h2>Your Products</h2>
          {products && products.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Featured</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <button
                        className={`featured-toggle ${product.featured ? 'active' : ''}`}
                        onClick={() => toggleFeatured(product.id, product.featured || false)}
                        title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                      >
                        {product.featured ? '⭐' : '☆'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">No products yet. Create your first product!</p>
          )}
        </section>

        <section className="info-section">
          <h3>✅ Real Data - No Mocks</h3>
          <p>All data is fetched from PostgreSQL database. This dashboard uses React + TypeScript.</p>
        </section>
      </main>
    </div>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('merchant_token'));

  return (
    <QueryClientProvider client={queryClient}>
      {!token ? (
        <Login onLogin={setToken} />
      ) : (
        <Dashboard token={token} onLogout={() => { localStorage.removeItem('merchant_token'); setToken(null); }} />
      )}
    </QueryClientProvider>
  );
}

export default App;
