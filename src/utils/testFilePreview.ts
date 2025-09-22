// Test utility for file preview service
import { filePreviewService } from './filePreviewService';

export const testFilePreviewService = () => {
  console.log('🧪 Testing File Preview Service...');

  // Test corrupted PowerPoint file
  const corruptedPPT = 'data:application/msword;base64,0M8R4KGxGuEAAAAAAAAAAAAAAAAAAAAAPgADAP7/CQAGAAAAAAAAAAAAAAACAAAAzAAAAAAAAAAAEAAAzwAAAAEAAAD';
  const pptInfo = filePreviewService.getPreviewInfo('presentation.pptx', 'application/vnd.ms-powerpoint', corruptedPPT, 'test-id');
  console.log('📊 PowerPoint (corrupted):', pptInfo);

  // Test normal PowerPoint file
  const normalPPT = filePreviewService.getPreviewInfo('presentation.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', undefined, 'test-id');
  console.log('📊 PowerPoint (normal):', normalPPT);

  // Test Word document
  const wordInfo = filePreviewService.getPreviewInfo('document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', undefined, 'test-id');
  console.log('📄 Word Document:', wordInfo);

  // Test Excel file
  const excelInfo = filePreviewService.getPreviewInfo('spreadsheet.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', undefined, 'test-id');
  console.log('📊 Excel Spreadsheet:', excelInfo);

  // Test PDF
  const pdfInfo = filePreviewService.getPreviewInfo('document.pdf', 'application/pdf', 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...', 'test-id');
  console.log('📄 PDF Document:', pdfInfo);

  // Test image
  const imageInfo = filePreviewService.getPreviewInfo('image.jpg', 'image/jpeg', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...', 'test-id');
  console.log('🖼️ Image:', imageInfo);

  // Test text file
  const textInfo = filePreviewService.getPreviewInfo('readme.txt', 'text/plain', 'data:text/plain;base64,SGVsbG8gV29ybGQ=', 'test-id');
  console.log('📝 Text File:', textInfo);

  console.log('✅ File Preview Service tests completed!');
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testFilePreview = testFilePreviewService;
}
