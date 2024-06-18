const loadsh = require('lodash');
const { setNestedValue } = require('./utils');

const historyPlugin = ({
  mongoose = false, // A mongoose instance
  modelName = '__histories', // Name of the collection for the histories
  userCollection = 'User', // Collection to ref when you pass an user id
  accountCollection = 'Company', // Collection to ref when you pass an account id or the item has an account property
  userFieldName = 'user', // Name of the property for the user
  accountFieldName = 'company', // Name of the property of the account if any
  timestampFieldName = 'timestamp', // Name of the property of the timestamp
  methodFieldName = 'method', // Name of the property of the method
  ignore = [], // List of fields to ignore when compare changes
  ignoreMethods = ['ignore'], // Changes are not saved if the method matches
  noDiffSave = false, // Save event even if there are no changes
  noDiffSaveOnMethods = [], // Save event even if there are no changes if method matches
  noEventSave = true, // If false save only when __history property is passed,
  postSaveMiddleware,
  parentCollection,
  parentFieldNameInCollection,
  dbFieldsUrlsSupport = []
}) => {
  if (mongoose === false) {
    throw new Error('You need to pass a mongoose instance');
  }

  const Schema = new mongoose.Schema(
    {
      collectionName: String,
      collectionId: { type: mongoose.Schema.Types.ObjectId },
      diff: {},
      event: { type: String, enum: ['create', 'update', 'delete'] },
      reason: String,
      data: { type: mongoose.Schema.Types.Mixed },
      [userFieldName]: {
        type: mongoose.Schema.Types.ObjectId,
        ref: userCollection
      },
      [accountFieldName]: {
        type: mongoose.Schema.Types.ObjectId,
        ref: accountCollection
      },
      [timestampFieldName]: {
        type: Date
      },
      ref: {
        child: {
          type: mongoose.Schema.Types.ObjectId
        },
        childHistory: {
          type: mongoose.Schema.Types.ObjectId
        }
      },
      [methodFieldName]: String
    },
    {
      collection: modelName
    }
  );

  Schema.set('minimize', false);
  Schema.set('versionKey', false);
  Schema.set('strict', true);

  if (parentCollection)
    Schema.add({
      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: parentCollection
      }
    });

  Schema.pre('save', function (next) {
    this[timestampFieldName] = this[timestampFieldName] ?? new Date();
    return next();
  });

  if (postSaveMiddleware) Schema.post('save', postSaveMiddleware);

  const Model = mongoose.model(modelName, Schema);

  const query = (method = 'find', queryOptions = {}) => {
    const requestedQuery = Model[method](queryOptions.find || {});

    if (queryOptions.select !== undefined) {
      Object.assign(queryOptions.select, {
        _id: 0,
        collectionId: 0,
        collectionName: 0
      });

      requestedQuery.select(queryOptions.select);
    }

    if (queryOptions.sort) requestedQuery.sort(queryOptions.sort);
    if (queryOptions.populate) requestedQuery.populate(queryOptions.populate);
    if (queryOptions.limit) requestedQuery.limit(queryOptions.limit);

    return requestedQuery.lean();
  };

  const getPreviousVersion = async document => {
    // get the oldest version from the history collection
    const versions = await document.getVersions();
    return versions[versions.length - 1] ? versions[versions.length - 1].object : {};
  };

  const cleanFields = object => {
    delete object.__history;
    delete object.__v;

    ignore.forEach(e => delete object[ignore[e]]);
    return object;
  };

  const getDiff = ({ prev, current, document, forceSave, schema }) => {
    const fieldsWithDefaults = Object.keys(schema.obj).filter(e => schema.obj[e].default);
    let diff = document.modifiedPaths().reduce((acc, field) => {
      if (['__history', '__v', 'updatedAt', 'createdAt', ...ignore].includes(field)) return acc;

      if (loadsh.isEqual(prev[field], current[field])) return acc;
      acc[field] = { old: prev[field], new: current[field] };

      if (dbFieldsUrlsSupport.includes(field)) {
        const currentParsed = schema.statics.parseUrl(field, current[field]);
        const prevParsed = schema.statics.parseUrl(field, prev[field]);
        const [currentValue, currentPath] = currentParsed || [];
        const [prevValue] = prevParsed || [];
        if (currentParsed instanceof Array) {
          let pathNew = currentPath.split('.');
          pathNew.splice(1, 0, 'new');
          pathNew = pathNew.join('.');

          let pathOld = currentPath.split('.');
          pathOld.splice(1, 0, 'old');
          pathOld = pathOld.join('.');

          acc = setNestedValue(acc, pathNew, currentValue);
          acc = setNestedValue(acc, pathOld, prevValue);
        } else {
          acc = setNestedValue(acc, `${field}Url.new`, currentValue);
          acc = setNestedValue(acc, `${field}Url.old`, prevValue);
        }
      }

      if (acc[field].new === undefined && acc[field].old === undefined) delete acc[field];
      return acc;
    }, {});

    if (!Object.keys(prev).length) {
      fieldsWithDefaults.forEach(field => {
        if (!diff[field]) diff[field] = { old: undefined, new: schema.obj[field].default };
      });
    }

    let saveWithoutDiff = false;
    if (document.__history) {
      const method = document.__history[methodFieldName];
      if ([...noDiffSaveOnMethods, 'childSave'].includes(method)) {
        saveWithoutDiff = true;
        if (forceSave) {
          diff = prev;
        }
      }
    }

    return {
      diff,
      saveWithoutDiff
    };
  };

  const saveHistory = async ({ document, diff }) => {
    const obj = {};
    obj.collectionName = document.constructor.modelName;
    obj.collectionId = document._id;
    obj.parent = parentFieldNameInCollection?.split('.').reduce((acc, key) => acc[key], document);
    obj.diff = diff || {};

    obj.event = document?.__history?.event || (document.isNew ? 'create' : 'update');
    if (document.__history) {
      obj[userFieldName] = document.__history[userFieldName];
      obj[accountFieldName] = document.__history[accountFieldName];
      obj.reason = document.__history.reason;
      obj.data = document.__history.data;
      obj[methodFieldName] = document.__history[methodFieldName];
      obj[timestampFieldName] = document.__history[timestampFieldName];

      if (document.__history[methodFieldName] === 'childSave' && document.__history.ref) {
        obj.ref = document.__history.ref;
      }
    }

    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
    const history = new Model(obj);

    document.__history = undefined;
    await history.save();
  };

  const patch = (old, diff) => {
    Object.keys(diff).forEach(diffKey => {
      old[diffKey] = diff[diffKey].new;
    });
    return old;
  };

  return function (schema) {
    schema.add({
      __history: { type: mongoose.Schema.Types.Mixed }
    });

    const preSave = function (forceSave) {
      return async function (next) {
        const currentDocument = this;

        if (currentDocument.__history !== undefined || noEventSave) {
          if (currentDocument.__history !== undefined && ignoreMethods.includes(currentDocument.__history.method)) {
            delete this._doc.__history;
            return next();
          }
          try {
            const previousVersion = await getPreviousVersion(currentDocument);

            const currentObject = cleanFields(JSON.parse(JSON.stringify(currentDocument)));
            const previousObject = cleanFields(JSON.parse(JSON.stringify(previousVersion || {})));

            const { diff, saveWithoutDiff } = getDiff({
              current: currentObject,
              prev: previousObject,
              document: currentDocument,
              forceSave,
              schema
            });

            const diffWithoutUpdatedAt = { ...diff };
            delete diffWithoutUpdatedAt.updatedAt;
            if (Object.keys(diffWithoutUpdatedAt).length || noDiffSave || saveWithoutDiff) {
              await saveHistory({ document: currentDocument, diff });
            }

            return next();
          } catch (error) {
            return next(error);
          }
        }

        return next();
      };
    };

    schema.pre('save', preSave(false));

    schema.pre('remove', preSave(true));

    // diff.find
    schema.methods.getDiffs = async function (getDiffsOptions = {}) {
      getDiffsOptions.find = getDiffsOptions.find || {};
      Object.assign(getDiffsOptions.find, {
        collectionName: this.constructor.modelName,
        collectionId: this._id
      });

      getDiffsOptions.sort = getDiffsOptions.sort || '-' + timestampFieldName;

      const data = await query('find', getDiffsOptions);

      // custom dbField plugin support
      if (getDiffsOptions.fields && typeof schema.statics.getFields === 'function') {
        const dbFields = schema.statics.getFields(getDiffsOptions.fields);
        return data.map(e => ({
          ...e,
          diff: Object.keys(e.diff).reduce((acc, key) => {
            if (dbFields.includes(key) && key !== 'updatedAt') {
              acc[key] = e.diff[key];
            }
            return acc;
          }, {})
        }));
      }

      return data;
    };

    // versions.find
    schema.methods.getVersions = async function (getVersionsOptions = {}, includeObject = true) {
      getVersionsOptions.sort = getVersionsOptions.sort || timestampFieldName;

      const histories = await this.getDiffs(getVersionsOptions);
      if (!includeObject) {
        return histories;
      }

      let version = {};

      const data = histories
        .filter(e => Object.keys(e.diff).length)
        .map((e, i, arr) => {
          version = Object.keys(e.diff).length ? patch(version, e.diff) : { ...arr[i - 1].object };
          e.object = { ...version };
          delete e.diff;
          return e;
        });

      return data;
    };
  };
};

module.exports = historyPlugin;
