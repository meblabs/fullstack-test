module.exports = {
  login: {
    $id: 'login',
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' }
    },
    additionalProperties: false,
    required: ['email', 'password'],
    errorMessage: {
      properties: {
        email: '210'
      }
    }
  },
  checkEmail: {
    $id: 'checkEmail',
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' }
    },
    additionalProperties: false,
    errorMessage: {
      properties: {
        email: '210'
      }
    },
    required: ['email']
  },
  register: {
    $id: 'register',
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      name: { type: 'string' },
      lastname: { type: 'string' },
      fullname: { type: 'string' },
      phone: { $ref: 'phone' },
      lang: { $ref: 'lang' }
    },
    additionalProperties: false,
    errorMessage: {
      properties: {
        email: '210'
      }
    },
    required: ['email', 'password']
  },
  changePassword: {
    type: 'object',
    properties: {
      password: { type: 'string' }
    },
    additionalProperties: false,
    required: ['password']
  },
  changePasswordParams: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      token: { type: 'string' }
    },
    additionalProperties: false,
    required: ['email', 'token']
  }
};
