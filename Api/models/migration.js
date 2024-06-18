const mongoose = require('mongoose');

const { Schema } = mongoose;

const schema = Schema({
  lastRun: String,
  migrations: [{ title: String, description: String, timestamp: Number }]
});

module.exports = mongoose.models.Migration || mongoose.model('Migration', schema);
