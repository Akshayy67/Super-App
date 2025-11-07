import { useState, useEffect, useCallback } from 'react';

interface CopyEventData {
  text: string;
  sourceContext: string;
  timestamp: number;
}

export const useGlobalCopyListener = () => {
  const [copyEvent, setCopyEvent] = useState<CopyEventData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastCopyTime, setLastCopyTime] = useState(0);

  const detectSourceContext = useCallback((target: EventTarget | null): string => {
    if (!target) {
      // Check if there's an active PDF iframe
      const pdfIframes = document.querySelectorAll('iframe[data-pdf-viewer="true"]');
      for (const iframe of Array.from(pdfIframes)) {
        try {
          // Check if iframe is visible and might be the source
          if ((iframe as HTMLElement).offsetParent !== null) {
            return 'PDF Content';
          }
        } catch (e) {
          // Cross-origin iframe
        }
      }
      return 'Unknown Source';
    }
    
    const element = target as HTMLElement;
    
    // Check if it's from AI Chat
    if (element.closest('[data-component="ai-chat"]')) {
      return 'AI Assistant';
    }
    
    // Check if it's from file content
    if (element.closest('[data-component="file-content"]')) {
      return 'File Content';
    }
    
    // Check if it's from PDF viewer
    if (element.closest('[data-component="pdf-viewer"]') ||
        element.closest('[data-pdf-viewer="true"]')) {
      return 'PDF Content';
    }
    
    // Check if it's from short notes
    if (element.closest('[data-component="notes"]')) {
      return 'Short Notes';
    }
    
    // Check if it's from flashcards
    if (element.closest('[data-component="flashcards"]')) {
      return 'Flashcards';
    }
    
    // Check if it's from tasks
    if (element.closest('[data-component="tasks"]')) {
      return 'Tasks';
    }
    
    // Check if it's from dashboard
    if (element.closest('[data-component="dashboard"]')) {
      return 'Dashboard';
    }
    
    // Check if it's from file manager
    if (element.closest('[data-component="file-manager"]')) {
      return 'File Manager';
    }
    
    // Check if it's from study tools
    if (element.closest('[data-component="study-tools"]')) {
      return 'Study Tools';
    }
    
    // Check for specific text patterns
    const text = element.textContent || '';
    if (text.includes('AI') || text.includes('assistant') || text.includes('chat')) {
      return 'AI Assistant';
    }
    
    if (text.includes('flashcard') || text.includes('question') || text.includes('answer')) {
      return 'Flashcards';
    }
    
    if (text.includes('task') || text.includes('todo') || text.includes('deadline')) {
      return 'Tasks';
    }
    
    if (text.includes('note') || text.includes('memo') || text.includes('journal')) {
      return 'Short Notes';
    }
    
    // Default fallback
    return 'Website Content';
  }, []);

  const handleCopy = useCallback((event: ClipboardEvent) => {
    const now = Date.now();
    
    // Prevent rapid successive triggers (debounce)
    if (now - lastCopyTime < 1000) {
      return;
    }

    const selection = window.getSelection();
    let copiedText = selection?.toString().trim() || '';
    
    // For PDF iframes (cross-origin), selection might be empty
    // Check clipboard directly after a delay
    if (!copiedText || copiedText.length === 0) {
      // Might be copying from PDF iframe - check clipboard after delay
      setTimeout(async () => {
        try {
          const clipboardText = await navigator.clipboard.readText();
          if (clipboardText && clipboardText.trim().length >= 20) {
            // Check if there's a visible PDF iframe
            const pdfIframes = document.querySelectorAll('iframe[data-pdf-viewer="true"]');
            const hasVisiblePdf = Array.from(pdfIframes).some(iframe => {
              try {
                return (iframe as HTMLElement).offsetParent !== null;
              } catch (e) {
                return false;
              }
            });
            
            if (hasVisiblePdf) {
              const sourceContext = detectSourceContext(null);
              setCopyEvent({
                text: clipboardText.trim(),
                sourceContext: 'PDF Content',
                timestamp: Date.now()
              });
              setIsModalVisible(true);
              setLastCopyTime(now);
            }
          }
        } catch (error) {
          // Clipboard access failed
        }
      }, 200);
      return;
    }
    
    // Only show modal for meaningful text (more than 20 characters to avoid premature triggers)
    if (copiedText.length < 20) {
      return;
    }

    // Add a small delay to ensure the copy operation is complete
    setTimeout(async () => {
      // Double-check that we still have a valid selection
      const currentSelection = window.getSelection();
      if (!currentSelection || currentSelection.toString().trim().length < 20) {
        return;
      }

      // Verify that text was actually copied to clipboard
      try {
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText || clipboardText.trim().length < 20) {
          return; // No text in clipboard or too short
        }
        // Use clipboard text if it's different (might be more complete)
        if (clipboardText.trim().length > copiedText.length) {
          copiedText = clipboardText.trim();
        }
      } catch (error) {
        // If clipboard access fails, continue with selection text
        console.log('Clipboard access failed, using selection text');
      }

      const sourceContext = detectSourceContext(event.target);
      
      setCopyEvent({
        text: copiedText,
        sourceContext,
        timestamp: Date.now()
      });
      
      setIsModalVisible(true);
      setLastCopyTime(now);
    }, 150); // 150ms delay to ensure copy is complete
  }, [detectSourceContext, lastCopyTime]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Listen for Ctrl+C (Windows/Linux) or Cmd+C (Mac)
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
      const now = Date.now();
      
      // Prevent rapid successive triggers (debounce)
      if (now - lastCopyTime < 1000) {
        return;
      }

      // Longer delay for keyboard shortcuts to ensure the copy operation completes
      setTimeout(async () => {
        const selection = window.getSelection();
        let copiedText = selection?.toString().trim() || '';
        
        // If no selection, check clipboard (might be from PDF iframe)
        if (!copiedText || copiedText.length < 20) {
          try {
            const clipboardText = await navigator.clipboard.readText();
            if (clipboardText && clipboardText.trim().length >= 20) {
              copiedText = clipboardText.trim();
              
              // Check if there's a visible PDF iframe
              const pdfIframes = document.querySelectorAll('iframe[data-pdf-viewer="true"]');
              const hasVisiblePdf = Array.from(pdfIframes).some(iframe => {
                try {
                  return (iframe as HTMLElement).offsetParent !== null;
                } catch (e) {
                  return false;
                }
              });
              
              if (hasVisiblePdf) {
                setCopyEvent({
                  text: copiedText,
                  sourceContext: 'PDF Content',
                  timestamp: Date.now()
                });
                setIsModalVisible(true);
                setLastCopyTime(now);
                return;
              }
            }
          } catch (error) {
            // Clipboard access failed
          }
        }
        
        if (copiedText && copiedText.length > 20) {
          const sourceContext = detectSourceContext(document.activeElement);
          
          setCopyEvent({
            text: copiedText,
            sourceContext,
            timestamp: Date.now()
          });
          
          setIsModalVisible(true);
          setLastCopyTime(now);
        }
      }, 250); // 250ms delay for keyboard shortcuts (slightly longer for PDFs)
    }
  }, [detectSourceContext, lastCopyTime]);

  // Function to attach listeners to PDF iframes
  const attachIframeListeners = useCallback(() => {
    const pdfIframes = document.querySelectorAll('iframe[data-pdf-viewer="true"]');
    pdfIframes.forEach((iframe) => {
      try {
        const iframeDoc = (iframe as HTMLIFrameElement).contentDocument ||
                         (iframe as HTMLIFrameElement).contentWindow?.document;
        if (iframeDoc) {
          // Attach copy listener to iframe document
          iframeDoc.addEventListener('copy', handleCopy);
          iframeDoc.addEventListener('keydown', handleKeyDown);
        }
      } catch (e) {
        // Cross-origin iframe - cannot access
        // This is expected for many PDF viewers
        console.log('Cannot access iframe content (cross-origin):', e);
      }
    });
  }, [handleCopy, handleKeyDown]);

  useEffect(() => {
    // Add event listeners to main document
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    
    // Attach listeners to existing PDF iframes
    attachIframeListeners();
    
    // Use MutationObserver to detect new PDF iframes
    const observer = new MutationObserver(() => {
      attachIframeListeners();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check periodically for new iframes (fallback)
    const iframeCheckInterval = setInterval(() => {
      attachIframeListeners();
    }, 2000);
    
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
      clearInterval(iframeCheckInterval);
      
      // Clean up iframe listeners
      const pdfIframes = document.querySelectorAll('iframe[data-pdf-viewer="true"]');
      pdfIframes.forEach((iframe) => {
        try {
          const iframeDoc = (iframe as HTMLIFrameElement).contentDocument ||
                           (iframe as HTMLIFrameElement).contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.removeEventListener('copy', handleCopy);
            iframeDoc.removeEventListener('keydown', handleKeyDown);
          }
        } catch (e) {
          // Cross-origin iframe - cannot access
        }
      });
    };
  }, [handleCopy, handleKeyDown, attachIframeListeners]);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setCopyEvent(null);
  }, []);

  return {
    copyEvent,
    isModalVisible,
    closeModal
  };
};
