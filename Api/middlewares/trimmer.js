module.exports = () => (req, res, next) => {
  req.body = Object.keys(req.body).reduce((acc, e) => {
    acc[e] = typeof req.body[e] === 'string' ? req.body[e].trim() : req.body[e];
    return acc;
  }, {});
  next();
};
