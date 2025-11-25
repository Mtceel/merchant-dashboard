import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './ShopifyStyleEditor.css';

const API_URL = '/api';

interface Block {
  id: string;
  type: string;
  config: Record<string, any>;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export function ShopifyStyleEditor() {
  const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewKey, setPreviewKey] = useState(0);
  const queryClient = useQueryClient();

  // Fetch all pages
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const token = localStorage.getItem('merchant_token');
      const response = await axios.get<{pages: Page[]}>(`${API_URL}/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.pages || response.data;
    }
  });

  // Fetch selected page data
  const { data: selectedPage, isLoading: pageLoading } = useQuery({
    queryKey: ['page', selectedPageId],
    enabled: selectedPageId !== null,
    queryFn: async () => {
      const token = localStorage.getItem('merchant_token');
      const response = await axios.get<Page>(`${API_URL}/pages/${selectedPageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
  });

  // Load blocks when page changes
  useEffect(() => {
    if (selectedPage?.content) {
      try {
        const parsed = JSON.parse(selectedPage.content);
        setBlocks(parsed);
      } catch {
        setBlocks([]);
      }
    }
  }, [selectedPage]);

  // Save page mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('merchant_token');
      await axios.put(
        `${API_URL}/pages/${selectedPageId}`,
        { content: JSON.stringify(blocks) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', selectedPageId] });
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync();
      alert('Changes saved!');
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      config: getDefaultConfig(type)
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (blockId: string, config: Record<string, any>) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, config } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  // Auto-select first page if none selected
  if (!selectedPageId && pages && pages.length > 0 && !pagesLoading) {
    setSelectedPageId(pages[0].id);
  }

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const tenant = JSON.parse(localStorage.getItem('merchant_tenant') || '{}');
  
  // Generate preview HTML from blocks (Shopify-style: render inline, no external iframe URL)
  useEffect(() => {
    // Regenerate preview when blocks change
    const renderPreview = async () => {
      try {
        // POST to storefront-renderer service (via nginx proxy at /storefront)
        const response = await axios.post(`${API_URL}/storefront/preview`, {
          blocks,
          tenantId: tenant.id
        });
        setPreviewHtml(response.data);
        setPreviewKey(prev => prev + 1);
      } catch (error) {
        console.error('Preview render error:', error);
      }
    };
    
    if (blocks.length > 0) {
      renderPreview();
    }
  }, [blocks, tenant.id]);

  return (
    <div className="shopify-editor">
      {/* Top Bar */}
      <div className="editor-topbar">
        <div className="topbar-left">
          <button className="btn-back" onClick={() => window.history.back()}>← Back</button>
          <h2>Customize your store</h2>
        </div>
        <div className="topbar-center">
          <select 
            className="page-selector"
            value={selectedPageId || ''}
            onChange={(e) => setSelectedPageId(Number(e.target.value))}
          >
            {pages?.map(page => (
              <option key={page.id} value={page.id}>
                {page.title} ({page.slug})
              </option>
            ))}
          </select>
        </div>
        <div className="topbar-right">
          <a href={`https://${tenant.subdomain || 'demo'}.fv-company.com/${selectedPage?.slug || ''}`} target="_blank" rel="noopener noreferrer" className="btn-preview">
            👁️ View Live
          </a>
          <button 
            className="btn-save" 
            onClick={handleSave}
            disabled={isSaving || !selectedPageId}
          >
            {isSaving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="editor-layout">
        {/* Left Sidebar - Sections */}
        <div className="editor-sidebar">
          <div className="sidebar-header">
            <h3>Sections</h3>
            <button className="btn-icon" onClick={() => addBlock('hero')}>+</button>
          </div>

          <div className="sections-list">
            {blocks.length === 0 ? (
              <div className="empty-sections">
                <p>No sections yet</p>
                <button className="btn-add-section" onClick={() => addBlock('hero')}>
                  + Add Section
                </button>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div 
                  key={block.id}
                  className={`section-item ${selectedBlockId === block.id ? 'active' : ''}`}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <div className="section-info">
                    <span className="section-icon">{getBlockIcon(block.type)}</span>
                    <span className="section-name">{block.type}</span>
                  </div>
                  <div className="section-actions">
                    <button 
                      className="btn-icon-sm"
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button 
                      className="btn-icon-sm"
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                      disabled={index === blocks.length - 1}
                    >
                      ↓
                    </button>
                    <button 
                      className="btn-icon-sm btn-danger"
                      onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <button className="btn-add-section" onClick={() => addBlock('hero')}>
              + Add Section
            </button>
          </div>

          <div className="add-section-types">
            <h4>Section Types</h4>
            <div className="section-types-grid">
              <button onClick={() => addBlock('hero')}>🎯 Hero</button>
              <button onClick={() => addBlock('text')}>📝 Text</button>
              <button onClick={() => addBlock('image')}>🖼️ Image</button>
              <button onClick={() => addBlock('gallery')}>🎨 Gallery</button>
              <button onClick={() => addBlock('video')}>🎥 Video</button>
              <button onClick={() => addBlock('products')}>🛍️ Products</button>
            </div>
          </div>
        </div>

        {/* Center - Live Preview */}
        <div className="editor-preview">
          {pageLoading ? (
            <div className="loading-preview">Loading preview...</div>
          ) : selectedPage && blocks.length > 0 && previewHtml ? (
            <iframe 
              key={previewKey}
              srcDoc={previewHtml}
              sandbox="allow-scripts"
              className="preview-iframe"
              title="Page Preview"
            />
          ) : (
            <div className="no-page-selected">
              <p>{selectedPage ? (blocks.length === 0 ? 'Add blocks to see preview' : 'Loading preview...') : 'Select a page to start editing'}</p>
            </div>
          )}
        </div>

        {/* Right Sidebar - Block Settings */}
        <div className="editor-settings">
          {selectedBlock ? (
            <>
              <div className="settings-header">
                <h3>{selectedBlock.type} Settings</h3>
                <button className="btn-icon" onClick={() => setSelectedBlockId(null)}>×</button>
              </div>
              <div className="settings-body">
                <BlockSettings 
                  block={selectedBlock}
                  onChange={(config) => updateBlock(selectedBlock.id, config)}
                />
              </div>
            </>
          ) : (
            <div className="no-block-selected">
              <p>Select a section to edit its settings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockSettings({ block, onChange }: { block: Block; onChange: (config: Record<string, any>) => void }) {
  const updateField = (field: string, value: any) => {
    onChange({ ...block.config, [field]: value });
  };

  switch (block.type) {
    case 'hero':
      return (
        <div className="settings-form">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text"
              value={block.config.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Subtitle</label>
            <input 
              type="text"
              value={block.config.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Button Text</label>
            <input 
              type="text"
              value={block.config.buttonText || ''}
              onChange={(e) => updateField('buttonText', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Button Link</label>
            <input 
              type="text"
              value={block.config.buttonLink || ''}
              onChange={(e) => updateField('buttonLink', e.target.value)}
            />
          </div>
        </div>
      );
    
    case 'text':
      return (
        <div className="settings-form">
          <div className="form-group">
            <label>Content</label>
            <textarea 
              rows={6}
              value={block.config.content || ''}
              onChange={(e) => updateField('content', e.target.value)}
            />
          </div>
        </div>
      );
    
    default:
      return <p>Settings for {block.type} coming soon</p>;
  }
}

function getBlockIcon(type: string): string {
  const icons: Record<string, string> = {
    hero: '🎯',
    text: '📝',
    image: '🖼️',
    gallery: '🎨',
    video: '🎥',
    products: '🛍️',
  };
  return icons[type] || '📦';
}

function getDefaultConfig(type: string): Record<string, any> {
  switch (type) {
    case 'hero':
      return {
        title: 'Welcome to our store',
        subtitle: 'Discover amazing products',
        buttonText: 'Shop Now',
        buttonLink: '/products'
      };
    case 'text':
      return {
        content: 'Add your text here...'
      };
    default:
      return {};
  }
}
