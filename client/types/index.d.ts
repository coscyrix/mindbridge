/**
 * Global Type Definitions
 * 
 * This file contains global type definitions that can be used throughout the application.
 * As you migrate files from JS to TS, add shared types here.
 */

// Example: Extending Window interface for custom properties
declare global {
  interface Window {
    // Add any custom window properties here
    // Example: customProperty?: any;
  }
}

// Example: Common API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Example: Common Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Example: Form field types
export interface FormField {
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
}

// Export empty object to make this a module
export {};

