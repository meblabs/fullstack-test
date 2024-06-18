module.exports = what => (req, res, next) => {
  req[what] = Object.keys(req[what]).reduce((acc, e) => {
    acc[e] = typeof req[what][e] === 'string' ? req[what][e].toLowerCase() : req[what][e];
    return acc;
  }, {});
  next();
};
