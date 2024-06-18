/* eslint-disable class-methods-use-this */
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

if (process.env.ENV === 'dev' && fs.existsSync(path.resolve(__dirname, '.env.development'))) {
  dotenv.config({ path: path.resolve(__dirname, '.env.development'), override: true });
} else {
  dotenv.config();
}

if (process.env.ENV === 'dev') process.env.MONGO_DATABASE_HOST = 'localhost';

const Migration = require('../models/migration');
require('./connect');

class dbStore {
  load(fn) {
    return Migration.findOne({})
      .lean()
      .then(data => {
        if (!data) return fn(null, {});
        if (
          !Object.prototype.hasOwnProperty.call(data, 'lastRun') ||
          !Object.prototype.hasOwnProperty.call(data, 'migrations')
        ) {
          return fn(new Error('Invalid store file'));
        }
        return fn(null, data);
      })
      .catch(fn);
  }

  save(set, fn) {
    return Migration.updateOne(
      {},
      {
        $set: {
          lastRun: set.lastRun
        },
        $push: {
          migrations: { $each: set.migrations }
        }
      },
      {
        upsert: true,
        multi: true
      }
    )
      .then(result => fn(null, result))
      .catch(fn);
  }
}

module.exports = dbStore;
