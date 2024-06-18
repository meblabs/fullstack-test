/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2019');
const addFormats = require('ajv-formats');

const { ServerError, ValidationError, MissingRequiredParameter, AdditionalParameters } = require('../helpers/response');

const ajv = new Ajv({ allErrors: true, coerceTypes: true });
addFormats(ajv);
require('ajv-errors')(ajv);

ajv.addKeyword({
  keyword: 'prohibited',
  type: 'object',
  schemaType: 'array',
  validate: function validate(fieldsName, data) {
    const keys = Object.keys(data);
    const invalidKeys = keys.filter(e => fieldsName.includes(e));
    if (!invalidKeys.length) return true;

    validate.errors = [
      { keyword: 'prohibited', message: 'Prohibited field', params: { prohibitedProperty: invalidKeys[0] } }
    ];
    return false;
  },
  errors: true
});

ajv.addKeyword({
  keyword: 'isNotEmpty',
  type: 'string',
  validate(schema, data) {
    return typeof data === 'string' && data.trim() !== '';
  },
  errors: false
});

const validatorPath = `${__dirname}/../schema/`;
fs.readdirSync(validatorPath)
  .filter(file => file.split('.')[1] === 'js')
  .forEach(file => {
    const f = path.parse(file).name;
    const schema = require(`${validatorPath}${f}.js`);
    Object.keys(schema).forEach(key => ajv.addSchema(schema[key], key));
  });

const errorParser = data => {
  const [error] = data;
  const { keyword, instancePath, message, params } = error;

  switch (keyword) {
    case 'required':
      return MissingRequiredParameter('/' + params.missingProperty);
    case 'additionalProperties':
      return AdditionalParameters('/' + params.additionalProperty);
    case 'errorMessage':
      return ValidationError(instancePath, Number(message));
    case 'prohibited':
      return AdditionalParameters('/' + params.prohibitedProperty);
    case 'dependencies':
      return MissingRequiredParameter('/' + params.missingProperty);
    default: {
      return ValidationError(instancePath);
    }
  }
};

exports.validator = schemas => (req, res, next) => {
  const schemasObj = typeof schemas === 'string' ? { body: schemas } : schemas;

  Object.keys(schemasObj).forEach(key => {
    const validate = ajv.getSchema(schemasObj[key]);

    if (!validate) return next(ServerError('Missing validator schema'));

    const valid = validate(req[key]);
    if (!valid) return next(errorParser(validate.errors));

    return true;
  });

  next();
};
