/**
 * Enhanced Block Library - Shopify-style with templates and search
 */

import { useState } from 'react';
import { Plus, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { blockTemplates, blockTemplatesByCategory, templateCategories } from './blockTemplates';

interface BlockLibraryProps {
  onAddBlock: (blockType: string, defaultConfig: Record<string, any>) => void;
}

export function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['hero', 'ecommerce'])
  );
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  // Filter templates based on search
  const filteredTemplates = searchQuery
    ? blockTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : blockTemplates;

  const toggleCategory = (categoryKey: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="block-library">
      <div className="library-header">
        <h3>Add Sections</h3>
        <p className="library-subtitle">Choose from pre-built templates</p>
      </div>

      {/* Search Bar */}
      <div className="library-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search sections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Categories */}
      <div className="library-categories">
        {searchQuery ? (
          // Show search results
          <div className="search-results">
            <div className="results-count">
              {filteredTemplates.length} result{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
            <div className="template-grid">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onAdd={() => onAddBlock(template.type, template.config)}
                  isHovered={hoveredTemplate === template.id}
                  onHover={() => setHoveredTemplate(template.id)}
                  onLeave={() => setHoveredTemplate(null)}
                />
              ))}
            </div>
          </div>
        ) : (
          // Show categories
          templateCategories.map((category) => {
            const templates = blockTemplatesByCategory[category.key] || [];
            const isExpanded = expandedCategories.has(category.key);

            return (
              <div key={category.key} className="library-category">
                <button
                  className="category-header"
                  onClick={() => toggleCategory(category.key)}
                >
                  <div className="category-info">
                    <span className="category-icon">{category.icon}</span>
                    <div className="category-text">
                      <span className="category-label">{category.label}</span>
                      <span className="category-description">{category.description}</span>
                    </div>
                  </div>
                  <div className="category-toggle">
                    <span className="template-count">{templates.length}</span>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="category-content">
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onAdd={() => onAddBlock(template.type, template.config)}
                        isHovered={hoveredTemplate === template.id}
                        onHover={() => setHoveredTemplate(template.id)}
                        onLeave={() => setHoveredTemplate(null)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: any;
  onAdd: () => void;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}

function TemplateCard({ template, onAdd, isHovered, onHover, onLeave }: TemplateCardProps) {
  return (
    <div
      className={`template-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="template-preview">
        <div className="template-preview-icon">{template.icon}</div>
        {isHovered && (
          <button className="template-add-btn" onClick={onAdd}>
            <Plus size={20} />
            Add Section
          </button>
        )}
      </div>
      <div className="template-info">
        <div className="template-name">{template.name}</div>
        <div className="template-description">{template.description}</div>
      </div>
    </div>
  );
}
