import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import './ThemeEditor.css';

const API_URL = '/api';

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  sections: Section[];
}

interface Section {
  id: string;
  type: 'hero' | 'product-grid' | 'text' | 'image' | 'features';
  enabled: boolean;
  settings: any;
}

interface Theme {
  id: number;
  name: string;
  settings: ThemeSettings;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ThemeEditorProps {
  token: string;
  onBack?: () => void;
}

export default function ThemeEditor({ token, onBack }: ThemeEditorProps) {
  const [activeTab, setActiveTab] = useState<'sections' | 'colors' | 'fonts'>('sections');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  
  const queryClient = useQueryClient();
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch active theme
  const { data: theme, isLoading } = useQuery<{ theme: Theme }>({
    queryKey: ['active-theme'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/theme/active`, axiosConfig);
      return response.data;
    },
  });

  // Save theme mutation
  const saveMutation = useMutation({
    mutationFn: async (settings: ThemeSettings) => {
      const response = await axios.put(`${API_URL}/theme/active`, { settings }, axiosConfig);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-theme'] });
      setIsSaving(false);
      setPreviewKey(prev => prev + 1); // Force iframe reload
    },
  });

  const [localSettings, setLocalSettings] = useState<ThemeSettings | null>(null);

  useEffect(() => {
    if (theme?.theme?.settings) {
      setLocalSettings(theme.theme.settings);
      if (theme.theme.settings.sections.length > 0 && !selectedSection) {
        setSelectedSection(theme.theme.settings.sections[0].id);
      }
    }
  }, [theme]);

  const handleSave = () => {
    if (localSettings) {
      setIsSaving(true);
      saveMutation.mutate(localSettings);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      sections: localSettings.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const updateSectionSettings = (sectionId: string, settingKey: string, value: any) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      sections: localSettings.sections.map(s =>
        s.id === sectionId
          ? { ...s, settings: { ...s.settings, [settingKey]: value } }
          : s
      ),
    });
  };

  const updateColor = (key: keyof ThemeSettings['colors'], value: string) => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      colors: { ...localSettings.colors, [key]: value },
    });
  };

  const addSection = (type: Section['type']) => {
    if (!localSettings) return;
    
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      enabled: true,
      settings: getDefaultSectionSettings(type),
    };
    
    setLocalSettings({
      ...localSettings,
      sections: [...localSettings.sections, newSection],
    });
    setSelectedSection(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    if (!localSettings) return;
    
    setLocalSettings({
      ...localSettings,
      sections: localSettings.sections.filter(s => s.id !== sectionId),
    });
    
    if (selectedSection === sectionId) {
      setSelectedSection(localSettings.sections[0]?.id || null);
    }
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    if (!localSettings) return;
    
    const index = localSettings.sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;
    
    const newSections = [...localSettings.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    setLocalSettings({
      ...localSettings,
      sections: newSections,
    });
  };

  if (isLoading || !localSettings) {
    return <div className="theme-editor-loading">Loading theme editor...</div>;
  }

  const currentSection = localSettings.sections.find(s => s.id === selectedSection);
  
  // Get user info to determine store URL
  const { data: userInfo } = useQuery({
    queryKey: ['tenant-info'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/tenant/info`, axiosConfig);
      return response.data;
    },
  });
  
  const subdomain = userInfo?.subdomain || 'demo';
  const previewUrl = `https://${subdomain}.fv-company.com?preview=${previewKey}`;

  return (
    <div className="theme-editor">
      <div className="theme-editor-header">
        <div className="header-left">
          {onBack && (
            <button onClick={onBack} className="btn-back" style={{ marginRight: '16px' }}>
              ← Back
            </button>
          )}
          <div>
            <h2>🎨 Online Store Editor</h2>
            <p className="header-subtitle">Customize your storefront live</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={handleSave} disabled={isSaving} className="btn-save">
            {isSaving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      <div className="theme-editor-body">
        {/* Left Sidebar - Controls */}
        <div className="editor-sidebar">
          <div className="sidebar-tabs">
            <button
              className={activeTab === 'sections' ? 'active' : ''}
              onClick={() => setActiveTab('sections')}
            >
              📦 Sections
            </button>
            <button
              className={activeTab === 'colors' ? 'active' : ''}
              onClick={() => setActiveTab('colors')}
            >
              🎨 Colors
            </button>
            <button
              className={activeTab === 'fonts' ? 'active' : ''}
              onClick={() => setActiveTab('fonts')}
            >
              🔤 Fonts
            </button>
          </div>

          <div className="sidebar-content">
            {activeTab === 'sections' && (
              <div className="sections-panel">
                <div className="section-list">
                  <h3>Page Sections</h3>
                  {localSettings.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`section-item ${selectedSection === section.id ? 'active' : ''} ${!section.enabled ? 'disabled' : ''}`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className="section-item-header">
                        <span className="section-icon">{getSectionIcon(section.type)}</span>
                        <span className="section-name">{getSectionName(section.type)}</span>
                        <div className="section-actions">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                            disabled={index === 0}
                            title="Move up"
                          >
                            ▲
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                            disabled={index === localSettings.sections.length - 1}
                            title="Move down"
                          >
                            ▼
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateSection(section.id, { enabled: !section.enabled }); }}
                            title={section.enabled ? 'Hide' : 'Show'}
                          >
                            {section.enabled ? '👁' : '👁‍🗨'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="add-section">
                  <h4>Add Section</h4>
                  <div className="section-types">
                    <button onClick={() => addSection('hero')} className="section-type-btn">
                      🚀 Hero
                    </button>
                    <button onClick={() => addSection('product-grid')} className="section-type-btn">
                      🛍️ Products
                    </button>
                    <button onClick={() => addSection('text')} className="section-type-btn">
                      📝 Text
                    </button>
                    <button onClick={() => addSection('features')} className="section-type-btn">
                      ⭐ Features
                    </button>
                  </div>
                </div>

                {currentSection && (
                  <div className="section-settings">
                    <h4>Section Settings</h4>
                    <SectionSettings
                      section={currentSection}
                      onUpdate={(key, value) => updateSectionSettings(currentSection.id, key, value)}
                      onDelete={() => deleteSection(currentSection.id)}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="colors-panel">
                <h3>Theme Colors</h3>
                <div className="color-picker-group">
                  <label>
                    Primary Color
                    <input
                      type="color"
                      value={localSettings.colors.primary}
                      onChange={(e) => updateColor('primary', e.target.value)}
                    />
                    <span>{localSettings.colors.primary}</span>
                  </label>
                  <label>
                    Secondary Color
                    <input
                      type="color"
                      value={localSettings.colors.secondary}
                      onChange={(e) => updateColor('secondary', e.target.value)}
                    />
                    <span>{localSettings.colors.secondary}</span>
                  </label>
                  <label>
                    Background
                    <input
                      type="color"
                      value={localSettings.colors.background}
                      onChange={(e) => updateColor('background', e.target.value)}
                    />
                    <span>{localSettings.colors.background}</span>
                  </label>
                  <label>
                    Text Color
                    <input
                      type="color"
                      value={localSettings.colors.text}
                      onChange={(e) => updateColor('text', e.target.value)}
                    />
                    <span>{localSettings.colors.text}</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'fonts' && (
              <div className="fonts-panel">
                <h3>Typography</h3>
                <div className="font-selector-group">
                  <label>
                    Heading Font
                    <select
                      value={localSettings.fonts.heading}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        fonts: { ...localSettings.fonts, heading: e.target.value }
                      })}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Montserrat">Montserrat</option>
                    </select>
                  </label>
                  <label>
                    Body Font
                    <select
                      value={localSettings.fonts.body}
                      onChange={(e) => setLocalSettings({
                        ...localSettings,
                        fonts: { ...localSettings.fonts, body: e.target.value }
                      })}
                    >
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Lato">Lato</option>
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Live Preview */}
        <div className="editor-preview">
          <div className="preview-header">
            <span>📱 Live Preview</span>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="preview-link">
              Open in new tab ↗
            </a>
          </div>
          <iframe
            key={previewKey}
            src={previewUrl}
            className="preview-iframe"
            title="Store Preview"
          />
        </div>
      </div>
    </div>
  );
}

// Section Settings Component
function SectionSettings({
  section,
  onUpdate,
  onDelete,
}: {
  section: Section;
  onUpdate: (key: string, value: any) => void;
  onDelete: () => void;
}) {
  return (
    <div className="section-settings-form">
      {section.type === 'hero' && (
        <>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={section.settings.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              value={section.settings.subtitle || ''}
              onChange={(e) => onUpdate('subtitle', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Button Text</label>
            <input
              type="text"
              value={section.settings.buttonText || ''}
              onChange={(e) => onUpdate('buttonText', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Background Image URL</label>
            <input
              type="text"
              value={section.settings.backgroundImage || ''}
              onChange={(e) => onUpdate('backgroundImage', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {section.type === 'product-grid' && (
        <>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={section.settings.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Columns</label>
            <select
              value={section.settings.columns || 3}
              onChange={(e) => onUpdate('columns', Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div className="form-group">
            <label>Products to Show</label>
            <input
              type="number"
              value={section.settings.limit || 6}
              onChange={(e) => onUpdate('limit', Number(e.target.value))}
              min="1"
              max="20"
            />
          </div>
        </>
      )}

      {section.type === 'text' && (
        <>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={section.settings.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={section.settings.content || ''}
              onChange={(e) => onUpdate('content', e.target.value)}
              rows={6}
            />
          </div>
        </>
      )}

      {section.type === 'features' && (
        <>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={section.settings.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Product Selection</label>
            <select
              value={section.settings.selectionType || 'newest'}
              onChange={(e) => onUpdate('selectionType', e.target.value)}
            >
              <option value="newest">Newest Products</option>
              <option value="featured">Featured Products Only</option>
              <option value="random">Random Products</option>
            </select>
          </div>
          <div className="form-group">
            <label>Number of Products</label>
            <input
              type="number"
              value={section.settings.limit || 3}
              onChange={(e) => onUpdate('limit', Number(e.target.value))}
              min="1"
              max="6"
            />
          </div>
          <p className="form-hint">
            {section.settings.selectionType === 'featured' 
              ? 'Shows only products marked as featured in your product list' 
              : 'Shows your actual products based on selection method'}
          </p>
        </>
      )}

      <button onClick={onDelete} className="btn-danger">
        🗑️ Delete Section
      </button>
    </div>
  );
}

// Helper Functions
function getSectionIcon(type: Section['type']): string {
  const icons = {
    hero: '🚀',
    'product-grid': '🛍️',
    text: '📝',
    image: '🖼️',
    features: '⭐',
  };
  return icons[type] || '📦';
}

function getSectionName(type: Section['type']): string {
  const names = {
    hero: 'Hero Banner',
    'product-grid': 'Product Grid',
    text: 'Text Section',
    image: 'Image',
    features: 'Features',
  };
  return names[type] || type;
}

function getDefaultSectionSettings(type: Section['type']): any {
  const defaults: Record<Section['type'], any> = {
    hero: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products',
      buttonText: 'Shop Now',
      backgroundImage: '',
    },
    'product-grid': {
      title: 'Featured Products',
      columns: 3,
      limit: 6,
    },
    text: {
      title: 'About Us',
      content: 'Tell your story here...',
    },
    image: {
      url: '',
      alt: '',
    },
    features: {
      title: 'Why Choose Us',
    },
  };
  return defaults[type] || {};
}
