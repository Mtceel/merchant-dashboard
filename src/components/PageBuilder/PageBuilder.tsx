/**
 * Page Builder - Main Component
 * Shopify-style visual editor with drag-and-drop blocks
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BlockLibrary } from './BlockLibrary';
import { BlockCanvas } from './BlockCanvas';
import { BlockEditor } from './BlockEditor';
import { PagePreview } from './PagePreview';
import { Save, Eye, EyeOff, Settings, ArrowLeft } from 'lucide-react';
import './PageBuilder.css';

const API_URL = 'https://api.fv-company.com';

interface Block {
  id: string;
  type: string;
  config: Record<string, any>;
}

interface PageBuilderProps {
  pageId?: number;
  onBack: () => void;
}

export function PageBuilder({ pageId, onBack }: PageBuilderProps) {
  const queryClient = useQueryClient();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [pageSettings, setPageSettings] = useState({
    slug: '',
    title: '',
    meta_description: '',
    is_published: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  const token = localStorage.getItem('merchant_token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch page data
  const { data: page, isLoading } = useQuery({
    queryKey: ['page', pageId],
    queryFn: async () => {
      if (!pageId) return null;
      const response = await axios.get(`${API_URL}/api/pages/${pageId}`, axiosConfig);
      return response.data;
    },
    enabled: !!pageId,
  });

  // Fetch block types
  const { data: blockTypesData } = useQuery({
    queryKey: ['block-types'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/block-types`, axiosConfig);
      return response.data;
    },
  });

  // Load page data
  useEffect(() => {
    if (page) {
      setBlocks(page.blocks || []);
      setPageSettings({
        slug: page.slug,
        title: page.title,
        meta_description: page.meta_description || '',
        is_published: page.is_published || false,
      });
    }
  }, [page]);

  // Save page mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = {
        ...pageSettings,
        blocks,
      };

      if (pageId) {
        return axios.put(`${API_URL}/api/pages/${pageId}`, data, axiosConfig);
      } else {
        return axios.post(`${API_URL}/api/pages`, data, axiosConfig);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      alert('Page saved successfully!');
    },
    onError: (error: any) => {
      alert(`Error saving page: ${error.response?.data?.error || error.message}`);
    },
  });

  // Render preview mutation
  const previewMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${API_URL}/api/pages/render`,
        { blocks },
        axiosConfig
      );
      return response.data.html;
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddBlock = (blockType: string, defaultConfig: Record<string, any>) => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      config: { ...defaultConfig },
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleUpdateBlock = (blockId: string, config: Record<string, any>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, config } : block
      )
    );
  };

  const handleDeleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((block) => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleDuplicateBlock = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (block) {
      const newBlock = {
        ...block,
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const index = blocks.findIndex((b) => b.id === blockId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    }
  };

  const selectedBlock = selectedBlockId
    ? blocks.find((b) => b.id === selectedBlockId)
    : null;

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading page...</div>
      </div>
    );
  }

  return (
    <div className="page-builder">
      {/* Header */}
      <div className="builder-header">
        <div className="header-left">
          <button onClick={onBack} className="btn-back">
            <ArrowLeft size={20} />
            Back to Pages
          </button>
          <h1>{pageId ? `Edit: ${pageSettings.title}` : 'New Page'}</h1>
        </div>
        <div className="header-right">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary"
          >
            <Settings size={18} />
            Page Settings
          </button>
          <button
            onClick={() => {
              previewMutation.mutate();
              setShowPreview(!showPreview);
            }}
            className="btn-secondary"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => saveMutation.mutate()}
            className="btn-primary"
            disabled={saveMutation.isPending}
          >
            <Save size={18} />
            {saveMutation.isPending ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      {/* Page Settings Modal */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Page Settings</h2>
            <div className="form-group">
              <label>Page Title</label>
              <input
                type="text"
                value={pageSettings.title}
                onChange={(e) =>
                  setPageSettings({ ...pageSettings, title: e.target.value })
                }
                placeholder="About Us"
              />
            </div>
            <div className="form-group">
              <label>URL Slug</label>
              <input
                type="text"
                value={pageSettings.slug}
                onChange={(e) =>
                  setPageSettings({ ...pageSettings, slug: e.target.value })
                }
                placeholder="about-us"
              />
              <small>Only lowercase letters, numbers, and hyphens</small>
            </div>
            <div className="form-group">
              <label>Meta Description (SEO)</label>
              <textarea
                value={pageSettings.meta_description}
                onChange={(e) =>
                  setPageSettings({
                    ...pageSettings,
                    meta_description: e.target.value,
                  })
                }
                placeholder="A brief description for search engines"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={pageSettings.is_published}
                  onChange={(e) =>
                    setPageSettings({
                      ...pageSettings,
                      is_published: e.target.checked,
                    })
                  }
                />
                <span>Published (visible on storefront)</span>
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {showPreview ? (
        <PagePreview html={previewMutation.data || ''} isLoading={previewMutation.isPending} />
      ) : (
        <div className="builder-content">
          {/* Block Library Sidebar */}
          <BlockLibrary
            blockTypes={blockTypesData?.byCategory || {}}
            onAddBlock={handleAddBlock}
          />

          {/* Canvas */}
          <div className="builder-canvas-container">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <BlockCanvas
                  blocks={blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onDeleteBlock={handleDeleteBlock}
                  onDuplicateBlock={handleDuplicateBlock}
                />
              </SortableContext>
            </DndContext>

            {blocks.length === 0 && (
              <div className="empty-canvas">
                <h2>Start Building Your Page</h2>
                <p>Drag blocks from the left sidebar to get started</p>
              </div>
            )}
          </div>

          {/* Block Editor Panel */}
          {selectedBlock && (
            <BlockEditor
              block={selectedBlock}
              onUpdate={(config: Record<string, any>) => handleUpdateBlock(selectedBlock.id, config)}
              onClose={() => setSelectedBlockId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}
