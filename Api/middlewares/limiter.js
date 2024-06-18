const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../helpers/response');
const { rateLimitMinute, rateLimitMax } = require('../config');

module.exports = (minute = rateLimitMinute, max = rateLimitMax) =>
  rateLimit({
    windowMs: minute * 60 * 1000,
    max,
    handler: (req, res, next) => next(RateLimitError())
  });
