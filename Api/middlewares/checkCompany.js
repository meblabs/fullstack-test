const p2r = require('path-to-regexp');
const { NotFound, Unauthorized } = require('../helpers/response');
const { canGetCompany } = require('../rbac/companies');

module.exports =
  ({ excludedPaths = [] }) =>
  async ({ params: { companyId }, originalUrl }, res, next) => {
    const {
      locals: { user }
    } = res;
    if (excludedPaths?.filter(e => p2r.pathToRegexp(e).test(originalUrl))?.length) return next();
    const targetCompany = await canGetCompany(user, companyId);
    if (targetCompany === null) return next(NotFound());
    if (!targetCompany) return next(Unauthorized());
    res.locals.company = targetCompany;

    return next();
  };
