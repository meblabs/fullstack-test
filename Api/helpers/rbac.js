/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');

const { Forbidden, InvalidRole, ForbiddenResources } = require('./response');

const grantPath = `${__dirname}/../roles/`;
const grants = fs
  .readdirSync(grantPath)
  .filter(file => file.split('.')[1] === 'json')
  .reduce((acc, file) => {
    const f = path.parse(file).name;
    acc[f] = require(`${grantPath}${f}.json`);
    return acc;
  }, {});

exports.check = ({ company = {}, roles: globalRoles = [] }, resources, action) =>
  new Promise((resolve, reject) => {
    const companyRoles = company?.roles || [];
    const roles = Array.from(new Set([...companyRoles, ...globalRoles]));
    const grantedRoles = Object.keys(grants).filter(role => roles.includes(role));

    if (!grantedRoles.length) {
      reject(InvalidRole());
      return;
    }

    const allowedResources = grantedRoles.reduce((acc, role) => {
      Object.keys(grants[role]).forEach(resource => {
        acc[resource] = { ...acc[resource], ...grants[role][resource] };
      });
      return acc;
    }, {});

    if (!allowedResources[resources]) {
      reject(ForbiddenResources());
      return;
    }

    const permit = Object.keys(allowedResources[resources]).find(e => e.includes(action));

    if (permit) {
      const value = permit.split(':');

      if (action.includes(':')) {
        const actionSplit = action.split(':');
        if (actionSplit[0] !== value[0] && actionSplit[1] !== value[1] && value[1] !== 'any') {
          reject(Forbidden());
          return;
        }
      }

      const ret = {
        action: value[0],
        type: value[1],
        attributes: allowedResources[resources][permit]
      };

      resolve(ret);
      return;
    }

    reject(Forbidden());
  });

module.exports.getMaxRole = roles => {
  if (roles.includes('superadmin')) return 'superadmin';
  if (roles.includes('admin')) return 'admin';
  return false;
};
