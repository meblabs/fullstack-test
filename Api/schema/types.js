module.exports = {
  objectId: {
    $id: 'objectId',
    type: 'string',
    pattern: '^[a-f\\d]{24}$'
  },
  phoneNumber: {
    $id: 'phoneNumber',
    type: 'string',
    pattern: '^\\d{6,11}$'
  },
  phonePrefix: {
    $id: 'phonePrefix',
    type: 'string',
    pattern: '^\\+\\d{1,4}$'
  },
  phoneCountry: {
    $id: 'phoneCountry',
    type: 'string',
    minLength: 2,
    maxLength: 2
  },
  phone: {
    type: 'object',
    properties: {
      country: { $ref: 'phoneCountry' },
      prefix: { $ref: 'phonePrefix' },
      number: { $ref: 'phoneNumber' }
    },
    required: ['country', 'prefix', 'number'],
    additionalProperties: false
  },
  lang: {
    $id: 'lang',
    type: 'string',
    minLength: 2,
    maxLength: 2
  },
  country: {
    $id: 'country',
    type: 'string',
    minLength: 2,
    maxLength: 2
  },
  roles: {
    $id: 'roles',
    type: 'array',
    items: { type: 'string' }
  }
};
