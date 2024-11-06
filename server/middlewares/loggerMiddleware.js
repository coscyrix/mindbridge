// middlewares/loggerMiddleware.js

function loggerMiddleware(req, res, next) {
  console.log(`[console] ${req.method} ${req.url}`);
  next(); // Pass control to the next middleware function
}

export default loggerMiddleware;
