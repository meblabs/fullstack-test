const Company = require('../models/company');
const User = require('../models/user');
const { SendData, ServerError, NotFound, Unauthorized, AlreadyExists, DeletedAccount } = require('../helpers/response');
const getter = require('../helpers/getter');
const { canGetCompany, canDeleteCompany, canUpdateCompany } = require('../rbac/companies');
const { inviteEmail } = require('../emails/index');

module.exports.get = async (req, res, next) => {
  try {
    const { filter } = req.query;
    const query = {};

    if (filter) {
      query.name = new RegExp(filter, 'i');
    }

    const data = await getter(Company, query, req, res);

    return next(SendData(data));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.create = async (req, { locals: { user } }, next) => {
  try {
    const data = new Company(req.body);

    data.__history = {
      user: user.id,
      affiliate: data._id,
      event: 'create',
      method: 'create'
    };

    await data.save();

    return next(SendData(data.response('cp')));
  } catch (err) {
    if (err.code === 11000) return next(AlreadyExists());
    return next(ServerError(err));
  }
};

module.exports.getById = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const targetCompany = await canGetCompany(user, id);
    if (targetCompany === null) return next(NotFound());
    if (!targetCompany) return next(Unauthorized());

    return next(SendData(targetCompany.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};

module.exports.update = async ({ params: { id }, body }, { locals: { user } }, next) => {
  try {
    const targetCompany = await canUpdateCompany(user, id);
    if (targetCompany === null) return next(NotFound());
    if (!targetCompany) return next(Unauthorized());

    const data = Object.assign(targetCompany, body);

    data.__history = {
      event: 'update',
      method: 'patch',
      user: user.id,
      company: user.company.id
    };

    await data.save();

    return next(SendData(targetCompany.response('cp')));
  } catch (err) {
    if (err.code === 11000) return next(AlreadyExists());
    return next(ServerError(err));
  }
};

module.exports.delete = async ({ params: { id } }, { locals: { user } }, next) => {
  try {
    const targetCompany = await canDeleteCompany(user, id);
    if (targetCompany === null) return next(NotFound());
    if (!targetCompany) return next(Unauthorized());

    targetCompany.__history = {
      event: 'delete',
      method: 'delete',
      user: user.id,
      company: user.company.id
    };

    await Promise.all([
      targetCompany.softDelete(),
      User.updateMany({ 'company.id': id }, { deleted: true, deletedAt: new Date() })
    ]);

    return next(SendData({ message: 'Company deleted successfully' }));
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.getPic = async ({ params: { id } }, res, next) => {
  try {
    const targetCompany = await Company.findById(id);
    if (!targetCompany || !targetCompany.pic) return next(NotFound());

    return next(SendData(targetCompany.get('picUrl')));
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.inviteUser = async ({ params: { id }, body }, { locals: { user } }, next) => {
  try {
    const { roles } = body;
    delete body.roles;

    const targetCompany = await canUpdateCompany(user, id);
    if (targetCompany === null) return next(NotFound());
    if (!targetCompany) return next(Unauthorized());

    const checkExistance = await User.findOne({ email: body.email }, { _id: 1 }).lean();
    if (checkExistance) return next(AlreadyExists());

    const checkDeleted = await User.findOne({ email: body.email, deleted: true }, { _id: 1 }).lean();
    if (checkDeleted) return next(DeletedAccount());

    // USER MUST BE ENABLED CHANGING THE PASSWORD
    const password = Math.random().toString(36).slice(-8);

    const newUser = await new User({
      ...body,
      company: {
        id: targetCompany.id,
        type: targetCompany.type,
        roles,
        name: targetCompany.name
      },
      password
    }).save();

    await inviteEmail(newUser.toObject());

    return next(SendData(newUser.response('cp')));
  } catch (err) {
    return next(ServerError(err));
  }
};
