const User = require('../models/user');
const { SendData, ServerError, NotFound, Unauthorized } = require('../helpers/response');
const { canGetUser, canDeleteUser, canUpdateUser } = require('../rbac/users');
const getter = require('../helpers/getter');
const { canGetCompany } = require('../rbac/companies');

const userQuery = ({ filter }) => {
  const query = {};

  if (filter) {
    query.fullname = new RegExp(filter, 'i');
  }

  return query;
};

module.exports.get = async (req, res, next) => {
  try {
    const query = userQuery(req.query);
    const data = await getter(User, query, req, res, [...User.getFields('listing'), 'company']);

    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.getById = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const targetUser = await canGetUser(user, id);
    if (targetUser === null) return next(NotFound());
    if (!targetUser) return next(Unauthorized());

    return next(SendData(targetUser.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.update = async ({ params: { id }, body }, { locals: { user } }, next) => {
  try {
    const targetUser = await canUpdateUser(user, id);
    if (targetUser === null) return next(NotFound());
    if (!targetUser) return next(Unauthorized());

    const data = Object.assign(targetUser, body);

    data.__history = {
      event: 'update',
      method: 'patch',
      user: user.id,
      company: user.company.id
    };

    await data.save();

    return next(SendData(targetUser.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.delete = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const targetUser = await canDeleteUser(user, id);
    if (targetUser === null) return next(NotFound());
    if (!targetUser) return next(Unauthorized());

    targetUser.__history = {
      event: 'delete',
      method: 'delete',
      user: user.id,
      company: user.company.id
    };

    await targetUser.softDelete();

    return next(SendData({ message: 'User deleted successfully' }));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.getByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const query = userQuery(req.query);
    query['company.id'] = companyId;

    const data = await getter(User, query, req, res);

    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};
