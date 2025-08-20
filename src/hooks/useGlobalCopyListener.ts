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
    if (!target) return 'Unknown Source';
    
    const element = target as HTMLElement;
    
    // Check if it's from AI Chat
    if (element.closest('[data-component="ai-chat"]')) {
      return 'AI Assistant';
    }
    
    // Check if it's from file content
    if (element.closest('[data-component="file-content"]')) {
      return 'File Content';
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
    if (!selection || selection.toString().trim().length === 0) {
      return;
    }

    const copiedText = selection.toString().trim();
    
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
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 20) {
          const copiedText = selection.toString().trim();
          const sourceContext = detectSourceContext(document.activeElement);
          
          setCopyEvent({
            text: copiedText,
            sourceContext,
            timestamp: Date.now()
          });
          
          setIsModalVisible(true);
          setLastCopyTime(now);
        }
      }, 200); // 200ms delay for keyboard shortcuts
    }
  }, [detectSourceContext, lastCopyTime]);

  useEffect(() => {
    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);
    
    // Remove the selectionchange listener as it was causing premature triggers
    // Only rely on actual copy events and keyboard shortcuts
    
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCopy, handleKeyDown]);

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
