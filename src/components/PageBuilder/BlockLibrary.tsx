/**
 * Block Library - Sidebar with available block types
 */

import { Plus } from 'lucide-react';

interface BlockType {
  name: string;
  category: string;
  icon: string;
  default_config: Record<string, any>;
}

interface BlockLibraryProps {
  blockTypes: Record<string, BlockType[]>;
  onAddBlock: (blockType: string, defaultConfig: Record<string, any>) => void;
}

export function BlockLibrary({ blockTypes, onAddBlock }: BlockLibraryProps) {
  const categories = [
    { key: 'layout', label: 'Layout', icon: '📐' },
    { key: 'content', label: 'Content', icon: '📝' },
    { key: 'media', label: 'Media', icon: '🖼️' },
    { key: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  ];

  return (
    <div className="block-library">
      <div className="library-header">
        <h3>Blocks</h3>
        <p className="library-subtitle">Drag to add</p>
      </div>

      <div className="library-categories">
        {categories.map((category) => (
          <div key={category.key} className="library-category">
            <div className="category-header">
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
            </div>

            <div className="category-blocks">
              {blockTypes[category.key]?.map((block) => (
                <button
                  key={block.name}
                  className="block-item"
                  onClick={() => onAddBlock(block.name, block.default_config)}
                  title={`Add ${block.name} block`}
                >
                  <div className="block-icon">{getBlockIcon(block.icon)}</div>
                  <div className="block-label">{formatBlockName(block.name)}</div>
                  <Plus size={14} className="block-add-icon" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatBlockName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getBlockIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'layout-grid': '📐',
    'columns': '⬜',
    'type': '📝',
    'megaphone': '📣',
    'image': '🖼️',
    'images': '🖼️',
    'video': '🎥',
    'shopping-bag': '🛒',
    'star': '⭐',
    'menu': '☰',
    'layout-list': '📋',
  };
  return iconMap[icon] || '📦';
}
