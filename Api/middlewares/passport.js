const passport = require('passport');
const configure = require('../helpers/passport');

configure(passport);

module.exports = (req, res, next) => passport.initialize();
