import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import './OnlineStore.css';

const API_URL = '/api';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: 'page' | 'custom' | 'external';
  order: number;
}

interface Page {
  id: number;
  title: string;
  slug: string;
}

export function NavigationManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', label: 'Home', url: '/', type: 'page', order: 0 },
    { id: '2', label: 'Shop', url: '/products', type: 'page', order: 1 },
    { id: '3', label: 'About', url: '/about', type: 'page', order: 2 },
    { id: '4', label: 'Contact', url: '/contact', type: 'page', order: 3 },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', url: '', type: 'page' as 'page' | 'custom' | 'external' });

  const { data: pages = [] } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const token = localStorage.getItem('merchant_token');
      const response = await axios.get<Page[]>(`${API_URL}/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...menuItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newItems.length) return;
    
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    newItems.forEach((item, idx) => item.order = idx);
    setMenuItems(newItems);
  };

  const deleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const addItem = () => {
    if (!newItem.label || !newItem.url) return;
    
    const item: MenuItem = {
      id: Date.now().toString(),
      label: newItem.label,
      url: newItem.url,
      type: newItem.type,
      order: menuItems.length
    };
    
    setMenuItems([...menuItems, item]);
    setNewItem({ label: '', url: '', type: 'page' });
    setShowAddModal(false);
  };

  const handlePageSelect = (page: Page) => {
    setNewItem({
      label: page.title,
      url: `/${page.slug}`,
      type: 'page'
    });
  };

  return (
    <div className="navigation-manager">
      <div className="nav-header">
        <div>
          <h2>Navigation</h2>
          <p>Manage your store's main navigation menu</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          + Add Menu Item
        </button>
      </div>

      <div className="nav-preview">
        <h3>Main Navigation Preview</h3>
        <div className="preview-navbar">
          {menuItems.map(item => (
            <a key={item.id} href={item.url} className="preview-nav-link">
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="menu-items-list">
        <h3>Menu Items</h3>
        {menuItems.length === 0 ? (
          <div className="empty-state">
            <p>No menu items yet</p>
          </div>
        ) : (
          <div className="menu-items">
            {menuItems.map((item, index) => (
              <div key={item.id} className="menu-item-card">
                <div className="menu-item-drag">
                  <span>⋮⋮</span>
                </div>
                <div className="menu-item-info">
                  <h4>{item.label}</h4>
                  <p className="menu-item-url">{item.url}</p>
                  <span className={`badge badge-${item.type === 'page' ? 'primary' : 'secondary'}`}>
                    {item.type}
                  </span>
                </div>
                <div className="menu-item-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === menuItems.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Menu Item</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Link Type</label>
                <select 
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                >
                  <option value="page">Page</option>
                  <option value="custom">Custom URL</option>
                  <option value="external">External Link</option>
                </select>
              </div>

              {newItem.type === 'page' && pages && (
                <div className="form-group">
                  <label>Select Page</label>
                  <div className="pages-grid">
                    {pages.map(page => (
                      <button
                        key={page.id}
                        className={`page-select-btn ${newItem.url === `/${page.slug}` ? 'active' : ''}`}
                        onClick={() => handlePageSelect(page)}
                      >
                        {page.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="e.g., About Us"
                />
              </div>
              
              <div className="form-group">
                <label>URL</label>
                <input
                  type="text"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder={newItem.type === 'external' ? 'https://example.com' : '/page-url'}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={addItem}
                disabled={!newItem.label || !newItem.url}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
