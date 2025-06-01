const rateLimit = require('express-rate-limit');

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429, // HTTP status code for Too Many Requests
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  // You can also add a handler function for more complex logic, e.g., logging
  // handler: (req, res, next, options) => {
  //   console.log(`Rate limit exceeded for IP: ${req.ip}`);
  //   res.status(options.statusCode).send(options.message);
  // }
});

module.exports = apiRateLimiter;
