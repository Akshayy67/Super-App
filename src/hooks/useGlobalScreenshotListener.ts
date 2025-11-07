import { useState, useEffect, useCallback, useRef } from 'react';

interface ScreenshotEventData {
  image: string; // Base64 data URL
  sourceContext: string;
  timestamp: number;
  method: 'printscreen' | 'snipping-tool' | 'mobile' | 'clipboard';
}

export const useGlobalScreenshotListener = () => {
  const [screenshotEvent, setScreenshotEvent] = useState<ScreenshotEventData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastScreenshotTime, setLastScreenshotTime] = useState(0);
  const clipboardCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastClipboardImage = useRef<string | null>(null);
  const clipboardCheckTimeout = useRef<NodeJS.Timeout | null>(null);
  const isCheckingClipboard = useRef<boolean>(false);
  const windowsKeyPressed = useRef<boolean>(false);
  const processedScreenshots = useRef<Set<string>>(new Set()); // Track processed screenshots
  const modalClosedTime = useRef<number>(0); // Track when modal was last closed
  const isModalVisibleRef = useRef<boolean>(false); // Ref for modal visibility to avoid stale closures

  const detectSourceContext = useCallback((): string => {
    // Check active element and document context
    const activeElement = document.activeElement;
    if (!activeElement) return 'Screenshot';
    
    const element = activeElement as HTMLElement;
    
    // Check if it's from AI Chat
    if (element.closest('[data-component="ai-chat"]')) {
      return 'AI Assistant Screenshot';
    }
    
    // Check if it's from file content (including PDF)
    if (element.closest('[data-component="file-content"]') || 
        element.closest('[data-component="pdf-viewer"]')) {
      return 'File Content Screenshot';
    }
    
    // Check if it's from PDF iframe
    const iframes = document.querySelectorAll('iframe[data-pdf-viewer="true"]');
    for (const iframe of Array.from(iframes)) {
      try {
        // Check if iframe has focus or is visible
        if (document.activeElement === iframe || 
            (iframe as HTMLElement).offsetParent !== null) {
          return 'PDF Screenshot';
        }
      } catch (e) {
        // Cross-origin iframe, can't access
      }
    }
    
    // Check if it's from short notes
    if (element.closest('[data-component="notes"]')) {
      return 'Notes Screenshot';
    }
    
    // Check if it's from flashcards
    if (element.closest('[data-component="flashcards"]')) {
      return 'Flashcards Screenshot';
    }
    
    // Check if it's from tasks
    if (element.closest('[data-component="tasks"]')) {
      return 'Tasks Screenshot';
    }
    
    // Check if it's from dashboard
    if (element.closest('[data-component="dashboard"]')) {
      return 'Dashboard Screenshot';
    }
    
    // Check if it's from file manager
    if (element.closest('[data-component="file-manager"]')) {
      return 'File Manager Screenshot';
    }
    
    // Check if it's from team space
    if (element.closest('[data-component="team-space"]')) {
      return 'Team Space Screenshot';
    }
    
    // Default fallback
    return 'Screenshot';
  }, []);

  // Create a hash of the image for comparison (use first and last 100 chars for speed)
  const getImageHash = useCallback((imageDataUrl: string): string => {
    if (imageDataUrl.length < 200) return imageDataUrl;
    // Use first 100 chars, last 100 chars, and length as a simple hash
    return `${imageDataUrl.substring(0, 100)}_${imageDataUrl.substring(imageDataUrl.length - 100)}_${imageDataUrl.length}`;
  }, []);

  const processScreenshot = useCallback((imageDataUrl: string, method: 'printscreen' | 'snipping-tool' | 'mobile' | 'clipboard') => {
    const now = Date.now();
    
    // Don't process if modal is currently visible (use ref for current state)
    if (isModalVisibleRef.current) {
      console.log('⏸️ Modal is visible, ignoring screenshot');
      return;
    }
    
    // Prevent re-triggering immediately after modal was closed (30 seconds cooldown)
    if (now - modalClosedTime.current < 30000) {
      console.log('⏸️ Screenshot modal recently closed, ignoring clipboard check');
      return;
    }
    
    // Prevent rapid successive triggers (debounce)
    if (now - lastScreenshotTime < 2000) {
      return;
    }
    
    // Create a hash for this image
    const imageHash = getImageHash(imageDataUrl);
    
    // Check if this screenshot was already processed
    if (processedScreenshots.current.has(imageHash)) {
      console.log('🔄 Screenshot already processed, ignoring');
      return;
    }
    
    // Check if this is the same as the last clipboard image
    if (imageDataUrl === lastClipboardImage.current) {
      console.log('🔄 Same image as last detected, ignoring');
      return;
    }
    
    // Mark as processed and update refs
    processedScreenshots.current.add(imageHash);
    lastClipboardImage.current = imageDataUrl;
    
    // Clean up old processed screenshots (keep last 10)
    if (processedScreenshots.current.size > 10) {
      const entries = Array.from(processedScreenshots.current);
      processedScreenshots.current = new Set(entries.slice(-10));
    }

    const sourceContext = detectSourceContext();
    
    console.log('📸 Screenshot detected:', { method, sourceContext, length: imageDataUrl.length });
    
    setScreenshotEvent({
      image: imageDataUrl,
      sourceContext,
      timestamp: Date.now(),
      method
    });
    
    isModalVisibleRef.current = true; // Update ref first
    setIsModalVisible(true);
    setLastScreenshotTime(now);
  }, [detectSourceContext, getImageHash]);

  const handlePaste = useCallback(async (event: ClipboardEvent) => {
    // Check if clipboard contains an image
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.indexOf('image') !== -1) {
        // Don't prevent default - let the paste work normally
        // event.preventDefault();
        // event.stopPropagation();
        
        const blob = item.getAsFile();
        if (!blob) continue;

        try {
          const reader = new FileReader();
          reader.onloadend = () => {
            const imageDataUrl = reader.result as string;
            
            // Determine method based on platform
            let method: 'printscreen' | 'snipping-tool' | 'mobile' | 'clipboard' = 'clipboard';
            
            // On mobile, screenshots are typically pasted
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
              method = 'mobile';
            }
            // On Windows, if Windows key was recently pressed, it's likely Snipping Tool
            else if (navigator.platform.toLowerCase().includes('win') && windowsKeyPressed.current) {
              method = 'snipping-tool';
              windowsKeyPressed.current = false; // Reset
            }

            processScreenshot(imageDataUrl, method);
          };
          reader.readAsDataURL(blob);
          break;
        } catch (error) {
          console.error('Error reading screenshot from paste:', error);
        }
      }
    }
  }, [processScreenshot]);

  // Check clipboard for images
  const checkClipboardForImage = useCallback(async (method: 'printscreen' | 'snipping-tool' | 'mobile' | 'clipboard' = 'clipboard'): Promise<boolean> => {
    // Don't check if modal is visible (use ref for current state)
    if (isModalVisibleRef.current) {
      return false;
    }
    
    // Don't check if modal was recently closed (30 seconds cooldown)
    const now = Date.now();
    if (now - modalClosedTime.current < 30000) {
      return false;
    }
    
    if (isCheckingClipboard.current) {
      return false;
    }
    
    isCheckingClipboard.current = true;
    
    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.read) {
        console.log('Clipboard API not available');
        isCheckingClipboard.current = false;
        return false;
      }

      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onloadend = () => {
              const imageDataUrl = reader.result as string;
              // Double-check modal state before processing (use ref for current state)
              const currentTime = Date.now();
              if (!isModalVisibleRef.current && (currentTime - modalClosedTime.current >= 30000)) {
                processScreenshot(imageDataUrl, method);
              } else {
                console.log('⏸️ Skipping screenshot processing - modal visible or recently closed');
              }
              isCheckingClipboard.current = false;
            };
            reader.onerror = () => {
              isCheckingClipboard.current = false;
            };
            reader.readAsDataURL(blob);
            return true;
          }
        }
      }
    } catch (error: any) {
      // Clipboard API might not be available or user denied permission
      if (error.name !== 'NotAllowedError' && error.name !== 'NotFoundError') {
        console.log('Error reading clipboard:', error.name, error.message);
      }
    }
    
    isCheckingClipboard.current = false;
    return false;
  }, [processScreenshot]);

  // Detect PrintScreen key press and Windows key combinations
  const handleKeyDown = useCallback(async (event: KeyboardEvent) => {
    // Track Windows key (Meta key) for Win+Shift+S detection
    if (event.key === 'Meta' || event.key === 'OSLeft' || event.key === 'OSRight') {
      windowsKeyPressed.current = true;
      // Reset after 2 seconds
      setTimeout(() => {
        windowsKeyPressed.current = false;
      }, 2000);
    }
    
    // Detect Win+Shift+S (Snipping Tool) - we can't detect this directly, 
    // but we can detect Shift+S when Windows key was recently pressed
    if ((event.key === 's' || event.key === 'S') && 
        event.shiftKey && 
        windowsKeyPressed.current) {
      // Win+Shift+S detected - check clipboard after a delay
      console.log('Win+Shift+S detected, checking clipboard...');
      windowsKeyPressed.current = false;
      setTimeout(() => {
        checkClipboardForImage('snipping-tool');
      }, 500); // Wait for Snipping Tool to finish
      return;
    }
    
    // PrintScreen key detection
    // Note: Many browsers block PrintScreen key detection for security
    // We'll rely more on clipboard monitoring
    if (event.key === 'PrintScreen' || 
        event.keyCode === 44 || 
        (event.key === 'F13' && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey)) {
      
      console.log('PrintScreen key detected, checking clipboard...');
      
      // PrintScreen puts the screenshot in clipboard
      // Wait a bit for the clipboard to be updated, then check
      setTimeout(() => {
        checkClipboardForImage('printscreen');
      }, 300); // Wait 300ms for clipboard to update
    }
  }, [checkClipboardForImage]);

  // Periodic clipboard check for Win+Shift+S and other screenshot tools
  // This monitors clipboard changes to detect screenshots from external tools
  const monitorClipboardChanges = useCallback(async () => {
    // Don't check if modal is visible (use ref for current state)
    if (isModalVisibleRef.current) {
      return;
    }
    
    // Don't check if modal was recently closed (30 seconds cooldown)
    const now = Date.now();
    if (now - modalClosedTime.current < 30000) {
      return;
    }
    
    // Only check if it's been a while since last screenshot to avoid spam
    if (now - lastScreenshotTime < 1000) {
      return;
    }

    // Don't check if we're already checking
    if (isCheckingClipboard.current) {
      return;
    }

    await checkClipboardForImage('snipping-tool');
  }, [lastScreenshotTime, checkClipboardForImage]);

  useEffect(() => {
    // Request clipboard permissions on user interaction (required by browsers)
    const requestClipboardPermission = async () => {
      try {
        // Check if clipboard API is available
        if (!navigator.clipboard || !navigator.clipboard.read) {
          console.warn('⚠️ Clipboard API not available. Screenshot detection requires HTTPS or localhost.');
          return;
        }

        // Try to read clipboard to trigger permission prompt if needed
        // Note: This requires user interaction in most browsers
        await navigator.clipboard.read();
        console.log('✅ Clipboard permission granted');
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          console.warn('⚠️ Clipboard permission denied. Screenshot detection requires clipboard permissions.');
          console.warn('💡 To enable: Click anywhere on the page, then clipboard permission will be requested.');
        } else if (error.name === 'NotFoundError') {
          // No clipboard data - this is normal, not an error
        } else {
          console.log('Clipboard check:', error.message);
        }
      }
    };
    
    // Request permission on first user interaction (click, keypress, etc.)
    const handleUserInteraction = () => {
      requestClipboardPermission();
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    
    // Add event listeners
    document.addEventListener('paste', handlePaste, true); // Use capture phase
    document.addEventListener('keydown', handleKeyDown, true);
    
    // Set up periodic clipboard monitoring for Win+Shift+S and other tools
    // Check every 2 seconds for clipboard changes
    clipboardCheckInterval.current = setInterval(() => {
      monitorClipboardChanges();
    }, 2000);
    
    // For mobile devices, also listen for focus events
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      const handleFocus = async () => {
        setTimeout(() => {
          checkClipboardForImage('mobile');
        }, 500);
      };
      window.addEventListener('focus', handleFocus);
      
      return () => {
        document.removeEventListener('paste', handlePaste, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('focus', handleFocus);
        if (clipboardCheckInterval.current) {
          clearInterval(clipboardCheckInterval.current);
        }
        if (clipboardCheckTimeout.current) {
          clearTimeout(clipboardCheckTimeout.current);
        }
      };
    }
    
    // Also check clipboard on window focus (user might have taken screenshot in another app)
    const handleWindowFocus = async () => {
      // Don't check if modal is visible or was recently closed (use ref for current state)
      if (isModalVisibleRef.current || (Date.now() - modalClosedTime.current < 30000)) {
        return;
      }
      
      // Clear any pending timeouts
      if (clipboardCheckTimeout.current) {
        clearTimeout(clipboardCheckTimeout.current);
      }
      // Check clipboard after a short delay
      clipboardCheckTimeout.current = setTimeout(() => {
        checkClipboardForImage('clipboard');
      }, 300);
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('focus', handleWindowFocus);
      if (clipboardCheckInterval.current) {
        clearInterval(clipboardCheckInterval.current);
      }
      if (clipboardCheckTimeout.current) {
        clearTimeout(clipboardCheckTimeout.current);
      }
    };
  }, [handlePaste, handleKeyDown, monitorClipboardChanges, checkClipboardForImage]);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    isModalVisibleRef.current = false; // Update ref
    setScreenshotEvent(null);
    
    // Mark the current screenshot as processed immediately
    if (screenshotEvent?.image) {
      const imageHash = getImageHash(screenshotEvent.image);
      processedScreenshots.current.add(imageHash);
      lastClipboardImage.current = screenshotEvent.image;
      
      // Clean up old processed screenshots (keep last 10)
      if (processedScreenshots.current.size > 10) {
        const entries = Array.from(processedScreenshots.current);
        processedScreenshots.current = new Set(entries.slice(-10));
      }
    }
    
    // Record when modal was closed to prevent immediate re-triggering
    modalClosedTime.current = Date.now();
    
    console.log('✅ Screenshot modal closed, will ignore same screenshot for 30 seconds');
  }, [screenshotEvent, getImageHash]);

  // Expose a manual trigger for testing/debugging
  const triggerScreenshotCheck = useCallback(() => {
    console.log('🔍 Manually checking clipboard for screenshot...');
    checkClipboardForImage('clipboard');
  }, [checkClipboardForImage]);

  // Expose triggerScreenshotCheck on window for debugging
  useEffect(() => {
    (window as any).triggerScreenshotCheck = triggerScreenshotCheck;
    console.log('💡 Screenshot detection active! Try: triggerScreenshotCheck() in console to test');
    return () => {
      delete (window as any).triggerScreenshotCheck;
    };
  }, [triggerScreenshotCheck]);

  return {
    screenshotEvent,
    isModalVisible,
    closeModal,
    triggerScreenshotCheck
  };
};

