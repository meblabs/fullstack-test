module.exports = (schema, options) => {
  const getFields = function (fields) {
    if (!fields) {
      return options.fields.public;
    }
    if (typeof fields === 'string') {
      return options.fields[fields];
    }
    return fields;
  };

  const setPath = (object, path, value) =>
    path.split('.').reduce((o, p, i) => {
      o[p] = path.split('.').length === i + 1 ? value : o[p] || {};
      return o;
    }, object);

  schema.statics.getFields = getFields;
  schema.statics.getUrls = options.urls || [];
  schema.statics.parseUrl = options.parseUrl ? options.parseUrl : (name, value) => value;

  schema.statics.getProjectFields = function (fields) {
    return schema.statics.getFields(fields).reduce((acc, item) => {
      acc[item] = 1;
      return acc;
    }, {});
  };

  const parseObj = function (obj, { skipParseUrls = false }) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = obj[key];

      if (skipParseUrls !== true && schema.statics.getUrls.includes(key) && acc[key] && acc[key].length !== 0) {
        const parsed = schema.statics.parseUrl(key, acc[key]);
        if (parsed instanceof Array) {
          const [value, path] = parsed;
          acc = setPath(acc, path, value);
        } else {
          acc[key + 'Url'] = parsed;
        }
      }

      return acc;
    }, {});
  };

  schema.statics.parseObj = parseObj;

  schema.methods.response = function (fields, responseOptions = {}) {
    const starterObj = this.toObject({ virtuals: true });
    const filtredFields = getFields(fields).reduce((acc, item) => {
      acc[item] = starterObj[item];
      if (JSON.stringify(acc[item]) === '{}') delete acc[item];
      return acc;
    }, {});
    return parseObj(filtredFields, responseOptions);
  };

  schema.post(['find', 'findById', 'findOne'], function (res) {
    /* internalGet options lets bypass all middlewares */

    if (!res || (this.getOptions && this.getOptions().internalGet === true)) return res;
    if (res instanceof Array) {
      res.forEach(e => {
        if (e._doc) e._doc = parseObj(e._doc, this.getOptions());
        else e = parseObj(e, {});
      });
    } else if (res._doc) {
      res._doc = parseObj(res._doc, this.getOptions());
    }

    return res;
  });

  // eslint-disable-next-line prefer-arrow-callback
  schema.post('aggregate', function (res, next) {
    if (res.length > 0)
      res.forEach((doc, index, theArray) => {
        const newDoc = parseObj(doc, {});
        theArray[index] = newDoc;
      });

    return next();
  });

  schema.pre(['find'], function (next) {
    if (!this.selected()) this.select(options.fields.public);
    return next();
  });
};
