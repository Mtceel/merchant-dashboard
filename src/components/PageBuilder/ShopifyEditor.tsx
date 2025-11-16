/**
 * Shopify-Style Visual Page Editor
 * Split-screen layout: Preview (left) + Settings (right)
 * NO iframe - direct HTML rendering with click-to-edit
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import './ShopifyEditor.css';

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
}

interface BlockType {
  id: number;
  name: string;
  category: string;
  icon: string;
  default_config: Record<string, any>;
}

export function ShopifyEditor({ pageId, onClose }: { pageId: number; onClose: () => void }) {
  const [page, setPage] = useState<Page | null>(pageId === 0 ? {
    id: 0,
    title: 'New Page',
    slug: 'new-page',
    content: '[]',
    is_published: false
  } : null);
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'settings'>('sections');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pageId > 0) {
      loadPage();
    }
    loadBlockTypes();
  }, [pageId]);

  const loadPage = async () => {
    const token = localStorage.getItem('merchant_token');
    const response = await axios.get(`${API_URL}/pages/${pageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPage(response.data);
    
    try {
      const content = JSON.parse(response.data.content || '[]');
      setBlocks(content);
    } catch {
      setBlocks([]);
    }
  };

  const loadBlockTypes = async () => {
    const token = localStorage.getItem('merchant_token');
    const response = await axios.get(`${API_URL}/block-types`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setBlockTypes(response.data.blockTypes || []);
  };

  const addBlock = (blockType: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: blockType.name,
      config: { ...blockType.default_config }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (blockId: string, config: Record<string, any>) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, config: { ...b.config, ...config } } : b
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
    setSelectedBlockId(null);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setBlocks(updated);
  };

  const renderBlockPreview = (block: Block): React.ReactElement => {
    const c = block.config;
    const isSelected = selectedBlockId === block.id;
    
    const className = `block-preview ${isSelected ? 'selected' : ''}`;
    
    switch (block.type) {
      case 'hero':
        return (
          <div 
            className={className}
            onClick={() => setSelectedBlockId(block.id)}
            style={{
              height: c.height || '600px',
              backgroundImage: c.backgroundImage ? `url('${c.backgroundImage}')` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: c.textColor || '#fff',
              textAlign: 'center',
              padding: '40px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{c.title || 'Hero Title'}</h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{c.subtitle || 'Subtitle'}</p>
              <a 
                href={c.buttonLink || '#'} 
                style={{
                  background: c.buttonColor || '#667eea',
                  color: 'white',
                  padding: '15px 40px',
                  textDecoration: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}
              >
                {c.buttonText || 'Click Here'}
              </a>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div 
            className={className}
            onClick={() => setSelectedBlockId(block.id)}
            style={{ maxWidth: c.maxWidth || '800px', margin: '40px auto', padding: '0 20px' }}
          >
            <h2 style={{ fontSize: c.headingSize || '2rem', color: c.headingColor || '#333', marginBottom: '1rem' }}>
              {c.heading || 'Heading'}
            </h2>
            <div style={{ fontSize: c.textSize || '1rem', color: c.textColor || '#666', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: c.content || '<p>Your content here...</p>' }} />
          </div>
        );
      
      case 'image':
        return (
          <div 
            className={className}
            onClick={() => setSelectedBlockId(block.id)}
            style={{ textAlign: 'center', margin: '40px auto', maxWidth: c.maxWidth || '100%' }}
          >
            <img src={c.src || 'https://via.placeholder.com/800x600'} alt={c.alt || 'Image'} style={{ borderRadius: c.borderRadius || '0px', maxWidth: '100%' }} />
            {c.caption && <p style={{ marginTop: '10px', color: '#666', fontSize: '0.9rem' }}>{c.caption}</p>}
          </div>
        );
      
      case 'call-to-action':
        return (
          <div 
            className={className}
            onClick={() => setSelectedBlockId(block.id)}
            style={{
              background: c.backgroundColor || '#667eea',
              color: c.textColor || '#fff',
              padding: '60px 40px',
              textAlign: 'center',
              margin: '40px 0',
            }}
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{c.title || 'Ready to get started?'}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{c.description || 'Description'}</p>
            <a 
              href={c.buttonLink || '#'} 
              style={{
                background: c.buttonColor || '#fff',
                color: c.textColor === '#fff' ? '#667eea' : '#fff',
                padding: '15px 40px',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                display: 'inline-block',
              }}
            >
              {c.buttonText || 'Get Started'}
            </a>
          </div>
        );
      
      default:
        return (
          <div 
            className={className}
            onClick={() => setSelectedBlockId(block.id)}
            style={{ padding: '40px', textAlign: 'center', background: '#f5f5f5' }}
          >
            Block: {block.type}
          </div>
        );
    }
  };

  const savePage = async () => {
    if (!page) return;
    
    setIsSaving(true);
    const token = localStorage.getItem('merchant_token');
    
    try {
      if (pageId === 0) {
        await axios.post(`${API_URL}/pages`, {
          ...page,
          content: JSON.stringify(blocks)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.put(`${API_URL}/pages/${pageId}`, {
          ...page,
          content: JSON.stringify(blocks)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      alert('Page saved successfully!');
      onClose();
    } catch (error: any) {
      alert(`Error saving page: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="shopify-editor">
      {/* Top Bar (Shopify-style) */}
      <div className="editor-header">
        <div className="header-left">
          <button onClick={onClose} className="back-btn">← Back</button>
          <div className="page-title">
            <input 
              type="text" 
              value={page?.title || ''} 
              onChange={(e) => setPage(page ? {...page, title: e.target.value} : null)}
              placeholder="Page title"
            />
          </div>
        </div>
        <div className="header-right">
          <button onClick={savePage} disabled={isSaving} className="save-btn">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Left: Live Preview (NO iframe!) */}
        <div className="preview-panel">
          <div className="preview-content">
            {blocks.length === 0 ? (
              <div className="empty-preview">
                <h2>Add your first section</h2>
                <p>Choose a section from the sidebar to get started</p>
              </div>
            ) : (
              blocks.map(block => (
                <div key={block.id} className="block-wrapper">
                  {renderBlockPreview(block)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Settings Sidebar */}
        <div className="settings-panel">
          {/* Tabs */}
          <div className="settings-tabs">
            <button 
              className={activeTab === 'sections' ? 'active' : ''}
              onClick={() => setActiveTab('sections')}
            >
              Sections
            </button>
            <button 
              className={activeTab === 'theme' ? 'active' : ''}
              onClick={() => setActiveTab('theme')}
            >
              Theme settings
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              Page settings
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-content">
            {activeTab === 'sections' && !selectedBlock && (
              <div className="sections-list">
                <h3>Add section</h3>
                {['content', 'layout', 'media'].map(category => (
                  <div key={category} className="section-category">
                    <h4>{category}</h4>
                    {blockTypes.filter(bt => bt.category === category).map(bt => (
                      <div key={bt.id} className="section-item" onClick={() => addBlock(bt)}>
                        <span className="section-icon">{bt.icon}</span>
                        <span className="section-name">{bt.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'sections' && selectedBlock && (
              <div className="block-settings">
                <div className="settings-header">
                  <h3>{selectedBlock.type}</h3>
                  <button onClick={() => setSelectedBlockId(null)}>×</button>
                </div>
                
                <div className="settings-actions">
                  <button onClick={() => moveBlock(selectedBlock.id, 'up')}>↑ Move up</button>
                  <button onClick={() => moveBlock(selectedBlock.id, 'down')}>↓ Move down</button>
                  <button onClick={() => deleteBlock(selectedBlock.id)} className="delete-btn">Delete</button>
                </div>

                <div className="settings-fields">
                  {Object.entries(selectedBlock.config).map(([key, value]) => (
                    <div key={key} className="field">
                      <label>{key}</label>
                      {typeof value === 'boolean' ? (
                        <input 
                          type="checkbox" 
                          checked={value}
                          onChange={(e) => updateBlock(selectedBlock.id, { [key]: e.target.checked })}
                        />
                      ) : typeof value === 'number' ? (
                        <input 
                          type="number" 
                          value={value}
                          onChange={(e) => updateBlock(selectedBlock.id, { [key]: Number(e.target.value) })}
                        />
                      ) : (
                        <input 
                          type="text" 
                          value={value}
                          onChange={(e) => updateBlock(selectedBlock.id, { [key]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="theme-settings">
                <h3>Theme settings</h3>
                <p>Coming soon: Colors, typography, layout presets</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="page-settings">
                <h3>Page settings</h3>
                <div className="field">
                  <label>Title</label>
                  <input 
                    type="text" 
                    value={page?.title || ''} 
                    onChange={(e) => setPage(page ? {...page, title: e.target.value} : null)}
                  />
                </div>
                <div className="field">
                  <label>URL slug</label>
                  <input 
                    type="text" 
                    value={page?.slug || ''} 
                    onChange={(e) => setPage(page ? {...page, slug: e.target.value} : null)}
                  />
                </div>
                <div className="field">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={page?.is_published || false}
                      onChange={(e) => setPage(page ? {...page, is_published: e.target.checked} : null)}
                    />
                    Published
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
