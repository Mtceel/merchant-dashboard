/**
 * Pages List - Overview of all pages
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, Globe } from 'lucide-react';
import { PageBuilder } from './PageBuilder';
import './PagesList.css';

const API_URL = '/api';

export function PagesList() {
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const token = localStorage.getItem('merchant_token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch pages
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/pages`, axiosConfig);
      return response.data;
    },
  });

  // Delete page mutation
  const deleteMutation = useMutation({
    mutationFn: async (pageId: number) => {
      await axios.delete(`${API_URL}/api/pages/${pageId}`, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      alert('Page deleted successfully!');
    },
    onError: (error: any) => {
      alert(`Error deleting page: ${error.response?.data?.error || error.message}`);
    },
  });

  if (editingPageId !== null) {
    return (
      <PageBuilder
        pageId={editingPageId}
        onBack={() => setEditingPageId(null)}
      />
    );
  }

  if (isCreating) {
    return (
      <PageBuilder
        onBack={() => setIsCreating(false)}
      />
    );
  }

  const pages = pagesData?.pages || [];

  return (
    <div className="pages-list">
      <div className="pages-header">
        <div>
          <h1>Pages</h1>
          <p>Manage your store pages with the visual editor</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="btn-primary">
          <Plus size={18} />
          Create Page
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">Loading pages...</div>
      ) : pages.length === 0 ? (
        <div className="empty-state">
          <h2>No pages yet</h2>
          <p>Create your first page with our visual editor</p>
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            <Plus size={18} />
            Create Page
          </button>
        </div>
      ) : (
        <div className="pages-grid">
          {pages.map((page: any) => (
            <div key={page.id} className="page-card">
              <div className="page-card-header">
                <div>
                  <h3>{page.title}</h3>
                  <div className="page-meta">
                    <span className="page-slug">/{page.slug}</span>
                    {page.is_published ? (
                      <span className="badge badge-success">
                        <Globe size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="badge badge-draft">Draft</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="page-card-body">
                <p>{page.meta_description || 'No description'}</p>
                <div className="page-stats">
                  <span>{page.blocks?.length || 0} blocks</span>
                  <span>·</span>
                  <span>Updated {formatDate(page.updated_at)}</span>
                </div>
              </div>

              <div className="page-card-actions">
                <button
                  onClick={() => setEditingPageId(page.id)}
                  className="btn-secondary"
                >
                  <Edit size={16} />
                  Edit
                </button>
                {page.is_published && (
                  <a
                    href={`https://${getUserSubdomain()}.fv-company.com/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <Eye size={16} />
                    View
                  </a>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete page "${page.title}"?`)) {
                      deleteMutation.mutate(page.id);
                    }
                  }}
                  className="btn-danger"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getUserSubdomain(): string {
  const tenantData = localStorage.getItem('merchant_tenant');
  if (tenantData) {
    const tenant = JSON.parse(tenantData);
    return tenant.subdomain || 'yourstore';
  }
  return 'yourstore';
}
