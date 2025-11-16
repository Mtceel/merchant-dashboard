/**
 * Block Editor - Property panel for editing block configurations
 */

import { X } from 'lucide-react';

interface BlockEditorProps {
  block: {
    id: string;
    type: string;
    config: Record<string, any>;
  };
  onUpdate: (config: Record<string, any>) => void;
  onClose: () => void;
}

export function BlockEditor({ block, onUpdate, onClose }: BlockEditorProps) {
  const handleChange = (key: string, value: any) => {
    onUpdate({ ...block.config, [key]: value });
  };

  const renderField = (key: string, value: any) => {
    // Detect field type
    if (key.toLowerCase().includes('color')) {
      return (
        <div key={key} className="form-group">
          <label>{formatLabel(key)}</label>
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleChange(key, e.target.value)}
          />
        </div>
      );
    }

    if (key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key.toLowerCase().includes('src')) {
      return (
        <div key={key} className="form-group">
          <label>{formatLabel(key)}</label>
          <input
            type="url"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <small>Enter image URL</small>
        </div>
      );
    }

    if (key.toLowerCase().includes('height') || key.toLowerCase().includes('width') || key.toLowerCase().includes('size')) {
      return (
        <div key={key} className="form-group">
          <label>{formatLabel(key)}</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="e.g. 400px, 50%, auto"
          />
        </div>
      );
    }

    if (key === 'content' || key === 'description') {
      return (
        <div key={key} className="form-group">
          <label>{formatLabel(key)}</label>
          <textarea
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={6}
            placeholder={`Enter ${key}...`}
          />
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={key} className="form-group">
          <label>{formatLabel(key)}</label>
          <div className="array-editor">
            <textarea
              value={JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleChange(key, parsed);
                } catch (err) {
                  // Invalid JSON, ignore
                }
              }}
              rows={8}
              placeholder="JSON array"
            />
            <small>Edit as JSON</small>
          </div>
        </div>
      );
    }

    // Default text input
    return (
      <div key={key} className="form-group">
        <label>{formatLabel(key)}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={`Enter ${key}...`}
        />
      </div>
    );
  };

  return (
    <div className="block-editor">
      <div className="editor-header">
        <h3>Edit {formatBlockName(block.type)}</h3>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="editor-content">
        {Object.entries(block.config).map(([key, value]) => renderField(key, value))}
      </div>
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}

function formatBlockName(name: string): string {
  return name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
