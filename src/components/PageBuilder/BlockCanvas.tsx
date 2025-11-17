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
        <div className="preview-hero" style={{
          background: config.backgroundColor || '#f6f6f7',
          padding: '60px 20px',
          textAlign: config.alignment || 'center',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: config.textColor || '#fff',
          position: 'relative'
        }}>
          <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
            <h3 style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              lineHeight: '1.2'
            }}>
              {config.title || config.heading || 'Welcome to Our Store'}
            </h3>
            <p style={{ 
              fontSize: '16px', 
              marginBottom: '20px',
              opacity: 0.95,
              lineHeight: '1.5'
            }}>
              {config.subtitle || config.subheading || 'Discover amazing products'}
            </p>
            {config.buttonText && (
              <button style={{
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: '600',
                background: '#fff',
                color: '#667eea',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                {config.buttonText}
              </button>
            )}
          </div>
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
    case 'products-grid':
      return (
        <div className="preview-product-grid" style={{ padding: '40px 20px', background: '#fff' }}>
          <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
            {config.heading || 'Featured Products'}
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ 
                background: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  background: `linear-gradient(135deg, ${['#f3f4f6', '#dbeafe', '#fce7f3', '#fef3c7'][i-1]} 0%, ${['#e5e7eb', '#bfdbfe', '#fbcfe8', '#fde68a'][i-1]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  🛍️
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>Product Name {i}</p>
                  <p style={{ color: '#667eea', fontWeight: 'bold', fontSize: '18px' }}>€{(29.99 + i * 10).toFixed(2)}</p>
                  <button style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '8px',
                    background: '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'products-carousel':
      return (
        <div style={{ padding: '60px 20px', background: '#f9fafb' }}>
          <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
            {config.heading || 'Best Sellers'}
          </h4>
          <div style={{ 
            display: 'flex',
            gap: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            overflowX: 'auto',
            padding: '10px'
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ 
                minWidth: '250px',
                background: '#fff',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                flexShrink: 0
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  background: `linear-gradient(135deg, ${['#f3f4f6', '#dbeafe', '#fce7f3', '#fef3c7'][i-1]} 0%, ${['#e5e7eb', '#bfdbfe', '#fbcfe8', '#fde68a'][i-1]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px'
                }}>
                  {['🎧', '⌚', '👟', '📱'][i-1]}
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>Product Name {i}</p>
                  <p style={{ color: '#667eea', fontWeight: 'bold', fontSize: '18px' }}>€{(29.99 + i * 10).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'email-signup':
    case 'email-popup':
      return (
        <div style={{
          padding: '60px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>
            {config.heading || 'Join Our Newsletter'}
          </h3>
          <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.9 }}>
            {config.subheading || 'Get exclusive deals and updates'}
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={{ 
                flex: 1,
                padding: '12px 16px', 
                borderRadius: '6px', 
                border: 'none',
                fontSize: '15px'
              }} 
            />
            <button style={{
              padding: '12px 28px',
              background: '#fff',
              color: '#667eea',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              {config.buttonText || 'Subscribe'}
            </button>
          </div>
        </div>
      );
    
    case 'text-image':
    case 'text-image-multi':
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: config.imagePosition === 'right' ? '1fr 1fr' : '1fr 1fr',
          gap: '40px',
          padding: '60px 20px',
          maxWidth: '1200px',
          margin: '0 auto',
          alignItems: 'center'
        }}>
          <div style={{ order: config.imagePosition === 'right' ? 2 : 1 }}>
            <div style={{
              width: '100%',
              height: '300px',
              background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px'
            }}>
              📸
            </div>
          </div>
          <div style={{ order: config.imagePosition === 'right' ? 1 : 2 }}>
            <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              {config.heading || 'Our Story'}
            </h4>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4b5563', marginBottom: '20px' }}>
              {config.text?.substring(0, 200) || 'Tell your brand story with beautiful text and images. This section is perfect for sharing your company values, mission, or product details.'}
            </p>
            {config.buttonText && (
              <button style={{
                padding: '12px 28px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                {config.buttonText}
              </button>
            )}
          </div>
        </div>
      );
    
    case 'faq':
      return (
        <div style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <h4 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
            {config.heading || 'Frequently Asked Questions'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(config.items || [
              { question: 'What is your return policy?', answer: 'We offer 30-day returns' },
              { question: 'How long does shipping take?', answer: '3-5 business days' },
              { question: 'Do you ship internationally?', answer: 'Yes, worldwide shipping available' }
            ]).slice(0, 5).map((item: any, i: number) => (
              <div key={i} style={{ 
                padding: '20px', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '16px' }}>{item.question}</strong>
                  <span style={{ fontSize: '20px', color: '#667eea' }}>▼</span>
                </div>
                <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'blog-grid':
    case 'blog-featured':
      return (
        <div style={{ padding: '60px 20px', background: '#fff' }}>
          <h4 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
            {config.heading || 'Latest from Our Blog'}
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {['📝', '💡', '🚀'].map((emoji, i) => (
              <div key={i} style={{ 
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s'
              }}>
                <div style={{ 
                  width: '100%', 
                  height: '200px', 
                  background: `linear-gradient(135deg, ${['#dbeafe', '#fce7f3', '#fef3c7'][i]} 0%, ${['#bfdbfe', '#fbcfe8', '#fde68a'][i]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '64px'
                }}>
                  {emoji}
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                    {new Date().toLocaleDateString()}
                  </p>
                  <h5 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
                    Blog Post Title {i + 1}
                  </h5>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '16px' }}>
                    A brief excerpt from the blog post to give readers a preview of the content...
                  </p>
                  <button style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    color: '#667eea',
                    border: '1px solid #667eea',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'features':
      return (
        <div style={{ padding: '60px 20px', background: '#f9fafb' }}>
          <h4 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
            {config.heading || 'Why Choose Us'}
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '32px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {(config.items || [
              { icon: '🚚', heading: 'Free Shipping', text: 'On orders over €50' },
              { icon: '🔒', heading: 'Secure Payment', text: '100% secure transactions' },
              { icon: '↩️', heading: 'Easy Returns', text: '30-day return policy' }
            ]).slice(0, 4).map((item: any, i: number) => (
              <div key={i} style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}>
                  {item.icon}
                </div>
                <h5 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {item.heading || item.title}
                </h5>
                <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                  {item.text || item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'testimonials':
      return (
        <div style={{ padding: '60px 20px', background: '#f9fafb' }}>
          <h4 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
            {config.heading || 'What Our Customers Say'}
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {(config.items || [
              { name: 'Sarah Johnson', text: 'Amazing product! Highly recommend.', author: 'Sarah Johnson' },
              { name: 'Mike Chen', text: 'Great quality and fast shipping.', author: 'Mike Chen' }
            ]).slice(0, 3).map((item: any, i: number) => (
              <div key={i} style={{ 
                padding: '24px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                <div style={{ color: '#fbbf24', marginBottom: '12px', fontSize: '18px' }}>
                  ⭐⭐⭐⭐⭐
                </div>
                <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#374151', marginBottom: '16px', fontStyle: 'italic' }}>
                  "{item.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    {((item.name || item.author || 'User')[0]).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name || item.author || 'Customer'}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    case 'cta':
      return (
        <div style={{
          padding: '80px 20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
            {config.heading || 'Ready to Get Started?'}
          </h3>
          <p style={{ fontSize: '18px', marginBottom: '32px', opacity: 0.95, maxWidth: '600px', margin: '0 auto 32px' }}>
            {config.text || 'Join thousands of satisfied customers today'}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(config.buttons || [{ text: 'Get Started' }, { text: 'Learn More' }]).map((button: any, i: number) => (
              <button key={i} style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                background: i === 0 ? '#fff' : 'transparent',
                color: i === 0 ? '#667eea' : '#fff',
                border: i === 0 ? 'none' : '2px solid #fff',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: i === 0 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}>
                {button.text}
              </button>
            ))}
          </div>
        </div>
      );
    
    case 'collection-list':
      return (
        <div className="preview-product-grid">
          <h4>{config.heading || 'Collections'}</h4>
          <div className="product-grid-layout">
            {[1, 2, 3].map((i) => (
              <div key={i} className="product-placeholder">
                <div className="product-image" />
                <p>Collection {i}</p>
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
