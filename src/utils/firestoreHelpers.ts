/**
 * Utility functions for Firestore operations
 */

// File size constants for consistent handling across the app
export const FILE_SIZE_LIMITS = {
  // Firestore document limit is 1MB, but base64 encoding increases size by ~33%
  // So we use 700KB as the safe threshold for Firestore storage
  FIRESTORE_SAFE_LIMIT: 700 * 1024, // 700KB

  // Files larger than 1MB should go to Google Drive
  GOOGLE_DRIVE_THRESHOLD: 1024 * 1024, // 1MB

  // Firestore absolute limit
  FIRESTORE_ABSOLUTE_LIMIT: 1048576, // 1MB in bytes
} as const;

/**
 * Filters out undefined values from an object before saving to Firestore
 * Firestore doesn't accept undefined values - they must be omitted or set to null
 *
 * @param data - The object to filter
 * @returns A new object with undefined values removed
 */
export function filterUndefinedValues(
  data: Record<string, any>
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );
}

/**
 * Recursively filters out undefined values from nested objects
 *
 * @param data - The object to filter (can contain nested objects)
 * @returns A new object with undefined values removed at all levels
 */
export function deepFilterUndefinedValues(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => deepFilterUndefinedValues(item));
  }

  if (typeof data === "object") {
    const filtered: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        filtered[key] = deepFilterUndefinedValues(value);
      }
    }
    return filtered;
  }

  return data;
}

/**
 * Validates that an object doesn't contain any Firestore-incompatible values
 *
 * @param data - The object to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateFirestoreData(data: any): string[] {
  const errors: string[] = [];

  function checkValue(value: any, path: string = ""): void {
    if (value === undefined) {
      errors.push(`Undefined value at ${path || "root"}`);
    }

    if (typeof value === "function") {
      errors.push(`Function value at ${path || "root"}`);
    }

    if (value instanceof Date) {
      // Note: Date objects are actually supported in Firestore, but serverTimestamp() is preferred
      // This is just a warning for consistency
      console.warn(
        `Date object at ${
          path || "root"
        } - consider using serverTimestamp() for consistency`
      );
    }

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, nestedValue] of Object.entries(value)) {
        checkValue(nestedValue, path ? `${path}.${key}` : key);
      }
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, path ? `${path}[${index}]` : `[${index}]`);
      });
    }
  }

  checkValue(data);
  return errors;
}

/**
 * Validates that a Firestore document doesn't exceed size limits
 * Firestore has a 1MB limit per document
 *
 * @param data - The document data to validate
 * @returns Object with validation result and size info
 */
export function validateFirestoreDocumentSize(data: any): {
  isValid: boolean;
  sizeBytes: number;
  sizeMB: number;
  errors: string[];
} {
  const errors: string[] = [];

  // Convert to JSON string to estimate size
  const jsonString = JSON.stringify(data);
  const sizeBytes = new Blob([jsonString]).size;
  const sizeMB = sizeBytes / (1024 * 1024);

  // Firestore limit is 1MB (1,048,576 bytes)
  const FIRESTORE_LIMIT_BYTES = 1048576;

  if (sizeBytes > FIRESTORE_LIMIT_BYTES) {
    errors.push(
      `Document size (${
        Math.round(sizeMB * 100) / 100
      }MB) exceeds Firestore limit (1MB)`
    );
  }

  // Check for large content fields that might be causing the issue
  if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string" && value.length > 500000) {
        // ~500KB
        const fieldSizeMB = new Blob([value]).size / (1024 * 1024);
        errors.push(
          `Field "${key}" is very large (${
            Math.round(fieldSizeMB * 100) / 100
          }MB) - consider using external storage`
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    sizeBytes,
    sizeMB,
    errors,
  };
}
