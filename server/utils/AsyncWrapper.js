// utils/AsyncWrapper.js

// Utility function to wrap asynchronous route handlers and handle errors
export const AsyncWrapper = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
