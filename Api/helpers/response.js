const Response = (message, statusCode = 500, data = {}, error = 1) => ({
  message,
  statusCode,
  data,
  error
});

module.exports = {
  /* OK */
  SendData: (data, statusCode = 200) => Response('Success', statusCode, data),

  /* ERRORS */
  CustomError: (message, statusCode, data, error) => Response(message, statusCode, data, error),

  ServerError: data =>
    Response('System error: operation not completed, please refresh the page or try again later', 500, data, 1),

  RateLimitError: data => Response('Too many requests from this IP, please try again later.', 500, data, 2),

  /* 200 - validation errors */

  ValidationError: (data, error = 200) => Response('Validation error', 400, data, error),

  MissingRequiredParameter: data => Response('Missing required parameters', 400, data, 201),

  AdditionalParameters: data => Response('Additional parameters are not permitted', 400, data, 202),

  AlreadyExists: data => Response('The resource already exists', 400, data, 203),

  /* 300 - auth errors */

  WrongEmail: data => Response('Wrong email', 400, data, 300),

  WrongPassword: () => Response('Wrong password', 400, {}, 301),

  InactiveAccount: () => Response('Inactive account', 401, {}, 302),

  DeletedAccount: () => Response('Deleted account', 400, {}, 303),

  EmailAlreadyExists: data => Response('The email already exists', 400, data, 304),

  AuthReset: () => Response('Auth reset, please change password', 401, {}, 305),

  MissingRefreshToken: () => Response('Refresh token does not exist', 401, {}, 306),

  ExpiredRefreshToken: () => Response('Expired refresh token', 401, {}, 307),

  UnauthorizedRefreshToken: () => Response('Unauthorized refresh token', 401, {}, 308),

  /* 400 - generic client error */

  BadRequest: () => Response('Bad request', 400, {}, 400),

  Unauthorized: () => Response('Unauthorized', 401, {}, 401),

  BlockedByCORS: () => Response('Not allowed by CORS', 401, {}, 402),

  Forbidden: () => Response('Forbidden', 403, {}, 403),

  NotFound: () => Response('Not found', 404, {}, 404),

  NotAcceptable: () => Response('Not acceptable', 406, {}, 406),

  InvalidRole: () => Response('Forbidden', 403, {}, 410),

  ForbiddenResources: () => Response('Forbidden', 403, {}, 411)

  /* 400 - specific client errors */
};
