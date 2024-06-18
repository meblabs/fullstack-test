const { intersection } = require('../helpers/utils');
const Company = require('../models/company');

const companyRbac = async (caller, resourceId, { authorizedRoles = [] }) => {
  const company = await Company.findById(resourceId);
  if (!company) return null;

  const { grants, company: userCompany = {}, roles: globalRoles } = caller;
  const { roles: companyRoles = [] } = userCompany;
  const roles = Array.from(new Set([...companyRoles, ...globalRoles]));

  if (grants?.type === 'any' || roles.includes('superuser')) return company;
  if (intersection(authorizedRoles, roles).length && userCompany?.id?.toString() === resourceId) return company;

  return false;
};

module.exports.canGetCompany = (caller, resourceId) =>
  companyRbac(caller, resourceId, { authorizedRoles: ['admin', 'user'] });

module.exports.canUpdateCompany = (caller, resourceId) =>
  companyRbac(caller, resourceId, { authorizedRoles: ['admin'] });

module.exports.canDeleteCompany = (caller, resourceId) => companyRbac(caller, resourceId, {});
