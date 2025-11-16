import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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

export function VisualPageEditor({ pageId, onClose }: { pageId: number; onClose: () => void }) {
  const [page, setPage] = useState<Page | null>({
    id: 0,
    title: 'New Page',
    slug: 'new-page',
    content: '[]',
    is_published: false
  });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings'>('blocks');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (pageId > 0) {
      loadPage();
    }
    loadBlockTypes();
  }, [pageId]);

  const loadPage = async () => {
    const token = localStorage.getItem('token');
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
    const token = localStorage.getItem('token');
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
    updateIframeContent([...blocks, newBlock]);
  };

  const updateBlock = (blockId: string, config: Record<string, any>) => {
    const updated = blocks.map(b => 
      b.id === blockId ? { ...b, config: { ...b.config, ...config } } : b
    );
    setBlocks(updated);
    updateIframeContent(updated);
  };

  const deleteBlock = (blockId: string) => {
    const updated = blocks.filter(b => b.id !== blockId);
    setBlocks(updated);
    setSelectedBlockId(null);
    updateIframeContent(updated);
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    const updated = [...blocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setBlocks(updated);
    updateIframeContent(updated);
  };

  const updateIframeContent = (blocksToRender: Block[]) => {
    if (!iframeRef.current?.contentWindow) return;
    
    const html = generatePreviewHTML(blocksToRender);
    const doc = iframeRef.current.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    
    // Add click handlers to blocks in iframe
    setTimeout(() => {
      const iframeDoc = iframeRef.current?.contentWindow?.document;
      if (!iframeDoc) return;
      
      iframeDoc.querySelectorAll('[data-block-id]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const blockId = (el as HTMLElement).dataset.blockId;
          if (blockId) {
            setSelectedBlockId(blockId);
            // Highlight selected block
            iframeDoc.querySelectorAll('[data-block-id]').forEach(b => 
              b.classList.remove('selected-block')
            );
            el.classList.add('selected-block');
          }
        });
      });
    }, 100);
  };

  const generatePreviewHTML = (blocksToRender: Block[]) => {
    const blocksHTML = blocksToRender.map(block => {
      const blockHTML = renderBlock(block);
      return `<div class="block-wrapper" data-block-id="${block.id}">${blockHTML}</div>`;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .block-wrapper { 
              position: relative; 
              cursor: pointer;
              transition: all 0.2s;
            }
            .block-wrapper:hover {
              outline: 2px dashed #667eea;
              outline-offset: 4px;
            }
            .block-wrapper.selected-block {
              outline: 3px solid #667eea;
              outline-offset: 4px;
            }
            img { max-width: 100%; height: auto; }
            ${generateBlockStyles()}
          </style>
        </head>
        <body>
          ${blocksHTML}
        </body>
      </html>
    `;
  };

  const renderBlock = (block: Block): string => {
    const c = block.config;
    
    switch (block.type) {
      case 'hero':
        return `
          <div style="
            height: ${c.height || '600px'};
            background-image: url('${c.backgroundImage}');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${c.textColor || '#fff'};
            text-align: center;
            padding: 40px;
          ">
            <div>
              <h1 style="font-size: 3rem; margin-bottom: 1rem;">${c.title || 'Hero Title'}</h1>
              <p style="font-size: 1.5rem; margin-bottom: 2rem;">${c.subtitle || 'Subtitle'}</p>
              <a href="${c.buttonLink || '#'}" style="
                background: ${c.buttonColor || '#667eea'};
                color: white;
                padding: 15px 40px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
              ">${c.buttonText || 'Click Here'}</a>
            </div>
          </div>
        `;
      
      case 'text':
        return `
          <div style="max-width: ${c.maxWidth || '800px'}; margin: 40px auto; padding: 0 20px;">
            <h2 style="font-size: ${c.headingSize || '2rem'}; color: ${c.headingColor || '#333'}; margin-bottom: 1rem;">
              ${c.heading || 'Heading'}
            </h2>
            <div style="font-size: ${c.textSize || '1rem'}; color: ${c.textColor || '#666'}; line-height: 1.6;">
              ${c.content || '<p>Your content here...</p>'}
            </div>
          </div>
        `;
      
      case 'image':
        return `
          <div style="text-align: center; margin: 40px auto; max-width: ${c.maxWidth || '100%'};">
            <img src="${c.src || '/assets/placeholder.jpg'}" alt="${c.alt || 'Image'}" style="border-radius: ${c.borderRadius || '0px'};" />
            ${c.caption ? `<p style="margin-top: 10px; color: #666; font-size: 0.9rem;">${c.caption}</p>` : ''}
          </div>
        `;
      
      case 'call-to-action':
        return `
          <div style="
            background: ${c.backgroundColor || '#667eea'};
            color: ${c.textColor || '#fff'};
            padding: 60px 40px;
            text-align: center;
            margin: 40px 0;
          ">
            <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">${c.title || 'Ready to get started?'}</h2>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">${c.description || 'Description'}</p>
            <a href="${c.buttonLink || '#'}" style="
              background: ${c.buttonColor || '#fff'};
              color: #667eea;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              display: inline-block;
            ">${c.buttonText || 'Get Started'}</a>
          </div>
        `;
      
      default:
        return `<div style="padding: 40px; text-align: center; background: #f5f5f5;">Block: ${block.type}</div>`;
    }
  };

  const generateBlockStyles = () => {
    return `
      .hero { }
      .text-block { }
      .image-block { }
      .cta-block { }
    `;
  };

  const savePage = async () => {
    if (!page) return;
    
    const token = localStorage.getItem('token');
    
    try {
      if (pageId === 0) {
        // Create new page
        await axios.post(`${API_URL}/pages`, {
          ...page,
          content: JSON.stringify(blocks)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Update existing page
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
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="visual-editor">
      {/* Top Bar */}
      <div className="editor-topbar">
        <div className="topbar-left">
          <button onClick={onClose} className="btn-icon">←</button>
          <h2>{page?.title || 'Loading...'}</h2>
        </div>
        <div className="topbar-center">
          <button 
            className={`view-toggle ${sidebarOpen ? 'active' : ''}`}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            📱 Desktop
          </button>
        </div>
        <div className="topbar-right">
          <button onClick={savePage} className="btn-primary">Save</button>
        </div>
      </div>

      <div className="editor-container">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div className="editor-sidebar">
            <div className="sidebar-tabs">
              <button 
                className={activeTab === 'blocks' ? 'active' : ''}
                onClick={() => setActiveTab('blocks')}
              >
                + Add Section
              </button>
              <button 
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </div>

            {activeTab === 'blocks' && (
              <div className="blocks-list">
                <h3>Content Blocks</h3>
                {blockTypes.filter(bt => bt.category === 'content').map(bt => (
                  <div key={bt.id} className="block-item" onClick={() => addBlock(bt)}>
                    <span className="block-icon">{bt.icon}</span>
                    <span className="block-name">{bt.name}</span>
                  </div>
                ))}
                
                <h3>Layout Blocks</h3>
                {blockTypes.filter(bt => bt.category === 'layout').map(bt => (
                  <div key={bt.id} className="block-item" onClick={() => addBlock(bt)}>
                    <span className="block-icon">{bt.icon}</span>
                    <span className="block-name">{bt.name}</span>
                  </div>
                ))}
                
                <h3>Media Blocks</h3>
                {blockTypes.filter(bt => bt.category === 'media').map(bt => (
                  <div key={bt.id} className="block-item" onClick={() => addBlock(bt)}>
                    <span className="block-icon">{bt.icon}</span>
                    <span className="block-name">{bt.name}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="page-settings">
                <h3>Page Settings</h3>
                <div className="form-group">
                  <label>Page Title</label>
                  <input 
                    type="text" 
                    value={page?.title || ''} 
                    onChange={(e) => setPage(page ? {...page, title: e.target.value} : null)}
                  />
                </div>
                <div className="form-group">
                  <label>URL Slug</label>
                  <input 
                    type="text" 
                    value={page?.slug || ''} 
                    onChange={(e) => setPage(page ? {...page, slug: e.target.value} : null)}
                  />
                </div>
                <div className="form-group">
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
        )}

        {/* Center: Live Preview */}
        <div className="editor-canvas">
          <iframe 
            ref={iframeRef}
            className="preview-iframe"
            title="Page Preview"
            onLoad={() => updateIframeContent(blocks)}
          />
        </div>

        {/* Right Sidebar: Block Settings */}
        {selectedBlock && (
          <div className="block-settings-panel">
            <div className="panel-header">
              <h3>{selectedBlock.type}</h3>
              <button onClick={() => setSelectedBlockId(null)} className="btn-icon">×</button>
            </div>
            
            <div className="panel-actions">
              <button onClick={() => moveBlock(selectedBlock.id, 'up')}>↑ Move Up</button>
              <button onClick={() => moveBlock(selectedBlock.id, 'down')}>↓ Move Down</button>
              <button onClick={() => deleteBlock(selectedBlock.id)} className="btn-danger">🗑 Delete</button>
            </div>

            <div className="panel-content">
              <BlockConfigEditor 
                block={selectedBlock} 
                onChange={(config) => updateBlock(selectedBlock.id, config)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BlockConfigEditor({ block, onChange }: { block: Block; onChange: (config: Record<string, any>) => void }) {
  const updateConfig = (key: string, value: any) => {
    onChange({ ...block.config, [key]: value });
  };

  return (
    <div className="config-editor">
      {Object.entries(block.config).map(([key, value]) => (
        <div key={key} className="config-field">
          <label>{key}</label>
          {typeof value === 'boolean' ? (
            <input 
              type="checkbox" 
              checked={value}
              onChange={(e) => updateConfig(key, e.target.checked)}
            />
          ) : typeof value === 'number' ? (
            <input 
              type="number" 
              value={value}
              onChange={(e) => updateConfig(key, Number(e.target.value))}
            />
          ) : (
            <input 
              type="text" 
              value={value}
              onChange={(e) => updateConfig(key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
