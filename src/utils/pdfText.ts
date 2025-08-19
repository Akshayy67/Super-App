import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist";
// Use Vite's worker bundling to avoid CORS issues
// @ts-ignore - Vite worker import
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

try {
  const workerInstance: Worker = new PdfWorker();
  // Prefer setting the port directly so we don't rely on a URL
  // @ts-ignore: pdfjs type definitions may not include workerPort
  GlobalWorkerOptions.workerPort = workerInstance;
} catch {
  // Fallback to no-op; pdfjs will attempt a fake worker if needed
}

export async function extractTextFromPdfDataUrl(dataUrl: string): Promise<string> {
  // Convert data URL to ArrayBuffer
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);

  const loadingTask = getDocument({ data: bytes });
  const pdf: PDFDocumentProxy = await loadingTask.promise;

  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((it: any) => (it.str ?? "")).join(" ");
    text += (pageNum > 1 ? "\n\n" : "") + pageText;
    // Hard cap to avoid excessive payloads
    if (text.length > 20000) return text.slice(0, 20000);
  }

  return text;
}


