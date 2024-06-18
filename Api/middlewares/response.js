module.exports = (toSend, res) => {
  const { statusCode = 500, message = '', data = {}, error = 1 } = toSend;
  const successCode = [200, 201, 202];

  if (successCode.indexOf(statusCode) >= 0) {
    return res.status(statusCode).json(data);
  }

  if (process.env.ENV === 'staging' || process.env.ENV === 'production' || statusCode === 500)
    // eslint-disable-next-line global-require, no-console
    console.trace('[API]', require('util').inspect(toSend));

  return res.status(statusCode).json({
    error,
    message,
    data
  });
};
