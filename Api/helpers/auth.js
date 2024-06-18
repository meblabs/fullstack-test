const jwt = require('jsonwebtoken');
const { v1: uuidv1 } = require('uuid');
const dayjs = require('dayjs');

const Rt = require('../models/rt');

const genereteAuthToken = user => {
  const token = jwt.sign(
    {
      id: user._id,
      company: user.company,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    { expiresIn: parseInt(process.env.JWT_EXPIRES_TIME) }
  );

  return { token, expires: dayjs().add(process.env.JWT_EXPIRES_TIME, 's').format() };
};

const genereteRefreshToken = async user => {
  const uuid = uuidv1();
  const rt = jwt.sign(
    {
      userId: user._id,
      rt: uuid,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.RT_SECRET,
    { expiresIn: parseInt(process.env.RT_EXPIRES_TIME) }
  );

  await new Rt({ user: user._id, token: uuid, expires: dayjs().add(process.env.RT_EXPIRES_TIME, 's') }).save();

  return { rt, expires: dayjs().add(process.env.RT_EXPIRES_TIME, 's').format() };
};

const generateToken = async (res, user) => {
  const { token, expires: tokenExpires } = genereteAuthToken(user);
  const { rt, expires: rtExpires } = await genereteRefreshToken(user);

  res.cookie('accessToken', token, {
    httpOnly: true,
    expires: new Date(tokenExpires),
    sameSite: 'strict',
    secure: process.env.ENV !== 'dev',
    path: '/'
  });
  res.cookie('refreshToken', rt, {
    httpOnly: true,
    expires: new Date(rtExpires),
    sameSite: 'strict',
    secure: process.env.ENV !== 'dev',
    path: '/'
  });
};

const clearTokens = res => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.ENV !== 'dev',
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.ENV !== 'dev',
    path: '/'
  });
};

const genereteChangePasswordToken = user => {
  const token = jwt.sign(
    { id: user._id, iat: Math.floor(Date.now() / 1000) },
    `${process.env.CHANGE_PASSWORD_SECRET}${user.password}`,
    {
      expiresIn: parseInt(process.env.CHANGE_PASSWORD_EXPIRES_TIME)
    }
  );

  return { token, expires: dayjs().add(process.env.CHANGE_PASSWORD_EXPIRES_TIME, 's').format() };
};

module.exports = { genereteAuthToken, genereteRefreshToken, generateToken, clearTokens, genereteChangePasswordToken };
