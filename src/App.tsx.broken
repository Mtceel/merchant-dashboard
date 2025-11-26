import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ProductsManager } from './components/ProductsManager';
import ThemeEditor from './ThemeEditor';
import './App.css';

const queryClient = new QueryClient();
const API_URL = '/api';

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

type MenuItem = 'home' | 'products' | 'online-store';

const menuItems: { id: MenuItem; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'products', label: 'Products', icon: '🏷️' },
  { id: 'online-store', label: 'Online Store', icon: '🌐' },
];

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('demo@fv-company.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/login`, { email, password });
      localStorage.setItem('merchant_token', response.data.token);
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
  const [activeMenu, setActiveMenu] = useState<MenuItem>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/dashboard/stats`, axiosConfig);
      return response.data;
    },
    refetchInterval: 15000,
  });

  const renderContent = () => {
    if (activeMenu === 'products') {
      return <ProductsManager token={token} tenantId="1" />;
    }
    if (activeMenu === 'online-store') {
      return <ThemeEditor token={token} onBack={() => setActiveMenu('home')} />;
    }
    return (
      <div className="page-content">
        <div className="page-header">
          <h1>Home</h1>
        </div>
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
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
          <div className="store-info">
            <h1>🏪 My Store</h1>
          </div>
        </div>
        <div className="header-right">
          <button className="header-icon">🔍</button>
          <button className="header-icon">🔔</button>
          <button onClick={onLogout} className="header-icon">🚪</button>
        </div>
      </header>

      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu(item.id);
                setMobileMenuOpen(false);
              }}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="main-content">
        {renderContent()}
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
