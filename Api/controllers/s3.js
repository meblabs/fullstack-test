const { getSign } = require('../helpers/s3');

const { SendData, ServerError } = require('../helpers/response');

exports.getSign = (req, res, next) =>
  getSign(req.params.ext)
    .then(sign => next(SendData(sign)))
    .catch(err => next(ServerError(err)));
