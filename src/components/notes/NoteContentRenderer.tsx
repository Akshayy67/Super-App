import React from 'react';

interface NoteContentRendererProps {
  content: string;
  maxLength?: number;
  showImages?: boolean;
}

/**
 * Renders note content with support for markdown images
 * Parses markdown image syntax: ![alt](data:image/... or http://...)
 */
export const NoteContentRenderer: React.FC<NoteContentRendererProps> = ({
  content,
  maxLength,
  showImages = true,
}) => {
  // Function to extract images from markdown
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'image'; content: string; alt?: string }> = [];
    
    if (!text) {
      return [{ type: 'text' as const, content: '' }];
    }

    let lastIndex = 0;

    // Regex to match markdown images: ![alt](url)
    // Also match images that might be data URLs without markdown syntax
    const imageRegex = /!\[([^\]]*)\]\((data:[^)]+|https?:\/\/[^)]+)\)/g;
    let match;
    let hasImages = false;

    while ((match = imageRegex.exec(text)) !== null) {
      hasImages = true;
      // Add text before image
      if (match.index > lastIndex) {
        const textContent = text.substring(lastIndex, match.index);
        if (textContent.trim() || parts.length === 0) {
          parts.push({ type: 'text', content: textContent });
        }
      }

      // Add image
      const imageUrl = match[2];
      const altText = match[1] || 'Screenshot';
      parts.push({ type: 'image', content: imageUrl, alt: altText });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim() || !hasImages) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    // If no images found, return the original text
    if (!hasImages) {
      return [{ type: 'text' as const, content: text }];
    }

    return parts;
  };

  const parts = parseContent(content);
  let displayLength = 0;
  const shouldTruncate = maxLength !== undefined;
  let truncated = false;

  return (
    <div className="note-content">
      {parts.map((part, index) => {
        // If already truncated, don't render more
        if (truncated) {
          return null;
        }

        if (part.type === 'image' && showImages) {
          // For preview mode, show a smaller image or placeholder
          if (shouldTruncate && displayLength >= maxLength! * 0.8) {
            // Show image indicator if we're close to truncation limit
            truncated = true;
            return (
              <div key={`image-${index}`} className="my-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  [Screenshot image...]
                </div>
              </div>
            );
          }
          
          return (
            <div key={`image-${index}`} className="my-2">
              <img
                src={part.content}
                alt={part.alt || 'Screenshot'}
                className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm"
                style={{ maxHeight: shouldTruncate ? '150px' : '300px', objectFit: 'contain', cursor: 'pointer' }}
                onClick={() => {
                  // Open image in new tab/window for full view
                  const newWindow = window.open();
                  if (newWindow) {
                    newWindow.document.write(`<img src="${part.content}" style="max-width:100%;height:auto;" />`);
                  }
                }}
                onError={(e) => {
                  // Fallback if image fails to load - show error message
                  const target = e.target as HTMLImageElement;
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="text-xs text-red-500 p-2 border border-red-200 rounded bg-red-50 dark:bg-red-900/20">⚠️ Failed to load image</div>`;
                  }
                }}
              />
            </div>
          );
        } else if (part.type === 'text') {
          let textContent = part.content;

          // Apply truncation if needed
          if (shouldTruncate) {
            const remainingLength = maxLength! - displayLength;
            if (remainingLength > 0) {
              if (textContent.length > remainingLength) {
                textContent = textContent.substring(0, remainingLength).trim() + '...';
                truncated = true;
              }
              displayLength += textContent.length;
            } else {
              truncated = true;
              return null; // Don't render if we've exceeded maxLength
            }
          }

          return (
            <span key={`text-${index}`} className="whitespace-pre-wrap break-words">
              {textContent}
            </span>
          );
        }
        return null;
      })}
      {parts.length === 0 && content && (
        <span className="text-gray-400 dark:text-gray-500 italic">Empty note</span>
      )}
      {!content && (
        <span className="text-gray-400 dark:text-gray-500 italic">No content</span>
      )}
    </div>
  );
};

