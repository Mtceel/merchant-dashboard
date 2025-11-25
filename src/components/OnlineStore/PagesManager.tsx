import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ShopifyEditor } from '../PageBuilder/ShopifyEditor';
import './OnlineStore.css';

const API_URL = '/api';

interface Page {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
  description?: string;
  updated_at: string;
}

export function PagesManager() {
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get<Page[]>(`${API_URL}/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: { title: string; slug: string }) => {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/pages`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      setShowCreateModal(false);
      setNewPageTitle('');
      setNewPageSlug('');
    }
  });

  const deletePageMutation = useMutation({
    mutationFn: async (pageId: number) => {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/pages/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    }
  });

  const handleCreatePage = () => {
    if (!newPageTitle || !newPageSlug) return;
    createPageMutation.mutate({ title: newPageTitle, slug: newPageSlug });
  };

  const handleTitleChange = (title: string) => {
    setNewPageTitle(title);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setNewPageSlug(slug);
  };

  if (editingPageId !== null) {
    return (
      <ShopifyEditor 
        pageId={editingPageId} 
        onClose={() => setEditingPageId(null)} 
      />
    );
  }

  return (
    <div className="pages-manager">
      <div className="pages-header">
        <div>
          <h2>Pages</h2>
          <p>Manage your store pages with the visual editor</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Page
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading pages...</div>
      ) : pages && pages.length > 0 ? (
        <div className="pages-list">
          {pages.map((page) => (
            <div key={page.id} className="page-card">
              <div className="page-info">
                <h3>{page.title}</h3>
                <div className="page-meta">
                  <span className="page-slug">/{page.slug}</span>
                  <span className={`badge ${page.is_published ? 'badge-success' : 'badge-secondary'}`}>
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {page.description && <p className="page-description">{page.description}</p>}
                <p className="page-updated">Updated {new Date(page.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="page-actions">
                <button 
                  className="btn-primary"
                  onClick={() => setEditingPageId(page.id)}
                >
                  Edit
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    const tenant = JSON.parse(localStorage.getItem('merchant_tenant') || '{}');
                    window.open(`https://${tenant.subdomain}.fv-company.com/${page.slug}`, '_blank');
                  }}
                >
                  View
                </button>
                <button 
                  className="btn-danger"
                  onClick={() => {
                    if (confirm(`Delete page "${page.title}"?`)) {
                      deletePageMutation.mutate(page.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No pages yet</h3>
          <p>Create your first page to get started</p>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Page
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Page</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Page Title</label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., About Us"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>URL Slug</label>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="e.g., about-us"
                />
                <small>URL will be: https://yourstore.com/{newPageSlug || 'page-slug'}</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCreatePage}
                disabled={!newPageTitle || !newPageSlug || createPageMutation.isPending}
              >
                {createPageMutation.isPending ? 'Creating...' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
