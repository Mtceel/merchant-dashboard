/**
 * Page Preview - Full-screen preview of rendered page
 */

interface PagePreviewProps {
  html: string;
  isLoading: boolean;
}

export function PagePreview({ html, isLoading }: PagePreviewProps) {
  if (isLoading) {
    return (
      <div className="preview-loading">
        <div className="spinner"></div>
        <p>Rendering preview...</p>
      </div>
    );
  }

  return (
    <div className="page-preview">
      <div className="preview-frame">
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              ${html}
            </body>
            </html>
          `}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Page Preview"
        />
      </div>
    </div>
  );
}
