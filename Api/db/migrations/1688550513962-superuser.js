/* eslint-disable no-console */
const User = require('../../models/user');
require('../connect');

const adminUser = new User({
  email: 'test@meblabs.com',
  name: 'Admin',
  lang: 'IT',
  active: true,
  roles: ['superuser']
});

module.exports.up = async () => {
  adminUser.password = 'testtest';

  return adminUser.save();
};

module.exports.down = async () => User.deleteOne({ email: 'test@meblabs.com' });
