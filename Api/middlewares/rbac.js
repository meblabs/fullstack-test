const { check } = require('../helpers/rbac');

module.exports = (resource, action) => (req, res, next) =>
  check(res.locals.user, resource, action)
    .then(grants => {
      res.locals.grants = grants;
      res.locals.user = { ...JSON.parse(JSON.stringify(res.locals.user)), grants };
      return next();
    })
    .catch(err => next(err));
