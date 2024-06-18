const passport = require('passport');
const p2r = require('path-to-regexp');

const { Unauthorized, UnauthorizedRefreshToken } = require('../helpers/response');

exports.isAuth = (req, res, next, options = { excludedPaths: [] }) => {
  if (options?.excludedPaths?.filter(e => p2r.pathToRegexp(e).test(req.originalUrl))?.length) return next();

  return passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) {
      res.locals.user = user;
      return next();
    }
    return next(Unauthorized());
  })(req, res, next);
};

exports.isAuthRt = (req, res, next) =>
  passport.authenticate('jwt-rt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (user) {
      res.locals.user = user;
      return next();
    }
    return next(UnauthorizedRefreshToken());
  })(req, res, next);

exports.isAuthRtlogout = (req, res, next) =>
  passport.authenticate('jwt-rt', { session: false }, (err, user) => {
    if (user) res.locals.user = user;
    return next();
  })(req, res, next);

exports.isAuthChangePassword = (req, res, next) =>
  passport.authenticate('changePassword', (err, user) => {
    if (err) return next(err);
    if (user) {
      res.locals.user = user;
      return next();
    }
    return next(Unauthorized());
  })(req, res, next);
