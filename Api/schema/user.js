module.exports = {
  updateUser: {
    $id: 'user',
    type: 'object',
    properties: {
      name: { type: 'string' },
      lastname: { type: 'string' },
      fullname: { type: 'string' },
      pic: { type: 'string' },
      lang: { $ref: 'lang' },
      phone: { $ref: 'phone' }
    },
    additionalProperties: false
  }
};
