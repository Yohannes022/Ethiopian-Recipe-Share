// Type definitions for modules without type definitions
declare module 'module-alias/register' {
  const value: any;
  export = value;
}

declare module 'http-errors' {
  const createError: any;
  const isHttpError: any;
  export { createError, isHttpError };
}

// Add other module declarations as needed
