const express = require('express');
const controller = require('../controllers/users');
const { isAuth } = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { validator } = require('../middlewares/validator');

const router = express.Router();

router.route('/').get(isAuth, rbac('users', 'read:any'), controller.get);

router
  .route('/:id')
  .get(validator({ params: 'id' }), isAuth, rbac('users', 'read'), controller.getById)
  .patch(validator({ body: 'user', params: 'id' }), isAuth, rbac('users', 'update'), controller.update)
  .delete(validator({ params: 'id' }), isAuth, rbac('users', 'delete'), controller.delete);

module.exports = router;
