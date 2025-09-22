// Enhanced File Preview Service
// Handles preview logic for different file types including Office documents

export interface FilePreviewInfo {
  canPreview: boolean;
  previewType: 'image' | 'pdf' | 'text' | 'office' | 'unsupported' | 'corrupted';
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  actions: Array<{
    label: string;
    action: 'download' | 'office-online' | 'analyze' | 'external';
    color: string;
    url?: string;
  }>;
}

export class FilePreviewService {
  
  // Check if file data is corrupted
  isCorruptedData(content: string): boolean {
    if (!content) return false;
    
    // Check for common corruption patterns
    const corruptionPatterns = [
      '0M8R4KGxGuEAAAAAAAAAAAAAAAAAAAAAPgADAP7/CQAGAAAAAAAAAAAAAAACAAAAzAAAAAAAAAAAEAAAzwAAAAEAAAD',
      'data:application/msword;base64,0M8R4KGx',
      'data:application/vnd.ms-powerpoint;base64,0M8R4KGx'
    ];
    
    return corruptionPatterns.some(pattern => content.includes(pattern));
  }

  // Check if base64 data is valid
  isValidBase64(content: string): boolean {
    try {
      // Remove data URL prefix if present
      const base64Data = content.includes(',') ? content.split(',')[1] : content;
      // Check if it's valid base64
      return btoa(atob(base64Data)) === base64Data;
    } catch (e) {
      return false;
    }
  }

  // Get file type from MIME type and filename
  getFileType(mimeType?: string, fileName?: string): string {
    const name = fileName?.toLowerCase() || '';
    const mime = mimeType?.toLowerCase() || '';

    // Images
    if (mime.startsWith('image/')) return 'image';

    // PDFs
    if (mime.includes('pdf') || name.endsWith('.pdf')) return 'pdf';

    // Text files
    if (mime.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.md')) return 'text';

    // PowerPoint
    if (mime.includes('powerpoint') || mime.includes('presentation') || 
        name.endsWith('.ppt') || name.endsWith('.pptx')) return 'powerpoint';

    // Word
    if (mime.includes('msword') || mime.includes('wordprocessingml') || 
        name.endsWith('.doc') || name.endsWith('.docx')) return 'word';

    // Excel
    if (mime.includes('excel') || mime.includes('spreadsheetml') || 
        name.endsWith('.xls') || name.endsWith('.xlsx')) return 'excel';

    return 'unknown';
  }

  // Get preview information for a file
  getPreviewInfo(fileName: string, mimeType?: string, content?: string, fileId?: string): FilePreviewInfo {
    const fileType = this.getFileType(mimeType, fileName);
    
    // Check for corrupted data first
    if (content && this.isCorruptedData(content)) {
      return {
        canPreview: false,
        previewType: 'corrupted',
        icon: '⚠️',
        iconColor: 'text-yellow-600',
        title: 'File Data Corrupted',
        description: 'The file data appears to be corrupted or incomplete. This often happens with Office documents that weren\'t uploaded properly.',
        actions: [
          { label: 'Try Download', action: 'download', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: 'AI Analysis', action: 'analyze', color: 'bg-purple-600 hover:bg-purple-700' }
        ]
      };
    }

    // Check for invalid base64 data
    if (content && !this.isValidBase64(content)) {
      return {
        canPreview: false,
        previewType: 'corrupted',
        icon: '⚠️',
        iconColor: 'text-yellow-600',
        title: 'Invalid File Data',
        description: 'The file data is invalid or corrupted. Please try re-uploading the file.',
        actions: [
          { label: 'Try Download', action: 'download', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: 'AI Analysis', action: 'analyze', color: 'bg-purple-600 hover:bg-purple-700' }
        ]
      };
    }

    switch (fileType) {
      case 'image':
        return {
          canPreview: true,
          previewType: 'image',
          icon: '🖼️',
          iconColor: 'text-blue-600',
          title: 'Image Preview',
          description: 'Image file ready for preview',
          actions: [
            { label: 'Download', action: 'download', color: 'bg-blue-600 hover:bg-blue-700' }
          ]
        };

      case 'pdf':
        return {
          canPreview: true,
          previewType: 'pdf',
          icon: '📄',
          iconColor: 'text-red-600',
          title: 'PDF Document',
          description: 'PDF document with inline preview',
          actions: [
            { label: 'Download PDF', action: 'download', color: 'bg-red-600 hover:bg-red-700' },
            { label: 'AI Analysis', action: 'analyze', color: 'bg-purple-600 hover:bg-purple-700' }
          ]
        };

      case 'text':
        return {
          canPreview: true,
          previewType: 'text',
          icon: '📝',
          iconColor: 'text-gray-600',
          title: 'Text Document',
          description: 'Text file with syntax highlighting',
          actions: [
            { label: 'Download', action: 'download', color: 'bg-gray-600 hover:bg-gray-700' }
          ]
        };

      case 'powerpoint':
        return {
          canPreview: false,
          previewType: 'office',
          icon: '📊',
          iconColor: 'text-orange-600',
          title: 'PowerPoint Presentation',
          description: 'PowerPoint files cannot be previewed in the browser. Download to view in PowerPoint or compatible software.',
          actions: [
            { label: 'Download PowerPoint', action: 'download', color: 'bg-orange-600 hover:bg-orange-700' },
            { 
              label: 'Try Office Online', 
              action: 'office-online', 
              color: 'bg-blue-600 hover:bg-blue-700',
              url: fileId ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + '/api/file/' + fileId)}` : undefined
            },
            { label: 'AI Analysis', action: 'analyze', color: 'bg-purple-600 hover:bg-purple-700' }
          ]
        };

      case 'word':
        return {
          canPreview: false,
          previewType: 'office',
          icon: '📄',
          iconColor: 'text-blue-600',
          title: 'Word Document',
          description: 'Word documents cannot be previewed in the browser. Download to view in Word or compatible software.',
          actions: [
            { label: 'Download Document', action: 'download', color: 'bg-blue-600 hover:bg-blue-700' },
            { 
              label: 'Try Office Online', 
              action: 'office-online', 
              color: 'bg-green-600 hover:bg-green-700',
              url: fileId ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + '/api/file/' + fileId)}` : undefined
            },
            { label: 'AI Analysis', action: 'analyze', color: 'bg-purple-600 hover:bg-purple-700' }
          ]
        };

      case 'excel':
        return {
          canPreview: false,
          previewType: 'office',
          icon: '📊',
          iconColor: 'text-green-600',
          title: 'Excel Spreadsheet',
          description: 'Excel files cannot be previewed in the browser. Download to view in Excel or compatible software.',
          actions: [
            { label: 'Download Spreadsheet', action: 'download', color: 'bg-green-600 hover:bg-green-700' },
            { 
              label: 'Try Office Online', 
              action: 'office-online', 
              color: 'bg-blue-600 hover:bg-blue-700',
              url: fileId ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(window.location.origin + '/api/file/' + fileId)}` : undefined
            },
            { label: 'AI Analysis', action: 'analyze', color: 'bg-purple-600 hover:bg-purple-700' }
          ]
        };

      default:
        return {
          canPreview: false,
          previewType: 'unsupported',
          icon: '📁',
          iconColor: 'text-gray-400',
          title: 'Preview Not Available',
          description: 'This file type is not supported for preview. Download the file to view it.',
          actions: [
            { label: 'Download File', action: 'download', color: 'bg-gray-600 hover:bg-gray-700' },
            { label: 'AI Analysis', action: 'analyze', color: 'bg-purple-600 hover:bg-purple-700' }
          ]
        };
    }
  }

  // Render preview content based on file type
  renderPreviewContent(fileName: string, mimeType?: string, content?: string): string | null {
    const fileType = this.getFileType(mimeType, fileName);
    
    if (!content) return null;

    // Check for corrupted data
    if (this.isCorruptedData(content) || !this.isValidBase64(content)) {
      return null;
    }

    switch (fileType) {
      case 'image':
        return content; // Return data URL directly for images

      case 'pdf':
        return content; // Return data URL for PDF iframe

      case 'text':
        try {
          // Decode base64 text content
          const base64Data = content.includes(',') ? content.split(',')[1] : content;
          return atob(base64Data);
        } catch (e) {
          return null;
        }

      default:
        return null; // No preview content for other types
    }
  }

  // Get appropriate MIME type for download
  getDownloadMimeType(fileName: string, originalMimeType?: string): string {
    const fileType = this.getFileType(originalMimeType, fileName);
    
    switch (fileType) {
      case 'powerpoint':
        return fileName.toLowerCase().endsWith('.pptx') 
          ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          : 'application/vnd.ms-powerpoint';
      
      case 'word':
        return fileName.toLowerCase().endsWith('.docx')
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/msword';
      
      case 'excel':
        return fileName.toLowerCase().endsWith('.xlsx')
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/vnd.ms-excel';
      
      default:
        return originalMimeType || 'application/octet-stream';
    }
  }
}

export const filePreviewService = new FilePreviewService();
