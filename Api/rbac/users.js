const User = require('../models/user');
const { intersection } = require('../helpers/utils');

const userRbac = async (caller, resourceId, { authorizedRoles = [], customCondition, onHimself = false }) => {
  const user = await User.findById(resourceId, {});
  if (!user) return null;

  const { id: _id, company, roles: globalRoles } = caller;
  const { roles: companyRoles } = company;
  const roles = Array.from(new Set([...companyRoles, ...globalRoles]));

  if (roles.includes('superuser')) return user;
  if (onHimself && resourceId?.toString() === _id?.toString()) return user;
  if (customCondition && customCondition(caller, user) === true) return user;

  if (company?.id?.toString() === user?.company?.id?.toString() && intersection(authorizedRoles, roles).length)
    return user;
  return false;
};

module.exports.userRbac = userRbac;

module.exports.canChangePassword = ({ email: userEmail }, email) => email === userEmail;

module.exports.canGetUser = (caller, resourceId) =>
  userRbac(caller, resourceId, { authorizedRoles: ['admin'], onHimself: true });

module.exports.canUpdateUser = (caller, resourceId) =>
  userRbac(caller, resourceId, { authorizedRoles: ['admin'], onHimself: true });

module.exports.canDeleteUser = (caller, resourceId) =>
  userRbac(caller, resourceId, { authorizedRoles: ['admin'], onHimself: false });
