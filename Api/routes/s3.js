const express = require('express');
const { getSign } = require('../controllers/s3');
const { isAuth } = require('../middlewares/isAuth');
const { validator } = require('../middlewares/validator');
const lowercase = require('../middlewares/lowercase');

const router = express.Router();

router.get('/sign/:ext', lowercase('params'), validator({ params: 's3sign' }), isAuth, getSign);

module.exports = router;
