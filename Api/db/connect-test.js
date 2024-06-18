/* eslint-disable no-console */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const config = require('./config');

const connect = async () => {
  // Prevent MongooseError: Can't call `openUri()` on
  // an active connection with different connection strings
  await mongoose.disconnect();

  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  global.__MONGOINSTANCE = mongoServer;
  return mongoose
    .set('strictQuery', false)
    .connect(mongoUri, config)
    .catch(err => {
      console.error(`[MongoDB-TEST] ${err} -- Retrying in 5s`);
    });
};

const close = async () => {
  try {
    await mongoose.disconnect();
    await global.__MONGOINSTANCE.stop();
  } catch (err) {
    console.error(err);
  }
};

const clear = async () => {
  const { collections } = mongoose.connection;

  return Promise.all(Object.keys(collections).map(key => collections[key].deleteMany())).catch(console.error);
};

module.exports = {
  connect,
  close,
  clear
};
