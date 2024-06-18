const passport = require('passport');
const User = require('../models/user');
const {
  SendData,
  ServerError,
  NotFound,
  EmailAlreadyExists,
  DeletedAccount,
  Unauthorized,
  BadRequest,
  AlreadyExists
} = require('../helpers/response');
const { generateToken, clearTokens } = require('../helpers/auth');
const { registerEmail, changePasswordEmail, inviteEmail } = require('../emails');
const { langs, defaultLang } = require('../config');
const { canChangePassword } = require('../rbac/users');
const { canUpdateCompany } = require('../rbac/companies');

exports.login = (req, res, next) =>
  passport.authenticate('local', { session: false }, async (err, user) => {
    if (err) return next(err);

    try {
      await generateToken(res, user);

      return next(SendData(user.response()));
    } catch (e) {
      return next(ServerError(e));
    }
  })(req, res, next);

exports.check = async (req, res, next) => {
  try {
    const data = await User.findById(res.locals.user.id);
    return next(SendData(data.response()));
  } catch (err) {
    return next(Unauthorized(err));
  }
};

exports.checkIfEmailExists = async ({ params: { email } }, res, next) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return next(NotFound());

    const response = { message: 'Email exists!', ...user.response() };

    delete response.name;
    delete response.lastname;
    delete response.fullname;
    delete response.phone;
    return next(SendData(response));
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.resendActivationEmail = async ({ body: { email } }, res, next) => {
  try {
    const user = await User.findOne({ email }).lean();
    if (!user) return next(NotFound());
    if (user.active) return next(BadRequest());

    await registerEmail(user).catch(erremail => console.error(`[EMAIL ERROR]: ${erremail}`));

    return next(SendData());
  } catch (e) {
    return next(ServerError(e));
  }
};

exports.register = async (req, res, next) => {
  try {
    if (req.body.lang && !langs.includes(req.body.lang)) {
      req.body.lang = defaultLang;
    }

    const check = await User.findOne({ email: req.body.email }).lean();
    if (check) return next(EmailAlreadyExists());
    const checkDeleted = await User.findOne({ email: req.body.email, deleted: true }).lean();
    if (checkDeleted) return next(DeletedAccount());

    req.body.active = true;
    const user = await new User(req.body).save();

    await generateToken(res, user);

    registerEmail(user.email, user.lang, user.fullname);

    return next(SendData(user.response()));
  } catch (e) {
    return next(ServerError(e));
  }
};

exports.invite = async ({ body }, { locals: { user } }, next) => {
  try {
    const targetCompany = await canUpdateCompany(user, body.company.id);
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
        roles: body.company.roles,
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

exports.refreshToken = async (req, res, next) => {
  try {
    await generateToken(res, res.locals.user);

    return next(SendData(res.locals.user.response()));
  } catch (e) {
    return next(ServerError(e));
  }
};

exports.logout = async (req, res, next) => {
  clearTokens(res);
  return next(SendData({ message: 'Logout succesfully!' }));
};

exports.forgotPassword = async ({ body: { email } }, res, next) => {
  try {
    const user = await User.findOne({ email }).lean();
    if (!user) return next(NotFound());

    await changePasswordEmail(user, false);
    return next(SendData());
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.restoreUser = async ({ body: { email } }, res, next) => {
  try {
    const user = await User.findOne({ email, deleted: true }).lean();
    if (!user) return next(NotFound());

    await changePasswordEmail(user, true);
    return next(SendData());
  } catch (err) {
    return next(ServerError(err));
  }
};

exports.changePassword = async ({ params: { email }, body: { password } }, res, next) => {
  try {
    if (!canChangePassword(res.locals.user, email)) return next(Unauthorized());
    const user = await User.findOne({ email, deleted: { $in: [true, false] } });
    if (!user) return next(NotFound());
    user.password = password;
    user.authReset = null;
    user.active = true;
    user.deleted = false;
    user.deletedAt = undefined;

    await user.save();

    res.clearCookie('accessToken', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/'
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      path: '/'
    });

    return next(SendData(user.response('profile')));
  } catch (err) {
    return next(ServerError(err));
  }
};
