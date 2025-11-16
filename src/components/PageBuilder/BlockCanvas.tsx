/**
 * Block Canvas - Main editing area with draggable blocks
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';

interface Block {
  id: string;
  type: string;
  config: Record<string, any>;
}

interface BlockCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
}

export function BlockCanvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: BlockCanvasProps) {
  return (
    <div className="block-canvas">
      {blocks.map((block) => (
        <SortableBlock
          key={block.id}
          block={block}
          isSelected={block.id === selectedBlockId}
          onSelect={() => onSelectBlock(block.id)}
          onDelete={() => onDeleteBlock(block.id)}
          onDuplicate={() => onDuplicateBlock(block.id)}
        />
      ))}
    </div>
  );
}

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-block ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div className="block-handle" {...attributes} {...listeners}>
        <GripVertical size={18} />
      </div>

      {/* Block Content Preview */}
      <div className="block-preview">
        <div className="block-type-badge">{formatBlockName(block.type)}</div>
        <div className="block-preview-content">
          {renderBlockPreview(block)}
        </div>
      </div>

      {/* Block Actions */}
      <div className="block-actions">
        <button
          className="block-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate block"
        >
          <Copy size={16} />
        </button>
        <button
          className="block-action-btn danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete block"
        >
          <Trash2 size={16} />
        </button>
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

function renderBlockPreview(block: Block): React.ReactElement {
  const { config } = block;

  switch (block.type) {
    case 'hero':
      return (
        <div className="preview-hero">
          <h3>{config.title || 'Hero Title'}</h3>
          <p>{config.subtitle || 'Subtitle'}</p>
          {config.buttonText && <button>{config.buttonText}</button>}
        </div>
      );

    case 'text':
      return (
        <div className="preview-text">
          <h4>{config.heading || 'Heading'}</h4>
          <div dangerouslySetInnerHTML={{ __html: config.content || '<p>Text content...</p>' }} />
        </div>
      );

    case 'image':
      return (
        <div className="preview-image">
          <img src={config.src || '/placeholder.jpg'} alt={config.alt || 'Image'} />
          {config.caption && <p className="caption">{config.caption}</p>}
        </div>
      );

    case 'gallery':
      return (
        <div className="preview-gallery">
          <div className="gallery-grid">
            {config.images?.slice(0, 3).map((img: any, i: number) => (
              <div key={i} className="gallery-item">
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
          {config.images?.length > 3 && (
            <p className="gallery-more">+{config.images.length - 3} more</p>
          )}
        </div>
      );

    case 'product-grid':
      return (
        <div className="preview-product-grid">
          <div className="product-grid-layout">
            {[1, 2, 3].map((i) => (
              <div key={i} className="product-placeholder">
                <div className="product-image" />
                <p>Product {i}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'call-to-action':
      return (
        <div className="preview-cta">
          <h3>{config.title || 'CTA Title'}</h3>
          <p>{config.description || 'Description'}</p>
          <button>{config.buttonText || 'Button'}</button>
        </div>
      );

    case 'section-two-column':
      return (
        <div className="preview-two-column">
          <div className="column-left">
            <div className="image-placeholder" />
          </div>
          <div className="column-right">
            <h4>{config.title || 'Section Title'}</h4>
            <p>{config.description || 'Description...'}</p>
          </div>
        </div>
      );

    case 'header':
      return (
        <div className="preview-header">
          <div className="header-logo">Logo</div>
          <nav className="header-nav">
            {config.menuItems?.slice(0, 4).map((item: any, i: number) => (
              <span key={i}>{item.label}</span>
            ))}
          </nav>
        </div>
      );

    case 'footer':
      return (
        <div className="preview-footer">
          <div className="footer-columns">
            <div>About</div>
            <div>Links</div>
            <div>Contact</div>
          </div>
        </div>
      );

    default:
      return (
        <div className="preview-default">
          <p>{block.type} block</p>
        </div>
      );
  }
}
