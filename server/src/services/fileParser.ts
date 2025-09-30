import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { ValidationError } from "../middleware/errorHandler.js";

export interface ParsedDocument {
  text: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    characterCount: number;
    fileType: string;
    fileName: string;
  };
}

export class FileParserService {
  private static readonly MAX_TEXT_LENGTH = 50000; // 50k characters max
  private static readonly SUPPORTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  static async parseFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ParsedDocument> {
    if (!this.SUPPORTED_TYPES.includes(mimeType)) {
      throw new ValidationError(
        `Unsupported file type: ${mimeType}. Supported types: PDF, DOCX, TXT`
      );
    }

    let text: string;
    let pageCount: number | undefined;

    try {
      switch (mimeType) {
        case "application/pdf":
          const pdfResult = await this.parsePDF(buffer);
          text = pdfResult.text;
          pageCount = pdfResult.pageCount;
          break;

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          text = await this.parseDOCX(buffer);
          break;

        case "text/plain":
          text = buffer.toString("utf-8");
          break;

        default:
          throw new ValidationError(`Unsupported file type: ${mimeType}`);
      }

      // Clean and validate text
      text = this.cleanText(text);

      if (text.length === 0) {
        throw new ValidationError("No readable text found in the document");
      }

      if (text.length > this.MAX_TEXT_LENGTH) {
        console.warn(
          `Document too long (${text.length} chars), truncating to ${this.MAX_TEXT_LENGTH}`
        );
        text = text.substring(0, this.MAX_TEXT_LENGTH);
      }

      return {
        text,
        metadata: {
          pageCount,
          wordCount: this.countWords(text),
          characterCount: text.length,
          fileType: mimeType,
          fileName,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      console.error("File parsing error:", error);
      throw new ValidationError(
        `Failed to parse ${fileName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private static async parsePDF(
    buffer: Buffer
  ): Promise<{ text: string; pageCount: number }> {
    try {
      const data = await pdfParse(buffer, {
        // PDF parsing options
        max: 0, // Parse all pages
        version: "v1.10.100",
      });

      return {
        text: data.text,
        pageCount: data.numpages,
      };
    } catch (error) {
      throw new Error(
        `PDF parsing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private static async parseDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });

      if (result.messages.length > 0) {
        console.warn("DOCX parsing warnings:", result.messages);
      }

      return result.value;
    } catch (error) {
      throw new Error(
        `DOCX parsing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private static cleanText(text: string): string {
    return (
      text
        // Normalize whitespace
        .replace(/\s+/g, " ")
        // Remove excessive line breaks
        .replace(/\n{3,}/g, "\n\n")
        // Remove control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Trim whitespace
        .trim()
    );
  }

  private static countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  static validateFileSize(size: number): void {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || "5242880"); // 5MB default

    if (size > maxSize) {
      throw new ValidationError(
        `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`
      );
    }
  }

  static validateFileName(fileName: string): void {
    // Check for dangerous file names
    if (
      fileName.includes("..") ||
      fileName.includes("/") ||
      fileName.includes("\\")
    ) {
      throw new ValidationError("Invalid file name");
    }

    // Check file extension
    const allowedExtensions = [".pdf", ".docx", ".txt"];
    const extension = fileName
      .toLowerCase()
      .substring(fileName.lastIndexOf("."));

    if (!allowedExtensions.includes(extension)) {
      throw new ValidationError(
        `Invalid file extension. Allowed: ${allowedExtensions.join(", ")}`
      );
    }
  }
}
