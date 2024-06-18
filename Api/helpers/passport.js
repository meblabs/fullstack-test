const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy } = require('passport-jwt');
const { Strategy: CustomStrategy } = require('passport-custom');

const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Rt = require('../models/rt');
const {
  WrongEmail,
  WrongPassword,
  ServerError,
  Unauthorized,
  MissingRefreshToken,
  ExpiredRefreshToken,
  DeletedAccount,
  InactiveAccount,
  UnauthorizedRefreshToken
} = require('./response');

const optionsJwt = {
  jwtFromRequest: req => {
    if (req && Object.keys(req.cookies).length && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }
    return null;
  },
  secretOrKey: process.env.JWT_SECRET
};

const optionsRefreshToken = {
  jwtFromRequest: req => {
    if (req && Object.keys(req.cookies).length && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return null;
  },
  secretOrKey: process.env.RT_SECRET
};

module.exports = passport => {
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        await User.findOne({ email, deleted: { $in: [false, true] } })
          .then(user => {
            if (!user) return done(WrongEmail());
            if (!user.active) return done(InactiveAccount());
            if (user.deleted) return done(DeletedAccount());
            // if (user.authReset) return done(AuthReset());

            return user.comparePassword(password, (e, isMatch) => {
              if (e) return done(ServerError(e));
              if (!isMatch) return done(WrongPassword());

              return done(null, user);
            });
          })
          .catch(err => done(ServerError(err)));
      }
    )
  );

  passport.use('jwt', new JwtStrategy(optionsJwt, async (jwtPayload, done) => done(null, jwtPayload)));

  passport.use(
    'jwt-rt',
    new JwtStrategy(optionsRefreshToken, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.userId);
        const rt = await Rt.findOne({ user: jwtPayload.userId, token: jwtPayload.rt });
        if (!user) return done(UnauthorizedRefreshToken());
        if (!rt) {
          user.authReset = dayjs().format();
          await Promise.all([Rt.deleteMany({ user: jwtPayload.userId }), user.save()]);
          return done(MissingRefreshToken());
        }
        if (dayjs(rt.expires).isBefore(dayjs())) return done(ExpiredRefreshToken());

        await Promise.all([Rt.deleteOne({ _id: rt._id }), user.save()]);
        return done(null, user);
      } catch (err) {
        return done(Unauthorized(err));
      }
    })
  );

  passport.use(
    'changePassword',
    new CustomStrategy(async (req, done) => {
      await User.findOne({ email: req.params.email })
        .then(user => {
          if (!user) return done(Unauthorized());
          const decoded = jwt.verify(atob(req.params.token), `${process.env.CHANGE_PASSWORD_SECRET}${user.password}`);
          if (!decoded) return done(Unauthorized());
          return done(null, user);
        })
        .catch(err => done(Unauthorized()));
    })
  );
};
