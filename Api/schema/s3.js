module.exports = {
  s3sign: {
    type: 'object',
    properties: {
      ext: {
        enum: ['jpg', 'jpeg', 'gif', 'png', 'pdf']
      }
    },
    required: ['ext'],
    additionalProperties: false
  }
};
