/* eslint-disable max-len */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const config = require('./config');

const { MONGO_DATABASE_USERNAME, MONGO_DATABASE_PASSWORD, MONGO_DATABASE_HOST, MONGO_DATABASE_NAME } = process.env;

const remoteDb = `${MONGO_DATABASE_HOST}/${MONGO_DATABASE_NAME}?authSource=%24external&authMechanism=MONGODB-AWS&retryWrites=true&w=majority`;
const localDb = `mongodb://${MONGO_DATABASE_USERNAME}:${MONGO_DATABASE_PASSWORD}@${MONGO_DATABASE_HOST}:27017/${MONGO_DATABASE_NAME}`;

const mongoURL = process.env.ENV !== 'dev' ? remoteDb : localDb;

const connect = () =>
  mongoose
    .set('strictQuery', false)
    .connect(mongoURL, config)
    .then(() => {
      console.log('[MongoDB] CONNECTED!');
    })
    .catch(err => {
      console.error(err);
      console.error(`[MongoDB] ERRROR: NON CONNECTED! -> ${mongoURL}`);
    });

connect();

module.exports = mongoose.connection;
