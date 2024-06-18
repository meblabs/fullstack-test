module.exports = {
  createCompany: {
    $id: 'createCompany',
    type: 'object',
    properties: {
      name: { type: 'string' },
      lang: { $ref: 'lang' },
      country: { $ref: 'country' },
      city: { type: 'string' },
      address: { type: 'string' },
      phone: { $ref: 'phone' },
      vatNumber: { type: 'string' },
      pic: { type: 'string' },
      zipcode: { type: 'string' },
      type: { type: 'string' }
    },
    required: ['name'],
    additionalProperties: false
  },
  updateCompany: {
    $id: 'updateCompany',
    type: 'object',
    properties: {
      name: { type: 'string' },
      lang: { $ref: 'lang' },
      country: { $ref: 'country' },
      city: { type: 'string' },
      address: { type: 'string' },
      phone: { $ref: 'phone' },
      vatNumber: { type: 'string' },
      pic: { type: 'string' },
      zipcode: { type: 'string' }
    },
    additionalProperties: false
  },
  invite: {
    $id: 'invite',
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string' },
      lastname: { type: 'string' },
      fullname: { type: 'string' },
      phone: { $ref: 'phone' },
      lang: { $ref: 'lang' },
      roles: { $ref: 'roles' }
    },
    additionalProperties: false,
    required: ['email', 'roles']
  },
  companyId: {
    $id: 'companyId',
    type: 'object',
    properties: {
      companyId: { $ref: 'objectId' }
    }
  }
};
