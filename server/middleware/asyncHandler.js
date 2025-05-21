// Wrap async/await route handlers to handle errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export as default for CommonJS compatibility
module.exports = asyncHandler;
