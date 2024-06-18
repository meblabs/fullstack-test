const express = require('express');
const controller = require('../controllers/users');
const { isAuth } = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

const router = express.Router({ mergeParams: true });

router.route('/').get(isAuth, rbac('users', 'read'), controller.getByCompany);

module.exports = router;
