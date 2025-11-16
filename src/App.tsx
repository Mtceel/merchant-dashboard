import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PagesList } from './components/PageBuilder/PagesList';
import './App.css';

const queryClient = new QueryClient();
const API_URL = '/api';

interface AuthResponse {
  token: string;
  user: { id: number; email: string; role: string; subdomain?: string };
  tenant?: { id: number; subdomain: string; storeName: string; storeUrl: string };
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
}

type MenuItem = 'home' | 'orders' | 'products' | 'customers' | 'analytics' | 'marketing' | 'discounts' | 'apps' | 'online-store' | 'settings';

const menuItems: { id: MenuItem; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'orders', label: 'Orders', icon: '📦' },
  { id: 'products', label: 'Products', icon: '🏷️' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'discounts', label: 'Discounts', icon: '🏷️' },
  { id: 'apps', label: 'Apps', icon: '🧩' },
  { id: 'online-store', label: 'Online Store', icon: '🌐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
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
      // Sla user data op in localStorage
      if (response.data.user) {
        localStorage.setItem('merchant_user', JSON.stringify(response.data.user));
      }
      if (response.data.tenant) {
        localStorage.setItem('merchant_tenant', JSON.stringify(response.data.tenant));
      }
      onLogin(response.data.token);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🏪</div>
          <h1>fv-company</h1>
        </div>
        <h2>Log in to your store</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email@example.com"
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="login-footer">
          <p>Demo: demo@fv-company.com / demo123</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/user`, axiosConfig);
      // Update localStorage met nieuwe data
      if (response.data) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role,
          subdomain: response.data.subdomain,
        };
        localStorage.setItem('merchant_user', JSON.stringify(userData));
        
        if (response.data.subdomain) {
          const tenantData = {
            subdomain: response.data.subdomain,
            storeName: response.data.storeName,
            storeUrl: response.data.storeUrl,
          };
          localStorage.setItem('merchant_tenant', JSON.stringify(tenantData));
        }
      }
      return response.data;
    },
    // Refresh elke 5 minuten om data up-to-date te houden
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/dashboard/stats`, axiosConfig);
      return response.data;
    },
    refetchInterval: 30000,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/products`, axiosConfig);
      return response.data;
    },
  });

  const renderContent = () => {
    switch (activeMenu) {
      case 'home':
        return <HomeContent stats={stats} />;
      case 'products':
        return <ProductsContent products={products} />;
      case 'orders':
        return <OrdersContent />;
      case 'customers':
        return <CustomersContent />;
      case 'analytics':
        return <AnalyticsContent stats={stats} />;
      case 'marketing':
        return <MarketingContent />;
      case 'discounts':
        return <DiscountsContent />;
      case 'apps':
        return <AppsContent />;
      case 'online-store':
        return <OnlineStoreContent user={user} />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <HomeContent stats={stats} />;
    }
  };

  return (
    <div className="shopify-layout">
      <nav className="top-nav">
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
        <div className="top-nav-brand">
          <span className="brand-icon">🏪</span>
          <span className="brand-name">My Store</span>
        </div>
        <div className="top-nav-actions">
          <button className="nav-icon-btn" title="Search">🔍</button>
          <button className="nav-icon-btn" title="Notifications">🔔</button>
          <button className="nav-icon-btn" onClick={onLogout} title="Logout">🚪</button>
        </div>
      </nav>

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

function HomeContent({ stats }: { stats?: Stats }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Home</h1>
        <button className="btn-primary">Add product</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total sales today</div>
          <div className="stat-value">${stats?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
          <div className="stat-change positive">↑ +12.5% from yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders today</div>
          <div className="stat-value">{stats?.totalOrders || 0}</div>
          <div className="stat-change positive">↑ +5.2% from yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total products</div>
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          <div className="stat-change neutral">No change</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lifetime revenue</div>
          <div className="stat-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
          <div className="stat-change positive">↑ All time</div>
        </div>
      </div>

      <div className="cards-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>📊 Sales overview</h3>
            <select className="card-select">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="card-body">
            <div className="chart-placeholder">
              <p>📈 Sales chart will appear here</p>
              <p className="text-muted">Integrate with analytics library</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>🎯 Quick actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="quick-action-btn">➕ Add product</button>
              <button className="quick-action-btn">📦 View orders</button>
              <button className="quick-action-btn">👥 Add customer</button>
              <button className="quick-action-btn">🏷️ Create discount</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsContent({ products }: { products?: Product[] }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn-primary">Add product</button>
      </div>

      <div className="search-bar">
        <input type="text" placeholder="Search products..." />
        <button className="btn-secondary">Filter</button>
      </div>

      {products && products.length > 0 ? (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Product</th>
                <th>Status</th>
                <th>Inventory</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div className="product-cell">
                      <div className="product-image">🏷️</div>
                      <div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-sku">SKU: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-success">Active</span></td>
                  <td>{product.stock} in stock</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <button className="btn-icon">✏️</button>
                    <button className="btn-icon">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Add your products</h3>
          <p>Start by stocking your store with products your customers will love</p>
          <button className="btn-primary">Add product</button>
        </div>
      )}
    </div>
  );
}

function OrdersContent() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Orders</h1>
        <button className="btn-primary">Create order</button>
      </div>
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h3>No orders yet</h3>
        <p>When customers place orders, they'll appear here</p>
      </div>
    </div>
  );
}

function CustomersContent() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn-primary">Add customer</button>
      </div>
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>No customers yet</h3>
        <p>Start building your customer base</p>
      </div>
    </div>
  );
}

function AnalyticsContent({ stats }: { stats?: Stats }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Analytics</h1>
        <select className="btn-secondary">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
        </select>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total revenue</div>
          <div className="stat-value">${stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Orders</div>
          <div className="stat-value">{stats?.totalOrders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average order value</div>
          <div className="stat-value">${stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Conversion rate</div>
          <div className="stat-value">2.4%</div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3>📊 Revenue over time</h3>
        </div>
        <div className="card-body">
          <div className="chart-placeholder">
            <p>📈 Analytics charts coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketingContent() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Marketing</h1>
        <button className="btn-primary">Create campaign</button>
      </div>
      <div className="empty-state">
        <div className="empty-icon">📢</div>
        <h3>Start your marketing campaigns</h3>
        <p>Reach more customers with email, social, and ads</p>
      </div>
    </div>
  );
}

function DiscountsContent() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Discounts</h1>
        <button className="btn-primary">Create discount</button>
      </div>
      <div className="empty-state">
        <div className="empty-icon">🏷️</div>
        <h3>Create discount codes</h3>
        <p>Offer discounts to increase sales and reward customers</p>
      </div>
    </div>
  );
}

function AppsContent() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Apps</h1>
        <button className="btn-primary">Visit App Store</button>
      </div>
      <div className="apps-grid">
        <div className="app-card">
          <div className="app-icon">📧</div>
          <h4>Email Marketing</h4>
          <p>Send newsletters and promotions</p>
          <button className="btn-secondary">Install</button>
        </div>
        <div className="app-card">
          <div className="app-icon">📦</div>
          <h4>Inventory Management</h4>
          <p>Track stock levels automatically</p>
          <button className="btn-secondary">Install</button>
        </div>
        <div className="app-card">
          <div className="app-icon">💬</div>
          <h4>Live Chat</h4>
          <p>Support customers in real-time</p>
          <button className="btn-secondary">Install</button>
        </div>
      </div>
    </div>
  );
}

function OnlineStoreContent({ user }: { user?: { subdomain?: string; email?: string } }) {
  type SectionType = 'overview' | 'pages' | 'themes';
  const [activeSection, setActiveSection] = useState<SectionType>('overview');
  
  // Probeer eerst localStorage tenant data als fallback voor snelle render
  const getLocalTenantData = () => {
    try {
      const tenantData = localStorage.getItem('merchant_tenant');
      if (tenantData) {
        return JSON.parse(tenantData);
      }
    } catch (e) {
      console.error('Failed to parse tenant data:', e);
    }
    return null;
  };

  const localTenant = getLocalTenantData();
  
  // Bepaal de store URL - gebruik API data (user) als die er is, anders localStorage
  const getStoreUrl = () => {
    // Eerst API user data (real-time)
    if (user?.subdomain) {
      return `https://${user.subdomain}.fv-company.com`;
    }
    // Dan localStorage tenant data (cached)
    if (localTenant?.subdomain) {
      return `https://${localTenant.subdomain}.fv-company.com`;
    }
    // Fallback: gebruik email prefix als subdomain
    if (user?.email) {
      const emailPrefix = user.email.split('@')[0];
      return `https://${emailPrefix}.fv-company.com`;
    }
    return 'https://yourstore.fv-company.com';
  };

  const storeUrl = getStoreUrl();
  const storeName = user?.subdomain ? 
    (user as any).storeName || localTenant?.storeName || 'Your Store' : 
    localTenant?.storeName || 'Your Store';

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Online Store</h1>
        <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">View store</a>
      </div>

      {/* Submenu for Online Store sections */}
      <div className="online-store-tabs">
        <button 
          className={`tab-button ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          🏠 Overview
        </button>
        <button 
          className={`tab-button ${activeSection === 'pages' ? 'active' : ''}`}
          onClick={() => setActiveSection('pages')}
        >
          📄 Pages
        </button>
        <button 
          className={`tab-button ${activeSection === 'themes' ? 'active' : ''}`}
          onClick={() => setActiveSection('themes')}
        >
          🎨 Themes
        </button>
      </div>

      {activeSection === 'pages' && <PagesList />}

      {activeSection === 'overview' && (
        <div className="dashboard-card">
          <div className="card-header">
            <h3>🌐 {storeName}</h3>
          </div>
          <div className="card-body">
            <div className="store-preview">
              <p><strong>Store URL:</strong> {storeUrl}</p>
              <p><strong>Theme:</strong> Default Theme</p>
              <p><strong>Status:</strong> <span className="badge badge-success">Published</span></p>
              <div className="store-actions">
                <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">View store</a>
                <button className="btn-secondary" onClick={() => setActiveSection('themes')}>Customize theme</button>
                <button className="btn-secondary" onClick={() => setActiveSection('pages')}>Manage pages</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'themes' && (
        <div className="empty-state">
          <div className="empty-icon">🎨</div>
          <h3>Theme customization</h3>
          <p>Theme editor coming soon</p>
        </div>
      )}
    </div>
  );
}

function SettingsContent() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-grid">
        <div className="setting-card">
          <div className="setting-icon">🏪</div>
          <div className="setting-content">
            <h4>Store details</h4>
            <p>Manage your store name, address, and contact information</p>
          </div>
          <button className="btn-secondary">Manage</button>
        </div>

        <div className="setting-card">
          <div className="setting-icon">💳</div>
          <div className="setting-content">
            <h4>Payments</h4>
            <p>Configure payment providers and methods</p>
          </div>
          <button className="btn-secondary">Manage</button>
        </div>

        <div className="setting-card">
          <div className="setting-icon">🚚</div>
          <div className="setting-content">
            <h4>Shipping and delivery</h4>
            <p>Set up shipping rates and delivery options</p>
          </div>
          <button className="btn-secondary">Manage</button>
        </div>

        <div className="setting-card">
          <div className="setting-icon">👤</div>
          <div className="setting-content">
            <h4>Account</h4>
            <p>Manage your account settings and preferences</p>
          </div>
          <button className="btn-secondary">Manage</button>
        </div>
      </div>
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
        <Dashboard 
          token={token} 
          onLogout={() => { 
            localStorage.removeItem('merchant_token');
            localStorage.removeItem('merchant_user');
            localStorage.removeItem('merchant_tenant');
            setToken(null); 
          }} 
        />
      )}
    </QueryClientProvider>
  );
}

export default App;
